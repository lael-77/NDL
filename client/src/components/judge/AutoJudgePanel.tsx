import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AutoJudgePanelProps {
  autoScore?: {
    functionality: number;
    innovation: number;
    plagiarismFlag: boolean;
    aiGeneratedFlag: boolean;
    suggestions?: string;
  };
  teamName: string;
  onEvaluate?: () => void;
}

export const AutoJudgePanel = ({ autoScore, teamName, onEvaluate }: AutoJudgePanelProps) => {
  return (
    <Card className="bg-white border-[#E0E0E0]">
      <CardHeader>
        <CardTitle className="text-[#1A1A1A]">Auto-Judge Results</CardTitle>
        <CardDescription className="text-[#4A4A4A]">AI Evaluation for {teamName}</CardDescription>
      </CardHeader>
      <CardContent>
        {autoScore ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#F5F7FA] rounded-lg">
                <div className="text-sm text-[#4A4A4A] mb-1">Functionality</div>
                <div className="text-2xl font-bold text-[#0077CC]">{autoScore.functionality}/100</div>
                <div className="w-full h-2 bg-[#E0E0E0] rounded-full mt-2">
                  <div
                    className="h-full bg-[#0077CC] rounded-full transition-all"
                    style={{ width: `${autoScore.functionality}%` }}
                  />
                </div>
              </div>
              <div className="p-4 bg-[#F5F7FA] rounded-lg">
                <div className="text-sm text-[#4A4A4A] mb-1">Innovation</div>
                <div className="text-2xl font-bold text-[#0077CC]">{autoScore.innovation}/100</div>
                <div className="w-full h-2 bg-[#E0E0E0] rounded-full mt-2">
                  <div
                    className="h-full bg-[#0077CC] rounded-full transition-all"
                    style={{ width: `${autoScore.innovation}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {autoScore.plagiarismFlag && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Plagiarism Detected
                </Badge>
              )}
              {autoScore.aiGeneratedFlag && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  AI-Generated Code
                </Badge>
              )}
              {!autoScore.plagiarismFlag && !autoScore.aiGeneratedFlag && (
                <Badge variant="outline" className="flex items-center gap-1 border-[#22C55E] text-[#22C55E]">
                  <CheckCircle className="h-3 w-3" />
                  Original Code
                </Badge>
              )}
            </div>

            {autoScore.suggestions && (
              <div className="p-3 bg-[#F5F7FA] rounded-lg">
                <div className="text-sm font-semibold text-[#1A1A1A] mb-1">AI Suggestions</div>
                <div className="text-sm text-[#4A4A4A]">{autoScore.suggestions}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[#4A4A4A] mb-4">No auto-judge evaluation yet</p>
            {onEvaluate && (
              <Button onClick={onEvaluate} className="bg-[#0077CC] hover:bg-[#005FA3]">
                Run Auto-Evaluation
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

