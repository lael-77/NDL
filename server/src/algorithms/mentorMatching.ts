/**
 * Mentor Matching Algorithm
 * Greedy algorithm with tag matching, capacity constraints, and load balancing
 */

interface Student {
  id: string;
  tags: string[];
  schoolId: string;
  progressPercentage: number;
}

interface Mentor {
  id: string;
  tags: string[];
  maxMentees: number;
  currentMentees: number;
  schoolId?: string;
}

interface Match {
  mentorId: string;
  studentId: string;
  similarity: number;
}

/**
 * Calculate tag similarity between student and mentor
 * Returns score 0-1 (1 = perfect match)
 */
function calculateTagSimilarity(studentTags: string[], mentorTags: string[]): number {
  if (studentTags.length === 0 || mentorTags.length === 0) {
    return 0;
  }

  const studentSet = new Set(studentTags.map(t => t.toLowerCase()));
  const mentorSet = new Set(mentorTags.map(t => t.toLowerCase()));

  // Jaccard similarity
  const intersection = [...studentSet].filter(t => mentorSet.has(t)).length;
  const union = studentSet.size + mentorSet.size - intersection;

  return union > 0 ? intersection / union : 0;
}

/**
 * Calculate proximity score (same school = higher score)
 */
function calculateProximityScore(studentSchoolId: string, mentorSchoolId?: string): number {
  if (!mentorSchoolId) {
    return 0.5; // Neutral score for mentors without school
  }
  return studentSchoolId === mentorSchoolId ? 1.0 : 0.3;
}

/**
 * Calculate overall match score
 */
function calculateMatchScore(
  student: Student,
  mentor: Mentor,
  tagSimilarity: number,
  proximityScore: number
): number {
  // Weighted combination: 70% tag similarity, 30% proximity
  return tagSimilarity * 0.7 + proximityScore * 0.3;
}

/**
 * Greedy mentor matching algorithm
 * Matches students to mentors based on similarity, capacity, and load balancing
 */
export function matchMentorsToStudents(
  students: Student[],
  mentors: Mentor[]
): Match[] {
  const matches: Match[] = [];
  const mentorLoads = new Map<string, number>();

  // Initialize mentor loads
  mentors.forEach(mentor => {
    mentorLoads.set(mentor.id, mentor.currentMentees || 0);
  });

  // Sort students by priority (lower progress = higher priority)
  const sortedStudents = [...students].sort(
    (a, b) => a.progressPercentage - b.progressPercentage
  );

  for (const student of sortedStudents) {
    const candidateMatches: Array<{ mentor: Mentor; score: number }> = [];

    // Find all eligible mentors
    for (const mentor of mentors) {
      const currentLoad = mentorLoads.get(mentor.id) || 0;

      // Check capacity
      if (currentLoad >= mentor.maxMentees) {
        continue;
      }

      // Calculate match score
      const tagSimilarity = calculateTagSimilarity(student.tags, mentor.tags);
      const proximityScore = calculateProximityScore(student.schoolId, mentor.schoolId);
      const matchScore = calculateMatchScore(student, mentor, tagSimilarity, proximityScore);

      candidateMatches.push({ mentor, score: matchScore });
    }

    // Sort by score (descending) and load balancing
    candidateMatches.sort((a, b) => {
      // Primary: match score
      if (Math.abs(a.score - b.score) > 0.1) {
        return b.score - a.score;
      }
      // Secondary: lower load (load balancing)
      const loadA = mentorLoads.get(a.mentor.id) || 0;
      const loadB = mentorLoads.get(b.mentor.id) || 0;
      return loadA - loadB;
    });

    // Match to best candidate
    if (candidateMatches.length > 0) {
      const bestMatch = candidateMatches[0];
      matches.push({
        mentorId: bestMatch.mentor.id,
        studentId: student.id,
        similarity: bestMatch.score,
      });

      // Update mentor load
      const currentLoad = mentorLoads.get(bestMatch.mentor.id) || 0;
      mentorLoads.set(bestMatch.mentor.id, currentLoad + 1);
    }
  }

  return matches;
}

/**
 * Rebalance mentor assignments
 * Redistributes students to balance mentor loads
 */
export function rebalanceMentorAssignments(
  currentMatches: Match[],
  students: Student[],
  mentors: Mentor[]
): Match[] {
  // Remove all current matches and rematch
  return matchMentorsToStudents(students, mentors);
}

export default {
  matchMentorsToStudents,
  rebalanceMentorAssignments,
  calculateTagSimilarity,
  calculateProximityScore,
};

