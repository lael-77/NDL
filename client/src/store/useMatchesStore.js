import { create } from 'zustand';
import { matchesApi } from '../api/matches';

const useMatchesStore = create((set) => ({
  matches: [],
  currentMatch: null,
  loading: false,
  error: null,

  // Fetch all matches
  fetchMatches: async () => {
    set({ loading: true, error: null });
    try {
      const response = await matchesApi.getAll();
      set({
        matches: response.data,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fetch matches',
        loading: false,
      });
    }
  },

  // Fetch match by ID
  fetchMatchById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await matchesApi.getById(id);
      set({
        currentMatch: response.data,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fetch match',
        loading: false,
      });
    }
  },

  // Create a new match
  createMatch: async (matchData) => {
    set({ loading: true, error: null });
    try {
      const response = await matchesApi.create(matchData);
      set((state) => ({
        matches: [...state.matches, response.data],
        loading: false,
      }));
      return { success: true, data: response.data };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to create match',
        loading: false,
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Update a match
  updateMatch: async (id, matchData) => {
    set({ loading: true, error: null });
    try {
      const response = await matchesApi.update(id, matchData);
      set((state) => ({
        matches: state.matches.map((match) =>
          match.id === id ? response.data : match
        ),
        currentMatch: state.currentMatch?.id === id ? response.data : state.currentMatch,
        loading: false,
      }));
      return { success: true, data: response.data };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to update match',
        loading: false,
      });
      return { success: false, error: error.response?.data?.error };
    }
  },
}));

export default useMatchesStore;

