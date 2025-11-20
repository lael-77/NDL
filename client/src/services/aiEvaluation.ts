import axios from '../api/axios';

export interface AIEvaluationRequest {
  matchId: string;
  teamId: string;
  submissionUrl?: string;
  codeArtifact?: string;
  description?: string;
}

export interface AIEvaluationResult {
  functionality: number; // 0-100
  innovation: number; // 0-100
  plagiarismFlag: boolean;
  aiGeneratedFlag: boolean;
  suggestions: string;
  evidence: {
    plagiarism: string[];
    aiGenerated: string[];
    strengths: string[];
    weaknesses: string[];
  };
  detailedReport: string;
  evaluatedAt: string;
}

/**
 * Mock AI Evaluation Service
 * In production, this would call an actual AI service (OpenAI, Anthropic, etc.)
 */
export const evaluateWithAI = async (request: AIEvaluationRequest): Promise<AIEvaluationResult> => {
  try {
    // For now, simulate AI evaluation with mock data
    // In production, replace this with actual AI API call
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock evaluation logic
    const functionality = Math.floor(Math.random() * 30) + 70; // 70-100
    const innovation = Math.floor(Math.random() * 25) + 75; // 75-100
    const plagiarismFlag = Math.random() > 0.85; // 15% chance
    const aiGeneratedFlag = Math.random() > 0.90; // 10% chance

    const result: AIEvaluationResult = {
      functionality,
      innovation,
      plagiarismFlag,
      aiGeneratedFlag,
      suggestions: plagiarismFlag
        ? "Potential plagiarism detected. Review code similarity with known sources."
        : aiGeneratedFlag
        ? "Code appears to be AI-generated. Verify original work and understanding."
        : "Code structure is solid. Consider adding error handling and optimization.",
      evidence: {
        plagiarism: plagiarismFlag
          ? [
              "High similarity (87%) with Stack Overflow solution",
              "Identical function names and structure found in GitHub repository",
            ]
          : [],
        aiGenerated: aiGeneratedFlag
          ? [
              "Pattern matching suggests AI code generation (92% confidence)",
              "Unusual code formatting consistent with AI tools",
            ]
          : [],
        strengths: [
          "Clean code structure",
          "Good variable naming",
          "Proper use of modern JavaScript features",
        ],
        weaknesses: [
          "Missing error handling",
          "Could benefit from code comments",
          "Performance optimization opportunities",
        ],
      },
      detailedReport: `
# AI Evaluation Report

## Functionality Score: ${functionality}/100
The code demonstrates ${functionality >= 85 ? 'excellent' : functionality >= 75 ? 'good' : 'adequate'} functionality with proper implementation of core features.

## Innovation Score: ${innovation}/100
${innovation >= 85 ? 'Highly innovative' : innovation >= 75 ? 'Moderately innovative' : 'Standard'} approach with ${innovation >= 85 ? 'creative' : 'practical'} solutions.

## Code Quality Analysis
${plagiarismFlag ? '⚠️ PLAGIARISM DETECTED: Review required before approval.' : '✅ Original code verified.'}
${aiGeneratedFlag ? '⚠️ AI-GENERATED CODE DETECTED: Verify student understanding.' : '✅ Human-written code confirmed.'}

## Recommendations
${plagiarismFlag ? '1. Review code similarity with known sources\n2. Request explanation of implementation approach\n' : ''}
${aiGeneratedFlag ? '1. Verify student understanding through Q&A\n2. Request code walkthrough\n' : ''}
3. Add comprehensive error handling
4. Include code documentation
5. Optimize performance bottlenecks
      `.trim(),
      evaluatedAt: new Date().toISOString(),
    };

    return result;
  } catch (error) {
    console.error('AI Evaluation error:', error);
    throw new Error('Failed to evaluate with AI. Please try again.');
  }
};

/**
 * Submit AI evaluation results to backend
 */
export const submitAIEvaluation = async (
  matchId: string,
  teamId: string,
  result: AIEvaluationResult
) => {
  const response = await axios.post(`/judge/matches/${matchId}/auto-scores`, {
    matchId,
    teamId,
    functionality: result.functionality,
    innovation: result.innovation,
    plagiarismFlag: result.plagiarismFlag,
    aiGeneratedFlag: result.aiGeneratedFlag,
    suggestions: result.suggestions,
  });
  return response.data;
};

