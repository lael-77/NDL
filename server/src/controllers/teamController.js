import db from '../services/database.js';
import { emitTeamUpdate } from '../services/socket.js';
import { canManageTeam } from '../utils/permissions.js';

// Use the database service (primary database)
const prisma = db;

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
    const userId = req.user?.userId || req.user?.id;
    const { name, schoolId, captainId, logoUrl } = req.body;
    
    // Check permission - user must be able to manage teams in the school
    if (schoolId) {
      // For now, allow if user is admin, school admin, or coach
      // More specific check can be added
      const user = await prisma.profile.findUnique({
        where: { id: userId },
        select: { role: true, schoolId: true },
        include: {
          coachProfile: { select: { schoolId: true } },
        },
      });

      const isAdmin = user?.role === 'admin';
      const isSchoolAdmin = user?.role === 'school_admin' && user.schoolId === schoolId;
      const isCoach = user?.role === 'coach' && user.coachProfile?.schoolId === schoolId;

      if (!isAdmin && !isSchoolAdmin && !isCoach) {
        return res.status(403).json({ error: 'You do not have permission to create teams in this school' });
      }
    }
    
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
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.params;
    const { name, logoUrl, points, wins, draws, losses } = req.body;
    
    // Check permission
    const hasPermission = await canManageTeam(userId, id);
    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to update this team' });
    }
    
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
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.params;
    
    // Check permission
    const hasPermission = await canManageTeam(userId, id);
    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to delete this team' });
    }
    
    await prisma.team.delete({
      where: { id },
    });
    
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

