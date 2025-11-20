/**
 * Scoring Service - Handles AI and Human score aggregation
 * Implements 60% AI + 40% Human scoring algorithm
 */

interface AIScore {
  correctness: number; // 0-40
  efficiency: number; // 0-20
  originality: number; // 0-20
  docsAndTests: number; // 0-20
}

interface HumanScore {
  score: number; // 0-100
  judgeId: string;
  comments?: string;
}

/**
 * Calculate AI score from component scores
 * Total: 0-100
 */
export function calculateAIScore(components: AIScore): number {
  const { correctness, efficiency, originality, docsAndTests } = components;

  // Validate ranges
  if (correctness < 0 || correctness > 40) {
    throw new Error('Correctness must be between 0 and 40');
  }
  if (efficiency < 0 || efficiency > 20) {
    throw new Error('Efficiency must be between 0 and 20');
  }
  if (originality < 0 || originality > 20) {
    throw new Error('Originality must be between 0 and 20');
  }
  if (docsAndTests < 0 || docsAndTests > 20) {
    throw new Error('Docs and Tests must be between 0 and 20');
  }

  const total = correctness + efficiency + originality + docsAndTests;
  return Math.round(total * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate final score: 60% AI + 40% Human
 */
export function calculateFinalScore(aiScore: number, humanScore: number): number {
  if (aiScore < 0 || aiScore > 100) {
    throw new Error('AI score must be between 0 and 100');
  }
  if (humanScore < 0 || humanScore > 100) {
    throw new Error('Human score must be between 0 and 100');
  }

  const final = aiScore * 0.6 + humanScore * 0.4;
  return Math.round(final * 100) / 100; // Round to 2 decimal places
}

/**
 * Aggregate multiple human judge scores
 * Returns average of all judge scores
 */
export function aggregateHumanScores(scores: HumanScore[]): number {
  if (scores.length === 0) {
    return 0;
  }

  const sum = scores.reduce((acc, score) => acc + score.score, 0);
  return Math.round((sum / scores.length) * 100) / 100;
}

/**
 * Calculate team score from individual student submissions
 * Options: average or best score
 */
export function calculateTeamScore(
  studentScores: number[],
  method: 'average' | 'best' = 'average'
): number {
  if (studentScores.length === 0) {
    return 0;
  }

  if (method === 'best') {
    return Math.max(...studentScores);
  }

  // Average method
  const sum = studentScores.reduce((acc, score) => acc + score, 0);
  return Math.round((sum / studentScores.length) * 100) / 100;
}

/**
 * Determine match winner based on final scores
 */
export function determineWinner(teamAScore: number, teamBScore: number): 'A' | 'B' | 'tie' {
  if (teamAScore > teamBScore) {
    return 'A';
  }
  if (teamBScore > teamAScore) {
    return 'B';
  }
  return 'tie';
}

/**
 * Tie-breaker logic: originality > submission time
 */
export function breakTie(
  teamA: { originality: number; submittedAt: Date },
  teamB: { originality: number; submittedAt: Date }
): 'A' | 'B' {
  // Higher originality wins
  if (teamA.originality > teamB.originality) {
    return 'A';
  }
  if (teamB.originality > teamA.originality) {
    return 'B';
  }

  // Earlier submission wins
  if (teamA.submittedAt < teamB.submittedAt) {
    return 'A';
  }
  return 'B';
}

export default {
  calculateAIScore,
  calculateFinalScore,
  aggregateHumanScores,
  calculateTeamScore,
  determineWinner,
  breakTie,
};

