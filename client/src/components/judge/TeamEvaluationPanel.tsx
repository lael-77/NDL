import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Save } from "lucide-react";
import { ScoreSlider } from "./ScoreSlider";

interface TeamEvaluationPanelProps {
  teamId: string;
  teamName: string;
  scores?: {
    codeFunctionality: number;
    innovation: number;
    presentation: number;
    problemRelevance: number;
    feasibility: number;
    collaboration: number;
    comments?: string;
    isLocked?: boolean;
  };
  autoScore?: {
    functionality: number;
    innovation: number;
  };
  coJudgeScores?: Array<{
    judge: { fullName: string };
    codeFunctionality: number;
    innovation: number;
    presentation: number;
    problemRelevance: number;
    feasibility: number;
    collaboration: number;
  }>;
  onSubmit: (scores: any, comments: string) => void;
  onLock: () => void;
}

const criteriaWeights = {
  codeFunctionality: 0.25,
  innovation: 0.25,
  presentation: 0.15,
  problemRelevance: 0.20,
  feasibility: 0.10,
  collaboration: 0.05,
};

export const TeamEvaluationPanel = ({
  teamId,
  teamName,
  scores,
  autoScore,
  coJudgeScores,
  onSubmit,
  onLock,
}: TeamEvaluationPanelProps) => {
  const [localScores, setLocalScores] = useState({
    codeFunctionality: scores?.codeFunctionality ?? 0,
    innovation: scores?.innovation ?? 0,
    presentation: scores?.presentation ?? 0,
    problemRelevance: scores?.problemRelevance ?? 0,
    feasibility: scores?.feasibility ?? 0,
    collaboration: scores?.collaboration ?? 0,
  });
  const [comments, setComments] = useState(scores?.comments || "");

  const calculateWeightedScore = () => {
    return Object.entries(criteriaWeights).reduce((sum, [key, weight]) => {
      return sum + (localScores[key as keyof typeof localScores] * weight * 10);
    }, 0);
  };

  // Calculate weighted average dynamically
  const weightedAverage = calculateWeightedScore();
  
  // Conflict detection: compare with co-judge scores
  const detectConflicts = () => {
    if (!coJudgeScores || coJudgeScores.length === 0) return [];
    
    const conflicts: Array<{ criterion: string; difference: number }> = [];
    const threshold = 2; // Consider >2 point difference as conflict
    
    Object.keys(criteriaWeights).forEach((criterion) => {
      const myScore = localScores[criterion as keyof typeof localScores];
      const avgCoJudge = averageCoJudgeScore(criterion);
      
      if (avgCoJudge !== null && Math.abs(myScore - avgCoJudge) > threshold) {
        conflicts.push({
          criterion,
          difference: Math.abs(myScore - avgCoJudge),
        });
      }
    });
    
    return conflicts;
  };

  const conflicts = detectConflicts();

  const handleScoreChange = (criterion: string, value: number[]) => {
    setLocalScores((prev) => ({ ...prev, [criterion]: value[0] }));
  };

  const handleSubmit = () => {
    onSubmit(localScores, comments);
  };

  const averageCoJudgeScore = (criterion: string) => {
    if (!coJudgeScores || coJudgeScores.length === 0) return null;
    const sum = coJudgeScores.reduce((acc, score) => acc + (score[criterion as keyof typeof score[0]] as number), 0);
    return Math.round(sum / coJudgeScores.length);
  };

  return (
    <Card className="bg-white border-[#E0E0E0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#1A1A1A]">Team Evaluation: {teamName}</CardTitle>
            <CardDescription className="text-[#4A4A4A]">Rate the team based on weighted criteria</CardDescription>
          </div>
          {scores?.isLocked && (
            <Badge variant="outline" className="border-[#22C55E] text-[#22C55E]">
              <Lock className="h-3 w-3 mr-1" />
              Locked
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto-Judge Reference */}
        {autoScore && (
          <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#E0E0E0]">
            <div className="text-sm font-semibold text-[#1A1A1A] mb-2">Auto-Judge Reference</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Functionality: {autoScore.functionality}/100</div>
              <div>Innovation: {autoScore.innovation}/100</div>
            </div>
          </div>
        )}

        {/* Weighted Average Display */}
        <div className="p-3 bg-[#0077CC]/10 rounded-lg border border-[#0077CC]/20">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-[#1A1A1A]">Weighted Average Score</div>
            <div className="text-2xl font-bold text-[#0077CC]">
              {weightedAverage.toFixed(1)}/100
            </div>
          </div>
          <div className="text-xs text-[#4A4A4A] mt-1">
            Calculated from: {Object.entries(criteriaWeights).map(([key, weight]) => 
              `${key.replace(/([A-Z])/g, ' $1').trim()} (${(weight * 100).toFixed(0)}%)`
            ).join(', ')}
          </div>
        </div>

        {/* Co-Judge Scores with Conflict Detection */}
        {coJudgeScores && coJudgeScores.length > 0 && (
          <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#E0E0E0]">
            <div className="text-sm font-semibold text-[#1A1A1A] mb-2">Co-Judge Averages</div>
            <div className="grid grid-cols-3 gap-2 text-xs text-[#4A4A4A] mb-2">
              <div>Functionality: {averageCoJudgeScore("codeFunctionality")}/10</div>
              <div>Innovation: {averageCoJudgeScore("innovation")}/10</div>
              <div>Presentation: {averageCoJudgeScore("presentation")}/10</div>
            </div>
            {conflicts.length > 0 && (
              <div className="mt-2 p-2 bg-[#FACC15]/10 border border-[#FACC15] rounded text-xs">
                <div className="font-semibold text-[#1A1A1A] mb-1">⚠️ Score Conflicts Detected</div>
                {conflicts.map((conflict, idx) => (
                  <div key={idx} className="text-[#4A4A4A]">
                    {conflict.criterion}: {conflict.difference.toFixed(1)} point difference
                  </div>
                ))}
                <div className="text-[#4A4A4A] mt-1 italic">
                  System will average scores or flag for review
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scoring Criteria */}
        <div className="space-y-4">
          <ScoreSlider
            label="Code Functionality"
            weight="25%"
            value={localScores.codeFunctionality}
            onChange={(value) => handleScoreChange("codeFunctionality", [value])}
            disabled={scores?.isLocked}
            autoScore={autoScore?.functionality}
            description="Proper working, efficiency, error handling"
          />

          <ScoreSlider
            label="Innovation & Creativity"
            weight="25%"
            value={localScores.innovation}
            onChange={(value) => handleScoreChange("innovation", [value])}
            disabled={scores?.isLocked}
            autoScore={autoScore?.innovation}
            description="Novelty of idea and potential real-world impact"
          />

          <ScoreSlider
            label="Presentation & Communication"
            weight="15%"
            value={localScores.presentation}
            onChange={(value) => handleScoreChange("presentation", [value])}
            disabled={scores?.isLocked}
            description="Clarity, confidence, teamwork in pitch"
          />

          <ScoreSlider
            label="Problem Relevance"
            weight="20%"
            value={localScores.problemRelevance}
            onChange={(value) => handleScoreChange("problemRelevance", [value])}
            disabled={scores?.isLocked}
            description="How deeply it solves a real human problem"
          />

          <ScoreSlider
            label="Feasibility & Scalability"
            weight="10%"
            value={localScores.feasibility}
            onChange={(value) => handleScoreChange("feasibility", [value])}
            disabled={scores?.isLocked}
            description="Can it realistically grow and scale"
          />

          <ScoreSlider
            label="Collaboration"
            weight="5%"
            value={localScores.collaboration}
            onChange={(value) => handleScoreChange("collaboration", [value])}
            disabled={scores?.isLocked}
            description="Team coordination and participation"
          />
        </div>

        {/* Comments */}
        <div>
          <Label className="text-[#1A1A1A]">Comments</Label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add qualitative feedback..."
            className="mt-2"
            rows={4}
            disabled={scores?.isLocked}
          />
        </div>

        {/* Total Score */}
        <div className="p-4 bg-[#0077CC]/10 rounded-lg border border-[#0077CC]/20">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#1A1A1A]">Weighted Total Score</span>
            <span className="text-2xl font-bold text-[#0077CC]">
              {calculateWeightedScore().toFixed(1)}/100
            </span>
          </div>
        </div>

        {/* Actions */}
        {!scores?.isLocked && (
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-[#0077CC] hover:bg-[#005FA3]"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Scores
            </Button>
            <Button
              onClick={onLock}
              variant="outline"
              className="border-[#0077CC] text-[#0077CC] hover:bg-[#0077CC]/10"
            >
              <Lock className="mr-2 h-4 w-4" />
              Lock Scores
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

