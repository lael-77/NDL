/**
 * School Admin Controller
 * Handles all school admin operations with proper RBAC
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import teamService from '../services/teamService';
import { emitNotification } from '../services/socket';

const prisma = new PrismaClient();

// Get all students for a school (paginated)
export async function getSchoolStudents(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const { page = 1, limit = 20, search, filter } = req.query;
    const userId = (req as any).user?.userId;

    // Verify user is school admin of this school
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { school: true },
    });

    if (!user || user.role !== 'school_admin' || user.school_id !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized: Not school admin of this school' });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { school_id: schoolId };

    if (search) {
      where.OR = [
        { student_number: { contains: search as string, mode: 'insensitive' } },
        { user: { email: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    if (filter === 'at_risk') {
      where.progress_percentage = { lt: 50 };
    }

    const [students, total] = await Promise.all([
      prisma.students.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile_data: true,
            },
          },
          teamMembers: {
            where: { is_active: true },
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.students.count({ where }),
    ]);

    res.json({
      students,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching school students:', error);
    res.status(500).json({ error: error.message });
  }
}

// Create a new student (enforces 20 student limit)
export async function createStudent(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const { email, password, fullName, age, grade, studentNumber } = req.body;
    const userId = (req as any).user?.userId;

    // Verify authorization
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'school_admin' || user.school_id !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check student limit (database constraint will also enforce, but check here for better error)
    const studentCount = await prisma.students.count({
      where: { school_id: schoolId },
    });

    if (studentCount >= 20) {
      return res.status(400).json({
        error: 'School has reached maximum student limit of 20',
        currentCount: studentCount,
      });
    }

    // Create user and student in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.users.create({
        data: {
          email,
          password_hash: password, // Should be hashed before this
          role: 'student',
          school_id: schoolId,
          profile_data: {
            fullName,
          },
        },
      });

      // Create student
      const student = await tx.students.create({
        data: {
          id: newUser.id,
          school_id: schoolId,
          student_number: studentNumber,
          age,
          grade,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile_data: true,
            },
          },
        },
      });

      // Emit notification
      await emitNotification(newUser.id, {
        type: 'student_created',
        title: 'Welcome to NDL!',
        message: `You have been registered as a student at ${schoolId}`,
      });

      return student;
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get student profile
export async function getStudentProfile(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    const userId = (req as any).user?.userId;

    const student = await prisma.students.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        teamMembers: {
          include: {
            team: {
              include: {
                school: true,
              },
            },
          },
        },
        submissions: {
          include: {
            match: true,
          },
          orderBy: {
            submitted_at: 'desc',
          },
          take: 10,
        },
        studentCourseProgress: {
          include: {
            course: true,
          },
        },
        mentorStudents: {
          include: {
            mentor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check authorization
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (
      user?.role !== 'school_admin' ||
      (user.role === 'school_admin' && user.school_id !== student.school_id)
    ) {
      if (userId !== studentId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    res.json(student);
  } catch (error: any) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get all teams for a school
export async function getSchoolTeams(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const userId = (req as any).user?.userId;

    // Verify authorization
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'school_admin' || user.school_id !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const teams = await prisma.teams.findMany({
      where: { school_id: schoolId },
      include: {
        teamMembers: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    profile_data: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.json(teams);
  } catch (error: any) {
    console.error('Error fetching school teams:', error);
    res.status(500).json({ error: error.message });
  }
}

// Create a new team
export async function createTeam(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const { name, description } = req.body;
    const userId = (req as any).user?.userId;

    // Verify authorization
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'school_admin' || user.school_id !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const team = await prisma.teams.create({
      data: {
        school_id: schoolId,
        name,
        description,
        status: 'active',
      },
    });

    res.status(201).json(team);
  } catch (error: any) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: error.message });
  }
}

// Add member to team (enforces 4 active members limit)
export async function addTeamMember(req: Request, res: Response) {
  try {
    const { teamId } = req.params;
    const { studentId, role, isActive, isCaptain } = req.body;
    const userId = (req as any).user?.userId;

    // Verify team exists and get school
    const team = await prisma.teams.findUnique({
      where: { id: teamId },
      include: { school: true },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Verify authorization
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'school_admin' || user.school_id !== team.school_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Use team service which handles constraints
    const member = await teamService.addTeamMember({
      teamId,
      studentId,
      role,
      isActive,
      isCaptain,
    });

    res.status(201).json(member);
  } catch (error: any) {
    console.error('Error adding team member:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get school dashboard stats
export async function getSchoolDashboard(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const userId = (req as any).user?.userId;

    // Verify authorization
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'school_admin' || user.school_id !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const [studentCount, teamCount, atRiskStudents, upcomingMatches, recentSubmissions] =
      await Promise.all([
        prisma.students.count({
          where: { school_id: schoolId },
        }),
        prisma.teams.count({
          where: { school_id: schoolId, status: 'active' },
        }),
        prisma.students.count({
          where: {
            school_id: schoolId,
            progress_percentage: { lt: 50 },
            last_active: {
              lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            },
          },
        }),
        prisma.matches.findMany({
          where: {
            OR: [
              { team_a: { school_id: schoolId } },
              { team_b: { school_id: schoolId } },
            ],
            status: 'scheduled',
            scheduled_at: { gte: new Date() },
          },
          include: {
            team_a: true,
            team_b: true,
          },
          take: 5,
          orderBy: {
            scheduled_at: 'asc',
          },
        }),
        prisma.submissions.findMany({
          where: {
            student: { school_id: schoolId },
          },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    email: true,
                    profile_data: true,
                  },
                },
              },
            },
            match: true,
          },
          take: 10,
          orderBy: {
            submitted_at: 'desc',
          },
        }),
      ]);

    res.json({
      stats: {
        studentCount,
        teamCount,
        atRiskStudents,
      },
      upcomingMatches,
      recentSubmissions,
    });
  } catch (error: any) {
    console.error('Error fetching school dashboard:', error);
    res.status(500).json({ error: error.message });
  }
}

export default {
  getSchoolStudents,
  createStudent,
  getStudentProfile,
  getSchoolTeams,
  createTeam,
  addTeamMember,
  getSchoolDashboard,
};

