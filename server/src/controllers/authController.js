import db from '../services/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Use the database service (primary database)
const prisma = db;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register a new user
export const register = async (req, res) => {
  try {
    const { email, password, fullName, role, schoolId } = req.body;
    
    // Validate role - map frontend role names to database enum values
    const roleMapping = {
      'player': 'player',
      'coach': 'coach',
      'judge': 'judge',
      'school_admin': 'school_admin',
      'schooladmin': 'school_admin',
      'sponsor': 'sponsor',
    };
    
    const normalizedRole = role?.toLowerCase();
    const dbRole = roleMapping[normalizedRole];
    
    if (!dbRole) {
      return res.status(400).json({ error: 'Invalid role. Admin role cannot be created via signup.' });
    }
    
    // Check if user already exists
    const existingUser = await prisma.profile.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user profile
    const user = await prisma.profile.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: dbRole,
      },
    });
    
    // If role is coach, create coach profile
    if (dbRole === 'coach' && schoolId) {
      try {
        // Check if school exists
        const school = await prisma.school.findUnique({
          where: { id: schoolId },
        });
        
        if (!school) {
          // If school doesn't exist, you might want to create it or return an error
          // For now, we'll skip coach creation if school doesn't exist
          console.warn(`School ${schoolId} not found for coach ${user.id}`);
        } else {
          // Check if school already has a coach
          const existingCoach = await prisma.coach.findUnique({
            where: { schoolId: school.id },
          });
          
          if (!existingCoach) {
            await prisma.coach.create({
              data: {
                profileId: user.id,
                schoolId: school.id,
              },
            });
          } else {
            console.warn(`School ${schoolId} already has a coach`);
          }
        }
      } catch (coachError) {
        console.error('Error creating coach profile:', coachError);
        // Don't fail registration if coach creation fails
      }
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });
    
    // Return user with schoolId if applicable
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        schoolId: user.schoolId || null,
        school_id: user.schoolId || null, // Also include snake_case for compatibility
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await prisma.profile.findUnique({
      where: { email },
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    // If user has no password (old accounts), allow login with any password for migration
    if (user.password) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      // For existing accounts without passwords, set a default password
      // This allows migration of old accounts
      const defaultPassword = 'password123'; // Change this in production
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await prisma.profile.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      // Verify against the newly set password
      const isValidPassword = await bcrypt.compare(password, hashedPassword);
      if (!isValidPassword && password !== defaultPassword) {
        return res.status(401).json({ error: 'Invalid credentials. Please use default password: password123' });
      }
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });
    
    // Return user with schoolId if applicable
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        schoolId: user.schoolId || null,
        school_id: user.schoolId || null, // Also include snake_case for compatibility
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    // In a real app, you'd extract userId from JWT token
    const userId = req.user?.userId; // Assuming middleware sets req.user
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const user = await prisma.profile.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { fullName, avatarUrl } = req.body;
    
    const user = await prisma.profile.update({
      where: { id: userId },
      data: {
        fullName,
        avatarUrl,
      },
    });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create admin account (only for existing admins)
export const createAdmin = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if requester is admin
    const requester = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create admin accounts' });
    }

    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.profile.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin profile
    const admin = await prisma.profile.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: 'admin',
      },
    });

    res.status(201).json({
      message: 'Admin account created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: error.message });
  }
};

// Forgot password - generate reset token
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const user = await prisma.profile.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token
    await prisma.profile.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // In production, send email with reset link
    // For now, we'll return the token (remove this in production!)
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;
    
    console.log(`Password reset link for ${email}: ${resetLink}`);
    
    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.',
      // Remove this in production - only for development
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined,
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ error: error.message });
  }
};

// Reset password with token
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    // Find user with valid reset token
    const user = await prisma.profile.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await prisma.profile.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: error.message });
  }
};

