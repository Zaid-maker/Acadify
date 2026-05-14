import express from "express";
import {
    enrollCourse,
    checkEnrollment,
    getMyCourses,
    getInstructorStudents,
} from "../controllers/enrollment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { isInstructor } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/me", protect, getMyCourses);
router.post("/", protect, enrollCourse);
router.get("/check", protect, checkEnrollment);
router.get("/instructor/students", protect, isInstructor, getInstructorStudents);

export default router;