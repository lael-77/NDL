/**
 * School Admin API Client
 */

import axios from './axios';

export interface Student {
  id: string;
  student_number: string;
  age: number;
  grade: number;
  level: string;
  progress_percentage: number;
  user: {
    id: string;
    email: string;
    profile_data: any;
  };
  teamMembers?: any[];
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  status: string;
  teamMembers: Array<{
    id: string;
    role: string;
    is_active: boolean;
    student: Student;
  }>;
}

export interface DashboardData {
  stats: {
    studentCount: number;
    teamCount: number;
    atRiskStudents: number;
  };
  upcomingMatches: any[];
  recentSubmissions: any[];
}

// Get school dashboard data (uses schoolId from authenticated user)
export async function getSchoolDashboard(): Promise<DashboardData> {
  const response = await axios.get(`/school-admin/dashboard`);
  return response.data;
}

// Get school students (paginated) - uses schoolId from authenticated user
export async function getSchoolStudents(
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    filter?: string;
  }
): Promise<{ students: Student[]; pagination: any }> {
  const response = await axios.get(`/school-admin/students`, {
    params,
  });
  return response.data;
}

// Create student - uses schoolId from authenticated user
export async function createStudent(
  data: {
    email: string;
    password: string;
    fullName: string;
    age: number;
    grade: number;
    studentNumber: string;
  }
): Promise<Student> {
  const response = await axios.post(`/school-admin/students`, data);
  return response.data;
}

// Get student profile
export async function getStudentProfile(studentId: string): Promise<Student> {
  const response = await axios.get(`/school-admin/students/${studentId}`);
  return response.data;
}

// Get school teams - uses schoolId from authenticated user
export async function getSchoolTeams(): Promise<Team[]> {
  const response = await axios.get(`/school-admin/teams`);
  return response.data;
}

// Create team - uses schoolId from authenticated user
export async function createTeam(
  data: { 
    name: string; 
    tier?: string;
    coachId?: string;
    playerIds?: string[];
  }
): Promise<Team> {
  const response = await axios.post(`/school-admin/teams`, data);
  return response.data;
}

// Add team member
export async function addTeamMember(
  teamId: string,
  data: {
    studentId: string;
    role?: string;
    isActive?: boolean;
    isCaptain?: boolean;
  }
): Promise<any> {
  const response = await axios.post(`/school-admin/teams/${teamId}/members`, data);
  return response.data;
}

// Remove team member
export async function removeTeamMember(teamId: string, memberId: string): Promise<any> {
  const response = await axios.delete(`/school-admin/teams/${teamId}/members/${memberId}`);
  return response.data;
}

// Swap team member
export async function swapTeamMember(
  teamId: string,
  data: {
    removeMemberId: string;
    addPlayerId: string;
  }
): Promise<any> {
  const response = await axios.post(`/school-admin/teams/${teamId}/members/swap`, data);
  return response.data;
}

// Delete team
export async function deleteTeam(teamId: string): Promise<any> {
  const response = await axios.delete(`/school-admin/teams/${teamId}`);
  return response.data;
}

// Assign coach to team
export async function assignCoach(teamId: string, coachId: string): Promise<any> {
  const response = await axios.post(`/school-admin/teams/${teamId}/coach`, { coachId });
  return response.data;
}

// Remove coach from team
export async function removeCoach(teamId: string): Promise<any> {
  const response = await axios.delete(`/school-admin/teams/${teamId}/coach`);
  return response.data;
}

// Swap coach
export async function swapCoach(teamId: string, coachId: string): Promise<any> {
  const response = await axios.put(`/school-admin/teams/${teamId}/coach`, { coachId });
  return response.data;
}

// Add team feedback
export async function addTeamFeedback(
  teamId: string,
  data: {
    message: string;
    isPublic?: boolean;
  }
): Promise<any> {
  const response = await axios.post(`/school-admin/teams/${teamId}/feedback`, data);
  return response.data;
}

// Get team feedback
export async function getTeamFeedback(teamId: string): Promise<any[]> {
  const response = await axios.get(`/school-admin/teams/${teamId}/feedback`);
  return response.data;
}

// Get school coaches
export async function getSchoolCoaches(): Promise<any[]> {
  const response = await axios.get(`/school-admin/coaches`);
  return response.data;
}

