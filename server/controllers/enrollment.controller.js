import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Progress from "../models/Progress.js";
import Section from "../models/Section.js";
import Lecture from "../models/Lecture.js";
import User from "../models/User.js";
import { createCalendarEvent } from "../services/googleCalendar.service.js";
import { pushExternalNotification } from "../services/notification.service.js";
import { trackIncident } from "../middleware/abuseDetection.middleware.js";

export const getMyCourses = async (req, res) => {
    try {
        const userId = req.user._id;

        const enrollments = await Enrollment.find({ user: userId }).populate(
            "course"
        );

        const result = [];

        for (const enr of enrollments) {
            const course = enr.course;
            if (!course) continue;

            // total lectures
            const sections = await Section.find({ course: course._id });
            const sectionIds = sections.map((s) => s._id);
            const totalLectures = await Lecture.countDocuments({
                section: { $in: sectionIds },
            });

            // completed lectures
            const completed = await Progress.countDocuments({
                user: userId,
                course: course._id,
            });

            const progressPercent = totalLectures
                ? Math.round((completed / totalLectures) * 100)
                : 0;

            result.push({
                ...course.toObject(),
                progressPercent,
            });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const enrollCourse = async (req, res) => {
    try {
        const userId = req.user._id;
        const { courseId } = req.body;

        // Restriction: Instructors/Admins cannot enroll as students
        if (req.user.role === "instructor" || req.user.role === "admin") {
            return res.status(403).json({
                message: "Instructors and Admins cannot enroll in courses as students.",
            });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.instructor?.toString() === userId.toString()) {
            return res.status(403).json({
                message: "Instructors cannot enroll in their own courses",
            });
        }

        const existing = await Enrollment.findOne({
            user: userId,
            course: courseId,
        });

        if (existing) {
            return res.status(400).json({ message: "Already enrolled" });
        }

        // Abuse detection: Check rapid enrollment frequency
        const recentEnrollmentsCount = await Enrollment.countDocuments({
            user: userId,
            createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) } // Last 1 hour
        });

        if (recentEnrollmentsCount > 20) {
            await trackIncident(userId, "mass_enrollment", { count: recentEnrollmentsCount, severity: "high" });
            return res.status(429).json({ message: "Action blocked: Suspicious enrollment pattern detected." });
        }

        const enrollment = await Enrollment.create({
            user: userId,
            course: courseId,
        });

        // Google Calendar Event Integration
        const user = await User.findById(userId);
        if (user && user.integrations?.googleCalendarEnabled && user.integrations?.googleRefreshToken) {
            try {
                // We create a "Course Learning Milestone" event 7 days from now
                // to warn the user or set a commitment goal.
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                nextWeek.setHours(10, 0, 0, 0); // 10:00 AM

                const endTime = new Date(nextWeek);
                endTime.setHours(11, 0, 0, 0); // 1-hour block

                await createCalendarEvent(user, {
                    title: `📚 Learning Goal: ${course.title}`,
                    description: `This is a reminder to continue your progress in the course "${course.title}". Consistency is key to mastery!`,
                    startTime: nextWeek.toISOString(),
                    endTime: endTime.toISOString()
                });

                // Also push a confirmation to Discord/Slack if enabled
                pushExternalNotification(userId, `📅 Success! A learning goal for "${course.title}" has been added to your Google Calendar for next week.`);
            } catch (calError) {
                console.error("Failed to auto-create calendar event", calError.message);
            }
        }

        res.status(201).json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const checkEnrollment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { courseId } = req.query;

        const enrollment = await Enrollment.findOne({
            user: userId,
            course: courseId,
        });

        res.json({ enrolled: !!enrollment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getInstructorStudents = async (req, res) => {
    try {
        const instructorId = req.user._id;

        // Find all courses taught by this instructor
        const courses = await Course.find({ instructor: instructorId }).select("_id title");
        const courseIds = courses.map(c => c._id);

        // Find all unique students enrolled in these courses
        const enrollments = await Enrollment.find({ course: { $in: courseIds } })
            .populate("user", "name email")
            .populate("course", "title");

        // Format for frontend: student profile + list of courses they are taking from this instructor
        const studentMap = {};

        enrollments.forEach(enr => {
            if (!enr.user) return;
            const studentId = enr.user._id.toString();
            
            if (!studentMap[studentId]) {
                studentMap[studentId] = {
                    _id: studentId,
                    name: enr.user.name,
                    email: enr.user.email,
                    enrolledCourses: []
                };
            }
            
            studentMap[studentId].enrolledCourses.push({
                _id: enr.course._id,
                title: enr.course.title,
                enrolledAt: enr.createdAt
            });
        });

        res.json(Object.values(studentMap));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
