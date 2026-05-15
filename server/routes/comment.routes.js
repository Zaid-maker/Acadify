import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { addComment, getComments, deleteComment, moderateComment } from '../controllers/comment.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/comments/{courseId}:
 *   get:
 *     summary: Get all comments for a course
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get('/:courseId', getComments);

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Add a comment to a course
 *     tags: [Comments]
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
 *               - content
 *             properties:
 *               courseId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post('/', protect, addComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Only owner, course instructor, or admin can delete
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 */
router.delete('/:id', protect, deleteComment);

/**
 * @swagger
 * /api/comments/{id}/moderate:
 *   patch:
 *     summary: Moderate (hide/unhide) a comment
 *     description: Only course instructor or admin can moderate
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment moderated
 */
router.patch('/:id/moderate', protect, moderateComment);

export default router;
