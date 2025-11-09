import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Permission System - Defines what each role can do
 * 
 * Hierarchy:
 * - Admin: Full access to everything
 * - School Admin: Manage their school and all subjects within it
 * - Coach: Manage teams and players in their school
 * - Judge: Manage matches they're assigned to
 * - Player: Manage own profile, view own data
 * - Sponsor: View sponsored schools/teams
 */

/**
 * Check if user is admin
 */
export const isAdmin = async (userId) => {
  if (!userId) return false;
  const user = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === 'admin';
};

/**
 * Check if user is school admin
 */
export const isSchoolAdmin = async (userId) => {
  if (!userId) return false;
  const user = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true, schoolId: true },
  });
  return user?.role === 'school_admin' && user.schoolId;
};

/**
 * Get user's school ID (for school admin or coach)
 */
export const getUserSchoolId = async (userId) => {
  if (!userId) return null;
  
  const user = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true, schoolId: true, studentSchoolId: true },
    include: {
      coachProfile: {
        select: { schoolId: true },
      },
    },
  });

  if (!user) return null;

  // School admin
  if (user.role === 'school_admin' && user.schoolId) {
    return user.schoolId;
  }

  // Coach
  if (user.role === 'coach' && user.coachProfile?.schoolId) {
    return user.coachProfile.schoolId;
  }

  // Player's school
  if (user.role === 'player' && user.studentSchoolId) {
    return user.studentSchoolId;
  }

  return null;
};

/**
 * Check if user can manage a school
 */
export const canManageSchool = async (userId, schoolId) => {
  if (!userId || !schoolId) return false;

  // Admin can manage all schools
  if (await isAdmin(userId)) return true;

  // School admin can manage their own school
  if (await isSchoolAdmin(userId)) {
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      select: { schoolId: true },
    });
    return user?.schoolId === schoolId;
  }

  return false;
};

/**
 * Check if user can manage a team
 */
export const canManageTeam = async (userId, teamId) => {
  if (!userId || !teamId) return false;

  // Admin can manage all teams
  if (await isAdmin(userId)) return true;

  // Get team's school
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { schoolId: true },
  });

  if (!team) return false;

  // School admin can manage teams in their school
  if (await isSchoolAdmin(userId)) {
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      select: { schoolId: true },
    });
    return user?.schoolId === team.schoolId;
  }

  // Coach can manage teams in their school
  const userSchoolId = await getUserSchoolId(userId);
  if (userSchoolId === team.schoolId) {
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role === 'coach';
  }

  return false;
};

/**
 * Check if user can manage a player
 */
export const canManagePlayer = async (userId, playerId) => {
  if (!userId || !playerId) return false;

  // Admin can manage all players
  if (await isAdmin(userId)) return true;

  // Player can manage themselves
  if (userId === playerId) return true;

  // Get player's school
  const player = await prisma.profile.findUnique({
    where: { id: playerId },
    select: { studentSchoolId: true, role: true },
  });

  if (!player || player.role !== 'player') return false;

  const playerSchoolId = player.studentSchoolId;
  if (!playerSchoolId) return false;

  // School admin can manage players in their school
  if (await isSchoolAdmin(userId)) {
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      select: { schoolId: true },
    });
    return user?.schoolId === playerSchoolId;
  }

  // Coach can manage players in their school
  const userSchoolId = await getUserSchoolId(userId);
  if (userSchoolId === playerSchoolId) {
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role === 'coach';
  }

  return false;
};

/**
 * Check if user can manage a coach
 */
export const canManageCoach = async (userId, coachId) => {
  if (!userId || !coachId) return false;

  // Admin can manage all coaches
  if (await isAdmin(userId)) return true;

  // Get coach's school
  const coach = await prisma.coach.findUnique({
    where: { profileId: coachId },
    select: { schoolId: true },
  });

  if (!coach) return false;

  // School admin can manage coaches in their school
  if (await isSchoolAdmin(userId)) {
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      select: { schoolId: true },
    });
    return user?.schoolId === coach.schoolId;
  }

  return false;
};

/**
 * Check if user can manage a match
 */
export const canManageMatch = async (userId, matchId) => {
  if (!userId || !matchId) return false;

  // Admin can manage all matches
  if (await isAdmin(userId)) return true;

  // Get match details
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: { select: { schoolId: true } },
      awayTeam: { select: { schoolId: true } },
    },
  });

  if (!match) return false;

  // Judge can manage matches (if assigned - for now, all judges can manage)
  const user = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role === 'judge') return true;

  // School admin can manage matches involving their school's teams
  if (await isSchoolAdmin(userId)) {
    const schoolAdmin = await prisma.profile.findUnique({
      where: { id: userId },
      select: { schoolId: true },
    });
    return (
      schoolAdmin?.schoolId === match.homeTeam.schoolId ||
      schoolAdmin?.schoolId === match.awayTeam.schoolId
    );
  }

  // Coach can manage matches involving their school's teams
  const userSchoolId = await getUserSchoolId(userId);
  if (userSchoolId) {
    return (
      userSchoolId === match.homeTeam.schoolId ||
      userSchoolId === match.awayTeam.schoolId
    );
  }

  return false;
};

/**
 * Get user's permissions object (for frontend)
 */
export const getUserPermissions = async (userId) => {
  if (!userId) return null;

  const user = await prisma.profile.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      schoolId: true,
      studentSchoolId: true,
    },
    include: {
      coachProfile: {
        select: { schoolId: true },
      },
    },
  });

  if (!user) return null;

  const isAdminUser = user.role === 'admin';
  const isSchoolAdminUser = user.role === 'school_admin';
  const isCoachUser = user.role === 'coach';
  const isJudgeUser = user.role === 'judge';
  const isPlayerUser = user.role === 'player';
  const isSponsorUser = user.role === 'sponsor';

  const schoolId = user.schoolId || user.coachProfile?.schoolId || user.studentSchoolId;

  return {
    userId: user.id,
    role: user.role,
    schoolId,
    can: {
      // Global permissions
      manageAll: isAdminUser,
      viewAll: isAdminUser || isSchoolAdminUser || isCoachUser || isJudgeUser,

      // School management
      manageSchools: isAdminUser,
      manageOwnSchool: isSchoolAdminUser,
      viewSchools: true,

      // Team management
      manageTeams: isAdminUser || isSchoolAdminUser || isCoachUser,
      manageOwnTeams: isSchoolAdminUser || isCoachUser,
      viewTeams: true,

      // Player management
      managePlayers: isAdminUser || isSchoolAdminUser || isCoachUser,
      manageOwnProfile: true,
      viewPlayers: true,

      // Coach management
      manageCoaches: isAdminUser || isSchoolAdminUser,
      viewCoaches: true,

      // Match management
      manageMatches: isAdminUser || isJudgeUser || isSchoolAdminUser || isCoachUser,
      viewMatches: true,

      // Judge management
      manageJudges: isAdminUser,
      viewJudges: isAdminUser || isSchoolAdminUser,

      // Sponsor management
      manageSponsors: isAdminUser || isSchoolAdminUser,
      viewSponsors: true,

      // School admin management
      manageSchoolAdmins: isAdminUser,
      viewSchoolAdmins: isAdminUser || isSchoolAdminUser,

      // Challenge management
      manageChallenges: isAdminUser || isSchoolAdminUser || isCoachUser,
      viewChallenges: true,

      // Arena management
      manageArenas: isAdminUser || isSchoolAdminUser,
      viewArenas: true,
    },
  };
};

/**
 * Permission middleware factory
 */
export const requirePermission = (permissionCheck) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const hasPermission = await permissionCheck(userId, req);
      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

