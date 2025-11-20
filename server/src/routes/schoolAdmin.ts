/**
 * School Admin Routes
 * All routes require school_admin role and school ownership verification
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import schoolAdminController from '../controllers/schoolAdminController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireRole('school_admin'));

// Dashboard
router.get('/schools/:schoolId/dashboard', schoolAdminController.getSchoolDashboard);

// Students
router.get('/schools/:schoolId/students', schoolAdminController.getSchoolStudents);
router.post('/schools/:schoolId/students', schoolAdminController.createStudent);
router.get('/students/:studentId', schoolAdminController.getStudentProfile);

// Teams
router.get('/schools/:schoolId/teams', schoolAdminController.getSchoolTeams);
router.post('/schools/:schoolId/teams', schoolAdminController.createTeam);
router.post('/teams/:teamId/members', schoolAdminController.addTeamMember);

export default router;

