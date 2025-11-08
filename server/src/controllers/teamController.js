import { PrismaClient } from '@prisma/client';
import { emitTeamUpdate } from '../services/socket.js';

const prisma = new PrismaClient();

// Get all teams
export const getTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        school: true,
        captain: true,
        members: {
          include: {
            player: true,
          },
        },
      },
      orderBy: {
        points: 'desc',
      },
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get team by ID
export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        school: true,
        captain: true,
        members: {
          include: {
            player: true,
          },
        },
      },
    });
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new team
export const createTeam = async (req, res) => {
  try {
    const { name, schoolId, captainId, logoUrl } = req.body;
    
    const team = await prisma.team.create({
      data: {
        name,
        schoolId,
        captainId,
        logoUrl,
      },
      include: {
        school: true,
        captain: true,
      },
    });
    
    // Emit socket event for new team
    emitTeamUpdate(team.id, team);
    
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a team
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logoUrl, points, wins, draws, losses } = req.body;
    
    const team = await prisma.team.update({
      where: { id },
      data: {
        name,
        logoUrl,
        points,
        wins,
        draws,
        losses,
      },
      include: {
        school: true,
        captain: true,
      },
    });
    
    // Emit socket event for team update
    emitTeamUpdate(id, team);
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a team
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.team.delete({
      where: { id },
    });
    
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

