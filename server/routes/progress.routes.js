import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    getProgress,
    markComplete,
} from "../controllers/progress.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/progress:
 *   post:
 *     summary: Mark a lecture as complete
 *     tags: [Progress]
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
 *               - lectureId
 *             properties:
 *               courseId:
 *                 type: string
 *               lectureId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Progress updated
 */
router.post("/", protect, markComplete);

/**
 * @swagger
 * /api/progress/{courseId}:
 *   get:
 *     summary: Get user progress for a specific course
 *     tags: [Progress]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Completed lecture IDs
 */
router.get("/:courseId", protect, getProgress);

export default router;
