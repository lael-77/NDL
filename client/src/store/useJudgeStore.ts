import { create } from 'zustand';

interface Timer {
  isRunning: boolean;
  elapsed: number;
  duration: number;
  startTime?: Date;
  pausedAt?: Date;
}

interface Score {
  teamId?: string;
  playerId?: string;
  criteria: Record<string, number>;
  comments?: string;
}

interface AutoJudgeResult {
  functionality: number;
  innovation: number;
  plagiarism: number;
  ai_detected: boolean;
  suggestions?: string;
}

interface JudgeState {
  // Matches
  matches: any[];
  activeMatch: any | null;
  
  // Timer
  timer: Timer | null;
  
  // Scores
  scores: Record<string, Score>;
  
  // AutoJudge Results
  autoJudgeResults: Record<string, AutoJudgeResult>;
  
  // Notifications
  notifications: any[];
  
  // Actions
  setMatches: (matches: any[]) => void;
  setActiveMatch: (match: any | null) => void;
  setTimer: (timer: Timer | null) => void;
  updateTimer: (updates: Partial<Timer>) => void;
  setScore: (matchId: string, score: Score) => void;
  getScore: (matchId: string, teamId?: string, playerId?: string) => Score | null;
  setAutoJudgeResult: (matchId: string, teamId: string, result: AutoJudgeResult) => void;
  getAutoJudgeResult: (matchId: string, teamId: string) => AutoJudgeResult | null;
  addNotification: (notification: any) => void;
  clearNotifications: () => void;
  reset: () => void;
}

const initialState = {
  matches: [],
  activeMatch: null,
  timer: null,
  scores: {},
  autoJudgeResults: {},
  notifications: [],
};

export const useJudgeStore = create<JudgeState>((set, get) => ({
  ...initialState,

  setMatches: (matches) => set({ matches }),

  setActiveMatch: (match) => set({ activeMatch: match }),

  setTimer: (timer) => set({ timer }),

  updateTimer: (updates) =>
    set((state) => ({
      timer: state.timer ? { ...state.timer, ...updates } : null,
    })),

  setScore: (matchId, score) =>
    set((state) => {
      const key = `${matchId}-${score.teamId || score.playerId}`;
      return {
        scores: {
          ...state.scores,
          [key]: score,
        },
      };
    }),

  getScore: (matchId, teamId, playerId) => {
    const state = get();
    const key = `${matchId}-${teamId || playerId}`;
    return state.scores[key] || null;
  },

  setAutoJudgeResult: (matchId, teamId, result) =>
    set((state) => ({
      autoJudgeResults: {
        ...state.autoJudgeResults,
        [`${matchId}-${teamId}`]: result,
      },
    })),

  getAutoJudgeResult: (matchId, teamId) => {
    const state = get();
    const key = `${matchId}-${teamId}`;
    return state.autoJudgeResults[key] || null;
  },

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),

  clearNotifications: () => set({ notifications: [] }),

  reset: () => set(initialState),
}));

