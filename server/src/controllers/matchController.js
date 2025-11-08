import { PrismaClient } from '@prisma/client';
import { emitMatchUpdate, emitMatchLive } from '../services/socket.js';
import { calculateMatchPoints } from '../services/scoring.js';

const prisma = new PrismaClient();

// Get all matches
export const getMatches = async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
        winner: true,
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get match by ID
export const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        winner: true,
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
    const { homeTeamId, awayTeamId, scheduledAt, status } = req.body;
    
    const match = await prisma.match.create({
      data: {
        homeTeamId,
        awayTeamId,
        scheduledAt: new Date(scheduledAt),
        status: status || 'scheduled',
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        winner: true,
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
    const { id } = req.params;
    const { homeScore, awayScore, status, winnerId } = req.body;
    
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
        homeTeam: true,
        awayTeam: true,
        winner: true,
      },
    });
    
    // Calculate points and update leaderboard if match is completed
    if (status === 'completed' && homeScore !== null && awayScore !== null) {
      // Only calculate if this is a new completion (wasn't completed before)
      if (previousMatch?.status !== 'completed') {
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

