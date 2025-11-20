/**
 * Integration Tests for Team Service
 * Tests 4-member constraint enforcement
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import teamService from '../services/teamService';

const prisma = new PrismaClient();

describe('Team Service - 4 Member Constraint', () => {
  let testSchoolId: string;
  let testTeamId: string;
  let testStudentIds: string[] = [];

  beforeAll(async () => {
    // Create test school
    const school = await prisma.schools.create({
      data: {
        name: 'Test School',
        country: 'Test',
      },
    });
    testSchoolId = school.id;

    // Create test team
    const team = await prisma.teams.create({
      data: {
        school_id: testSchoolId,
        name: 'Test Team',
      },
    });
    testTeamId = team.id;

    // Create 5 test students
    for (let i = 0; i < 5; i++) {
      const user = await prisma.users.create({
        data: {
          email: `teststudent${i}@test.com`,
          password_hash: 'test',
          role: 'student',
          school_id: testSchoolId,
        },
      });

      const student = await prisma.students.create({
        data: {
          id: user.id,
          school_id: testSchoolId,
          student_number: `TEST${i}`,
        },
      });

      testStudentIds.push(student.id);
    }
  });

  afterAll(async () => {
    // Cleanup
    await prisma.teamMembers.deleteMany({
      where: { team_id: testTeamId },
    });
    await prisma.students.deleteMany({
      where: { school_id: testSchoolId },
    });
    await prisma.teams.deleteMany({
      where: { school_id: testSchoolId },
    });
    await prisma.schools.delete({
      where: { id: testSchoolId },
    });
    await prisma.$disconnect();
  });

  it('should allow adding first 4 members', async () => {
    for (let i = 0; i < 4; i++) {
      const member = await teamService.addTeamMember({
        teamId: testTeamId,
        studentId: testStudentIds[i],
        role: 'Developer',
        isActive: true,
      });
      expect(member).toBeDefined();
    }
  });

  it('should reject 5th active member', async () => {
    await expect(
      teamService.addTeamMember({
        teamId: testTeamId,
        studentId: testStudentIds[4],
        role: 'Developer',
        isActive: true,
      })
    ).rejects.toThrow('Team has reached maximum active member limit of 4');
  });

  it('should allow adding inactive member', async () => {
    const member = await teamService.addTeamMember({
      teamId: testTeamId,
      studentId: testStudentIds[4],
      role: 'Developer',
      isActive: false, // Inactive doesn't count
    });
    expect(member).toBeDefined();
  });
});

