import express from "express";
import { startLiveSession, endLiveSession, getLiveSession } from "../controllers/liveSession.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { isInstructor } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/live-sessions/start:
 *   post:
 *     summary: Start a live session
 *     tags: [Live Sessions]
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
 *         description: Session started
 */
router.post("/start", protect, isInstructor, startLiveSession);

/**
 * @swagger
 * /api/live-sessions/end/{sessionId}:
 *   put:
 *     summary: End an active live session
 *     tags: [Live Sessions]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session ended
 */
router.put("/end/:sessionId", protect, endLiveSession);

/**
 * @swagger
 * /api/live-sessions/course/{courseId}:
 *   get:
 *     summary: Get live session details for a course
 *     tags: [Live Sessions]
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
 *         description: Session details
 */
router.get("/course/:courseId", protect, getLiveSession);

export default router;
