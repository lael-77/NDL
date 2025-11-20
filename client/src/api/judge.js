import axios from './axios.js';

// Get all assigned matches for the judge
export const getAssignedMatches = async () => {
  const response = await axios.get('/judge/matches');
  return response.data;
};

// Accept a match assignment
export const acceptMatch = (matchId) => {
  return axios.post(`/judge/matches/${matchId}/accept`);
};

// Decline a match assignment
export const declineMatch = (matchId) => {
  return axios.post(`/judge/matches/${matchId}/decline`);
};

// Get match details for judging
export const getMatchForJudging = async (matchId) => {
  const response = await axios.get(`/judge/matches/${matchId}`);
  return response.data;
};

// Match timer controls
export const startMatchTimer = (matchId, duration) => {
  return axios.post(`/judge/matches/${matchId}/timer/start`, { duration });
};

export const pauseMatchTimer = (matchId) => {
  return axios.post(`/judge/matches/${matchId}/timer/pause`);
};

export const resumeMatchTimer = (matchId) => {
  return axios.post(`/judge/matches/${matchId}/timer/resume`);
};

export const endMatch = (matchId, comments) => {
  return axios.post(`/judge/matches/${matchId}/timer/end`, { comments });
};

// Lineup management
export const submitLineup = (matchId, teamId, players) => {
  return axios.post(`/judge/matches/${matchId}/lineup`, { teamId, players });
};

export const approveLineup = (matchId, teamId) => {
  return axios.post(`/judge/matches/${matchId}/lineup/${teamId}/approve`);
};

// Auto-judge scores
export const submitAutoScores = (matchId, teamId, scores) => {
  return axios.post(`/judge/matches/${matchId}/auto-scores`, {
    matchId,
    teamId,
    ...scores,
  });
};

// Judge scores
export const submitJudgeScores = (matchId, teamId, scores, comments) => {
  return axios.post(`/judge/matches/${matchId}/scores/team`, {
    matchId,
    teamId,
    scores,
    comments,
  });
};

export const lockJudgeScores = (matchId, teamId) => {
  return axios.post(`/judge/matches/${matchId}/scores/team/${teamId}/lock`);
};

export const submitPlayerScores = (matchId, playerId, scores, notes) => {
  return axios.post(`/judge/matches/${matchId}/scores/player`, {
    matchId,
    playerId,
    scores,
    notes,
  });
};

// Co-judge collaboration
export const getCoJudgeScores = async (matchId) => {
  const response = await axios.get(`/judge/matches/${matchId}/co-judge-scores`);
  return response.data;
};

// Feedback
export const submitFeedback = (matchId, teamId, playerId, message, isPublic) => {
  return axios.post(`/judge/matches/${matchId}/feedback`, {
    matchId,
    teamId,
    playerId,
    message,
    isPublic,
  });
};

// AI Evaluation
export const evaluateWithAI = async (matchId, teamId, submissionData) => {
  const response = await axios.post(`/judge/matches/${matchId}/ai-evaluate`, {
    teamId,
    ...submissionData,
  });
  return response.data;
};

// Submit final match results
export const submitMatchResults = (matchId, signatures, finalComments) => {
  return axios.post(`/judge/matches/${matchId}/submit-results`, {
    signatures,
    finalComments,
  });
};

