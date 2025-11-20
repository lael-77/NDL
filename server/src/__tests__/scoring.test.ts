/**
 * Unit Tests for Scoring Algorithm
 */

import { describe, it, expect } from '@jest/globals';
import {
  calculateAIScore,
  calculateFinalScore,
  aggregateHumanScores,
  calculateTeamScore,
} from '../services/scoringService';

describe('Scoring Service', () => {
  describe('calculateAIScore', () => {
    it('should calculate AI score correctly', () => {
      const components = {
        correctness: 35,
        efficiency: 18,
        originality: 15,
        docsAndTests: 17,
      };
      const score = calculateAIScore(components);
      expect(score).toBe(85);
    });

    it('should handle maximum scores', () => {
      const components = {
        correctness: 40,
        efficiency: 20,
        originality: 20,
        docsAndTests: 20,
      };
      const score = calculateAIScore(components);
      expect(score).toBe(100);
    });

    it('should throw error for invalid ranges', () => {
      expect(() => {
        calculateAIScore({
          correctness: 50, // Invalid: > 40
          efficiency: 18,
          originality: 15,
          docsAndTests: 17,
        });
      }).toThrow('Correctness must be between 0 and 40');
    });
  });

  describe('calculateFinalScore', () => {
    it('should calculate final score with 60/40 split', () => {
      const aiScore = 80;
      const humanScore = 70;
      const final = calculateFinalScore(aiScore, humanScore);
      // 80 * 0.6 + 70 * 0.4 = 48 + 28 = 76
      expect(final).toBe(76);
    });

    it('should round to 2 decimal places', () => {
      const aiScore = 83.33;
      const humanScore = 66.67;
      const final = calculateFinalScore(aiScore, humanScore);
      expect(final).toBe(76.67);
    });
  });

  describe('aggregateHumanScores', () => {
    it('should average multiple judge scores', () => {
      const scores = [
        { score: 80, judgeId: '1' },
        { score: 70, judgeId: '2' },
        { score: 90, judgeId: '3' },
      ];
      const avg = aggregateHumanScores(scores);
      expect(avg).toBe(80);
    });

    it('should return 0 for empty array', () => {
      const avg = aggregateHumanScores([]);
      expect(avg).toBe(0);
    });
  });

  describe('calculateTeamScore', () => {
    it('should average student scores by default', () => {
      const studentScores = [80, 70, 90, 85];
      const teamScore = calculateTeamScore(studentScores, 'average');
      expect(teamScore).toBe(81.25);
    });

    it('should return best score when method is best', () => {
      const studentScores = [80, 70, 90, 85];
      const teamScore = calculateTeamScore(studentScores, 'best');
      expect(teamScore).toBe(90);
    });
  });
});

