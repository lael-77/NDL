import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  canManageSchool,
  canManageTeam,
  canManagePlayer,
  canManageCoach,
  canManageMatch,
} from '../utils/permissions.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Check permission for a specific resource
router.get('/check/:resourceType/:resourceId', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { resourceType, resourceId } = req.params;

    if (!userId || !resourceId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    let allowed = false;

    switch (resourceType) {
      case 'school':
        allowed = await canManageSchool(userId, resourceId);
        break;
      case 'team':
        allowed = await canManageTeam(userId, resourceId);
        break;
      case 'player':
        allowed = await canManagePlayer(userId, resourceId);
        break;
      case 'coach':
        allowed = await canManageCoach(userId, resourceId);
        break;
      case 'match':
        allowed = await canManageMatch(userId, resourceId);
        break;
      default:
        return res.status(400).json({ error: 'Invalid resource type' });
    }

    res.json({ allowed, resourceType, resourceId });
  } catch (error) {
    console.error('Error checking permission:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

