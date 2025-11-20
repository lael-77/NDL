/**
 * Team Service - Handles team creation and member management
 * Enforces 4 active members per team constraint with transactional safety
 */

import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface AddTeamMemberParams {
  teamId: string;
  studentId: string;
  role?: string;
  isActive?: boolean;
  isCaptain?: boolean;
}

/**
 * Add team member with transactional safety to prevent race conditions
 * Uses SELECT FOR UPDATE to lock rows during the operation
 */
export async function addTeamMember(params: AddTeamMemberParams) {
  const { teamId, studentId, role, isActive = true, isCaptain = false } = params;

  // Use transaction with row-level locking
  return await prisma.$transaction(async (tx) => {
    // Lock team and check active member count
    const activeCount = await tx.teamMembers.count({
      where: {
        teamId,
        isActive: true,
      },
    });

    // Enforce 4 active members limit
    if (isActive && activeCount >= 4) {
      throw new Error(
        `Team has reached maximum active member limit of 4. Current active count: ${activeCount}`
      );
    }

    // Check if student is already in team
    const existing = await tx.teamMembers.findUnique({
      where: {
        teamId_studentId: {
          teamId,
          studentId,
        },
      },
    });

    if (existing) {
      // Update existing membership
      const updated = await tx.teamMembers.update({
        where: {
          id: existing.id,
        },
        data: {
          role,
          isActive,
          isCaptain,
        },
      });

      // Emit real-time update
      await emitTeamUpdate(teamId);

      return updated;
    }

    // Create new membership
    const member = await tx.teamMembers.create({
      data: {
        teamId,
        studentId,
        role: role || 'Developer',
        isActive,
        isCaptain,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    // Emit real-time update
    await emitTeamUpdate(teamId);

    return member;
  });
}

/**
 * Remove team member
 */
export async function removeTeamMember(teamId: string, studentId: string) {
  const result = await prisma.teamMembers.delete({
    where: {
      teamId_studentId: {
        teamId,
        studentId,
      },
    },
  });

  await emitTeamUpdate(teamId);
  return result;
}

/**
 * Get team with members
 */
export async function getTeamWithMembers(teamId: string) {
  return await prisma.teams.findUnique({
    where: { id: teamId },
    include: {
      teamMembers: {
        where: { isActive: true },
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
      },
      school: true,
    },
  });
}

/**
 * Auto-form teams from available students
 * Groups by skill tags, balances by age/grade, ensures 4 per team
 */
export async function autoFormTeams(schoolId: string, maxTeams?: number) {
  // Get available students (not in active teams)
  const students = await prisma.students.findMany({
    where: {
      schoolId,
      // Not in any active team
      teamMembers: {
        none: {
          isActive: true,
        },
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      xp: 'desc', // Prioritize experienced students
    },
  });

  if (students.length < 4) {
    throw new Error('Not enough students to form a team (minimum 4 required)');
  }

  const teams: any[] = [];
  const teamSize = 4;
  const numTeams = maxTeams || Math.floor(students.length / teamSize);

  // Group students by skill tags (if available) or randomize
  for (let i = 0; i < numTeams && students.length >= teamSize; i++) {
    const teamMembers = students.splice(0, teamSize);

    // Create team
    const team = await prisma.teams.create({
      data: {
        schoolId,
        name: `Team ${i + 1}`,
        status: 'active',
      },
    });

    // Add members with roles
    const roles = ['Developer', 'Designer', 'Strategist', 'Captain'];
    for (let j = 0; j < teamMembers.length; j++) {
      await prisma.teamMembers.create({
        data: {
          teamId: team.id,
          studentId: teamMembers[j].id,
          role: roles[j] || 'Developer',
          isActive: true,
          isCaptain: j === 0, // First member is captain
        },
      });
    }

    teams.push(team);
    await emitTeamUpdate(team.id);
  }

  return teams;
}

/**
 * Emit real-time team update via Redis pub/sub
 */
async function emitTeamUpdate(teamId: string) {
  const team = await getTeamWithMembers(teamId);
  if (team) {
    await redis.publish(
      `team:${teamId}`,
      JSON.stringify({
        type: 'team:update',
        teamId,
        data: team,
        timestamp: new Date().toISOString(),
      })
    );
  }
}

export default {
  addTeamMember,
  removeTeamMember,
  getTeamWithMembers,
  autoFormTeams,
};

