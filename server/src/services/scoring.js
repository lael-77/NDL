import db from './database.js';
import { emitLeaderboardUpdate, emitTeamUpdate } from './socket.js';

// Use the database service (primary database)
const prisma = db;

/**
 * Calculate points for a match result
 * @param {Object} match - Match object with homeScore, awayScore, homeTeamId, awayTeamId
 * @returns {Object} - Updated team statistics
 */
export const calculateMatchPoints = async (match) => {
  const { homeScore, awayScore, homeTeamId, awayTeamId, winnerId } = match;

  // Determine winner
  let homeWins = 0;
  let awayWins = 0;
  let homeDraws = 0;
  let awayDraws = 0;
  let homeLosses = 0;
  let awayLosses = 0;
  let homePoints = 0;
  let awayPoints = 0;

  if (homeScore > awayScore) {
    // Home team wins
    homeWins = 1;
    homePoints = 3;
    awayLosses = 1;
  } else if (awayScore > homeScore) {
    // Away team wins
    awayWins = 1;
    awayPoints = 3;
    homeLosses = 1;
  } else {
    // Draw
    homeDraws = 1;
    awayDraws = 1;
    homePoints = 1;
    awayPoints = 1;
  }

  // Update home team statistics
  const homeTeam = await prisma.team.update({
    where: { id: homeTeamId },
    data: {
      points: { increment: homePoints },
      wins: { increment: homeWins },
      draws: { increment: homeDraws },
      losses: { increment: homeLosses },
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
  });

  // Update away team statistics
  const awayTeam = await prisma.team.update({
    where: { id: awayTeamId },
    data: {
      points: { increment: awayPoints },
      wins: { increment: awayWins },
      draws: { increment: awayDraws },
      losses: { increment: awayLosses },
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
  });

  // Emit socket events for team updates and leaderboard
  emitTeamUpdate(homeTeamId, homeTeam);
  emitTeamUpdate(awayTeamId, awayTeam);
  
  // Fetch updated leaderboard and emit
  const leaderboard = await prisma.team.findMany({
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
  emitLeaderboardUpdate(leaderboard);

  return { homeTeam, awayTeam };
};

/**
 * Update team tier based on performance
 * @param {String} teamId - Team ID
 * @param {String} newTier - New tier level
 */
export const updateTeamTier = async (teamId, newTier) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { school: true },
  });

  if (!team) {
    throw new Error('Team not found');
  }

  // Update school tier (since teams belong to schools)
  await prisma.school.update({
    where: { id: team.schoolId },
    data: { tier: newTier },
  });
};

/**
 * Promote/relegate teams based on tier standings
 * Top 3 teams promote, bottom 3 relegate
 */
export const processTierPromotionRelegation = async (tier) => {
  const teams = await prisma.team.findMany({
    where: {
      school: {
        tier: tier,
      },
    },
    include: {
      school: true,
    },
    orderBy: [
      { points: 'desc' },
      { wins: 'desc' },
    ],
  });

  const tierOrder = ['beginner', 'intermediate', 'advanced', 'regional', 'national'];
  const currentTierIndex = tierOrder.indexOf(tier);
  
  // Promote top 3 teams
  if (currentTierIndex < tierOrder.length - 1) {
    const nextTier = tierOrder[currentTierIndex + 1];
    for (let i = 0; i < Math.min(3, teams.length); i++) {
      await updateTeamTier(teams[i].id, nextTier);
    }
  }

  // Relegate bottom 3 teams
  if (currentTierIndex > 0) {
    const previousTier = tierOrder[currentTierIndex - 1];
    for (let i = Math.max(0, teams.length - 3); i < teams.length; i++) {
      await updateTeamTier(teams[i].id, previousTier);
    }
  }
};

