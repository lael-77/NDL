import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, X, Loader2, Check, X as XIcon } from "lucide-react";
import { evaluateWithAI, submitAIEvaluation, AIEvaluationResult } from "@/services/aiEvaluation";
import { useToast } from "@/hooks/use-toast";

interface AIEvaluationPanelProps {
  matchId: string;
  teamId: string;
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
  onAdoptScores: (scores: AIEvaluationResult) => void;
  onOverride: () => void;
}

export const AIEvaluationPanel = ({
  matchId,
  teamId,
  teamName,
  isOpen,
  onClose,
  onAdoptScores,
  onOverride,
}: AIEvaluationPanelProps) => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<AIEvaluationResult | null>(null);
  const [adopted, setAdopted] = useState(false);
  const { toast } = useToast();

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const evaluationResult = await evaluateWithAI({
        matchId,
        teamId,
      });
      setResult(evaluationResult);
      toast({
        title: "✅ AI Evaluation Complete",
        description: "Review the results below",
      });
    } catch (error: any) {
      toast({
        title: "❌ Evaluation Failed",
        description: error.message || "Failed to evaluate with AI",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAdopt = async () => {
    if (!result) return;

    try {
      await submitAIEvaluation(matchId, teamId, result);
      setAdopted(true);
      onAdoptScores(result);
      toast({
        title: "✅ Scores Adopted",
        description: "AI scores have been applied to the match",
      });
    } catch (error: any) {
      toast({
        title: "❌ Failed to Adopt Scores",
        description: error.message || "Failed to submit scores",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gradient-to-b from-[#0b0f19] via-[#1a1f2e] to-[#0b0f19] border-l-2 border-[#00ffc3] shadow-2xl z-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#00ffc3] mb-1">AI Evaluation</h2>
            <p className="text-sm text-gray-400">{teamName}</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-[#00ffc3]"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Evaluate Button */}
        {!result && (
          <Card className="bg-[#1a1f2e] border-[#00ffc3]/20 mb-6">
            <CardContent className="p-6">
              <Button
                onClick={handleEvaluate}
                disabled={isEvaluating}
                className="w-full bg-gradient-to-r from-[#00ffc3] to-[#00d4aa] hover:from-[#00d4aa] hover:to-[#00ffc3] text-[#0b0f19] font-bold"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  "🤖 Run AI Evaluation"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Scores */}
            <Card className="bg-[#1a1f2e] border-[#00ffc3]/20">
              <CardHeader>
                <CardTitle className="text-[#00ffc3]">Evaluation Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Functionality</span>
                    <span className="text-[#00ffc3] font-bold">{result.functionality}/100</span>
                  </div>
                  <div className="w-full h-3 bg-[#0b0f19] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00ffc3] to-[#00d4aa] transition-all duration-500"
                      style={{ width: `${result.functionality}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Innovation</span>
                    <span className="text-[#00ffc3] font-bold">{result.innovation}/100</span>
                  </div>
                  <div className="w-full h-3 bg-[#0b0f19] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#ff0077] to-[#ff4da6] transition-all duration-500"
                      style={{ width: `${result.innovation}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flags */}
            <Card className="bg-[#1a1f2e] border-[#00ffc3]/20">
              <CardHeader>
                <CardTitle className="text-[#00ffc3]">Quality Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.plagiarismFlag && (
                  <Badge className="w-full justify-center bg-red-500/20 text-red-400 border-red-500/50 py-2">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Plagiarism Detected
                  </Badge>
                )}
                {result.aiGeneratedFlag && (
                  <Badge className="w-full justify-center bg-orange-500/20 text-orange-400 border-orange-500/50 py-2">
                    <XCircle className="h-4 w-4 mr-2" />
                    AI-Generated Code
                  </Badge>
                )}
                {!result.plagiarismFlag && !result.aiGeneratedFlag && (
                  <Badge className="w-full justify-center bg-green-500/20 text-green-400 border-green-500/50 py-2">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Original Code Verified
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Evidence */}
            {(result.evidence.plagiarism.length > 0 || result.evidence.aiGenerated.length > 0) && (
              <Card className="bg-[#1a1f2e] border-red-500/50">
                <CardHeader>
                  <CardTitle className="text-red-400">⚠️ Review Required</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.evidence.plagiarism.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-300 bg-red-500/10 p-2 rounded">
                      {item}
                    </div>
                  ))}
                  {result.evidence.aiGenerated.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-300 bg-orange-500/10 p-2 rounded">
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Strengths & Weaknesses */}
            <Card className="bg-[#1a1f2e] border-[#00ffc3]/20">
              <CardHeader>
                <CardTitle className="text-[#00ffc3]">Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.evidence.strengths.length > 0 && (
                  <div>
                    <h4 className="text-green-400 font-semibold mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {result.evidence.strengths.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.evidence.weaknesses.length > 0 && (
                  <div>
                    <h4 className="text-orange-400 font-semibold mb-2">Areas for Improvement</h4>
                    <ul className="space-y-1">
                      {result.evidence.weaknesses.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start">
                          <AlertTriangle className="h-4 w-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Suggestions */}
            {result.suggestions && (
              <Card className="bg-[#1a1f2e] border-[#00ffc3]/20">
                <CardHeader>
                  <CardTitle className="text-[#00ffc3]">AI Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300">{result.suggestions}</p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            {!adopted && (
              <div className="space-y-3">
                <Button
                  onClick={handleAdopt}
                  className="w-full bg-gradient-to-r from-[#00ffc3] to-[#00d4aa] hover:from-[#00d4aa] hover:to-[#00ffc3] text-[#0b0f19] font-bold"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Adopt AI Scores
                </Button>
                <Button
                  onClick={onOverride}
                  variant="outline"
                  className="w-full border-[#00ffc3]/50 text-[#00ffc3] hover:bg-[#00ffc3]/10"
                >
                  <XIcon className="h-4 w-4 mr-2" />
                  Override & Enter Manually
                </Button>
              </div>
            )}

            {adopted && (
              <Badge className="w-full justify-center bg-green-500/20 text-green-400 border-green-500/50 py-3">
                <CheckCircle className="h-4 w-4 mr-2" />
                Scores Adopted Successfully
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

