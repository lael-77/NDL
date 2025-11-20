import db from '../services/database.js';
import { emitMatchUpdate, emitMatchLive } from '../services/socket.js';
import { calculateMatchPoints } from '../services/scoring.js';
import { canManageMatch } from '../utils/permissions.js';

// Use the database service (primary database)
const prisma = db;

// Get all matches
export const getMatches = async (req, res) => {
  try {
    console.log('🔍 [Matches] Fetching all matches...');
    
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      console.error('❌ [Matches] Database connection failed:', dbError.message);
      return res.status(503).json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to database',
      });
    }
    
    const matches = await prisma.match.findMany({
      include: {
        homeTeam: {
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
        awayTeam: {
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
        winner: {
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
        arena: {
          include: {
            school: {
              select: {
                name: true,
                location: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    }).catch((queryError) => {
      console.error('❌ [Matches] Query error:', queryError);
      console.error('❌ [Matches] Error message:', queryError.message);
      console.error('❌ [Matches] Error code:', queryError.code);
      if (queryError.meta) {
        console.error('❌ [Matches] Error meta:', JSON.stringify(queryError.meta, null, 2));
      }
      throw queryError;
    });
    
    // Sort matches: in_progress first, then scheduled, then completed
    const sortedMatches = (matches || []).sort((a, b) => {
      const statusOrder = { 'in_progress': 0, 'scheduled': 1, 'completed': 2, 'cancelled': 3 };
      const aOrder = statusOrder[a.status] || 4;
      const bOrder = statusOrder[b.status] || 4;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      // If same status, sort by date (most recent first)
      try {
        return new Date(b.scheduledAt) - new Date(a.scheduledAt);
      } catch (dateError) {
        return 0;
      }
    });
    
    console.log(`✅ [Matches] Found ${sortedMatches.length} matches`);
    res.json(sortedMatches);
  } catch (error) {
    console.error('❌ [Matches] Error fetching matches:', error);
    console.error('❌ [Matches] Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch matches',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
};

// Get match by ID
export const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: {
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
        awayTeam: {
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
        winner: {
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
    });
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new match
export const createMatch = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { homeTeamId, awayTeamId, scheduledAt, status } = req.body;
    
    // Check permission - user must be able to manage at least one of the teams
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    
    const isAdmin = user?.role === 'admin';
    const isJudge = user?.role === 'judge';
    
    if (!isAdmin && !isJudge) {
      // Check if user can manage either team
      const canManageHome = await canManageTeam(userId, homeTeamId);
      const canManageAway = await canManageTeam(userId, awayTeamId);
      
      if (!canManageHome && !canManageAway) {
        return res.status(403).json({ error: 'You do not have permission to create matches for these teams' });
      }
    }
    
    const match = await prisma.match.create({
      data: {
        homeTeamId,
        awayTeamId,
        scheduledAt: new Date(scheduledAt),
        status: status || 'scheduled',
      },
      include: {
        homeTeam: {
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
        awayTeam: {
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
        winner: {
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
    });
    
    // Emit socket event for new match
    emitMatchUpdate(match.id, match);
    
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a match
export const updateMatch = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.params;
    const { homeScore, awayScore, status, winnerId } = req.body;
    
    // Check permission
    const hasPermission = await canManageMatch(userId, id);
    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to update this match' });
    }
    
    // Get the previous match state to check if it was just completed
    const previousMatch = await prisma.match.findUnique({
      where: { id },
      select: { status: true, homeScore: true, awayScore: true },
    });
    
    const match = await prisma.match.update({
      where: { id },
      data: {
        homeScore,
        awayScore,
        status,
        winnerId,
      },
      include: {
        homeTeam: {
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
        awayTeam: {
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
        winner: {
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
    });
    
    // Calculate points and update leaderboard if match is completed
    if (status === 'completed' && homeScore !== null && awayScore !== null) {
      // Only calculate if this is a new completion (wasn't completed before)
      if (previousMatch?.status !== 'completed') {
        // calculateMatchPoints already emits leaderboard updates via socket
        await calculateMatchPoints({
          homeScore,
          awayScore,
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          winnerId,
        });
      }
    }
    
    // Emit socket events based on match status
    if (status === 'in_progress') {
      emitMatchLive(id, match);
    } else {
      emitMatchUpdate(id, match);
    }
    
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a match
export const deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.match.delete({
      where: { id },
    });
    
    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

