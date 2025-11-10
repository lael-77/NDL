import db from '../services/database.js';
import bcrypt from 'bcryptjs';

// Use the database service (primary database)
const prisma = db;

// Helper function to check if user is admin
const isAdmin = async (userId) => {
  if (!userId) return false;
  const user = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === 'admin';
};

// Helper function to check if user is school admin
const isSchoolAdmin = async (userId) => {
  if (!userId) return false;
  const user = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true, schoolId: true },
  });
  return user?.role === 'school_admin';
};

// Helper function to check if user is coach
const isCoach = async (userId) => {
  if (!userId) return false;
  const user = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== 'coach') return false;
  const coach = await prisma.coach.findUnique({
    where: { profileId: userId },
    select: { schoolId: true },
  });
  return coach ? { isCoach: true, schoolId: coach.schoolId } : false;
};

// Create user (admin only)
export const createUser = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: 'Only admins can create users' });
    }

    const { email, password, fullName, role, schoolId, age, grade, studentRole } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: 'Email, password, full name, and role are required' });
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

    // Prepare user data
    const userData = {
      email,
      password: hashedPassword,
      fullName,
      role,
      schoolId: role === 'school_admin' ? schoolId : null,
      age: role === 'player' ? age : null,
      grade: role === 'player' ? grade : null,
      studentRole: role === 'player' ? studentRole : null,
    };

    // Create user profile
    const user = await prisma.profile.create({
      data: userData,
    });

    // If coach, create coach profile
    if (role === 'coach' && schoolId) {
      await prisma.coach.create({
        data: {
          profileId: user.id,
          schoolId: schoolId,
        },
      });
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: 'Only admins can delete users' });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Prevent deleting yourself
    if (id === userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Check if user exists
    const user = await prisma.profile.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user (cascade will handle related records)
    await prisma.profile.delete({
      where: { id },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Change user role (admin only)
export const changeUserRole = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: 'Only admins can change user roles' });
    }

    const { id } = req.params;
    const { role, schoolId } = req.body;

    if (!id || !role) {
      return res.status(400).json({ error: 'User ID and role are required' });
    }

    // Check if user exists
    const user = await prisma.profile.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent changing your own role
    if (id === userId && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot change your own role from admin' });
    }

    // Update user role
    const updateData = {
      role,
      schoolId: role === 'school_admin' ? schoolId : null,
    };

    // If changing to coach, create coach profile if doesn't exist
    if (role === 'coach' && schoolId) {
      const existingCoach = await prisma.coach.findUnique({
        where: { profileId: id },
      });
      if (!existingCoach) {
        await prisma.coach.create({
          data: {
            profileId: id,
            schoolId: schoolId,
          },
        });
      }
    }

    // If changing from coach, delete coach profile
    if (user.role === 'coach' && role !== 'coach') {
      await prisma.coach.deleteMany({
        where: { profileId: id },
      });
    }

    const updatedUser = await prisma.profile.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: 'User role updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Error changing user role:', error);
    res.status(500).json({ error: error.message });
  }
};

// Promote/relegate school (admin only)
export const promoteRelegateSchool = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: 'Only admins can promote/relegate schools' });
    }

    const { id } = req.params;
    const { tier, action } = req.body; // action: 'promote' or 'relegate'

    if (!id) {
      return res.status(400).json({ error: 'School ID is required' });
    }

    // Get current school
    const school = await prisma.school.findUnique({
      where: { id },
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    let newTier = tier;

    // If action is provided, calculate new tier
    if (action && !tier) {
      const tierOrder = ['beginner', 'amateur', 'regular', 'professional', 'legendary', 'national'];
      const currentIndex = tierOrder.indexOf(school.tier);
      
      if (action === 'promote' && currentIndex < tierOrder.length - 1) {
        newTier = tierOrder[currentIndex + 1];
      } else if (action === 'relegate' && currentIndex > 0) {
        newTier = tierOrder[currentIndex - 1];
      } else {
        return res.status(400).json({ error: `Cannot ${action} school from ${school.tier} tier` });
      }
    }

    if (!newTier) {
      return res.status(400).json({ error: 'Tier or action is required' });
    }

    // Update school tier
    const updatedSchool = await prisma.school.update({
      where: { id },
      data: { tier: newTier },
    });

    // Update all teams in the school to the new tier
    await prisma.team.updateMany({
      where: { schoolId: id },
      data: { tier: newTier },
    });

    res.json({
      message: `School ${action || 'tier'} updated successfully`,
      school: {
        id: updatedSchool.id,
        name: updatedSchool.name,
        tier: updatedSchool.tier,
      },
    });
  } catch (error) {
    console.error('Error promoting/relegating school:', error);
    res.status(500).json({ error: error.message });
  }
};

