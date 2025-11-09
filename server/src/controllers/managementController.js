import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  getManagedStudents,
  getManagedCoaches,
  canAccessSchool,
} from '../middleware/rbac.js';

const prisma = new PrismaClient();

// ============================================
// LEAGUE ADMIN MANAGEMENT
// ============================================

/**
 * Get all students (League Admin only)
 */
export const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.profile.findMany({
      where: { role: 'player' },
      include: {
        studentSchool: true,
        teamMembers: {
          include: {
            team: {
              include: { school: true },
            },
          },
        },
        academyProgress: true,
        challengeSubmissions: {
          include: { challenge: true },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    res.json({ students, count: students.length });
  } catch (error) {
    console.error('Error fetching all students:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all coaches (League Admin only)
 */
export const getAllCoaches = async (req, res) => {
  try {
    const coaches = await prisma.coach.findMany({
      include: {
        profile: true,
        school: {
          include: {
            teams: {
              include: {
                members: {
                  include: { player: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ coaches, count: coaches.length });
  } catch (error) {
    console.error('Error fetching all coaches:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all schools (League Admin only)
 */
export const getAllSchools = async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      include: {
        teams: {
          include: {
            members: {
              include: { player: true },
            },
          },
        },
        coach: {
          include: { profile: true },
        },
        students: true,
        schoolAdmins: true,
        arenas: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json({ schools, count: schools.length });
  } catch (error) {
    console.error('Error fetching all schools:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// SCHOOL ADMIN MANAGEMENT
// ============================================

/**
 * Get students in school admin's school
 */
export const getSchoolStudents = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const students = await getManagedStudents(userId);

    res.json({ students, count: students.length });
  } catch (error) {
    console.error('Error fetching school students:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get coaches in school admin's school
 */
export const getSchoolCoaches = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const coaches = await getManagedCoaches(userId);

    res.json({ coaches, count: coaches.length });
  } catch (error) {
    console.error('Error fetching school coaches:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get sponsors for school admin's school
 */
export const getSchoolSponsors = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      include: { school: true },
    });

    if (!user || (user.role !== 'admin' && user.role !== 'school_admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const schoolId = user.role === 'admin' ? req.query.schoolId : user.schoolId;
    
    if (!schoolId) {
      return res.status(400).json({ error: 'School ID required' });
    }

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school || !school.sponsor) {
      return res.json({ sponsors: [], count: 0 });
    }

    // Find sponsors matching the school's sponsor name
    const sponsors = await prisma.profile.findMany({
      where: {
        role: 'sponsor',
        fullName: {
          contains: school.sponsor,
        },
      },
    });

    res.json({ sponsors, count: sponsors.length });
  } catch (error) {
    console.error('Error fetching school sponsors:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create student in school admin's school
 */
export const createStudent = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      include: { school: true },
    });

    if (!user || (user.role !== 'admin' && user.role !== 'school_admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const schoolId = user.role === 'admin' ? (req.body.schoolId || user.schoolId) : user.schoolId;

    if (!schoolId) {
      return res.status(400).json({ error: 'School ID required' });
    }

    const { email, password, fullName, studentRole, age, grade } = req.body;

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const student = await prisma.profile.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: 'player',
        studentRole,
        age,
        grade,
        studentSchoolId: schoolId,
      },
      include: {
        studentSchool: true,
      },
    });

    res.status(201).json({ student });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update student in school admin's school
 */
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || req.user?.id;

    const student = await prisma.profile.findUnique({
      where: { id },
      include: { studentSchool: true },
    });

    if (!student || student.role !== 'player') {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check access
    const hasAccess = await canAccessSchool(userId, student.studentSchoolId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { fullName, studentRole, age, grade, xp } = req.body;

    const updated = await prisma.profile.update({
      where: { id },
      data: {
        fullName,
        studentRole,
        age,
        grade,
        xp,
      },
      include: {
        studentSchool: true,
        teamMembers: {
          include: { team: true },
        },
      },
    });

    res.json({ student: updated });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// COACH MANAGEMENT
// ============================================

/**
 * Get students managed by coach
 */
export const getCoachStudents = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const students = await getManagedStudents(userId);

    res.json({ students, count: students.length });
  } catch (error) {
    console.error('Error fetching coach students:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get student details (Coach can view their students)
 */
export const getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || req.user?.id;

    const student = await prisma.profile.findUnique({
      where: { id },
      include: {
        studentSchool: true,
        teamMembers: {
          include: {
            team: {
              include: { school: true },
            },
          },
        },
        academyProgress: true,
        challengeSubmissions: {
          include: { challenge: true },
        },
      },
    });

    if (!student || student.role !== 'player') {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check access
    const hasAccess = await canAccessSchool(userId, student.studentSchoolId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ student });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update student progress (Coach can update their students)
 */
export const updateStudentProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || req.user?.id;

    const student = await prisma.profile.findUnique({
      where: { id },
      include: { studentSchool: true },
    });

    if (!student || student.role !== 'player') {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check access
    const hasAccess = await canAccessSchool(userId, student.studentSchoolId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { xp, academyProgress, notes } = req.body;

    const updated = await prisma.profile.update({
      where: { id },
      data: {
        xp: xp !== undefined ? xp : student.xp,
      },
    });

    res.json({ student: updated, message: 'Student progress updated' });
  } catch (error) {
    console.error('Error updating student progress:', error);
    res.status(500).json({ error: error.message });
  }
};

