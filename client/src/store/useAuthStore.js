import { create } from 'zustand';
import { authApi } from '../api/auth';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // Login
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.login({ email, password });
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Login failed',
        loading: false,
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Register
  register: async (email, password, fullName, role) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.register({ email, password, fullName, role });
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Registration failed',
        loading: false,
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  // Initialize auth state from localStorage
  initialize: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      set({
        user: JSON.parse(user),
        token,
        isAuthenticated: true,
      });
    }
  },

  // Update profile
  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.updateProfile(data);
      const user = response.data;
      
      localStorage.setItem('user', JSON.stringify(user));
      set({
        user,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Update failed',
        loading: false,
      });
      return { success: false, error: error.response?.data?.error };
    }
  },
}));

export default useAuthStore;

