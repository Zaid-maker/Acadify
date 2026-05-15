import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    addReview,
    getReviews,
} from "../controllers/review.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Add a review to a course
 *     tags: [Reviews]
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
 *               - rating
 *               - comment
 *             properties:
 *               courseId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review added
 */
router.post("/", protect, addReview);

/**
 * @swagger
 * /api/reviews/{courseId}:
 *   get:
 *     summary: Get all reviews for a course
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get("/:courseId", getReviews);

export default router;