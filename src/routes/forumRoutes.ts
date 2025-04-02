import express from 'express';
import * as forumController from '../controllers/forumController';
import { authMiddleware } from '../middleware/auth';
import { apiLimiter, createPostLimiter, createCommentLimiter, likeLimiter } from '../middleware/rateLimit';

// Use 'any' type to bypass TypeScript's type checking for Express routers
const router = express.Router() as any;

// Public routes
router.get('/posts', apiLimiter, forumController.getPosts);
router.get('/posts/:id', apiLimiter, forumController.getPost);

// Protected routes that require authentication
router.post('/posts', authMiddleware, createPostLimiter, forumController.createPost);
router.post('/posts/:id/comments', authMiddleware, createCommentLimiter, forumController.addComment);
router.post('/posts/:id/like', authMiddleware, likeLimiter, forumController.likePost);
router.post('/comments/:id/like', authMiddleware, likeLimiter, forumController.likeComment);
router.delete('/posts/:id', authMiddleware, apiLimiter, forumController.deletePost);
router.delete('/comments/:id', authMiddleware, apiLimiter, forumController.deleteComment);

export default router; 