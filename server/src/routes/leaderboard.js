import express from 'express';
import { 
  getLeaderboard, 
  getLeaderboardByTier,
  getStudentsLeaderboard,
  getCoachesLeaderboard,
  getSchoolsLeaderboard,
} from '../controllers/leaderboardController.js';

const router = express.Router();

// Specific routes must come before parameter routes
// GET /api/leaderboard/teams - Get teams leaderboard
router.get('/teams', getLeaderboard);

// GET /api/leaderboard/students - Get students leaderboard
router.get('/students', getStudentsLeaderboard);

// GET /api/leaderboard/coaches - Get coaches leaderboard
router.get('/coaches', getCoachesLeaderboard);

// GET /api/leaderboard/schools - Get schools leaderboard
router.get('/schools', getSchoolsLeaderboard);

// GET /api/leaderboard - Get global teams leaderboard
router.get('/', getLeaderboard);

// GET /api/leaderboard/:tier - Get leaderboard by tier (teams)
router.get('/:tier', getLeaderboardByTier);

export default router;

