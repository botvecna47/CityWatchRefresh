import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import * as issuesController from '../controllers/issues.controller.js';

const router = Router();

// Public routes
router.get('/', optionalAuth, issuesController.getIssues);
router.get('/:id', optionalAuth, issuesController.getIssue);
router.get('/:id/timeline', issuesController.getTimeline);

// Protected routes
router.post('/', authenticate, issuesController.createIssue);
router.patch('/:id', authenticate, issuesController.updateIssue);
router.delete('/:id', authenticate, issuesController.deleteIssue);
router.post('/:id/upvote', authenticate, issuesController.upvoteIssue);
router.delete('/:id/upvote', authenticate, issuesController.removeUpvote);

// User's own issues
router.get('/my', authenticate, issuesController.getMyIssues);

export default router;
