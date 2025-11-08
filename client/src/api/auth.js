import apiClient from './axios';

export const authApi = {
  // Register a new user
  register: (data) => apiClient.post('/auth/register', data),
  
  // Login user
  login: (data) => apiClient.post('/auth/login', data),
  
  // Get user profile
  getProfile: () => apiClient.get('/auth/profile'),
  
  // Update user profile
  updateProfile: (data) => apiClient.put('/auth/profile', data),
};

