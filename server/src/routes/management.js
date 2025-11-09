import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  requireLeagueAdmin,
  requireSchoolAdmin,
  requireCoach,
} from '../middleware/rbac.js';
import {
  // League Admin
  getAllStudents,
  getAllCoaches,
  getAllSchools,
  // School Admin
  getSchoolStudents,
  getSchoolCoaches,
  getSchoolSponsors,
  createStudent,
  updateStudent,
  // Coach
  getCoachStudents,
  getStudentDetails,
  updateStudentProgress,
} from '../controllers/managementController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ============================================
// LEAGUE ADMIN ROUTES (Manages all subjects)
// ============================================
router.get('/admin/students', requireLeagueAdmin, getAllStudents);
router.get('/admin/coaches', requireLeagueAdmin, getAllCoaches);
router.get('/admin/schools', requireLeagueAdmin, getAllSchools);

// ============================================
// SCHOOL ADMIN ROUTES (Manages their school)
// ============================================
router.get('/school/students', requireSchoolAdmin, getSchoolStudents);
router.get('/school/coaches', requireSchoolAdmin, getSchoolCoaches);
router.get('/school/sponsors', requireSchoolAdmin, getSchoolSponsors);
router.post('/school/students', requireSchoolAdmin, createStudent);
router.put('/school/students/:id', requireSchoolAdmin, updateStudent);

// ============================================
// COACH ROUTES (Manages students in their school)
// ============================================
router.get('/coach/students', requireCoach, getCoachStudents);
router.get('/coach/students/:id', requireCoach, getStudentDetails);
router.put('/coach/students/:id/progress', requireCoach, updateStudentProgress);

export default router;

