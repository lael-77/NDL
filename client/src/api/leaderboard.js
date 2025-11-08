import apiClient from './axios';

export const leaderboardApi = {
  // Get global leaderboard
  getGlobal: () => apiClient.get('/leaderboard'),
  
  // Get leaderboard by tier
  getByTier: (tier) => apiClient.get(`/leaderboard/${tier}`),
};

