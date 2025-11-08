import apiClient from './axios';

export const teamsApi = {
  // Get all teams
  getAll: () => apiClient.get('/teams'),
  
  // Get team by ID
  getById: (id) => apiClient.get(`/teams/${id}`),
  
  // Create a new team
  create: (data) => apiClient.post('/teams', data),
  
  // Update a team
  update: (id, data) => apiClient.put(`/teams/${id}`, data),
  
  // Delete a team
  delete: (id) => apiClient.delete(`/teams/${id}`),
};

