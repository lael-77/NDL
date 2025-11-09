import axios from './axios';

export const dashboardApi = {
  // Get player dashboard data
  getPlayerDashboard: () => {
    return axios.get('/dashboard/player');
  },

  // Get coach dashboard data
  getCoachDashboard: () => {
    return axios.get('/dashboard/coach');
  },

  // Get school admin dashboard data
  getSchoolAdminDashboard: () => {
    return axios.get('/dashboard/school-admin');
  },

  // Get sponsor dashboard data
  getSponsorDashboard: () => {
    return axios.get('/dashboard/sponsor');
  },

  // Get admin dashboard data
  getAdminDashboard: () => {
    return axios.get('/dashboard/admin');
  },
};

