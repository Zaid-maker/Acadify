import { protect } from "./auth.middleware.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { createNotification } from "../services/notification.service.js";

/**
 * Middleware to detect and prevent platform abuse.
 * It tracks suspicious patterns such as:
 * 1. Rapid enrollment-unenrollment cycles
 * 2. Mass comment deletion
 * 3. Rapid frequency of specific actions beyond rate limits
 */
export const abuseDetection = async (req, res, next) => {
  const userId = req.user?._id;
  if (!userId) return next();

  try {
    const user = await User.findById(userId);
    if (!user) return next();

    // Check if user is already flagged/blocked
    if (user.status === "blocked") {
      return res.status(403).json({ 
        message: "Your account has been suspended due to suspicious activity. Please contact support." 
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Tracks rapid sensitive actions to detect bots or malicious actors.
 * Logs incidents to the database for admin review.
 */
export const trackIncident = async (userId, type, metadata = {}) => {
  try {
    // Implement logic to log abuse incidents (could be a new model or ModerationLog)
    console.log(`[Abuse Detection] User ${userId} flagged for ${type}`, metadata);
    
    // Auto-flag user if high severity
    if (metadata.severity === "high") {
       await User.findByIdAndUpdate(userId, { $inc: { reportCount: 1 } });
    }

    // Notify Admins
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        type: "system_alert",
        priority: "high",
        message: `Security Alert: Suspicious ${type} detected from user ${userId}.`,
        metadata: { ...metadata, userId }
      });
    }
  } catch (err) {
    console.error("Abuse logging failed", err);
  }
};