// Assign student to team (school admin or coach)
export const assignStudentToTeam = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    const { studentId, teamId } = req.body;

    if (!studentId || !teamId) {
      return res.status(400).json({ error: 'Student ID and Team ID are required' });
    }

    // Check permissions
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      include: { school: true },
    });

    const isAdminUser = await isAdmin(userId);
    const isSchoolAdminUser = await isSchoolAdmin(userId);
    const coachCheck = await isCoach(userId);

    // Get team to check school
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { school: true },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user has permission
    let hasPermission = false;
    if (isAdminUser) {
      hasPermission = true;
    } else if (isSchoolAdminUser && user.schoolId === team.schoolId) {
      hasPermission = true;
    } else if (coachCheck && coachCheck.schoolId === team.schoolId) {
      hasPermission = true;
    }

    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to assign students to this team' });
    }

    // Check if student exists and is a player
    const student = await prisma.profile.findUnique({
      where: { id: studentId },
    });

    if (!student || student.role !== 'player') {
      return res.status(400).json({ error: 'Student not found or is not a player' });
    }

    // Check if already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_playerId: {
          teamId,
          playerId: studentId,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Student is already a member of this team' });
    }

    // Add student to team
    await prisma.teamMember.create({
      data: {
        teamId,
        playerId: studentId,
      },
    });

    res.json({ message: 'Student assigned to team successfully' });
  } catch (error) {
    console.error('Error assigning student to team:', error);
    res.status(500).json({ error: error.message });
  }
};

// Remove student from team (school admin or coach)
export const removeStudentFromTeam = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    const { studentId, teamId } = req.body;

    if (!studentId || !teamId) {
      return res.status(400).json({ error: 'Student ID and Team ID are required' });
    }

    // Check permissions (same logic as assignStudentToTeam)
    const user = await prisma.profile.findUnique({
      where: { id: userId },
    });

    const isAdminUser = await isAdmin(userId);
    const isSchoolAdminUser = await isSchoolAdmin(userId);
    const coachCheck = await isCoach(userId);

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    let hasPermission = false;
    if (isAdminUser) {
      hasPermission = true;
    } else if (isSchoolAdminUser && user.schoolId === team.schoolId) {
      hasPermission = true;
    } else if (coachCheck && coachCheck.schoolId === team.schoolId) {
      hasPermission = true;
    }

    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to remove students from this team' });
    }

    // Remove student from team
    await prisma.teamMember.deleteMany({
      where: {
        teamId,
        playerId: studentId,
      },
    });

    res.json({ message: 'Student removed from team successfully' });
  } catch (error) {
    console.error('Error removing student from team:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: 'Only admins can view all users' });
    }

    const { role, schoolId } = req.query;

    const where = {};
    if (role) where.role = role;
    if (schoolId) where.schoolId = schoolId;

    const users = await prisma.profile.findMany({
      where,
      include: {
        school: true,
        studentSchool: true,
        coachProfile: {
          include: {
            school: true,
          },
        },
        teamMembers: {
          include: {
            team: {
              include: { school: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get users by role (admin only)
export const getUsersByRole = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: 'Only admins can view users by role' });
    }

    const { role } = req.params;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const users = await prisma.profile.findMany({
      where: { role },
      include: {
        school: true,
        studentSchool: true,
        coachProfile: {
          include: {
            school: true,
          },
        },
        teamMembers: {
          include: {
            team: {
              include: { school: true },
            },
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    res.json({ users, count: users.length });
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({ error: error.message });
  }
};

// Change user's school (admin only)
export const changeUserSchool = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: 'Only admins can change user schools' });
    }

    const { id } = req.params;
    const { schoolId, studentSchoolId } = req.body;

    const user = await prisma.profile.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {};

    // For school_admin, update schoolId
    if (user.role === 'school_admin' && schoolId !== undefined) {
      updateData.schoolId = schoolId;
    }

    // For students, update studentSchoolId
    if (user.role === 'player' && studentSchoolId !== undefined) {
      updateData.studentSchoolId = studentSchoolId;
    }

    // For coaches, update coach's school
    if (user.role === 'coach' && schoolId !== undefined) {
      const coach = await prisma.coach.findUnique({
        where: { profileId: id },
      });
      if (coach) {
        await prisma.coach.update({
          where: { profileId: id },
          data: { schoolId },
        });
      }
    }

    const updatedUser = await prisma.profile.update({
      where: { id },
      data: updateData,
      include: {
        school: true,
        studentSchool: true,
        coachProfile: {
          include: { school: true },
        },
      },
    });

    res.json({
      message: 'User school updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error changing user school:', error);
    res.status(500).json({ error: error.message });
  }
};

// Remove user from role (admin only) - essentially changes role to player
export const removeFromRole = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: 'Only admins can remove users from roles' });
    }

    const { id } = req.params;

    if (id === userId) {
      return res.status(400).json({ error: 'Cannot remove yourself from role' });
    }

    const user = await prisma.profile.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If coach, delete coach profile
    if (user.role === 'coach') {
      await prisma.coach.deleteMany({
        where: { profileId: id },
      });
    }

    // Change role to player
    const updatedUser = await prisma.profile.update({
      where: { id },
      data: {
        role: 'player',
        schoolId: null, // Clear school admin schoolId
      },
      include: {
        studentSchool: true,
      },
    });

    res.json({
      message: 'User removed from role successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error removing user from role:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create school (admin only)
export const createSchool = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: 'Only admins can create schools' });
    }

    const { name, location, tier, motto, sponsor } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'School name is required' });
    }

    // Check if school already exists
    const existingSchool = await prisma.school.findFirst({
      where: { name },
    });

    if (existingSchool) {
      return res.status(400).json({ error: 'School with this name already exists' });
    }

    const school = await prisma.school.create({
      data: {
        name,
        location: location || null,
        tier: tier || 'beginner',
        motto: motto || null,
        sponsor: sponsor || null,
      },
    });

    res.status(201).json({
      message: 'School created successfully',
      school,
    });
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ error: error.message });
  }
};

