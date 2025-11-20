/**
 * School Admin Controller
 * Handles all school admin operations with proper RBAC
 */

import db from '../services/database.js';

const prisma = db;

// Get all students for a school (paginated)
export const getSchoolStudents = async (req, res) => {
  try {
    // Get schoolId from middleware (set by requireSchoolAdmin)
    const schoolId = req.schoolId;
    const { page = 1, limit = 20, search, filter } = req.query;
    const userId = req.user?.userId || req.user?.id;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found. User must be associated with a school.' });
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build where clause for students query
    const where = {
      studentSchoolId: schoolId,
      role: 'player', // Only get students (players)
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filter === 'at_risk') {
      // At-risk students have low XP or no academy progress
      where.xp = { lt: 100 };
    }

    // Get students
    const [students, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          teamMembers: {
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          academyProgress: {
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.profile.count({ where }),
    ]);

    const formattedStudents = students.map(student => ({
      id: student.id,
      email: student.email,
      fullName: student.fullName,
      role: student.role,
      studentSchoolId: student.studentSchoolId,
      xp: student.xp,
      age: student.age,
      grade: student.grade,
      studentRole: student.studentRole,
      progress_percentage: student.academyProgress?.[0]?.progress || 0,
      teamMembers: student.teamMembers || [],
    }));

    res.json({
      students: formattedStudents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching school students:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new student (no limit - new students become reserve players when teams are full)
export const createStudent = async (req, res) => {
  try {
    // Get schoolId from middleware (set by requireSchoolAdmin)
    const schoolId = req.schoolId;
    const { email, password, fullName, age, grade, studentNumber } = req.body;
    const userId = req.user?.userId || req.user?.id;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found. User must be associated with a school.' });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.default.hash(password || 'defaultPassword123', 10);

    // Check if email already exists
    const existingUser = await prisma.profile.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create student profile
    const newStudent = await prisma.profile.create({
      data: {
        email,
        password: passwordHash,
        fullName,
        role: 'player',
        studentSchoolId: schoolId,
        age: age || null,
        grade: grade || null,
      },
      include: {
        teamMembers: true,
      },
    });

    res.status(201).json({
      id: newStudent.id,
      email: newStudent.email,
      fullName: newStudent.fullName,
      role: newStudent.role,
      studentSchoolId: newStudent.studentSchoolId,
      age: newStudent.age,
      grade: newStudent.grade,
      xp: newStudent.xp,
      teamMembers: newStudent.teamMembers || [],
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get student profile
export const getStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user?.userId || req.user?.id;

    const student = await prisma.profile.findUnique({
      where: { id: studentId },
      include: {
        teamMembers: {
          include: {
            team: {
              include: {
                school: true,
              },
            },
          },
        },
        academyProgress: {
          take: 10,
          orderBy: { enrolledAt: 'desc' },
        },
        challengeSubmissions: {
          take: 10,
          orderBy: { submittedAt: 'desc' },
          include: {
            challenge: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check authorization
    const user = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (
      !user ||
      (user.role !== 'school_admin' || user.schoolId !== student.studentSchoolId)
    ) {
      if (userId !== studentId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    res.json(student);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all teams for a school
export const getSchoolTeams = async (req, res) => {
  try {
    // Get schoolId from middleware (set by requireSchoolAdmin)
    const schoolId = req.schoolId;
    const userId = req.user?.userId || req.user?.id;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found. User must be associated with a school.' });
    }

    const teams = await prisma.team.findMany({
      where: { schoolId },
      include: {
        members: {
          include: {
            player: {
              select: {
                id: true,
                email: true,
                fullName: true,
                studentRole: true,
                age: true,
                grade: true,
              },
            },
          },
        },
        coach: {
          include: {
            profile: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
        captain: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        teamFeedback: {
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Get latest 5 feedback entries
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(teams);
  } catch (error) {
    console.error('Error fetching school teams:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new team
export const createTeam = async (req, res) => {
  try {
    // Get schoolId from middleware (set by requireSchoolAdmin)
    const schoolId = req.schoolId;
    const { name, tier, coachId, playerIds } = req.body;
    const userId = req.user?.userId || req.user?.id;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found. User must be associated with a school.' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    // Validate tier
    const validTiers = ['beginner', 'amateur', 'regular', 'professional', 'legendary', 'national'];
    const teamTier = tier && validTiers.includes(tier) ? tier : 'beginner';

    // Validate playerIds (max 4)
    const players = Array.isArray(playerIds) ? playerIds.filter(Boolean) : [];
    if (players.length > 4) {
      return res.status(400).json({ error: 'Maximum 4 players allowed per team' });
    }

    // Verify coach belongs to school if coachId is provided
    if (coachId) {
      const coach = await prisma.coach.findUnique({
        where: { id: coachId },
        include: { school: true },
      });

      if (!coach || coach.schoolId !== schoolId) {
        return res.status(400).json({ error: 'Coach does not belong to this school' });
      }
    }

    // Verify all players belong to school
    if (players.length > 0) {
      const playersData = await prisma.profile.findMany({
        where: {
          id: { in: players },
          studentSchoolId: schoolId,
          role: 'player',
        },
      });

      if (playersData.length !== players.length) {
        return res.status(400).json({ error: 'One or more players do not belong to this school' });
      }
    }

    // Create team with members in a transaction
    const team = await prisma.$transaction(async (tx) => {
      // Create team
      const newTeam = await tx.team.create({
        data: {
          schoolId,
          name: name.trim(),
          tier: teamTier,
          coachId: coachId || null,
        },
      });

      // Add players if provided
      if (players.length > 0) {
        await tx.teamMember.createMany({
          data: players.map((playerId) => ({
            teamId: newTeam.id,
            playerId,
          })),
        });
      }

      // Fetch complete team with relations
      return await tx.team.findUnique({
        where: { id: newTeam.id },
        include: {
          members: {
            include: {
              player: {
                select: {
                  id: true,
                  email: true,
                  fullName: true,
                  studentRole: true,
                },
              },
            },
          },
          coach: {
            include: {
              profile: {
                select: {
                  id: true,
                  email: true,
                  fullName: true,
                },
              },
            },
          },
        },
      });
    });

    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add member to team (enforces 4 active members limit)
export const addTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { studentId, role } = req.body;
    const userId = req.user?.userId || req.user?.id;

    // Verify team exists and get school
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { school: true },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Verify authorization
    const user = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'school_admin' || user.schoolId !== team.schoolId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if already in team
    const existing = await prisma.teamMember.findFirst({
      where: {
        teamId,
        playerId: studentId,
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Student is already in this team' });
    }

    // Count active members (all team members are considered active in current schema)
    const activeCount = await prisma.teamMember.count({
      where: {
        teamId,
      },
    });

    if (activeCount >= 4) {
      return res.status(400).json({
        error: 'Team has reached maximum active member limit of 4',
        currentCount: activeCount,
      });
    }

    // Add member
    const member = await prisma.teamMember.create({
      data: {
        teamId,
        playerId: studentId,
      },
      include: {
        player: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ error: error.message });
  }
};

// Swap players between teams with tier qualification
export const swapPlayersBetweenTeams = async (req, res) => {
  try {
    const { sourceTeamId, targetTeamId, sourceMemberId, targetMemberId } = req.body;
    const schoolId = req.schoolId;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found. User must be associated with a school.' });
    }

    if (!sourceTeamId || !targetTeamId || !sourceMemberId || !targetMemberId) {
      return res.status(400).json({ 
        error: 'sourceTeamId, targetTeamId, sourceMemberId, and targetMemberId are required' 
      });
    }

    if (sourceTeamId === targetTeamId) {
      return res.status(400).json({ error: 'Source and target teams must be different' });
    }

    // Verify both teams exist and belong to school
    const [sourceTeam, targetTeam] = await Promise.all([
      prisma.team.findUnique({
        where: { id: sourceTeamId },
        include: { members: true },
      }),
      prisma.team.findUnique({
        where: { id: targetTeamId },
        include: { members: true },
      }),
    ]);

    if (!sourceTeam || sourceTeam.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized: Source team does not belong to your school' });
    }

    if (!targetTeam || targetTeam.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized: Target team does not belong to your school' });
    }

    // Verify members exist in their respective teams
    const sourceMember = sourceTeam.members.find((m) => m.id === sourceMemberId);
    const targetMember = targetTeam.members.find((m) => m.id === targetMemberId);

    if (!sourceMember) {
      return res.status(404).json({ error: 'Source team member not found' });
    }

    if (!targetMember) {
      return res.status(404).json({ error: 'Target team member not found' });
    }

    // Get player profiles to check tier qualification
    const [sourcePlayer, targetPlayer] = await Promise.all([
      prisma.profile.findUnique({ where: { id: sourceMember.playerId } }),
      prisma.profile.findUnique({ where: { id: targetMember.playerId } }),
    ]);

    if (!sourcePlayer || !targetPlayer) {
      return res.status(404).json({ error: 'One or more players not found' });
    }

    // Check tier qualifications
    const sourcePlayerTier = getPlayerQualifiedTier(sourcePlayer.xp || 0);
    const targetPlayerTier = getPlayerQualifiedTier(targetPlayer.xp || 0);

    if (!canPlayerJoinTier(sourcePlayerTier, targetTeam.tier)) {
      return res.status(400).json({ 
        error: `Source player does not qualify for target team's ${targetTeam.tier} tier`,
        playerTier: sourcePlayerTier,
        teamTier: targetTeam.tier,
      });
    }

    if (!canPlayerJoinTier(targetPlayerTier, sourceTeam.tier)) {
      return res.status(400).json({ 
        error: `Target player does not qualify for source team's ${sourceTeam.tier} tier`,
        playerTier: targetPlayerTier,
        teamTier: sourceTeam.tier,
      });
    }

    // Swap players in transaction
    await prisma.$transaction(async (tx) => {
      // Remove both members from their current teams
      await Promise.all([
        tx.teamMember.delete({ where: { id: sourceMemberId } }),
        tx.teamMember.delete({ where: { id: targetMemberId } }),
      ]);

      // Add players to their new teams
      await Promise.all([
        tx.teamMember.create({
          data: {
            teamId: targetTeamId,
            playerId: sourcePlayer.id,
          },
        }),
        tx.teamMember.create({
          data: {
            teamId: sourceTeamId,
            playerId: targetPlayer.id,
          },
        }),
      ]);

      // Handle captain status - if a captain is swapped, remove captain status
      if (sourceTeam.captainId === sourcePlayer.id) {
        await tx.team.update({
          where: { id: sourceTeamId },
          data: { captainId: null },
        });
      }

      if (targetTeam.captainId === targetPlayer.id) {
        await tx.team.update({
          where: { id: targetTeamId },
          data: { captainId: null },
        });
      }
    });

    res.json({ message: 'Players swapped between teams successfully' });
  } catch (error) {
    console.error('Error swapping players between teams:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ 
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
};

// Get school dashboard stats
export const getSchoolDashboard = async (req, res) => {
  try {
    // Get schoolId from middleware (set by requireSchoolAdmin)
    const schoolId = req.schoolId;
    const userId = req.user?.userId || req.user?.id;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found. User must be associated with a school.' });
    }

    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      console.error('❌ [Dashboard] Database connection failed:', dbError.message);
      return res.status(503).json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to database',
      });
    }

    let school;
    try {
      school = await prisma.school.findUnique({
        where: { id: schoolId },
        include: {
          teams: {
            select: {
              id: true,
              name: true,
              tier: true,
              points: true,
              wins: true,
              draws: true,
              losses: true,
              createdAt: true,
              // Only select fields that definitely exist - don't include new fields until migrations run
            },
          },
        },
      });
    } catch (queryError) {
      console.error('❌ [Dashboard] Query error:', queryError.message);
      console.error('❌ [Dashboard] Error code:', queryError.code);
      
      // If it's a column error, try without the new fields
      if (queryError.message && (queryError.message.includes("doesn't exist") || queryError.message.includes("Unknown column"))) {
        console.warn('⚠️ [Dashboard] Some columns may not exist. Please run: npm run prisma:push');
        // Retry with minimal fields
        school = await prisma.school.findUnique({
          where: { id: schoolId },
          select: {
            id: true,
            name: true,
            location: true,
            tier: true,
            motto: true,
            teams: {
              select: {
                id: true,
                name: true,
                tier: true,
                points: true,
                wins: true,
                draws: true,
                losses: true,
              },
            },
          },
        });
      } else {
        throw queryError;
      }
    }

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Get student count
    const studentCount = await prisma.profile.count({
      where: {
        studentSchoolId: schoolId,
        role: 'player',
      },
    });

    const teamCount = school.teams?.length || 0;

    // Get at-risk students (low XP or no academy progress)
    const atRiskStudents = await prisma.profile.count({
      where: {
        studentSchoolId: schoolId,
        role: 'player',
        OR: [
          { xp: { lt: 100 } },
          {
            academyProgress: {
              none: {},
            },
          },
        ],
      },
    });

    // Get upcoming matches for school teams
    const teamIds = school.teams?.map((t) => t.id) || [];
    const upcomingMatches = teamIds.length > 0 ? await prisma.match.findMany({
      where: {
        OR: [
          { homeTeamId: { in: teamIds } },
          { awayTeamId: { in: teamIds } },
        ],
        status: 'scheduled',
        scheduledAt: { gte: new Date() },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      take: 5,
      orderBy: {
        scheduledAt: 'asc',
      },
    }) : [];

    // Get recent submissions
    const recentSubmissions = await prisma.challengeSubmission.findMany({
      where: {
        player: {
          studentSchoolId: schoolId,
        },
      },
      include: {
        player: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        challenge: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
      },
      take: 10,
      orderBy: {
        submittedAt: 'desc',
      },
    });

    res.json({
      stats: {
        studentCount,
        teamCount,
        atRiskStudents,
      },
      upcomingMatches,
      recentSubmissions: recentSubmissions.map((s) => ({
        id: s.id,
        status: s.status,
        score: s.score,
        submittedAt: s.submittedAt,
        student: s.player,
        challenge: s.challenge,
      })),
    });
  } catch (error) {
    console.error('❌ [Dashboard] Error fetching school dashboard:', error);
    console.error('❌ [Dashboard] Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard',
      message: error.message || 'Database error. Please ensure migrations have been run.',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
};

// Delete team
export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const schoolId = req.schoolId;
    const userId = req.user?.userId || req.user?.id;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found. User must be associated with a school.' });
    }

    // Verify team exists and belongs to school
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized: Team does not belong to your school' });
    }

    // Delete team (cascade will delete members and feedback)
    await prisma.team.delete({
      where: { id: teamId },
    });

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: error.message });
  }
};

// Remove team member
export const removeTeamMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const schoolId = req.schoolId;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found. User must be associated with a school.' });
    }

    // Verify team exists and belongs to school
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Verify member exists and belongs to team
    const member = await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        teamId,
      },
    });

    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // If member is captain, remove captain status first
    if (team.captainId === member.playerId) {
      await prisma.team.update({
        where: { id: teamId },
        data: { captainId: null },
      });
    }

    // Remove member
    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    res.json({ message: 'Team member removed successfully' });
  } catch (error) {
    console.error('Error removing team member:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ 
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
};

// Helper function to check if player qualifies for team tier based on XP
function getPlayerQualifiedTier(xp) {
  if (xp >= 10000) return 'national';
  if (xp >= 5000) return 'legendary';
  if (xp >= 2500) return 'professional';
  if (xp >= 1000) return 'regular';
  if (xp >= 500) return 'amateur';
  return 'beginner';
}

// Helper function to check if player can join team tier
function canPlayerJoinTier(playerTier, teamTier) {
  const tierOrder = ['beginner', 'amateur', 'regular', 'professional', 'legendary', 'national'];
  const playerTierIndex = tierOrder.indexOf(playerTier);
  const teamTierIndex = tierOrder.indexOf(teamTier);
  
  // Player can join team if their tier is equal or higher (can't downgrade)
  // Or if team tier is beginner (anyone can join beginner)
  return teamTier === 'beginner' || playerTierIndex >= teamTierIndex;
}

// Swap team member (remove one and add another)
export const swapTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { removeMemberId, addPlayerId, sourceTeamId } = req.body; // sourceTeamId is optional for inter-team swaps
    const schoolId = req.schoolId;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found. User must be associated with a school.' });
    }

    if (!removeMemberId || !addPlayerId) {
      return res.status(400).json({ error: 'Both removeMemberId and addPlayerId are required' });
    }

    // Verify target team exists and belongs to school
    const targetTeam = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });

    if (!targetTeam || targetTeam.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized: Target team does not belong to your school' });
    }

    // Verify source team if provided (inter-team swap)
    let sourceTeam = null;
    if (sourceTeamId) {
      sourceTeam = await prisma.team.findUnique({
        where: { id: sourceTeamId },
        include: {
          members: true,
        },
      });

      if (!sourceTeam || sourceTeam.schoolId !== schoolId) {
        return res.status(403).json({ error: 'Unauthorized: Source team does not belong to your school' });
      }

      // Verify member belongs to source team
      const sourceMember = sourceTeam.members.find((m) => m.id === removeMemberId);
      if (!sourceMember) {
        return res.status(404).json({ error: 'Source team member not found' });
      }
    } else {
      // Reserve player swap - verify member belongs to target team
      const targetMember = targetTeam.members.find((m) => m.id === removeMemberId);
      if (!targetMember) {
        return res.status(404).json({ error: 'Target team member not found' });
      }
    }

    // Verify player belongs to school
    const player = await prisma.profile.findUnique({
      where: {
        id: addPlayerId,
        studentSchoolId: schoolId,
        role: 'player',
      },
    });

    if (!player) {
      return res.status(400).json({ error: 'Player does not belong to this school' });
    }

    // Check if player is already in the target team
    const existingMember = targetTeam.members.find((m) => m.playerId === addPlayerId);
    if (existingMember) {
      return res.status(400).json({ error: 'Player is already in the target team' });
    }

    // Check if player is in another team (for inter-team swap)
    if (sourceTeamId) {
      const playerInOtherTeam = await prisma.teamMember.findFirst({
        where: {
          playerId: addPlayerId,
          teamId: { not: sourceTeamId },
        },
      });

      if (!playerInOtherTeam || playerInOtherTeam.teamId !== teamId) {
        // Player must be in the source team for inter-team swap
        return res.status(400).json({ error: 'Player must be in the source team for inter-team swap' });
      }
    } else {
      // Reserve player swap - check if player is already in any team
      const playerInTeam = await prisma.teamMember.findFirst({
        where: {
          playerId: addPlayerId,
        },
      });

      if (playerInTeam) {
        return res.status(400).json({ error: 'Player is already in a team. Use inter-team swap instead.' });
      }
    }

    // Check tier qualification for target team
    const playerQualifiedTier = getPlayerQualifiedTier(player.xp || 0);
    if (!canPlayerJoinTier(playerQualifiedTier, targetTeam.tier)) {
      return res.status(400).json({ 
        error: `Player does not qualify for ${targetTeam.tier} tier. Player's tier: ${playerQualifiedTier}`,
        playerTier: playerQualifiedTier,
        teamTier: targetTeam.tier,
      });
    }

    // Swap in transaction
    await prisma.$transaction(async (tx) => {
      // Remove old member from target team
      await tx.teamMember.delete({
        where: { id: removeMemberId },
      });

      // If inter-team swap, also handle source team
      if (sourceTeamId && sourceTeamId !== teamId) {
        // Find the player being swapped in source team
        const sourcePlayerMember = sourceTeam.members.find((m) => m.playerId === addPlayerId);
        
        if (sourcePlayerMember) {
          // Remove player from source team
          await tx.teamMember.delete({
            where: { id: sourcePlayerMember.id },
          });

          // Add removed member to source team (swap both ways)
          await tx.teamMember.create({
            data: {
              teamId: sourceTeamId,
              playerId: targetTeam.members.find((m) => m.id === removeMemberId)?.playerId,
            },
          });
        }
      }

      // Add new member to target team
      await tx.teamMember.create({
        data: {
          teamId,
          playerId: addPlayerId,
        },
      });

      // If removed member was captain, remove captain status
      if (targetTeam.captainId === targetTeam.members.find((m) => m.id === removeMemberId)?.playerId) {
        await tx.team.update({
          where: { id: teamId },
          data: { captainId: null },
        });
      }
    });

    res.json({ message: 'Team member swapped successfully' });
  } catch (error) {
    console.error('Error swapping team member:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ 
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
};

// Assign coach to team
export const assignCoach = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { coachId } = req.body;
    const schoolId = req.schoolId;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found. User must be associated with a school.' });
    }

    if (!coachId) {
      return res.status(400).json({ error: 'Coach ID is required' });
    }

    // Verify team exists and belongs to school
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Verify coach belongs to school
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
    });

    if (!coach || coach.schoolId !== schoolId) {
      return res.status(400).json({ error: 'Coach does not belong to this school' });
    }

    // Update team coach
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { coachId },
      include: {
        coach: {
          include: {
            profile: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    res.json(updatedTeam);
  } catch (error) {
    console.error('Error assigning coach:', error);
    res.status(500).json({ error: error.message });
  }
};

// Remove coach from team
export const removeCoach = async (req, res) => {
  try {
    const { teamId } = req.params;
    const schoolId = req.schoolId;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found. User must be associated with a school.' });
    }

    // Verify team exists and belongs to school
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Remove coach
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { coachId: null },
    });

    res.json({ message: 'Coach removed successfully', team: updatedTeam });
  } catch (error) {
    console.error('Error removing coach:', error);
    res.status(500).json({ error: error.message });
  }
};

// Swap coach (assign new coach, replacing old one)
export const swapCoach = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { coachId } = req.body;
    const schoolId = req.schoolId;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found. User must be associated with a school.' });
    }

    if (!coachId) {
      return res.status(400).json({ error: 'Coach ID is required' });
    }

    // Verify team exists and belongs to school
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Verify coach belongs to school
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
    });

    if (!coach || coach.schoolId !== schoolId) {
      return res.status(400).json({ error: 'Coach does not belong to this school' });
    }

    // Update team coach
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { coachId },
      include: {
        coach: {
          include: {
            profile: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    res.json(updatedTeam);
  } catch (error) {
    console.error('Error swapping coach:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add feedback/comment to team
export const addTeamFeedback = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { message, isPublic } = req.body;
    const userId = req.user?.userId || req.user?.id;
    const schoolId = req.schoolId;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found. User must be associated with a school.' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Verify team exists and belongs to school
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Create feedback
    const feedback = await prisma.teamFeedback.create({
      data: {
        teamId,
        authorId: userId,
        message: message.trim(),
        isPublic: isPublic !== undefined ? isPublic : true,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error adding team feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get team feedback
export const getTeamFeedback = async (req, res) => {
  try {
    const { teamId } = req.params;
    const schoolId = req.schoolId;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found. User must be associated with a school.' });
    }

    // Verify team exists and belongs to school
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get feedback
    const feedback = await prisma.teamFeedback.findMany({
      where: { teamId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching team feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get school coaches (for dropdown)
export const getSchoolCoaches = async (req, res) => {
  try {
    const schoolId = req.schoolId;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found. User must be associated with a school.' });
    }

    const coaches = await prisma.coach.findMany({
      where: { schoolId },
      include: {
        profile: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    res.json(coaches);
  } catch (error) {
    console.error('Error fetching school coaches:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get reserve players (students not in any team)
export const getReservePlayers = async (req, res) => {
  try {
    const schoolId = req.schoolId;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found. User must be associated with a school.' });
    }

    // Get all students in the school
    const allStudents = await prisma.profile.findMany({
      where: {
        studentSchoolId: schoolId,
        role: 'player',
      },
      include: {
        teamMembers: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                tier: true,
              },
            },
          },
        },
      },
    });

    // Filter students who are not in any team
    const reservePlayers = allStudents.filter((student) => !student.teamMembers || student.teamMembers.length === 0);

    // Add tier qualification for each player
    const reservePlayersWithTier = reservePlayers.map((player) => {
      const qualifiedTier = getPlayerQualifiedTier(player.xp || 0);
      return {
        id: player.id,
        email: player.email,
        fullName: player.fullName,
        age: player.age,
        grade: player.grade,
        xp: player.xp || 0,
        studentRole: player.studentRole,
        qualifiedTier,
      };
    });

    res.json(reservePlayersWithTier);
  } catch (error) {
    console.error('Error fetching reserve players:', error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== SETTINGS CONTROLLERS ====================

// 1. School Profile Settings
export const getSchoolProfile = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found' });
    }

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        coaches: {
          include: {
            profile: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Parse JSON fields safely
    let socialMedia = null;
    let achievements = null;
    
    try {
      if (school.socialMedia) {
        socialMedia = typeof school.socialMedia === 'string' ? JSON.parse(school.socialMedia) : school.socialMedia;
      }
    } catch (e) {
      console.warn('Error parsing socialMedia JSON:', e);
    }
    
    try {
      if (school.achievements) {
        achievements = typeof school.achievements === 'string' ? JSON.parse(school.achievements) : school.achievements;
      }
    } catch (e) {
      console.warn('Error parsing achievements JSON:', e);
    }

    res.json({
      ...school,
      socialMedia,
      achievements,
    });
  } catch (error) {
    console.error('Error fetching school profile:', error);
    res.status(500).json({ error: error.message || 'Database error. Please ensure migrations have been run.' });
  }
};

export const updateSchoolProfile = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found' });
    }

    const {
      name,
      motto,
      logoUrl,
      bannerUrl,
      address,
      contactEmail,
      contactPhone,
      socialMedia,
      colorTheme,
      anthemUrl,
      description,
      achievements,
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (motto !== undefined) updateData.motto = motto;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
    if (address !== undefined) updateData.address = address;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (socialMedia !== undefined) updateData.socialMedia = JSON.stringify(socialMedia);
    if (colorTheme !== undefined) updateData.colorTheme = colorTheme;
    if (anthemUrl !== undefined) updateData.anthemUrl = anthemUrl;
    if (description !== undefined) updateData.description = description;
    if (achievements !== undefined) updateData.achievements = JSON.stringify(achievements);

    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: updateData,
    });

    // Parse JSON fields for response
    const socialMediaParsed = updatedSchool.socialMedia ? JSON.parse(updatedSchool.socialMedia) : null;
    const achievementsParsed = updatedSchool.achievements ? JSON.parse(updatedSchool.achievements) : null;

    res.json({
      ...updatedSchool,
      socialMedia: socialMediaParsed,
      achievements: achievementsParsed,
    });
  } catch (error) {
    console.error('Error updating school profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Coaches & Staff Permissions
export const addCoach = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found' });
    }

    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and fullName are required' });
    }

    // Check if email already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { email },
    });

    if (existingProfile) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.default.hash(password, 10);

    // Create coach in transaction
    const coach = await prisma.$transaction(async (tx) => {
      // Create profile
      const profile = await tx.profile.create({
        data: {
          email,
          password: passwordHash,
          fullName,
          role: 'coach',
        },
      });

      // Create coach record
      const newCoach = await tx.coach.create({
        data: {
          profileId: profile.id,
          schoolId,
        },
        include: {
          profile: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });

      return newCoach;
    });

    res.status(201).json(coach);
  } catch (error) {
    console.error('Error adding coach:', error);
    res.status(500).json({ error: error.message });
  }
};

export const removeCoachFromSchool = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const { coachId } = req.params;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found' });
    }

    // Verify coach belongs to school
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
    });

    if (!coach || coach.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized: Coach does not belong to your school' });
    }

    // Remove coach (cascade will handle profile if needed, but we'll keep profile)
    await prisma.coach.delete({
      where: { id: coachId },
    });

    res.json({ message: 'Coach removed successfully' });
  } catch (error) {
    console.error('Error removing coach:', error);
    res.status(500).json({ error: error.message });
  }
};

// 3. Team Configuration Settings
export const updateTeamSettings = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const { teamId } = req.params;
    const {
      name,
      logoUrl,
      homeArena,
      teamColors,
      category,
      coachCanManageLineups,
      coachCanEditInfo,
      coachCanUploadSubmissions,
      coachCanViewAnalytics,
      coachCanManageFinances,
    } = req.body;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found' });
    }

    // Verify team belongs to school
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (homeArena !== undefined) updateData.homeArena = homeArena;
    if (teamColors !== undefined) updateData.teamColors = JSON.stringify(teamColors);
    if (category !== undefined) updateData.category = category;
    if (coachCanManageLineups !== undefined) updateData.coachCanManageLineups = coachCanManageLineups;
    if (coachCanEditInfo !== undefined) updateData.coachCanEditInfo = coachCanEditInfo;
    if (coachCanUploadSubmissions !== undefined) updateData.coachCanUploadSubmissions = coachCanUploadSubmissions;
    if (coachCanViewAnalytics !== undefined) updateData.coachCanViewAnalytics = coachCanViewAnalytics;
    if (coachCanManageFinances !== undefined) updateData.coachCanManageFinances = coachCanManageFinances;

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: updateData,
      include: {
        coach: {
          include: {
            profile: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
        members: {
          include: {
            player: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    // Parse teamColors for response
    const teamColorsParsed = updatedTeam.teamColors ? JSON.parse(updatedTeam.teamColors) : null;

    res.json({
      ...updatedTeam,
      teamColors: teamColorsParsed,
    });
  } catch (error) {
    console.error('Error updating team settings:', error);
    res.status(500).json({ error: error.message });
  }
};

// 4. Sponsorship & Arena Settings
export const getSchoolSponsorships = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found' });
    }

    // Check if model exists in Prisma client
    if (!prisma.schoolSponsorship) {
      console.warn('⚠️ [Sponsorships] SchoolSponsorship model not found in Prisma client. Please run: npm run prisma:generate');
      return res.json([]);
    }

    // Check if table exists, if not return empty array
    try {
      const sponsorships = await prisma.schoolSponsorship.findMany({
        where: { schoolId },
        orderBy: { createdAt: 'desc' },
      });

      // Parse JSON fields
      const sponsorshipsWithParsed = sponsorships.map((sp) => ({
        ...sp,
        assets: sp.assets ? JSON.parse(sp.assets) : null,
      }));

      res.json(sponsorshipsWithParsed);
    } catch (dbError) {
      // If table doesn't exist, return empty array
      if (dbError.message && (dbError.message.includes("doesn't exist") || dbError.message.includes("Unknown table"))) {
        console.warn('SchoolSponsorship table does not exist yet. Please run: npm run prisma:push');
        res.json([]);
      } else {
        throw dbError;
      }
    }
  } catch (error) {
    console.error('Error fetching sponsorships:', error);
    res.status(500).json({ error: error.message || 'Database error. Please ensure migrations have been run.' });
  }
};

export const createSponsorship = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found' });
    }

    // Check if model exists in Prisma client
    if (!prisma.schoolSponsorship) {
      return res.status(503).json({ 
        error: 'Database model not available',
        message: 'Please restart the server after running: npm run prisma:generate'
      });
    }

    const { sponsorName, sponsorType, proposalUrl, offerDetails, assets } = req.body;

    if (!sponsorName || !sponsorType) {
      return res.status(400).json({ error: 'Sponsor name and type are required' });
    }

    const sponsorship = await prisma.schoolSponsorship.create({
      data: {
        schoolId,
        sponsorName,
        sponsorType,
        proposalUrl,
        offerDetails,
        assets: assets ? JSON.stringify(assets) : null,
      },
    });

    res.status(201).json({
      ...sponsorship,
      assets: sponsorship.assets ? JSON.parse(sponsorship.assets) : null,
    });
  } catch (error) {
    console.error('Error creating sponsorship:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateSponsorshipStatus = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const { sponsorshipId } = req.params;
    const { status } = req.body;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found' });
    }

    if (!['pending', 'approved', 'rejected', 'active'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const sponsorship = await prisma.schoolSponsorship.findUnique({
      where: { id: sponsorshipId },
    });

    if (!sponsorship || sponsorship.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData = { status };
    if (status === 'approved' || status === 'active') {
      updateData.approvedAt = new Date();
    }

    const updated = await prisma.schoolSponsorship.update({
      where: { id: sponsorshipId },
      data: updateData,
    });

    res.json({
      ...updated,
      assets: updated.assets ? JSON.parse(updated.assets) : null,
    });
  } catch (error) {
    console.error('Error updating sponsorship:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getArenaApplications = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found' });
    }

    const applications = await prisma.arenaApplication.findMany({
      where: { schoolId },
      include: {
        arena: true,
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching arena applications:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createArenaApplication = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found' });
    }

    const { arenaId, message } = req.body;

    if (!arenaId) {
      return res.status(400).json({ error: 'Arena ID is required' });
    }

    // Verify arena exists and belongs to school
    const arena = await prisma.arena.findUnique({
      where: { id: arenaId },
    });

    if (!arena || arena.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized: Arena does not belong to your school' });
    }

    const application = await prisma.arenaApplication.create({
      data: {
        arenaId,
        schoolId,
        message,
      },
      include: {
        arena: true,
      },
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating arena application:', error);
    res.status(500).json({ error: error.message });
  }
};

// 5. Finance & Transactions Settings
export const getSchoolFinances = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found' });
    }

    // Check if model exists in Prisma client
    if (!prisma.schoolFinance) {
      console.warn('⚠️ [Finances] SchoolFinance model not found in Prisma client. Please run: npm run prisma:generate');
      return res.json([]);
    }

    try {
      const finances = await prisma.schoolFinance.findMany({
        where: { schoolId },
        include: {
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(finances);
    } catch (dbError) {
      // If table doesn't exist, return empty array
      if (dbError.message && (dbError.message.includes("doesn't exist") || dbError.message.includes("Unknown table"))) {
        console.warn('SchoolFinance table does not exist yet. Please run: npm run prisma:push');
        res.json([]);
      } else {
        throw dbError;
      }
    }
  } catch (error) {
    console.error('Error fetching finances:', error);
    res.status(500).json({ error: error.message || 'Database error. Please ensure migrations have been run.' });
  }
};

export const createFinance = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found' });
    }

    // Check if model exists in Prisma client
    if (!prisma.schoolFinance) {
      return res.status(503).json({ 
        error: 'Database model not available',
        message: 'Please restart the server after running: npm run prisma:generate'
      });
    }

    const { type, amount, description, status, dueDate, teamId } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ error: 'Type and amount are required' });
    }

    // Verify team belongs to school if teamId provided
    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team || team.schoolId !== schoolId) {
        return res.status(403).json({ error: 'Unauthorized: Team does not belong to your school' });
      }
    }

    const finance = await prisma.schoolFinance.create({
      data: {
        schoolId,
        type,
        amount: parseFloat(amount),
        description,
        status: status || 'pending',
        dueDate: dueDate ? new Date(dueDate) : null,
        teamId: teamId || null,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(finance);
  } catch (error) {
    console.error('Error creating finance record:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateFinanceStatus = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const { financeId } = req.params;
    const { status, invoiceUrl, receiptUrl } = req.body;

    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found' });
    }

    const finance = await prisma.schoolFinance.findUnique({
      where: { id: financeId },
    });

    if (!finance || finance.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (invoiceUrl !== undefined) updateData.invoiceUrl = invoiceUrl;
    if (receiptUrl !== undefined) updateData.receiptUrl = receiptUrl;
    if (status === 'paid') {
      updateData.paidAt = new Date();
    }

    const updated = await prisma.schoolFinance.update({
      where: { id: financeId },
      data: updateData,
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating finance status:', error);
    res.status(500).json({ error: error.message });
  }
};

// 6. Communication & Notification Settings
export const getNotificationSettings = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found' });
    }

    // Check if model exists in Prisma client
    if (!prisma.schoolNotification) {
      console.warn('⚠️ [Notifications] SchoolNotification model not found in Prisma client. Please run: npm run prisma:generate');
      return res.json([]);
    }

    try {
      const notifications = await prisma.schoolNotification.findMany({
        where: { schoolId },
      });

      res.json(notifications);
    } catch (dbError) {
      // If table doesn't exist, return empty array
      if (dbError.message && (dbError.message.includes("doesn't exist") || dbError.message.includes("Unknown table"))) {
        console.warn('SchoolNotification table does not exist yet. Please run: npm run prisma:push');
        res.json([]);
      } else {
        throw dbError;
      }
    }
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ error: error.message || 'Database error. Please ensure migrations have been run.' });
  }
};

export const updateNotificationSettings = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'School ID not found' });
    }

    // Check if model exists in Prisma client
    if (!prisma.schoolNotification) {
      return res.status(503).json({ 
        error: 'Database model not available',
        message: 'Please restart the server after running: npm run prisma:generate'
      });
    }

    const { notificationType, channel, enabled, urgencyLevel } = req.body;

    if (!notificationType) {
      return res.status(400).json({ error: 'Notification type is required' });
    }

    const notification = await prisma.schoolNotification.upsert({
      where: {
        schoolId_notificationType: {
          schoolId,
          notificationType,
        },
      },
      update: {
        channel: channel || undefined,
        enabled: enabled !== undefined ? enabled : undefined,
        urgencyLevel: urgencyLevel || undefined,
      },
      create: {
        schoolId,
        notificationType,
        channel: channel || 'email',
        enabled: enabled !== undefined ? enabled : true,
        urgencyLevel: urgencyLevel || null,
      },
    });

    res.json(notification);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  getSchoolStudents,
  createStudent,
  getStudentProfile,
  getSchoolTeams,
  createTeam,
  addTeamMember,
  deleteTeam,
  removeTeamMember,
  swapTeamMember,
  swapPlayersBetweenTeams,
  assignCoach,
  removeCoach,
  swapCoach,
  addTeamFeedback,
  getTeamFeedback,
  getSchoolCoaches,
  getReservePlayers,
  getSchoolDashboard,
  // Settings
  getSchoolProfile,
  updateSchoolProfile,
  addCoach,
  removeCoachFromSchool,
  updateTeamSettings,
  getSchoolSponsorships,
  createSponsorship,
  updateSponsorshipStatus,
  getArenaApplications,
  createArenaApplication,
  getSchoolFinances,
  createFinance,
  updateFinanceStatus,
  getNotificationSettings,
  updateNotificationSettings,
};

