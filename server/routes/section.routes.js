import express from "express";
import {
    createSection,
    getSectionsByCourse,
} from "../controllers/section.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { isInstructor } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/sections:
 *   post:
 *     summary: Create a new course section
 *     tags: [Sections]
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
 *               - courseId
 *             properties:
 *               title:
 *                 type: string
 *               courseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Section created
 */
router.post("/", protect, isInstructor, createSection);

/**
 * @swagger
 * /api/sections/{courseId}:
 *   get:
 *     summary: Get all sections for a course
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of sections
 */
router.get("/:courseId", getSectionsByCourse);

export default router;
