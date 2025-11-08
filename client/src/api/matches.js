import apiClient from './axios';

export const matchesApi = {
  // Get all matches
  getAll: () => apiClient.get('/matches'),
  
  // Get match by ID
  getById: (id) => apiClient.get(`/matches/${id}`),
  
  // Create a new match
  create: (data) => apiClient.post('/matches', data),
  
  // Update a match
  update: (id, data) => apiClient.put(`/matches/${id}`, data),
  
  // Delete a match
  delete: (id) => apiClient.delete(`/matches/${id}`),
};