// Process bulk promotions/relegations (admin only)
export const processBulkPromotionsRelegations = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: 'Only admins can process bulk promotions/relegations' });
    }

    const { action, tier } = req.body; // action: 'promote' or 'relegate', tier: optional specific tier

    if (!action || !['promote', 'relegate'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "promote" or "relegate"' });
    }

    const tierOrder = ['beginner', 'amateur', 'regular', 'professional', 'legendary', 'national'];
    let schoolsToProcess = [];

    if (tier) {
      // Process schools in a specific tier
      schoolsToProcess = await prisma.school.findMany({
        where: { tier },
      });
    } else {
      // Process all schools (except those at max/min tier)
      const excludeTier = action === 'promote' ? 'national' : 'beginner';
      schoolsToProcess = await prisma.school.findMany({
        where: {
          tier: { not: excludeTier },
        },
      });
    }

    const results = {
      promoted: [],
      relegated: [],
      skipped: [],
    };

    for (const school of schoolsToProcess) {
      const currentIndex = tierOrder.indexOf(school.tier);
      
      if (action === 'promote' && currentIndex < tierOrder.length - 1) {
        const newTier = tierOrder[currentIndex + 1];
        await prisma.school.update({
          where: { id: school.id },
          data: { tier: newTier },
        });
        await prisma.team.updateMany({
          where: { schoolId: school.id },
          data: { tier: newTier },
        });
        results.promoted.push({ id: school.id, name: school.name, oldTier: school.tier, newTier });
      } else if (action === 'relegate' && currentIndex > 0) {
        const newTier = tierOrder[currentIndex - 1];
        await prisma.school.update({
          where: { id: school.id },
          data: { tier: newTier },
        });
        await prisma.team.updateMany({
          where: { schoolId: school.id },
          data: { tier: newTier },
        });
        results.relegated.push({ id: school.id, name: school.name, oldTier: school.tier, newTier });
      } else {
        results.skipped.push({ id: school.id, name: school.name, tier: school.tier, reason: `Cannot ${action} from ${school.tier}` });
      }
    }

    res.json({
      message: `Bulk ${action} processed successfully`,
      results,
      summary: {
        total: schoolsToProcess.length,
        processed: results.promoted.length + results.relegated.length,
        skipped: results.skipped.length,
      },
    });
  } catch (error) {
    console.error('Error processing bulk promotions/relegations:', error);
    res.status(500).json({ error: error.message });
  }
};

// Approve match (admin only)
export const approveMatch = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: 'Only admins can approve matches' });
    }

    const { id } = req.params;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.status !== 'scheduled') {
      return res.status(400).json({ error: 'Only scheduled matches can be approved' });
    }

    // Match is already scheduled, approval just confirms it
    // You could add an 'approved' field if needed
    const updatedMatch = await prisma.match.update({
      where: { id },
      data: {
        status: 'scheduled', // Keep as scheduled, or change to 'approved' if you add that status
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        winner: true,
        arena: true,
      },
    });

    // Emit socket event
    emitMatchUpdate(id, updatedMatch);

    res.json({
      message: 'Match approved successfully',
      match: updatedMatch,
    });
  } catch (error) {
    console.error('Error approving match:', error);
    res.status(500).json({ error: error.message });
  }
};

