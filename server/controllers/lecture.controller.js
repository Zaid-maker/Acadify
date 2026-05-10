import Lecture from "../models/Lecture.js";

export const createLecture = async (req, res) => {
    try {
        const { title, sectionId, videoUrl, description } = req.body;

        const lecture = await Lecture.create({
            title,
            section: sectionId,
            videoUrl,
            description,
            order: 0,
        });

        res.status(201).json(lecture);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getLecturesBySection = async (req, res) => {
    try {
        const lectures = await Lecture.find({
            section: req.params.sectionId,
        }).sort({ order: 1 });

        res.json(lectures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};