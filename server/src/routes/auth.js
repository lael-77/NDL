import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register - Register a new user
router.post('/register', register);

// POST /api/auth/login - Login user
router.post('/login', login);

// GET /api/auth/profile - Get user profile
router.get('/profile', getProfile);

// PUT /api/auth/profile - Update user profile
router.put('/profile', updateProfile);

export default router;

