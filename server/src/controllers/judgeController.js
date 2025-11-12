import db from '../services/database.js';
import { emitMatchUpdate, emitMatchLive } from '../services/socket.js';

const prisma = db;

// Get all assigned matches for a judge
export const getAssignedMatches = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    console.log('🔍 [Judge API] Fetching matches for judge:', userId);
    
    // If no matches are assigned, return all matches for testing (temporary)
    const assignedMatches = await prisma.match.findMany({
      where: {
        judges: {
          some: {
            judgeId: userId,
          },
        },
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
            members: {
              include: {
                player: {
                  select: {
                    id: true,
                    fullName: true,
                    studentRole: true,
                  },
                },
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
            members: {
              include: {
                player: {
                  select: {
                    id: true,
                    fullName: true,
                    studentRole: true,
                  },
                },
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
        judges: {
          include: {
            judge: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        lineups: {
          include: {
            player: {
              select: {
                id: true,
                fullName: true,
                studentRole: true,
              },
            },
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        timer: true,
        autoScores: true,
        judgeScores: {
          include: {
            judge: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });

    // If no assigned matches, assign all matches to this judge (for testing)
    if (assignedMatches.length === 0) {
      console.log('📝 [Judge API] No assigned matches found, auto-assigning all matches...');
      const allMatches = await prisma.match.findMany({
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
              members: {
                include: {
                  player: {
                    select: {
                      id: true,
                      fullName: true,
                      studentRole: true,
                    },
                  },
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
              members: {
                include: {
                  player: {
                    select: {
                      id: true,
                      fullName: true,
                      studentRole: true,
                    },
                  },
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
          judges: {
            include: {
              judge: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          lineups: {
            include: {
              player: {
                select: {
                  id: true,
                  fullName: true,
                  studentRole: true,
                },
              },
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          timer: true,
          autoScores: true,
          judgeScores: {
            include: {
              judge: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: {
          scheduledAt: 'desc',
        },
      });

      // Auto-assign this judge to all matches
      for (const match of allMatches) {
        const existingAssignment = await prisma.matchJudge.findUnique({
          where: {
            matchId_judgeId: {
              matchId: match.id,
              judgeId: userId,
            },
          },
        });

        if (!existingAssignment) {
          await prisma.matchJudge.create({
            data: {
              matchId: match.id,
              judgeId: userId,
              status: match.status === 'completed' ? 'accepted' : 'pending',
              isMain: true,
              respondedAt: match.status === 'completed' ? new Date() : null,
            },
          });
        }
      }

      console.log(`✅ [Judge API] Auto-assigned ${allMatches.length} matches to judge ${userId}`);
      
      // Fetch again with assignments
      const updatedMatches = await prisma.match.findMany({
        where: {
          judges: {
            some: {
              judgeId: userId,
            },
          },
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
              members: {
                include: {
                  player: {
                    select: {
                      id: true,
                      fullName: true,
                      studentRole: true,
                    },
                  },
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
              members: {
                include: {
                  player: {
                    select: {
                      id: true,
                      fullName: true,
                      studentRole: true,
                    },
                  },
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
          judges: {
            include: {
              judge: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          lineups: {
            include: {
              player: {
                select: {
                  id: true,
                  fullName: true,
                  studentRole: true,
                },
              },
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          timer: true,
          autoScores: true,
          judgeScores: {
            include: {
              judge: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: {
          scheduledAt: 'desc',
        },
      });

      // Add judge status for each match
      const matchesWithStatus = updatedMatches.map(match => {
        const judgeAssignment = match.judges.find(j => j.judgeId === userId);
        return {
          ...match,
          judgeStatus: judgeAssignment?.status || 'pending',
          isMainJudge: judgeAssignment?.isMain || false,
        };
      });

      return res.json(matchesWithStatus);
    }

    // Add judge status for each match
    const matchesWithStatus = assignedMatches.map(match => {
      const judgeAssignment = match.judges.find(j => j.judgeId === userId);
      return {
        ...match,
        judgeStatus: judgeAssignment?.status || 'pending',
        isMainJudge: judgeAssignment?.isMain || false,
      };
    });

    console.log(`📊 [Judge API] Returning ${matchesWithStatus.length} matches with status`);
    res.json(matchesWithStatus);
  } catch (error) {
    console.error('Error fetching assigned matches:', error);
    res.status(500).json({ error: error.message });
  }
};

// Accept a match assignment
export const acceptMatch = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { matchId } = req.params;

    const matchJudge = await prisma.matchJudge.update({
      where: {
        matchId_judgeId: {
          matchId,
          judgeId: userId,
        },
      },
      data: {
        status: 'accepted',
        respondedAt: new Date(),
      },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
    });

    emitMatchUpdate(matchId, matchJudge.match);

    res.json({ message: 'Match accepted successfully', matchJudge });
  } catch (error) {
    console.error('Error accepting match:', error);
    res.status(500).json({ error: error.message });
  }
};

// Decline a match assignment
export const declineMatch = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { matchId } = req.params;

    const matchJudge = await prisma.matchJudge.update({
      where: {
        matchId_judgeId: {
          matchId,
          judgeId: userId,
        },
      },
      data: {
        status: 'declined',
        respondedAt: new Date(),
      },
    });

    res.json({ message: 'Match declined successfully' });
  } catch (error) {
    console.error('Error declining match:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get match details for judging
export const getMatchForJudging = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { matchId } = req.params;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: {
          include: {
            school: true,
            members: {
              include: {
                player: true,
              },
            },
          },
        },
        awayTeam: {
          include: {
            school: true,
            members: {
              include: {
                player: true,
              },
            },
          },
        },
        arena: {
          include: {
            school: true,
          },
        },
        judges: {
          include: {
            judge: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        lineups: {
          include: {
            player: true,
            team: true,
          },
        },
        timer: true,
        autoScores: {
          include: {
            team: true,
          },
        },
        judgeScores: {
          include: {
            judge: {
              select: {
                id: true,
                fullName: true,
              },
            },
            team: true,
          },
        },
        playerScores: {
          include: {
            judge: {
              select: {
                id: true,
                fullName: true,
              },
            },
            player: true,
          },
        },
        feedback: {
          include: {
            judge: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Check if judge is assigned to this match
    const isAssigned = match.judges.some(j => j.judgeId === userId);
    if (!isAssigned) {
      return res.status(403).json({ error: 'You are not assigned to this match' });
    }

    // Add judge status
    const judgeAssignment = match.judges.find(j => j.judgeId === userId);
    const matchWithStatus = {
      ...match,
      judgeStatus: judgeAssignment?.status || 'pending',
      isMainJudge: judgeAssignment?.isMain || false,
    };

    res.json(matchWithStatus);
  } catch (error) {
    console.error('Error fetching match for judging:', error);
    res.status(500).json({ error: error.message });
  }
};

// Start match timer
export const startMatchTimer = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { matchId } = req.params;
    const { duration } = req.body;

    const matchJudge = await prisma.matchJudge.findUnique({
      where: {
        matchId_judgeId: {
          matchId,
          judgeId: userId,
        },
      },
    });

    if (!matchJudge || matchJudge.status !== 'accepted') {
      return res.status(403).json({ error: 'You must accept the match before starting it' });
    }

    await prisma.match.update({
      where: { id: matchId },
      data: { status: 'in_progress' },
    });

    const totalDuration = duration || 3600; // Default 60 mins total (30 min halves)
    const halfDuration = Math.floor(totalDuration / 2);

    const timer = await prisma.matchTimer.upsert({
      where: { matchId },
      create: {
        matchId,
        startTime: new Date(),
        isRunning: true,
        duration: totalDuration,
        halfDuration: halfDuration,
        currentHalf: 1,
        halftimeStatus: 'first_half',
      },
      update: {
        startTime: new Date(),
        isRunning: true,
        pausedAt: null,
        halftimeStatus: timer?.currentHalf === 2 ? 'second_half' : 'first_half',
      },
    });

    emitMatchLive(matchId, { status: 'in_progress', timer });

    res.json({ message: 'Match started', timer });
  } catch (error) {
    console.error('Error starting match timer:', error);
    res.status(500).json({ error: error.message });
  }
};

// Pause match timer
export const pauseMatchTimer = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { matchId } = req.params;

    const timer = await prisma.matchTimer.findUnique({
      where: { matchId },
    });

    if (!timer || !timer.isRunning) {
      return res.status(400).json({ error: 'Match timer is not running' });
    }

    const now = new Date();
    const startTime = timer.startTime || now;
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000) + timer.elapsedSeconds;
    
    // Check if we've reached halftime
    const halfDuration = timer.halfDuration || 1800;
    const currentHalf = timer.currentHalf || 1;
    let halftimeStatus = timer.halftimeStatus;
    
    // Auto-detect halftime: if we're in first half and elapsed >= half duration
    if (currentHalf === 1 && elapsed >= halfDuration) {
      halftimeStatus = 'halftime';
    } else if (currentHalf === 1 && elapsed < halfDuration) {
      halftimeStatus = 'first_half';
    } else if (currentHalf === 2) {
      halftimeStatus = 'second_half';
    }

    const updatedTimer = await prisma.matchTimer.update({
      where: { matchId },
      data: {
        isRunning: false,
        pausedAt: now,
        elapsedSeconds: elapsed,
        halftimeStatus: halftimeStatus,
      },
    });

    emitMatchLive(matchId, { timer: updatedTimer });

    res.json({ message: 'Match paused', timer: updatedTimer });
  } catch (error) {
    console.error('Error pausing match timer:', error);
    res.status(500).json({ error: error.message });
  }
};

// Resume match timer
export const resumeMatchTimer = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { matchId } = req.params;

    const timer = await prisma.matchTimer.findUnique({
      where: { matchId },
    });

    if (!timer) {
      return res.status(404).json({ error: 'Match timer not found' });
    }

    // If resuming from halftime, move to second half
    let currentHalf = timer.currentHalf || 1;
    let halftimeStatus = timer.halftimeStatus;
    
    if (timer.halftimeStatus === 'halftime') {
      currentHalf = 2;
      halftimeStatus = 'second_half';
    } else if (!timer.halftimeStatus || timer.halftimeStatus === 'first_half') {
      halftimeStatus = 'first_half';
    }

    const updatedTimer = await prisma.matchTimer.update({
      where: { matchId },
      data: {
        isRunning: true,
        startTime: new Date(),
        pausedAt: null,
        currentHalf: currentHalf,
        halftimeStatus: halftimeStatus,
      },
    });

    emitMatchLive(matchId, { timer: updatedTimer });

    res.json({ message: 'Match resumed', timer: updatedTimer });
  } catch (error) {
    console.error('Error resuming match timer:', error);
    res.status(500).json({ error: error.message });
  }
};

// End match
export const endMatch = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { matchId } = req.params;
    const { comments } = req.body; // Optional final comments

    // Check if judge is assigned and accepted
    const matchJudge = await prisma.matchJudge.findUnique({
      where: {
        matchId_judgeId: {
          matchId,
          judgeId: userId,
        },
      },
    });

    if (!matchJudge || matchJudge.status !== 'accepted') {
      return res.status(403).json({ error: 'You must accept the match before ending it' });
    }

    const timer = await prisma.matchTimer.findUnique({
      where: { matchId },
    });

    if (timer && timer.isRunning) {
      const now = new Date();
      const startTime = timer.startTime || now;
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000) + timer.elapsedSeconds;

      await prisma.matchTimer.update({
        where: { matchId },
        data: {
          isRunning: false,
          elapsedSeconds: elapsed,
          halftimeStatus: 'completed',
        },
      });
    }

    // Lock all auto-judge scores (prevent further modifications)
    // Note: In production, you might want to add a 'locked' field to AutoScore model

    const match = await prisma.match.update({
      where: { id: matchId },
      data: { status: 'completed' },
    });

    // Save final comments if provided
    if (comments && comments.trim()) {
      await prisma.matchFeedback.create({
        data: {
          matchId,
          judgeId: userId,
          message: comments,
          isPublic: false, // Final comments are internal
        },
      });
    }

    emitMatchUpdate(matchId, match);

    res.json({ message: 'Match ended', match });
  } catch (error) {
    console.error('Error ending match:', error);
    res.status(500).json({ error: error.message });
  }
};

// Submit team lineup
export const submitLineup = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { teamId, players } = req.body;

    await prisma.lineup.deleteMany({
      where: {
        matchId,
        teamId,
      },
    });

    const lineups = await prisma.lineup.createMany({
      data: players.map(player => ({
        matchId,
        teamId,
        playerId: player.playerId,
        position: player.position,
        role: player.role,
        isCaptain: player.isCaptain || false,
        isSubstitute: player.isSubstitute || false,
        status: 'submitted',
        submittedAt: new Date(),
      })),
    });

    emitMatchUpdate(matchId, { lineups });

    res.json({ message: 'Lineup submitted successfully', lineups });
  } catch (error) {
    console.error('Error submitting lineup:', error);
    res.status(500).json({ error: error.message });
  }
};

// Approve lineup
export const approveLineup = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { matchId, teamId } = req.params;

    const lineups = await prisma.lineup.updateMany({
      where: {
        matchId,
        teamId,
      },
      data: {
        status: 'approved',
        approvedAt: new Date(),
      },
    });

    emitMatchUpdate(matchId, { lineups });

    res.json({ message: 'Lineup approved successfully' });
  } catch (error) {
    console.error('Error approving lineup:', error);
    res.status(500).json({ error: error.message });
  }
};

// Submit auto-judge scores
export const submitAutoScores = async (req, res) => {
  try {
    const { matchId, teamId, functionality, innovation, plagiarismFlag, aiGeneratedFlag, suggestions } = req.body;

    const autoScore = await prisma.autoScore.upsert({
      where: {
        matchId_teamId: {
          matchId,
          teamId,
        },
      },
      create: {
        matchId,
        teamId,
        functionality: functionality || 0,
        innovation: innovation || 0,
        plagiarismFlag: plagiarismFlag || false,
        aiGeneratedFlag: aiGeneratedFlag || false,
        suggestions: suggestions || null,
      },
      update: {
        functionality,
        innovation,
        plagiarismFlag,
        aiGeneratedFlag,
        suggestions,
        evaluatedAt: new Date(),
      },
    });

    emitMatchLive(matchId, { autoScore });

    res.json({ message: 'Auto scores submitted', autoScore });
  } catch (error) {
    console.error('Error submitting auto scores:', error);
    res.status(500).json({ error: error.message });
  }
};

// Submit judge scores for a team
export const submitJudgeScores = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { matchId, teamId, scores, comments } = req.body;

    const judgeScore = await prisma.judgeScore.upsert({
      where: {
        matchId_judgeId_teamId: {
          matchId,
          judgeId: userId,
          teamId,
        },
      },
      create: {
        matchId,
        judgeId: userId,
        teamId,
        codeFunctionality: scores.codeFunctionality || 0,
        innovation: scores.innovation || 0,
        presentation: scores.presentation || 0,
        problemRelevance: scores.problemRelevance || 0,
        feasibility: scores.feasibility || 0,
        collaboration: scores.collaboration || 0,
        comments: comments || null,
      },
      update: {
        codeFunctionality: scores.codeFunctionality,
        innovation: scores.innovation,
        presentation: scores.presentation,
        problemRelevance: scores.problemRelevance,
        feasibility: scores.feasibility,
        collaboration: scores.collaboration,
        comments: comments || null,
      },
    });

    emitMatchLive(matchId, { judgeScore });

    res.json({ message: 'Judge scores submitted', judgeScore });
  } catch (error) {
    console.error('Error submitting judge scores:', error);
    res.status(500).json({ error: error.message });
  }
};

// Lock judge scores
export const lockJudgeScores = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { matchId, teamId } = req.params;

    const judgeScore = await prisma.judgeScore.update({
      where: {
        matchId_judgeId_teamId: {
          matchId,
          judgeId: userId,
          teamId,
        },
      },
      data: {
        isLocked: true,
        submittedAt: new Date(),
      },
    });

    emitMatchUpdate(matchId, { judgeScore });

    res.json({ message: 'Scores locked successfully', judgeScore });
  } catch (error) {
    console.error('Error locking judge scores:', error);
    res.status(500).json({ error: error.message });
  }
};

// Submit player scores
export const submitPlayerScores = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { matchId, playerId, scores, notes } = req.body;

    const playerScore = await prisma.playerScore.upsert({
      where: {
        matchId_judgeId_playerId: {
          matchId,
          judgeId: userId,
          playerId,
        },
      },
      create: {
        matchId,
        judgeId: userId,
        playerId,
        rolePerformance: scores.rolePerformance || 0,
        initiative: scores.initiative || 0,
        technicalMastery: scores.technicalMastery || 0,
        creativity: scores.creativity || 0,
        collaboration: scores.collaboration || 0,
        notes: notes || null,
      },
      update: {
        rolePerformance: scores.rolePerformance,
        initiative: scores.initiative,
        technicalMastery: scores.technicalMastery,
        creativity: scores.creativity,
        collaboration: scores.collaboration,
        notes: notes || null,
      },
    });

    emitMatchLive(matchId, { playerScore });

    res.json({ message: 'Player scores submitted', playerScore });
  } catch (error) {
    console.error('Error submitting player scores:', error);
    res.status(500).json({ error: error.message });
  }
};

// Submit feedback
export const submitFeedback = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { matchId, teamId, playerId, message, isPublic } = req.body;

    const feedback = await prisma.matchFeedback.create({
      data: {
        matchId,
        judgeId: userId,
        teamId: teamId || null,
        playerId: playerId || null,
        message,
        isPublic: isPublic || false,
      },
      include: {
        judge: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    res.json({ message: 'Feedback submitted', feedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get co-judge scores for a match
export const getCoJudgeScores = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { matchId } = req.params;

    const scores = await prisma.judgeScore.findMany({
      where: {
        matchId,
        judgeId: {
          not: userId,
        },
      },
      include: {
        judge: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(scores);
  } catch (error) {
    console.error('Error fetching co-judge scores:', error);
    res.status(500).json({ error: error.message });
  }
};
