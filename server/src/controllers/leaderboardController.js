import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get global leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        school: {
          select: {
            name: true,
            tier: true,
            location: true,
            motto: true,
            sponsor: true,
          },
        },
        captain: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { points: 'desc' },
        { wins: 'desc' },
      ],
    });
    
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get leaderboard by tier
export const getLeaderboardByTier = async (req, res) => {
  try {
    const { tier } = req.params;
    
    // Validate tier
    const validTiers = ['beginner', 'amateur', 'regular', 'professional', 'legendary', 'national'];
    const tierLower = tier.toLowerCase();
    if (!validTiers.includes(tierLower)) {
      return res.status(400).json({ error: 'Invalid tier level' });
    }
    
    const teams = await prisma.team.findMany({
      where: {
        tier: tierLower, // Teams now have their own tier field
      },
      include: {
        school: {
          select: {
            name: true,
            tier: true,
            location: true,
            motto: true,
            sponsor: true,
          },
        },
        captain: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { points: 'desc' },
        { wins: 'desc' },
      ],
    });
    
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get students leaderboard
export const getStudentsLeaderboard = async (req, res) => {
  try {
    const { tier } = req.query;
    
    const students = await prisma.profile.findMany({
      where: {
        role: 'player',
        ...(tier && {
          teamMembers: {
            some: {
              team: {
                tier: tier.toLowerCase(),
              },
            },
          },
        }),
      },
      include: {
        teamMembers: {
          include: {
            team: {
              include: {
                school: {
                  select: {
                    name: true,
                    tier: true,
                    location: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { xp: 'desc' },
      ],
    });
    
    // Calculate total points from team matches
    const studentsWithStats = students.map((student) => {
      const teams = (student.teamMembers || []).map((tm) => tm.team).filter(Boolean);
      const totalPoints = teams.reduce((sum, team) => sum + (team?.points || 0), 0);
      const totalWins = teams.reduce((sum, team) => sum + (team?.wins || 0), 0);
      const matchesPlayed = teams.reduce((sum, team) => sum + (team?.wins || 0) + (team?.draws || 0) + (team?.losses || 0), 0);
      
      return {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        xp: student.xp || 0,
        studentRole: student.studentRole,
        age: student.age,
        grade: student.grade,
        totalPoints,
        totalWins,
        matchesPlayed,
        teams: teams.map((t) => ({
          id: t.id,
          name: t.name,
          tier: t.tier,
          school: t.school,
        })),
        currentTeam: teams[0] || null,
      };
    });
    
    // Sort by total points
    studentsWithStats.sort((a, b) => b.totalPoints - a.totalPoints);
    
    res.json(studentsWithStats);
  } catch (error) {
    console.error('Error in getStudentsLeaderboard:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get coaches leaderboard
export const getCoachesLeaderboard = async (req, res) => {
  try {
    const { tier } = req.query;
    
    const coaches = await prisma.coach.findMany({
      include: {
        profile: {
          select: {
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        school: {
          include: {
            teams: {
              ...(tier && {
                where: {
                  tier: tier.toLowerCase(),
                },
              }),
            },
          },
        },
      },
    });
    
    // Calculate stats for each coach
    const coachesWithStats = await Promise.all(coaches.map(async (coach) => {
      const teams = (coach.school?.teams || []);
      const totalPoints = teams.reduce((sum, team) => sum + (team?.points || 0), 0);
      const totalWins = teams.reduce((sum, team) => sum + (team?.wins || 0), 0);
      const totalTeams = teams.length;
      
      // Get team member counts
      const teamMemberCounts = await Promise.all(
        teams.map(async (team) => {
          try {
            const count = await prisma.teamMember.count({
              where: { teamId: team.id },
            });
            return count;
          } catch (err) {
            return 0;
          }
        })
      );
      const totalPlayers = teamMemberCounts.reduce((sum, count) => sum + count, 0);
      
      // Calculate rating (points per team)
      const rating = totalTeams > 0 ? Math.round(totalPoints / totalTeams) : 0;
      
      return {
        id: coach.id,
        profileId: coach.profileId,
        fullName: coach.profile?.fullName || 'Unknown',
        email: coach.profile?.email || '',
        avatarUrl: coach.profile?.avatarUrl || null,
        school: {
          id: coach.school?.id || '',
          name: coach.school?.name || 'Unknown',
          tier: coach.school?.tier || 'beginner',
          location: coach.school?.location || null,
        },
        totalTeams,
        totalWins,
        totalPoints,
        totalPlayers,
        rating,
        teams: teams.map((t) => ({
          id: t.id,
          name: t.name,
          tier: t.tier,
          points: t.points || 0,
          wins: t.wins || 0,
        })),
      };
    }));
    
    // Sort by total points
    coachesWithStats.sort((a, b) => b.totalPoints - a.totalPoints);
    
    res.json(coachesWithStats);
  } catch (error) {
    console.error('Error in getCoachesLeaderboard:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get schools leaderboard (National Table)
export const getSchoolsLeaderboard = async (req, res) => {
  try {
    const { tier } = req.query;
    
    const schools = await prisma.school.findMany({
      where: tier ? { tier: tier.toLowerCase() } : {},
      include: {
        teams: true,
      },
    });
    
    // Calculate stats for each school
    const schoolsWithStats = await Promise.all(schools.map(async (school) => {
      const teams = school.teams || [];
      const totalPoints = teams.reduce((sum, team) => sum + (team?.points || 0), 0);
      const totalWins = teams.reduce((sum, team) => sum + (team?.wins || 0), 0);
      const totalTeams = teams.length;
      
      // Get team member counts
      const teamMemberCounts = await Promise.all(
        teams.map(async (team) => {
          try {
            const count = await prisma.teamMember.count({
              where: { teamId: team.id },
            });
            return count;
          } catch (err) {
            return 0;
          }
        })
      );
      const totalPlayers = teamMemberCounts.reduce((sum, count) => sum + count, 0);
      
      // Get unique tiers
      const tiers = [...new Set(teams.map((t) => t.tier).filter(Boolean))];
      
      // Calculate national rating (weighted average)
      const nationalRating = totalTeams > 0 ? Math.round(totalPoints / totalTeams) : 0;
      
      return {
        id: school.id,
        name: school.name,
        tier: school.tier,
        location: school.location,
        motto: school.motto,
        sponsor: school.sponsor,
        tiers,
        totalTeams,
        totalWins,
        totalPoints,
        totalPlayers,
        nationalRating,
        topTeam: teams.length > 0 
          ? teams.reduce((top, team) => ((team?.points || 0) > (top?.points || 0) ? team : top), teams[0])
          : null,
      };
    }));
    
    // Sort by national rating
    schoolsWithStats.sort((a, b) => b.nationalRating - a.nationalRating);
    
    res.json(schoolsWithStats);
  } catch (error) {
    console.error('Error in getSchoolsLeaderboard:', error);
    res.status(500).json({ error: error.message });
  }
};

