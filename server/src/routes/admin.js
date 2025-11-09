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
router.put('/schools/:id/tier', promoteRelegateSchool);

// Team management (admin, school admin, coach)
router.post('/teams/assign-student', assignStudentToTeam);
router.post('/teams/remove-student', removeStudentFromTeam);

export default router;

