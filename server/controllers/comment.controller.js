import Comment from "../models/Comment.js";
import Course from "../models/Course.js";
import ModerationLog from "../models/ModerationLog.js";
import { createNotification } from "../services/notification.service.js";
import { trackIncident } from "../middleware/abuseDetection.middleware.js";
import mongoose from "mongoose";

export const addComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    // Abuse detection: Check rapid commenting
    const recentCommentsCount = await Comment.countDocuments({
      user: userId,
      createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    });

    if (recentCommentsCount > 15) {
      await trackIncident(userId, "comment_spam", { count: recentCommentsCount, severity: "medium" });
      return res.status(429).json({ message: "You are posting comments too quickly. Please slow down." });
    }

    // Check if user is shadow banned
    const isShadowBanned = req.user.isShadowBanned || false;

    const comment = await Comment.create({
      user: userId,
      course: courseId,
      content: content.trim(),
      hidden: isShadowBanned, // Auto-hide if shadow banned
      moderationReason: isShadowBanned ? "Auto-hidden (Shadow Banned User)" : undefined,
      moderatedAt: isShadowBanned ? new Date() : undefined,
    });

    const populated = await comment.populate("user", "name");

    // Course instructor notification
    const courseObj = await Course.findById(courseId).select("instructor title");
    if (courseObj && String(courseObj.instructor) !== String(userId)) {
      await createNotification({
        recipient: courseObj.instructor,
        sender: userId,
        type: "new_comment",
        message: `${req.user.name} recently commented on your course "${courseObj.title}"`,
        link: `/course/${courseId}`,
        priority: "medium",
        metadata: { courseId, commentId: comment._id }
      });
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page: pageQ, limit: limitQ, q } = req.query;
    const currentUserId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    const page = Math.max(1, parseInt(pageQ, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitQ, 10) || 10));
    const skip = (page - 1) * limit;
    const courseObjectId = new mongoose.Types.ObjectId(courseId);

    // Visibility logic:
    // 1. Show all non-hidden comments
    // 2. If logged in, also show your OWN hidden comments (for shadow-ban effect)
    // 3. Admin/Instructor see all hidden anyway? Let's keep it simple:
    //    Everyone sees non-hidden. Owners see their own hidden. 
    //    Moderators see all (we'll add that match later if needed)

    const baseMatch = { course: courseObjectId };
    
    if (currentUserId) {
      baseMatch.$or = [
        { hidden: false },
        { user: new mongoose.Types.ObjectId(currentUserId) }
      ];
    } else {
      baseMatch.hidden = false;
    }

    const pipeline = [
      { $match: baseMatch },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    ];

    if (q && q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      pipeline.push({
        $match: {
          $or: [
            { content: { $regex: regex } },
            { "user.name": { $regex: regex } },
          ],
        },
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    });

    const result = await Comment.aggregate(pipeline);
    const total = result[0]?.metadata?.[0]?.total || 0;
    const data = result[0]?.data || [];

    res.json({
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // allow deletion by owner or admin
    // owner
    if (String(comment.user) === String(req.user._id)) {
      const prev = { hidden: comment.hidden, content: comment.content };
      await comment.remove();
      await ModerationLog.create({
        action: 'delete',
        comment: comment._id,
        course: comment.course,
        moderator: req.user._id,
        moderatorRole: req.user.role,
        reason: req.body.reason || 'Deleted by owner',
        previousState: prev,
      });
      return res.json({ message: "Comment deleted" });
    }

    // admin can delete
    if (req.user.role === "admin") {
      const prev = { hidden: comment.hidden, content: comment.content };
      await comment.remove();
      await ModerationLog.create({
        action: 'delete',
        comment: comment._id,
        course: comment.course,
        moderator: req.user._id,
        moderatorRole: req.user.role,
        reason: req.body.reason || 'Deleted by admin',
        previousState: prev,
      });
      return res.json({ message: "Comment deleted" });
    }

    // instructor of the course can delete
    const course = await Course.findById(comment.course).select("instructor");
    if (course && String(course.instructor) === String(req.user._id)) {
      await comment.remove();
      // log deletion by instructor
      await ModerationLog.create({
        action: 'delete',
        comment: comment._id,
        course: comment.course,
        moderator: req.user._id,
        moderatorRole: req.user.role,
        reason: req.body.reason || '',
        previousState: { hidden: comment.hidden, content: comment.content },
      });
      return res.json({ message: "Comment deleted" });
    }

    return res.status(403).json({ message: "Not authorized to delete this comment" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const moderateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { hidden, reason } = req.body;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // only admin or course instructor can moderate
    if (req.user.role === "admin") {
      // ok
    } else {
      const course = await Course.findById(comment.course).select("instructor");
      if (!course || String(course.instructor) !== String(req.user._id)) {
        return res.status(403).json({ message: "Not authorized to moderate this comment" });
      }
    }

    const previousHidden = comment.hidden;
    comment.hidden = Boolean(hidden);
    comment.moderationReason = reason || "";
    comment.moderatedBy = req.user._id;
    comment.moderatedAt = new Date();

    await comment.save();

    const populated = await comment.populate("user", "name").populate("moderatedBy", "name");

    // Notification for user
    if (String(comment.user) !== String(req.user._id)) {
      await Notification.create({
        recipient: comment.user,
        sender: req.user._id,
        type: "comment_moderated",
        message: `Your comment was ${comment.hidden ? 'hidden' : 'unhidden'} by a moderator: ${reason || 'No reason provided'}`,
        link: `/course/${comment.course}`,
      });
      pushExternalNotification(comment.user, `Moderation update: Your comment on Acadify was ${comment.hidden ? 'hidden' : 'unhidden'}.`);
    }

    // create audit log
    await ModerationLog.create({
      action: comment.hidden ? 'hide' : 'unhide',
      comment: comment._id,
      course: comment.course,
      moderator: req.user._id,
      moderatorRole: req.user.role,
      reason: reason || '',
      previousState: { hidden: previousHidden },
      newState: { hidden: comment.hidden },
    });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
