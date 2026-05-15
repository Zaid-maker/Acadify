import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { 
  updateIntegrations, 
  getIntegrations, 
  testIntegration,
  initiateGoogleAuth,
  googleCallback 
} from "../controllers/integration.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/integrations:
 *   get:
 *     summary: Get current integration settings
 *     tags: [Integrations]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Integration settings data
 */
router.get("/", protect, getIntegrations);

/**
 * @swagger
 * /api/integrations:
 *   put:
 *     summary: Update integration settings (Webhooks, etc.)
 *     tags: [Integrations]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               discordWebhook:
 *                 type: string
 *               slackWebhook:
 *                 type: string
 *               googleCalendarEnabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.put("/", protect, updateIntegrations);

/**
 * @swagger
 * /api/integrations/test:
 *   post:
 *     summary: Test a webhook integration
 *     tags: [Integrations]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - url
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [discord, slack]
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Test notification sent
 */
router.post("/test", protect, testIntegration);

/**
 * @swagger
 * /api/integrations/google/auth:
 *   get:
 *     summary: Initiate Google OAuth flow
 *     tags: [Integrations]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: OAuth redirect URL
 */
router.get("/google/auth", protect, initiateGoogleAuth);

/**
 * @swagger
 * /api/integrations/google/callback:
 *   get:
 *     summary: Google OAuth callback handler
 *     tags: [Integrations]
 *     responses:
 *       200:
 *         description: Authenticated successfully
 */
router.get("/google/callback", protect, googleCallback);

export default router;
