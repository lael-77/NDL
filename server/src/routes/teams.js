import express from 'express';
import { getTeams, getTeamById, createTeam, updateTeam, deleteTeam } from '../controllers/teamController.js';

const router = express.Router();

// GET /api/teams - Get all teams
router.get('/', getTeams);

// GET /api/teams/:id - Get team by ID
router.get('/:id', getTeamById);

// POST /api/teams - Create a new team
router.post('/', createTeam);

// PUT /api/teams/:id - Update a team
router.put('/:id', updateTeam);

// DELETE /api/teams/:id - Delete a team
router.delete('/:id', deleteTeam);

export default router;

