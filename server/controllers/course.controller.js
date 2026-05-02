import Section from "../models/Section.js";
import Lecture from "../models/Lecture.js";
import Course from "../models/Course.js";

export const createCourse = async (req, res) => {
    try {
        const course = await Course.create({
            ...req.body,
            instructor: req.user._id,
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllCourses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const search = (req.query.search || "").trim();
        const minPrice = parseInt(req.query.minPrice) || 0;
        const maxPrice = parseInt(req.query.maxPrice) || 100000;
        const minRating = parseFloat(req.query.minRating) || 0;
        const sort = req.query.sort || "newest";

        const skip = (page - 1) * limit;

        const match = {
            published: true,
            price: { $gte: minPrice, $lte: maxPrice },
            ...(search ? { $text: { $search: search } } : {}),
        };

        let sortOption = { createdAt: -1 };
        if (sort === "price_asc") sortOption = { price: 1, createdAt: -1 };
        if (sort === "price_desc") sortOption = { price: -1, createdAt: -1 };
        if (sort === "rating_desc") sortOption = { avgRating: -1, createdAt: -1 };

        const pipeline = [
            { $match: match },
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "course",
                    as: "reviews",
                },
            },
            {
                $addFields: {
                    avgRating: { $ifNull: [{ $avg: "$reviews.rating" }, 0] },
                    reviewCount: { $size: "$reviews" },
                },
            },
            {
                $lookup: {
                    from: "sections",
                    localField: "_id",
                    foreignField: "course",
                    as: "sections",
                },
            },
            {
                $lookup: {
                    from: "lectures",
                    localField: "sections._id",
                    foreignField: "section",
                    as: "lectures",
                },
            },
            {
                $addFields: {
                    sectionCount: { $size: "$sections" },
                    lectureCount: { $size: "$lectures" },
                },
            },
            {
                $match: {
                    avgRating: { $gte: minRating },
                },
            },
            { $sort: sortOption },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "users",
                    localField: "instructor",
                    foreignField: "_id",
                    as: "instructor",
                },
            },
            {
                $addFields: {
                    instructor: { $arrayElemAt: ["$instructor", 0] },
                },
            },
            {
                $project: {
                    reviews: 0,
                    sections: 0,
                    lectures: 0,
                },
            },
        ];

        const totalAgg = await Course.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "course",
                    as: "reviews",
                },
            },
            {
                $addFields: {
                    avgRating: { $ifNull: [{ $avg: "$reviews.rating" }, 0] },
                },
            },
            {
                $match: {
                    avgRating: { $gte: minRating },
                },
            },
            { $count: "total" },
        ]);

        const courses = await Course.aggregate(pipeline);
        const total = totalAgg[0]?.total || 0;

        res.json({
            data: courses,
            page,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const publishCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const isOwner = course.instructor.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const sections = await Section.find({ course: course._id }).select("_id");

        if (sections.length === 0) {
            return res.status(400).json({
                message: "Add at least one section before publishing",
            });
        }

        const lectureCount = await Lecture.countDocuments({
            section: { $in: sections.map((section) => section._id) },
        });

        if (lectureCount === 0) {
            return res.status(400).json({
                message: "Add at least one lecture before publishing",
            });
        }

        course.published = true;
        await course.save();

        res.json({ message: "Course published", course });
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

        const course = await Course.findById(courseId).select("-__v");

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const sections = await Section.find({ course: courseId })
            .select("-__v")
            .sort({ order: 1 });

        const sectionsWithLectures = await Promise.all(
            sections.map(async (section) => {
                const lectures = await Lecture.find({
                    section: section._id,
                })
                    .select("-__v")
                    .sort({ order: 1 });

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
