import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { initSocket, getSocket, isSocketEnabled } from '@/lib/socket';
import useAuthStore from '@/store/useAuthStore';

/**
 * Hook to set up real-time updates via WebSocket
 * Listens to socket events and updates React Query cache silently
 */
export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  const user = authStore.user;
  const isAuthenticated = authStore.isAuthenticated;
  const token = authStore.token || localStorage.getItem('token') || undefined;

  useEffect(() => {
    // Don't initialize WebSocket if not authenticated
    // This prevents interference with initial data loading
    if (!isAuthenticated) {
      return;
    }

    // Initialize socket connection
    const socket = initSocket(token || undefined);

    if (!socket || !isSocketEnabled()) {
      console.log('WebSocket not available, using standard HTTP requests');
      return;
    }

    // Handle leaderboard updates
    const handleLeaderboardUpdate = (data: any) => {
      console.log('Leaderboard update received via WebSocket');
      
      // Silently refetch leaderboard queries in the background
      // This updates the cache without showing loading states
      // Using invalidateQueries triggers a background refetch that doesn't show loading
      queryClient.invalidateQueries({ 
        queryKey: ['leaderboard'],
        refetchType: 'active', // Only refetch active queries (visible on screen)
      });
      queryClient.invalidateQueries({ queryKey: ['leaderboard-teams'], refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: ['leaderboard-students'], refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: ['leaderboard-coaches'], refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: ['leaderboard-schools'], refetchType: 'active' });
    };

    // Handle team updates
    const handleTeamUpdate = (data: any) => {
      console.log('Team update received via WebSocket');
      
      // Silently invalidate team-related queries (triggers background refetch)
      queryClient.invalidateQueries({ queryKey: ['teams'], refetchType: 'active' });
      if (data.teamId) {
        queryClient.invalidateQueries({ queryKey: ['team', data.teamId], refetchType: 'active' });
      }
      queryClient.invalidateQueries({ queryKey: ['leaderboard-teams'], refetchType: 'active' });
    };

    // Handle match updates
    const handleMatchUpdate = (data: any) => {
      console.log('Match update received via WebSocket');
      
      // Silently invalidate match-related queries (triggers background refetch)
      queryClient.invalidateQueries({ queryKey: ['matches'], refetchType: 'active' });
      if (data.matchId) {
        queryClient.invalidateQueries({ queryKey: ['match', data.matchId], refetchType: 'active' });
      }
    };

    // Handle dashboard updates
    const handleDashboardUpdate = () => {
      console.log('Dashboard update received via WebSocket');
      
      // Silently invalidate dashboard queries (triggers background refetch)
      if (user?.role) {
        queryClient.invalidateQueries({ queryKey: ['playerDashboard'], refetchType: 'active' });
        queryClient.invalidateQueries({ queryKey: ['coachDashboard'], refetchType: 'active' });
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'], refetchType: 'active' });
        queryClient.invalidateQueries({ queryKey: ['schoolAdminDashboard'], refetchType: 'active' });
      }
    };

    // Join leaderboard room to receive updates
    socket.emit('join:leaderboard');

    // Set up event listeners
    socket.on('leaderboard:update', handleLeaderboardUpdate);
    socket.on('team:update', handleTeamUpdate);
    socket.on('match:update', handleMatchUpdate);
    socket.on('match:live', handleMatchUpdate);
    
    // Listen for general data updates
    socket.on('data:update', handleDashboardUpdate);

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off('leaderboard:update', handleLeaderboardUpdate);
        socket.off('team:update', handleTeamUpdate);
        socket.off('match:update', handleMatchUpdate);
        socket.off('match:live', handleMatchUpdate);
        socket.off('data:update', handleDashboardUpdate);
      }
    };
  }, [queryClient, user, token, isAuthenticated]);
};

/**
 * Hook to set up real-time updates for a specific match
 */
export const useRealtimeMatch = (matchId: string | undefined) => {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  const token = authStore.token || localStorage.getItem('token') || undefined;

  useEffect(() => {
    if (!matchId) return;

    const socket = getSocket();
    if (!socket || !isSocketEnabled()) return;

    // Join match room
    socket.emit('join:match', matchId);

    // Handle match updates
    const handleMatchUpdate = (data: any) => {
      if (data.matchId === matchId) {
        console.log(`Match ${matchId} update received via WebSocket`);
        
        // Update cache directly for instant UI update
        if (data.match) {
          queryClient.setQueryData(['match', matchId], data.match);
        }
        
        // Also invalidate to ensure consistency
        queryClient.invalidateQueries({ queryKey: ['match', matchId] });
      }
    };

    socket.on('match:update', handleMatchUpdate);
    socket.on('match:live', handleMatchUpdate);

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit('leave:match', matchId);
        socket.off('match:update', handleMatchUpdate);
        socket.off('match:live', handleMatchUpdate);
      }
    };
  }, [matchId, queryClient, token]);
};

