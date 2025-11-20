import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';

/**
 * Hook for session timeout management
 * Auto-logout after inactivity period (default: 30 minutes)
 */
export const useSessionTimeout = (timeoutMinutes = 30) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimeout = () => {
    lastActivityRef.current = Date.now();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const inactiveTime = Date.now() - lastActivityRef.current;
      const timeoutMs = timeoutMinutes * 60 * 1000;

      if (inactiveTime >= timeoutMs) {
        logout();
        navigate('/auth');
        alert('Your session has expired due to inactivity. Please log in again.');
      }
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    // Reset timeout on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    resetTimeout();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeoutMinutes, logout, navigate]);

  return {
    resetTimeout,
    getRemainingTime: () => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = timeoutMinutes * 60 * 1000 - elapsed;
      return Math.max(0, Math.floor(remaining / 1000)); // Return seconds
    },
  };
};

