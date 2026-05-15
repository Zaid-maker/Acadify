import express from "express";
import {
    createLecture,
    getLecturesBySection,
} from "../controllers/lecture.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { isInstructor } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/lectures:
 *   post:
 *     summary: Create a new lecture
 *     tags: [Lectures]
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
 *               - sectionId
 *             properties:
 *               title:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               sectionId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lecture created
 */
router.post("/", protect, isInstructor, createLecture);

/**
 * @swagger
 * /api/lectures/{sectionId}:
 *   get:
 *     summary: Get all lectures in a section
 *     tags: [Lectures]
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of lectures
 */
router.get("/:sectionId", getLecturesBySection);

export default router;
