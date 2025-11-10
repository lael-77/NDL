import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createUser,
  deleteUser,
  changeUserRole,
  promoteRelegateSchool,
  assignStudentToTeam,
  removeStudentFromTeam,
  getAllUsers,
  getUsersByRole,
  changeUserSchool,
  removeFromRole,
  createSchool,
  processBulkPromotionsRelegations,
  approveMatch,
  editMatchResults,
  announceChallenge,
  broadcastMessage,
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User management (admin only)
router.post('/users', createUser);
router.get('/users', getAllUsers);
router.get('/users/role/:role', getUsersByRole);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', changeUserRole);
router.put('/users/:id/school', changeUserSchool);
router.put('/users/:id/remove-role', removeFromRole);

// School management (admin only)
router.post('/schools', createSchool);
router.put('/schools/:id/tier', promoteRelegateSchool);
router.post('/schools/bulk-promotions-relegations', processBulkPromotionsRelegations);

// Team management (admin, school admin, coach)
router.post('/teams/assign-student', assignStudentToTeam);
router.post('/teams/remove-student', removeStudentFromTeam);

// Match management (admin only)
router.post('/matches/:id/approve', approveMatch);
router.put('/matches/:id/results', editMatchResults);

// Challenge management (admin only)
router.post('/challenges/announce', announceChallenge);

// Messaging (admin only)
router.post('/messages/broadcast', broadcastMessage);

export default router;

