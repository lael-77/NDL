import apiClient from './axios';

export const leaderboardApi = {
  // Get global teams leaderboard
  getGlobal: () => apiClient.get('/leaderboard'),
  
  // Get leaderboard by tier
  getByTier: (tier) => apiClient.get(`/leaderboard/${tier}`),
  
  // Get teams leaderboard
  getTeams: (tier) => {
    const params = tier && tier !== 'all' ? { tier } : {};
    return apiClient.get('/leaderboard/teams', { params });
  },
  
  // Get students leaderboard
  getStudents: (tier) => {
    const params = tier && tier !== 'all' ? { tier } : {};
    return apiClient.get('/leaderboard/students', { params });
  },
  
  // Get coaches leaderboard
  getCoaches: (tier) => {
    const params = tier && tier !== 'all' ? { tier } : {};
    return apiClient.get('/leaderboard/coaches', { params });
  },
  
  // Get schools leaderboard
  getSchools: (tier) => {
    const params = tier && tier !== 'all' ? { tier } : {};
    return apiClient.get('/leaderboard/schools', { params });
  },
};

