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

/**
 * @swagger
 * /api/enrollments/me:
 *   get:
 *     summary: Get all courses the current student is enrolled in
 *     tags: [Enrollments]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled courses
 */
router.get("/me", protect, getMyCourses);

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Enrollments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully enrolled
 */
router.post("/", protect, enrollCourse);

/**
 * @swagger
 * /api/enrollments/check:
 *   get:
 *     summary: Check if student is enrolled in a specific course
 *     tags: [Enrollments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enrollment status
 */
router.get("/check", protect, checkEnrollment);

/**
 * @swagger
 * /api/enrollments/instructor/students:
 *   get:
 *     summary: Get all students enrolled in the instructor's courses
 *     tags: [Enrollments]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of students
 */
router.get("/instructor/students", protect, isInstructor, getInstructorStudents);

export default router;