import express from 'express';
import { getMatches, getMatchById, createMatch, updateMatch, deleteMatch } from '../controllers/matchController.js';

const router = express.Router();

// GET /api/matches - Get all matches
router.get('/', getMatches);

// GET /api/matches/:id - Get match by ID
router.get('/:id', getMatchById);

// POST /api/matches - Create a new match
router.post('/', createMatch);

// PUT /api/matches/:id - Update a match
router.put('/:id', updateMatch);

// DELETE /api/matches/:id - Delete a match
router.delete('/:id', deleteMatch);

export default router;

