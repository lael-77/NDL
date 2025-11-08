import express from 'express';
import { getLeaderboard, getLeaderboardByTier } from '../controllers/leaderboardController.js';

const router = express.Router();

// GET /api/leaderboard - Get global leaderboard
router.get('/', getLeaderboard);

// GET /api/leaderboard/:tier - Get leaderboard by tier
router.get('/:tier', getLeaderboardByTier);

export default router;

