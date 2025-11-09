import axios from './axios';

export const adminApi = {
  // Get all users
  getAllUsers: (role, schoolId) => {
    const params = {};
    if (role) params.role = role;
    if (schoolId) params.schoolId = schoolId;
    return axios.get('/admin/users', { params });
  },

  // Create user
  createUser: (userData) => {
    return axios.post('/admin/users', userData);
  },

  // Delete user
  deleteUser: (userId) => {
    return axios.delete(`/admin/users/${userId}`);
  },

  // Change user role
  changeUserRole: (userId, role, schoolId) => {
    return axios.put(`/admin/users/${userId}/role`, { role, schoolId });
  },

  // Promote/relegate school
  promoteRelegateSchool: (schoolId, tier, action) => {
    return axios.put(`/admin/schools/${schoolId}/tier`, { tier, action });
  },

  // Assign student to team
  assignStudentToTeam: (studentId, teamId) => {
    return axios.post('/admin/teams/assign-student', { studentId, teamId });
  },

  // Remove student from team
  removeStudentFromTeam: (studentId, teamId) => {
    return axios.post('/admin/teams/remove-student', { studentId, teamId });
  },

  // Get users by role
  getUsersByRole: (role) => {
    return axios.get(`/admin/users/role/${role}`);
  },

  // Change user's school
  changeUserSchool: (userId, schoolId, studentSchoolId) => {
    return axios.put(`/admin/users/${userId}/school`, { schoolId, studentSchoolId });
  },

  // Remove user from role
  removeFromRole: (userId) => {
    return axios.put(`/admin/users/${userId}/remove-role`);
  },
};

