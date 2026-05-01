import Section from "../models/Section.js";
import Lecture from "../models/Lecture.js";

export const createCourse = async (req, res) => {
    try {
        const { title, description, price } = req.body;

        const course = await Course.create({
            title,
            description,
            price,
            instructor: req.user?.id || null, // temporary
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate("instructor", "name email");
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate("instructor", "name");

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getFullCourse = async (req, res) => {
    try {
        const courseId = req.params.id;

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const sections = await Section.find({ course: courseId }).sort({ order: 1 });

        const sectionsWithLectures = await Promise.all(
            sections.map(async (section) => {
                const lectures = await Lecture.find({
                    section: section._id,
                }).sort({ order: 1 });

                return {
                    ...section.toObject(),
                    lectures,
                };
            })
        );

        res.json({
            ...course.toObject(),
            sections: sectionsWithLectures,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};