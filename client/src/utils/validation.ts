/**
 * Validation utilities for judge dashboard
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate lineup before approval
 */
export const validateLineup = (lineup: any[]): ValidationResult => {
  const errors: string[] = [];

  if (!lineup || lineup.length === 0) {
    errors.push("Lineup cannot be empty");
    return { isValid: false, errors };
  }

  // Check for at least one captain
  const captains = lineup.filter((p: any) => p.isCaptain);
  if (captains.length === 0) {
    errors.push("At least one player must be designated as captain");
  }

  // Check minimum player count (typically 3-5 players)
  if (lineup.length < 3) {
    errors.push("Lineup must have at least 3 players");
  }

  // Check for duplicate players
  const playerIds = lineup.map((p: any) => p.playerId);
  const uniqueIds = new Set(playerIds);
  if (playerIds.length !== uniqueIds.size) {
    errors.push("Duplicate players found in lineup");
  }

  // Check role distribution (at least one of each role recommended)
  const roles = lineup.map((p: any) => p.role);
  const hasDeveloper = roles.includes("Developer");
  const hasDesigner = roles.includes("Designer");
  const hasStrategist = roles.includes("Strategist");

  if (!hasDeveloper && !hasDesigner && !hasStrategist) {
    errors.push("Lineup should include at least one Developer, Designer, or Strategist");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate judge scores before locking
 */
export const validateJudgeScores = (scores: {
  codeFunctionality?: number;
  innovation?: number;
  presentation?: number;
  problemRelevance?: number;
  feasibility?: number;
  collaboration?: number;
}): ValidationResult => {
  const errors: string[] = [];

  const criteria = [
    { key: "codeFunctionality", label: "Code Functionality", weight: 0.25 },
    { key: "innovation", label: "Innovation", weight: 0.25 },
    { key: "presentation", label: "Presentation", weight: 0.15 },
    { key: "problemRelevance", label: "Problem Relevance", weight: 0.20 },
    { key: "feasibility", label: "Feasibility", weight: 0.10 },
    { key: "collaboration", label: "Collaboration", weight: 0.05 },
  ];

  criteria.forEach(({ key, label }) => {
    const value = scores[key as keyof typeof scores];
    if (value === undefined || value === null) {
      errors.push(`${label} score is required`);
    } else if (value < 0 || value > 10) {
      errors.push(`${label} score must be between 0 and 10`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate player scores
 */
export const validatePlayerScores = (scores: {
  rolePerformance?: number;
  initiative?: number;
  technicalMastery?: number;
  creativity?: number;
  collaboration?: number;
}): ValidationResult => {
  const errors: string[] = [];

  const criteria = [
    { key: "rolePerformance", label: "Role Performance" },
    { key: "initiative", label: "Initiative" },
    { key: "technicalMastery", label: "Technical Mastery" },
    { key: "creativity", label: "Creativity" },
    { key: "collaboration", label: "Collaboration" },
  ];

  criteria.forEach(({ key, label }) => {
    const value = scores[key as keyof typeof scores];
    if (value === undefined || value === null) {
      errors.push(`${label} score is required`);
    } else if (value < 0 || value > 10) {
      errors.push(`${label} score must be between 0 and 10`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate match can be started
 */
export const validateMatchStart = (match: any): ValidationResult => {
  const errors: string[] = [];

  if (!match) {
    errors.push("Match not found");
    return { isValid: false, errors };
  }

  // Check if all judges have accepted
  const judges = match.judges || [];
  const acceptedJudges = judges.filter((j: any) => j.status === "accepted");
  
  if (acceptedJudges.length === 0) {
    errors.push("At least one judge must accept the match");
  }

  if (judges.length > 0 && acceptedJudges.length < judges.length) {
    errors.push("All assigned judges must accept before starting the match");
  }

  // Check if lineups are approved
  const lineups = match.lineups || [];
  const teamIds = new Set(lineups.map((l: any) => l.teamId));
  const approvedLineups = lineups.filter((l: any) => l.status === "approved");

  if (teamIds.size > 0) {
    const approvedTeamIds = new Set(approvedLineups.map((l: any) => l.teamId));
    const missingApprovals = Array.from(teamIds).filter((id: any) => !approvedTeamIds.has(id));
    
    if (missingApprovals.length > 0) {
      errors.push("All team lineups must be approved before starting the match");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate match can be ended
 */
export const validateMatchEnd = (match: any, judgeId: string): ValidationResult => {
  const errors: string[] = [];

  if (!match) {
    errors.push("Match not found");
    return { isValid: false, errors };
  }

  if (match.status !== "in_progress") {
    errors.push("Match must be in progress to end it");
  }

  // Check if all scores are locked
  const judgeScores = match.judgeScores || [];
  const currentJudgeScores = judgeScores.filter((s: any) => s.judgeId === judgeId);
  const unlockedScores = currentJudgeScores.filter((s: any) => !s.isLocked);

  if (unlockedScores.length > 0) {
    errors.push("All scores must be locked before ending the match");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Check for score discrepancies between judges
 */
export const checkScoreDiscrepancies = (
  scores: Array<{ judge: { fullName: string }; [key: string]: any }>,
  threshold = 2 // 2 point difference threshold
): Array<{ judge: string; criterion: string; difference: number }> => {
  const discrepancies: Array<{ judge: string; criterion: string; difference: number }> = [];

  if (scores.length < 2) return discrepancies;

  const criteria = [
    "codeFunctionality",
    "innovation",
    "presentation",
    "problemRelevance",
    "feasibility",
    "collaboration",
  ];

  criteria.forEach((criterion) => {
    const values = scores.map((s) => s[criterion] || 0);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const difference = max - min;

    if (difference > threshold) {
      const judgeWithMax = scores.find((s) => s[criterion] === max)?.judge?.fullName || "Unknown";
      const judgeWithMin = scores.find((s) => s[criterion] === min)?.judge?.fullName || "Unknown";
      
      discrepancies.push({
        judge: `${judgeWithMax} vs ${judgeWithMin}`,
        criterion,
        difference,
      });
    }
  });

  return discrepancies;
};

