import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getModerationLogs, updateUserStatus } from '../controllers/moderation.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/moderation:
 *   get:
 *     summary: Get moderation logs
 *     description: Accessible by admin or course instructor
 *     tags: [Moderation]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of moderation events
 */
router.get('/', protect, getModerationLogs);

/**
 * @swagger
 * /api/moderation/user/{userId}:
 *   patch:
 *     summary: Update user status (flag/ban)
 *     tags: [Moderation]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, flagged, shadowed]
 *     responses:
 *       200:
 *         description: User status updated
 */
router.patch('/user/:userId', protect, updateUserStatus);

export default router;