// Edit match results (admin only)
export const editMatchResults = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: 'Only admins can edit match results' });
    }

    const { id } = req.params;
    const { homeScore, awayScore, winnerId, status } = req.body;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const updateData = {};
    if (homeScore !== undefined) updateData.homeScore = parseInt(homeScore);
    if (awayScore !== undefined) updateData.awayScore = parseInt(awayScore);
    if (status) updateData.status = status;

    // Determine winner if scores are provided
    if (homeScore !== undefined && awayScore !== undefined) {
      if (homeScore > awayScore) {
        updateData.winnerId = match.homeTeamId;
      } else if (awayScore > homeScore) {
        updateData.winnerId = match.awayTeamId;
      } else {
        updateData.winnerId = null; // Draw
      }
    } else if (winnerId) {
      updateData.winnerId = winnerId;
    }

    // If marking as completed, update team stats
    if (status === 'completed' && match.status !== 'completed') {
      const { calculateMatchPoints } = await import('../services/scoring.js');
      await calculateMatchPoints(match.id);
    }

    const updatedMatch = await prisma.match.update({
      where: { id },
      data: updateData,
      include: {
        homeTeam: true,
        awayTeam: true,
        winner: true,
        arena: true,
      },
    });

    // Emit socket event
    emitMatchUpdate(id, updatedMatch);

    res.json({
      message: 'Match results updated successfully',
      match: updatedMatch,
    });
  } catch (error) {
    console.error('Error editing match results:', error);
    res.status(500).json({ error: error.message });
  }
};

// Announce challenge (admin only)
export const announceChallenge = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: 'Only admins can announce challenges' });
    }

    const { title, description, difficulty, points, deadline } = req.body;

    if (!title || !description || !difficulty) {
      return res.status(400).json({ error: 'Title, description, and difficulty are required' });
    }

    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        difficulty,
        points: points || 100,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    // Create notifications for all players
    const players = await prisma.profile.findMany({
      where: { role: 'player' },
    });

    const notifications = players.map(player => ({
      userId: player.id,
      title: 'New Challenge Available',
      message: `A new ${difficulty} tier challenge has been announced: ${title}`,
      type: 'challenge',
      link: `/challenges/${challenge.id}`,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    // Emit socket event for real-time updates
    const { getIO } = await import('../services/socket.js');
    const io = getIO();
    if (io) {
      io.emit('challenge:new', {
        challenge,
        message: 'A new challenge has been announced',
      });
    }

    res.status(201).json({
      message: 'Challenge announced successfully',
      challenge,
      notificationsSent: notifications.length,
    });
  } catch (error) {
    console.error('Error announcing challenge:', error);
    res.status(500).json({ error: error.message });
  }
};

// Broadcast message/announcement (admin only)
export const broadcastMessage = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: 'Only admins can broadcast messages' });
    }

    const { title, message, recipients, recipientType } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    let targetUsers = [];

    // Determine recipients
    if (recipients && recipients.length > 0) {
      // Specific users selected
      targetUsers = await prisma.profile.findMany({
        where: {
          id: { in: recipients },
        },
      });
    } else if (recipientType) {
      // All users of a specific type
      if (recipientType === 'all') {
        targetUsers = await prisma.profile.findMany();
      } else {
        targetUsers = await prisma.profile.findMany({
          where: { role: recipientType },
        });
      }
    } else {
      // Default: send to all users
      targetUsers = await prisma.profile.findMany();
    }

    // Create notifications for all recipients
    const notifications = targetUsers.map(user => ({
      userId: user.id,
      title,
      message,
      type: 'announcement',
      link: null,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    // Create messages for all recipients
    const sender = await prisma.profile.findUnique({
      where: { id: userId },
    });

    const messages = targetUsers.map(user => ({
      senderId: userId,
      receiverId: user.id,
      subject: title,
      content: message,
    }));

    await prisma.message.createMany({
      data: messages,
    });

    // Emit socket event for real-time notifications
    const { getIO } = await import('../services/socket.js');
    const io = getIO();
    if (io) {
      targetUsers.forEach(user => {
        io.to(`user:${user.id}`).emit('notification:new', {
          title,
          message,
          type: 'announcement',
        });
      });
    }

    res.json({
      message: 'Message broadcast successfully',
      recipientsCount: targetUsers.length,
      notificationsCreated: notifications.length,
      messagesCreated: messages.length,
    });
  } catch (error) {
    console.error('Error broadcasting message:', error);
    res.status(500).json({ error: error.message });
  }
};

