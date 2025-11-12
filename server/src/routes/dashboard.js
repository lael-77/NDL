import express from 'express';
import {
  getPlayerDashboard,
  getCoachDashboard,
  getSchoolAdminDashboard,
  getSponsorDashboard,
  getAdminDashboard,
} from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Debug: Log route registration
console.log('✅ [Dashboard Routes] Routes registered: /api/dashboard/*');

// Dashboard routes - all require authentication
router.get('/player', authenticateToken, getPlayerDashboard);
router.get('/coach', authenticateToken, getCoachDashboard);
router.get('/school-admin', authenticateToken, getSchoolAdminDashboard);
router.get('/sponsor', authenticateToken, getSponsorDashboard);
router.get('/admin', authenticateToken, getAdminDashboard);

export default router;

