import { useEffect, useRef } from 'react';
import { getSocket, initSocket } from '@/lib/socket';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/useAuthStore';

/**
 * Hook for real-time judge dashboard updates via WebSocket
 * Handles match updates, timer updates, score updates, and co-judge sync
 */
export const useJudgeRealtime = (matchId: string | null) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!matchId) return;

    const token = localStorage.getItem('token');
    const socket = initSocket(token);

    if (!socket) {
      console.warn('WebSocket not available, using standard HTTP requests');
      return;
    }

    socketRef.current = socket;

    // Join match room
    socket.emit('join:match', matchId);

    // Listen for match updates
    socket.on('match:update', (data: any) => {
      if (data.matchId === matchId) {
        queryClient.invalidateQueries({ queryKey: ['judge-match', matchId] });
        queryClient.invalidateQueries({ queryKey: ['judge-matches'] });
      }
    });

    // Listen for live match updates (timer, scores)
    socket.on('match:live', (data: any) => {
      if (data.matchId === matchId) {
        queryClient.invalidateQueries({ queryKey: ['judge-match', matchId] });
        
        // Update timer if present
        if (data.match?.timer) {
          queryClient.setQueryData(['judge-match', matchId], (old: any) => {
            if (!old) return old;
            return { ...old, timer: data.match.timer };
          });
        }

        // Update scores if present
        if (data.match?.judgeScore) {
          queryClient.setQueryData(['judge-match', matchId], (old: any) => {
            if (!old) return old;
            return {
              ...old,
              judgeScores: [
                ...(old.judgeScores || []).filter((s: any) => 
                  !(s.judgeId === data.match.judgeScore.judgeId && s.teamId === data.match.judgeScore.teamId)
                ),
                data.match.judgeScore,
              ],
            };
          });
        }

        // Update auto scores if present
        if (data.match?.autoScore) {
          queryClient.setQueryData(['judge-match', matchId], (old: any) => {
            if (!old) return old;
            return {
              ...old,
              autoScores: [
                ...(old.autoScores || []).filter((s: any) => 
                  s.teamId !== data.match.autoScore.teamId
                ),
                data.match.autoScore,
              ],
            };
          });
        }
      }
    });

    // Listen for co-judge score updates
    socket.on('score:update', (data: any) => {
      if (data.matchId === matchId) {
        queryClient.invalidateQueries({ queryKey: ['co-judge-scores', matchId] });
      }
    });

    // Listen for notifications
    socket.on('notification:judge', (data: any) => {
      // Show notification toast
      console.log('Judge notification:', data);
    });

    return () => {
      if (socket) {
        socket.emit('leave:match', matchId);
        socket.off('match:update');
        socket.off('match:live');
        socket.off('score:update');
        socket.off('notification:judge');
      }
    };
  }, [matchId, queryClient, user]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
  };
};

