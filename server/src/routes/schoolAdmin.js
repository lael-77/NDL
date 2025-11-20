/**
 * School Admin Routes
 * All routes require school_admin role and school ownership verification
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireSchoolAdmin } from '../middleware/rbac.js';
import schoolAdminController from '../controllers/schoolAdminController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireSchoolAdmin);

// Dashboard - uses schoolId from middleware (req.schoolId)
router.get('/dashboard', schoolAdminController.getSchoolDashboard);

// Students - uses schoolId from middleware
router.get('/students', schoolAdminController.getSchoolStudents);
router.post('/students', schoolAdminController.createStudent);
router.get('/students/:studentId', schoolAdminController.getStudentProfile);

// Teams - uses schoolId from middleware
router.get('/teams', schoolAdminController.getSchoolTeams);
router.post('/teams', schoolAdminController.createTeam);
router.delete('/teams/:teamId', schoolAdminController.deleteTeam);

// Team Members
router.post('/teams/:teamId/members', schoolAdminController.addTeamMember);
router.delete('/teams/:teamId/members/:memberId', schoolAdminController.removeTeamMember);
router.post('/teams/:teamId/members/swap', schoolAdminController.swapTeamMember);
router.post('/teams/swap-between', schoolAdminController.swapPlayersBetweenTeams);

// Reserve Players
router.get('/reserve-players', schoolAdminController.getReservePlayers);

// Team Coaches
router.post('/teams/:teamId/coach', schoolAdminController.assignCoach);
router.delete('/teams/:teamId/coach', schoolAdminController.removeCoach);
router.put('/teams/:teamId/coach', schoolAdminController.swapCoach);

// Team Feedback
router.post('/teams/:teamId/feedback', schoolAdminController.addTeamFeedback);
router.get('/teams/:teamId/feedback', schoolAdminController.getTeamFeedback);

// Coaches - get list of coaches for school
router.get('/coaches', schoolAdminController.getSchoolCoaches);

// ==================== SETTINGS ROUTES ====================

// 1. School Profile Settings
router.get('/settings/profile', schoolAdminController.getSchoolProfile);
router.put('/settings/profile', schoolAdminController.updateSchoolProfile);

// 2. Coaches & Staff Permissions
router.post('/settings/coaches', schoolAdminController.addCoach);
router.delete('/settings/coaches/:coachId', schoolAdminController.removeCoachFromSchool);

// 3. Team Configuration Settings
router.put('/settings/teams/:teamId', schoolAdminController.updateTeamSettings);

// 4. Sponsorship & Arena Settings
router.get('/settings/sponsorships', schoolAdminController.getSchoolSponsorships);
router.post('/settings/sponsorships', schoolAdminController.createSponsorship);
router.put('/settings/sponsorships/:sponsorshipId/status', schoolAdminController.updateSponsorshipStatus);
router.get('/settings/arena-applications', schoolAdminController.getArenaApplications);
router.post('/settings/arena-applications', schoolAdminController.createArenaApplication);

// 5. Finance & Transactions Settings
router.get('/settings/finances', schoolAdminController.getSchoolFinances);
router.post('/settings/finances', schoolAdminController.createFinance);
router.put('/settings/finances/:financeId', schoolAdminController.updateFinanceStatus);

// 6. Communication & Notification Settings
router.get('/settings/notifications', schoolAdminController.getNotificationSettings);
router.put('/settings/notifications', schoolAdminController.updateNotificationSettings);

export default router;

