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
    const validTiers = ['beginner', 'intermediate', 'advanced', 'regional', 'national'];
    const tierLower = tier.toLowerCase();
    if (!validTiers.includes(tierLower)) {
      return res.status(400).json({ error: 'Invalid tier level' });
    }
    
    const teams = await prisma.team.findMany({
      where: {
        school: {
          tier: tierLower,
        },
      },
      include: {
        school: {
          select: {
            name: true,
            tier: true,
            location: true,
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

