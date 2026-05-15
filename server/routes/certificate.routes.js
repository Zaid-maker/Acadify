import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { generateCertificate } from "../controllers/certificate.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/certificates/{courseId}:
 *   get:
 *     summary: Generate a course completion certificate
 *     tags: [Certificates]
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
 *         description: Certificate data
 */
router.get("/:courseId", protect, generateCertificate);

export default router;
