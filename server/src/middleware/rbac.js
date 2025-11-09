import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Role-Based Access Control Middleware
 * 
 * Authority Structure:
 * - League Admin: Manages all subjects (schools, teams, students, coaches, sponsors, judges, etc.)
 * - School Admin: Manages profiles of coaches, students, and sponsors in their school
 * - Coach: Manages students in their school
 */

/**
 * Check if user is League Admin (has access to everything)
 */
export const requireLeagueAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'League admin access required' });
    }

    req.userRole = 'admin';
    req.userProfile = user;
    next();
  } catch (error) {
    console.error('Error in requireLeagueAdmin:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Check if user is School Admin (manages their school's resources)
 */
export const requireSchoolAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.profile.findUnique({
      where: { id: userId },
      include: { school: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // League admin has access to everything
    if (user.role === 'admin') {
      req.userRole = 'admin';
      req.userProfile = user;
      req.schoolId = null; // Admin can access all schools
      return next();
    }

    if (user.role !== 'school_admin' || !user.schoolId) {
      return res.status(403).json({ error: 'School admin access required' });
    }

    req.userRole = 'school_admin';
    req.userProfile = user;
    req.schoolId = user.schoolId;
    next();
  } catch (error) {
    console.error('Error in requireSchoolAdmin:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Check if user is Coach (manages students in their school)
 */
export const requireCoach = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        coachProfile: {
          include: { school: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // League admin and school admin have access
    if (user.role === 'admin' || user.role === 'school_admin') {
      req.userRole = user.role;
      req.userProfile = user;
      if (user.role === 'school_admin') {
        req.schoolId = user.schoolId;
      } else {
        req.schoolId = null; // Admin can access all schools
      }
      return next();
    }

    if (user.role !== 'coach' || !user.coachProfile) {
      return res.status(403).json({ error: 'Coach access required' });
    }

    req.userRole = 'coach';
    req.userProfile = user;
    req.schoolId = user.coachProfile.schoolId;
    next();
  } catch (error) {
    console.error('Error in requireCoach:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Helper: Check if user can access a specific school's resources
 */
export const canAccessSchool = async (userId, targetSchoolId) => {
  const user = await prisma.profile.findUnique({
    where: { id: userId },
    include: {
      school: true,
      coachProfile: {
        include: { school: true },
      },
    },
  });

  if (!user) return false;

  // League admin can access all schools
  if (user.role === 'admin') return true;

  // School admin can access their own school
  if (user.role === 'school_admin' && user.schoolId === targetSchoolId) return true;

  // Coach can access their school's resources
  if (user.role === 'coach' && user.coachProfile?.schoolId === targetSchoolId) return true;

  return false;
};

/**
 * Helper: Get students managed by a user
 */
export const getManagedStudents = async (userId) => {
  const user = await prisma.profile.findUnique({
    where: { id: userId },
    include: {
      school: true,
      coachProfile: {
        include: { school: true },
      },
    },
  });

  if (!user) return [];

  // League admin gets all students
  if (user.role === 'admin') {
    return await prisma.profile.findMany({
      where: { role: 'player' },
      include: {
        studentSchool: true,
        teamMembers: {
          include: { team: true },
        },
      },
    });
  }

  // School admin gets students in their school
  if (user.role === 'school_admin' && user.schoolId) {
    return await prisma.profile.findMany({
      where: {
        role: 'player',
        studentSchoolId: user.schoolId,
      },
      include: {
        studentSchool: true,
        teamMembers: {
          include: { team: true },
        },
      },
    });
  }

  // Coach gets students in their school
  if (user.role === 'coach' && user.coachProfile?.schoolId) {
    return await prisma.profile.findMany({
      where: {
        role: 'player',
        studentSchoolId: user.coachProfile.schoolId,
      },
      include: {
        studentSchool: true,
        teamMembers: {
          include: { team: true },
        },
      },
    });
  }

  return [];
};

/**
 * Helper: Get coaches managed by a user
 */
export const getManagedCoaches = async (userId) => {
  const user = await prisma.profile.findUnique({
    where: { id: userId },
    include: { school: true },
  });

  if (!user) return [];

  // League admin gets all coaches
  if (user.role === 'admin') {
    return await prisma.coach.findMany({
      include: {
        profile: true,
        school: true,
      },
    });
  }

  // School admin gets coaches in their school
  if (user.role === 'school_admin' && user.schoolId) {
    return await prisma.coach.findMany({
      where: { schoolId: user.schoolId },
      include: {
        profile: true,
        school: true,
      },
    });
  }

  return [];
};

