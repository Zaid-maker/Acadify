import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getInstructorAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Get instructor-specific analytics
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Analytical data (enrollments, revenue, active sessions)
 */
router.get("/", protect, getInstructorAnalytics);

export default router;
