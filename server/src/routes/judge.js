import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getAssignedMatches,
  acceptMatch,
  declineMatch,
  getMatchForJudging,
  startMatchTimer,
  pauseMatchTimer,
  resumeMatchTimer,
  endMatch,
  submitLineup,
  approveLineup,
  submitAutoScores,
  submitJudgeScores,
  lockJudgeScores,
  submitPlayerScores,
  submitFeedback,
  getCoJudgeScores,
} from '../controllers/judgeController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Debug: Log route registration
console.log('✅ [Judge Routes] Routes registered: /api/judge/*');

// Get assigned matches (must come before /matches/:matchId)
router.get('/matches', getAssignedMatches);

// Accept/Decline match
router.post('/matches/:matchId/accept', acceptMatch);
router.post('/matches/:matchId/decline', declineMatch);

// Get match details for judging
router.get('/matches/:matchId', getMatchForJudging);

// Match timer controls
router.post('/matches/:matchId/timer/start', startMatchTimer);
router.post('/matches/:matchId/timer/pause', pauseMatchTimer);
router.post('/matches/:matchId/timer/resume', resumeMatchTimer);
router.post('/matches/:matchId/timer/end', endMatch);

// Lineup management
router.post('/matches/:matchId/lineup', submitLineup);
router.post('/matches/:matchId/lineup/:teamId/approve', approveLineup);

// Auto-judge scores
router.post('/matches/:matchId/auto-scores', submitAutoScores);

// Judge scores
router.post('/matches/:matchId/scores/team', submitJudgeScores);
router.post('/matches/:matchId/scores/team/:teamId/lock', lockJudgeScores);
router.post('/matches/:matchId/scores/player', submitPlayerScores);

// Co-judge collaboration
router.get('/matches/:matchId/co-judge-scores', getCoJudgeScores);

// Feedback
router.post('/matches/:matchId/feedback', submitFeedback);

export default router;

