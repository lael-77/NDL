import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  createAdmin,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register - Register a new user
router.post('/register', register);

// POST /api/auth/login - Login user
router.post('/login', login);

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', resetPassword);

// GET /api/auth/profile - Get user profile (protected)
router.get('/profile', authenticateToken, getProfile);

// PUT /api/auth/profile - Update user profile (protected)
router.put('/profile', authenticateToken, updateProfile);

// POST /api/auth/create-admin - Create admin account (protected, admin only)
router.post('/create-admin', authenticateToken, createAdmin);

// GET /api/auth/permissions - Get user permissions
router.get('/permissions', authenticateToken, async (req, res) => {
  try {
    const { getUserPermissions } = await import('../utils/permissions.js');
    const userId = req.user?.userId || req.user?.id;
    const permissions = await getUserPermissions(userId);
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

