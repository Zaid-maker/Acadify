import express from 'express';
import { createCourse, getAllCourses, getCourseById, getFullCourse, publishCourse, getInstructorCourses } from '../controllers/course.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isInstructor } from '../middleware/role.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created
 */
router.post("/", protect, isInstructor, createCourse);

/**
 * @swagger
 * /api/courses/{id}/publish:
 *   patch:
 *     summary: Publish a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course published
 */
router.patch("/:id/publish", protect, isInstructor, publishCourse);

/**
 * @swagger
 * /api/courses/instructor/me:
 *   get:
 *     summary: Get courses created by the current instructor
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of instructor's courses
 */
router.get("/instructor/me", protect, isInstructor, getInstructorCourses);

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all published courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get("/", getAllCourses);

/**
 * @swagger
 * /api/courses/full/{id}:
 *   get:
 *     summary: Get course with all sections and lectures
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detailed course structure
 */
router.get("/full/:id", getFullCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course details by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course data
 */
router.get("/:id", getCourseById);

export default router;
