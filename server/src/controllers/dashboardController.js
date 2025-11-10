import db from '../services/database.js';

// Use the database service (primary database)
const prisma = db;

// Get player dashboard data
export const getPlayerDashboard = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get player profile with relations
    const player = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        teamMembers: {
          include: {
            team: {
              include: {
                school: true,
                members: {
                  include: {
                    player: true,
                  },
                },
                captain: true,
              },
            },
          },
        },
        academyProgress: true,
        challengeSubmissions: {
          include: {
            challenge: true,
            team: true,
          },
          orderBy: { submittedAt: 'desc' },
          take: 10,
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        receivedMessages: {
          include: {
            sender: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Get player's team
    const playerTeam = player.teamMembers[0]?.team;

    // Get matches for player's team
    const matches = playerTeam ? await prisma.match.findMany({
      where: {
        OR: [
          { homeTeamId: playerTeam.id },
          { awayTeamId: playerTeam.id },
        ],
      },
      include: {
        homeTeam: {
          include: { school: true },
        },
        awayTeam: {
          include: { school: true },
        },
        winner: true,
        arena: true,
      },
      orderBy: { scheduledAt: 'desc' },
    }) : [];

    // Calculate stats
    const stats = {
      xp: player.xp || 0,
      level: Math.floor((player.xp || 0) / 100) + 1,
      matchesPlayed: playerTeam ? (playerTeam.wins + playerTeam.draws + playerTeam.losses) : 0,
      wins: playerTeam?.wins || 0,
      losses: playerTeam?.losses || 0,
      draws: playerTeam?.draws || 0,
      points: playerTeam?.points || 0,
      challengesCompleted: player.challengeSubmissions.filter(s => s.status === 'approved').length,
      academyProgress: player.academyProgress.length,
      unreadNotifications: player.notifications.filter(n => !n.read).length,
      unreadMessages: player.receivedMessages.filter(m => !m.read).length,
    };

    res.json({
      player,
      team: playerTeam,
      matches,
      stats,
      notifications: player.notifications,
      messages: player.receivedMessages,
      academyProgress: player.academyProgress,
      challengeSubmissions: player.challengeSubmissions,
    });
  } catch (error) {
    console.error('Error fetching player dashboard:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get coach dashboard data
export const getCoachDashboard = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get coach profile with school and teams
    const coach = await prisma.coach.findUnique({
      where: { profileId: userId },
      include: {
        profile: true,
        school: {
          include: {
            teams: {
              include: {
                members: {
                  include: {
                    player: {
                      include: {
                        academyProgress: true,
                        challengeSubmissions: {
                          include: { challenge: true },
                        },
                      },
                    },
                  },
                },
                captain: true,
                homeMatches: {
                  include: {
                    awayTeam: { include: { school: true } },
                    arena: true,
                  },
                  orderBy: { scheduledAt: 'desc' },
                  take: 10,
                },
                awayMatches: {
                  include: {
                    homeTeam: { include: { school: true } },
                    arena: true,
                  },
                  orderBy: { scheduledAt: 'desc' },
                  take: 10,
                },
              },
            },
            coaches: {
              include: { profile: true },
            },
          },
        },
      },
    });

    if (!coach) {
      return res.status(404).json({ error: 'Coach not found' });
    }

    // Get all matches for coach's teams
    const teamIds = coach.school.teams.map(t => t.id);
    const allMatches = await prisma.match.findMany({
      where: {
        OR: [
          { homeTeamId: { in: teamIds } },
          { awayTeamId: { in: teamIds } },
        ],
      },
      include: {
        homeTeam: { include: { school: true } },
        awayTeam: { include: { school: true } },
        winner: true,
        arena: true,
      },
      orderBy: { scheduledAt: 'desc' },
    });

    // Calculate stats
    const stats = {
      totalTeams: coach.school.teams.length,
      totalPlayers: coach.school.teams.reduce((sum, team) => sum + team.members.length, 0),
      totalWins: coach.school.teams.reduce((sum, team) => sum + team.wins, 0),
      totalPoints: coach.school.teams.reduce((sum, team) => sum + team.points, 0),
      upcomingMatches: allMatches.filter(m => {
        const matchDate = new Date(m.scheduledAt);
        return matchDate > new Date() && m.status === 'scheduled';
      }).length,
    };

    // Get all players from all teams
    const allPlayers = coach.school.teams.flatMap(team => 
      team.members.map(member => ({
        ...member.player,
        teamName: team.name,
        teamTier: team.tier,
      }))
    );

    res.json({
      coach: coach.profile,
      school: coach.school,
      teams: coach.school.teams,
      players: allPlayers,
      matches: allMatches,
      stats,
    });
  } catch (error) {
    console.error('Error fetching coach dashboard:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get school admin dashboard data
export const getSchoolAdminDashboard = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user profile with school relation
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      include: { school: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user has schoolId, use it directly
    let school = null;
    if (user.schoolId) {
      school = await prisma.school.findUnique({
        where: { id: user.schoolId },
        include: {
          teams: {
            include: {
              members: {
                include: { player: true },
              },
              captain: true,
              homeMatches: {
                include: {
                  awayTeam: { include: { school: true } },
                  arena: true,
                },
                orderBy: { scheduledAt: 'desc' },
                take: 5,
              },
              awayMatches: {
                include: {
                  homeTeam: { include: { school: true } },
                  arena: true,
                },
                orderBy: { scheduledAt: 'desc' },
                take: 5,
              },
            },
          },
          coach: {
            include: { profile: true },
          },
          arenas: true,
          arenaApplications: {
            include: { arena: true },
            orderBy: { appliedAt: 'desc' },
          },
        },
      });
    } else {
      // Fallback: try to find by name matching
      const schoolNameMatch = user.fullName.match(/\((.+?)\s+Admin\)/);
      if (schoolNameMatch) {
        const schoolName = schoolNameMatch[1];
        school = await prisma.school.findFirst({
          where: { name: schoolName },
          include: {
            teams: {
              include: {
                members: {
                  include: { player: true },
                },
                captain: true,
                homeMatches: {
                  include: {
                    awayTeam: { include: { school: true } },
                    arena: true,
                  },
                  orderBy: { scheduledAt: 'desc' },
                  take: 5,
                },
                awayMatches: {
                  include: {
                    homeTeam: { include: { school: true } },
                    arena: true,
                  },
                  orderBy: { scheduledAt: 'desc' },
                  take: 5,
                },
              },
            },
            coaches: {
              include: { profile: true },
            },
            arenas: true,
            arenaApplications: {
              include: { arena: true },
              orderBy: { appliedAt: 'desc' },
            },
          },
        });
      }
    }

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Get all players from school teams
    const allPlayers = school.teams.flatMap(team => 
      team.members.map(member => ({
        ...member.player,
        teamName: team.name,
        teamTier: team.tier,
        teamId: team.id,
      }))
    );

    // Get all coaches for this school
    const coaches = await prisma.coach.findMany({
      where: { schoolId: school.id },
      include: {
        profile: true,
        school: true,
      },
    });

    // Get sponsors (if school has sponsorId)
    const sponsors = school.sponsorId ? await prisma.profile.findMany({
      where: { 
        role: 'sponsor',
        id: school.sponsorId,
      },
    }) : [];

    // Calculate stats
    const stats = {
      totalTeams: school.teams.length,
      totalPlayers: school.teams.reduce((sum, team) => sum + team.members.length, 0),
      totalWins: school.teams.reduce((sum, team) => sum + team.wins, 0),
      totalPoints: school.teams.reduce((sum, team) => sum + team.points, 0),
      coaches: coaches.length,
      arenas: school.arenas.length,
      pendingApplications: school.arenaApplications.filter(a => a.status === 'pending').length,
    };

    res.json({
      school,
      stats,
      players: allPlayers,
      coaches: coaches.map(c => ({
        ...c.profile,
        coachProfile: {
          school: c.school,
        },
      })),
      sponsors,
    });
  } catch (error) {
    console.error('Error fetching school admin dashboard:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get sponsor dashboard data
export const getSponsorDashboard = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get sponsor profile
    const sponsor = await prisma.profile.findUnique({
      where: { id: userId },
    });

    // Get schools sponsored by this sponsor
    // Sponsor fullName format: "Contact Name - Company Name"
    const companyName = sponsor?.fullName?.split(' - ')[1] || sponsor?.fullName || '';
    
    const sponsoredSchools = await prisma.school.findMany({
      where: {
        sponsor: {
          contains: companyName,
        },
      },
      include: {
        teams: {
          include: {
            members: {
              include: { player: true },
            },
            captain: true,
            homeMatches: {
              include: {
                awayTeam: { include: { school: true } },
                winner: true,
              },
              orderBy: { scheduledAt: 'desc' },
              take: 5,
            },
            awayMatches: {
              include: {
                homeTeam: { include: { school: true } },
                winner: true,
              },
              orderBy: { scheduledAt: 'desc' },
              take: 5,
            },
          },
        },
        coach: {
          include: { profile: true },
        },
      },
    });

    // Calculate stats
    const stats = {
      sponsoredSchools: sponsoredSchools.length,
      totalTeams: sponsoredSchools.reduce((sum, school) => sum + school.teams.length, 0),
      totalPlayers: sponsoredSchools.reduce((sum, school) => 
        sum + school.teams.reduce((teamSum, team) => teamSum + team.members.length, 0), 0
      ),
      totalWins: sponsoredSchools.reduce((sum, school) => 
        sum + school.teams.reduce((teamSum, team) => teamSum + team.wins, 0), 0
      ),
      totalPoints: sponsoredSchools.reduce((sum, school) => 
        sum + school.teams.reduce((teamSum, team) => teamSum + team.points, 0), 0
      ),
    };

    res.json({
      sponsor,
      sponsoredSchools,
      stats,
    });
  } catch (error) {
    console.error('Error fetching sponsor dashboard:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get admin dashboard data - comprehensive view of entire system
export const getAdminDashboard = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all comprehensive data
    const [
      totalSchools,
      totalTeams,
      totalPlayers,
      totalCoaches,
      totalJudges,
      totalAdmins,
      totalSponsors,
      totalSchoolAdmins,
      totalMatches,
      totalChallenges,
      totalArenas,
      totalNotifications,
      totalMessages,
      allSchools,
      allTeams,
      allPlayers,
      allCoaches,
      allJudges,
      allSponsors,
      allSchoolAdmins,
      allMatches,
      allChallenges,
      allArenas,
      recentMatches,
      tierBreakdown,
    ] = await Promise.all([
      prisma.school.count(),
      prisma.team.count(),
      prisma.profile.count({ where: { role: 'player' } }),
      prisma.coach.count(),
      prisma.profile.count({ where: { role: 'judge' } }),
      prisma.profile.count({ where: { role: 'admin' } }),
      prisma.profile.count({ where: { role: 'sponsor' } }),
      prisma.profile.count({ where: { role: 'school_admin' } }),
      prisma.match.count(),
      prisma.challenge.count(),
      prisma.arena.count(),
      prisma.notification.count(),
      prisma.message.count(),
      // All schools with full details
      prisma.school.findMany({
        include: {
          teams: {
            include: {
              members: {
                include: { player: true },
              },
              captain: true,
            },
          },
          coach: { include: { profile: true } },
          arenas: true,
          arenaApplications: true,
        },
        orderBy: { name: 'asc' },
      }),
      // All teams with full details
      prisma.team.findMany({
        include: {
          school: true,
          members: {
            include: { player: true },
          },
          captain: true,
          homeMatches: {
            include: {
              awayTeam: { include: { school: true } },
              arena: true,
            },
            take: 5,
          },
          awayMatches: {
            include: {
              homeTeam: { include: { school: true } },
              arena: true,
            },
            take: 5,
          },
        },
        orderBy: [
          { tier: 'asc' },
          { points: 'desc' },
        ],
      }),
      // All players
      prisma.profile.findMany({
        where: { role: 'player' },
        include: {
          teamMembers: {
            include: { team: { include: { school: true } } },
          },
          academyProgress: true,
          challengeSubmissions: {
            include: { challenge: true },
          },
        },
        orderBy: { xp: 'desc' },
      }),
      // All coaches
      prisma.coach.findMany({
        include: {
          profile: true,
          school: {
            include: {
              teams: true,
            },
          },
        },
      }),
      // All judges
      prisma.profile.findMany({
        where: { role: 'judge' },
        orderBy: { fullName: 'asc' },
      }),
      // All sponsors
      prisma.profile.findMany({
        where: { role: 'sponsor' },
        orderBy: { fullName: 'asc' },
      }),
      // All school admins
      prisma.profile.findMany({
        where: { role: 'school_admin' },
        orderBy: { fullName: 'asc' },
      }),
      // All matches
      prisma.match.findMany({
        include: {
          homeTeam: { include: { school: true } },
          awayTeam: { include: { school: true } },
          winner: true,
          arena: true,
        },
        orderBy: { scheduledAt: 'desc' },
      }),
      // All challenges
      prisma.challenge.findMany({
        include: {
          submissions: {
            include: {
              player: true,
              team: true,
            },
          },
        },
        orderBy: { releaseDate: 'desc' },
      }),
      // All arenas
      prisma.arena.findMany({
        include: {
          school: true,
          applications: true,
          matches: {
            take: 5,
            orderBy: { scheduledAt: 'desc' },
          },
        },
      }),
      // Recent matches (last 20)
      prisma.match.findMany({
        include: {
          homeTeam: { include: { school: true } },
          awayTeam: { include: { school: true } },
          winner: true,
          arena: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      // Tier breakdown
      prisma.team.groupBy({
        by: ['tier'],
        _count: { id: true },
        _sum: { points: true },
      }),
    ]);

    // Calculate comprehensive stats
    const stats = {
      totalSchools,
      totalTeams,
      totalPlayers,
      totalCoaches,
      totalJudges,
      totalAdmins,
      totalSponsors,
      totalSchoolAdmins,
      totalMatches,
      totalChallenges,
      totalArenas,
      totalNotifications,
      totalMessages,
      activeMatches: allMatches.filter(m => m.status === 'in_progress').length,
      scheduledMatches: allMatches.filter(m => m.status === 'scheduled').length,
      completedMatches: allMatches.filter(m => m.status === 'completed').length,
      totalPoints: allTeams.reduce((sum, team) => sum + team.points, 0),
      tierBreakdown: tierBreakdown.reduce((acc, tier) => {
        acc[tier.tier] = {
          teams: tier._count.id,
          totalPoints: tier._sum.points || 0,
        };
        return acc;
      }, {}),
    };

    res.json({
      stats,
      schools: allSchools,
      teams: allTeams,
      players: allPlayers,
      coaches: allCoaches,
      judges: allJudges,
      sponsors: allSponsors,
      schoolAdmins: allSchoolAdmins,
      matches: allMatches,
      recentMatches,
      challenges: allChallenges,
      arenas: allArenas,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: error.message });
  }
};