// Get reserve players (students not in any team)
export async function getReservePlayers(): Promise<any[]> {
  const response = await axios.get(`/school-admin/reserve-players`);
  return response.data;
}

// Swap players between teams
export async function swapPlayersBetweenTeams(data: {
  sourceTeamId: string;
  targetTeamId: string;
  sourceMemberId: string;
  targetMemberId: string;
}): Promise<any> {
  const response = await axios.post(`/school-admin/teams/swap-between`, data);
  return response.data;
}

// ==================== SETTINGS API ====================

// 1. School Profile Settings
export async function getSchoolProfile(): Promise<any> {
  const response = await axios.get(`/school-admin/settings/profile`);
  return response.data;
}

export async function updateSchoolProfile(data: {
  name?: string;
  motto?: string;
  logoUrl?: string;
  bannerUrl?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialMedia?: Record<string, string>;
  colorTheme?: string;
  anthemUrl?: string;
  description?: string;
  achievements?: any[];
}): Promise<any> {
  const response = await axios.put(`/school-admin/settings/profile`, data);
  return response.data;
}

// 2. Coaches & Staff Permissions
export async function addCoach(data: {
  email: string;
  password: string;
  fullName: string;
}): Promise<any> {
  const response = await axios.post(`/school-admin/settings/coaches`, data);
  return response.data;
}

export async function removeCoachFromSchool(coachId: string): Promise<any> {
  const response = await axios.delete(`/school-admin/settings/coaches/${coachId}`);
  return response.data;
}

// 3. Team Configuration Settings
export async function updateTeamSettings(
  teamId: string,
  data: {
    name?: string;
    logoUrl?: string;
    homeArena?: string;
    teamColors?: Record<string, string>;
    category?: string;
    coachCanManageLineups?: boolean;
    coachCanEditInfo?: boolean;
    coachCanUploadSubmissions?: boolean;
    coachCanViewAnalytics?: boolean;
    coachCanManageFinances?: boolean;
  }
): Promise<any> {
  const response = await axios.put(`/school-admin/settings/teams/${teamId}`, data);
  return response.data;
}

// 4. Sponsorship & Arena Settings
export async function getSchoolSponsorships(): Promise<any[]> {
  const response = await axios.get(`/school-admin/settings/sponsorships`);
  return response.data;
}

export async function createSponsorship(data: {
  sponsorName: string;
  sponsorType: string;
  proposalUrl?: string;
  offerDetails?: string;
  assets?: any;
}): Promise<any> {
  const response = await axios.post(`/school-admin/settings/sponsorships`, data);
  return response.data;
}

export async function updateSponsorshipStatus(
  sponsorshipId: string,
  status: string
): Promise<any> {
  const response = await axios.put(`/school-admin/settings/sponsorships/${sponsorshipId}/status`, { status });
  return response.data;
}

export async function getArenaApplications(): Promise<any[]> {
  const response = await axios.get(`/school-admin/settings/arena-applications`);
  return response.data;
}

export async function createArenaApplication(data: {
  arenaId: string;
  message?: string;
}): Promise<any> {
  const response = await axios.post(`/school-admin/settings/arena-applications`, data);
  return response.data;
}

// 5. Finance & Transactions Settings
export async function getSchoolFinances(): Promise<any[]> {
  const response = await axios.get(`/school-admin/settings/finances`);
  return response.data;
}

export async function createFinance(data: {
  type: string;
  amount: number;
  description?: string;
  status?: string;
  dueDate?: string;
  teamId?: string;
}): Promise<any> {
  const response = await axios.post(`/school-admin/settings/finances`, data);
  return response.data;
}

export async function updateFinanceStatus(
  financeId: string,
  data: {
    status?: string;
    invoiceUrl?: string;
    receiptUrl?: string;
  }
): Promise<any> {
  const response = await axios.put(`/school-admin/settings/finances/${financeId}`, data);
  return response.data;
}

// 6. Communication & Notification Settings
export async function getNotificationSettings(): Promise<any[]> {
  const response = await axios.get(`/school-admin/settings/notifications`);
  return response.data;
}

export async function updateNotificationSettings(data: {
  notificationType: string;
  channel?: string;
  enabled?: boolean;
  urgencyLevel?: string;
}): Promise<any> {
  const response = await axios.put(`/school-admin/settings/notifications`, data);
  return response.data;
}

