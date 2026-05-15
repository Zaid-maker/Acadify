import LiveSession from "../models/LiveSession.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

export const startLiveSession = async (req, res) => {
    try {
        const { courseId, title, roomName } = req.body;
        const instructorId = req.user._id; // Updated from .id to ._id for consistency

        // Check if instructor owns the course
        const course = await Course.findOne({ _id: courseId, instructor: instructorId });
        if (!course) {
            return res.status(403).json({ message: "Not authorized to go live for this course" });
        }

        // Check if there's already an active live session
        const activeSession = await LiveSession.findOne({ course: courseId, status: 'live' });
        if (activeSession) {
            return res.status(400).json({ message: "A live session is already active for this course" });
        }

        const session = await LiveSession.create({
            course: courseId,
            instructor: instructorId,
            title,
            roomName,
            status: 'live'
        });

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const endLiveSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const instructorId = req.user._id; // Updated from .id to ._id for consistency

        const session = await LiveSession.findOneAndUpdate(
            { _id: sessionId, instructor: instructorId, status: 'live' },
            { status: 'ended', endTime: new Date() },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ message: "Active session not found or unauthorized" });
        }

        res.json({ message: "Live session ended", session });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getLiveSession = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id;

        // Security: Check if user is the instructor OR an enrolled student
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const isInstructor = course.instructor.toString() === userId.toString();
        const isAdmin = req.user.role === 'admin';
        
        const enrollment = await Enrollment.findOne({ user: userId, course: courseId });

        if (!isInstructor && !isAdmin && !enrollment) {
            return res.status(403).json({ message: "You must be enrolled to see live session details" });
        }

        const session = await LiveSession.findOne({ course: courseId, status: 'live' })
            .populate('instructor', 'name')
            .populate('participants.user', 'name email avatar');
        
        // If student is joining, track them in participants if not already there
        if (session && !isInstructor && !isAdmin) {
            const alreadyIn = session.participants.some(p => p.user._id.toString() === userId.toString());
            if (!alreadyIn) {
                session.participants.push({ user: userId });
                await session.save();
            }
        }
        
        res.json(session || null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
