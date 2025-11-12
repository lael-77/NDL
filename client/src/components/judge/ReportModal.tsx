import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  match: any;
  teamScores: any;
  playerScores: any;
  autoScores: any;
}

export const ReportModal = ({
  open,
  onClose,
  onConfirm,
  match,
  teamScores,
  playerScores,
  autoScores,
}: ReportModalProps) => {
  if (!match) return null;

  const calculateTeamTotal = (teamId: string) => {
    const scores = teamScores[teamId];
    if (!scores) return 0;

    const weights = {
      codeFunctionality: 0.25,
      innovation: 0.25,
      presentation: 0.15,
      problemRelevance: 0.20,
      feasibility: 0.10,
      collaboration: 0.05,
    };

    return Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + (scores[key] || 0) * weight * 10;
    }, 0);
  };

  const homeTeamTotal = calculateTeamTotal(match.homeTeamId);
  const awayTeamTotal = calculateTeamTotal(match.awayTeamId);
  const winner = homeTeamTotal > awayTeamTotal ? match.homeTeam : awayTeamTotal > homeTeamTotal ? match.awayTeam : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-[#1A1A1A] flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Match Report - Final Review
          </DialogTitle>
          <DialogDescription className="text-[#4A4A4A]">
            Review all scores and details before final submission
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Match Info */}
            <Card className="bg-[#F5F7FA] border-[#E0E0E0]">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-[#4A4A4A] mb-1">Match</div>
                    <div className="font-semibold text-[#1A1A1A]">
                      {match.homeTeam?.name} vs {match.awayTeam?.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#4A4A4A] mb-1">Date & Venue</div>
                    <div className="text-sm text-[#1A1A1A]">
                      {format(new Date(match.scheduledAt), "MMM dd, yyyy HH:mm")}
                    </div>
                    <div className="text-sm text-[#4A4A4A]">{match.arena?.name || "TBD"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Scores Summary */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-[#E0E0E0]">
                <CardContent className="p-4">
                  <div className="font-semibold text-[#1A1A1A] mb-2">{match.homeTeam?.name}</div>
                  <div className="text-3xl font-bold text-[#0077CC] mb-2">
                    {homeTeamTotal.toFixed(1)}/100
                  </div>
                  {autoScores[match.homeTeamId] && (
                    <div className="text-xs text-[#4A4A4A]">
                      Auto: {autoScores[match.homeTeamId].functionality}/100
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="border-[#E0E0E0]">
                <CardContent className="p-4">
                  <div className="font-semibold text-[#1A1A1A] mb-2">{match.awayTeam?.name}</div>
                  <div className="text-3xl font-bold text-[#0077CC] mb-2">
                    {awayTeamTotal.toFixed(1)}/100
                  </div>
                  {autoScores[match.awayTeamId] && (
                    <div className="text-xs text-[#4A4A4A]">
                      Auto: {autoScores[match.awayTeamId].functionality}/100
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Winner */}
            {winner && (
              <Card className="bg-[#22C55E]/10 border-[#22C55E]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-[#22C55E]" />
                    <div>
                      <div className="font-semibold text-[#1A1A1A]">Winner</div>
                      <div className="text-lg text-[#22C55E]">{winner.name}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Scores */}
            <div>
              <div className="font-semibold text-[#1A1A1A] mb-3">Detailed Scores</div>
              <div className="space-y-3">
                {Object.entries(teamScores).map(([teamId, scores]: [string, any]) => {
                  const team = teamId === match.homeTeamId ? match.homeTeam : match.awayTeam;
                  return (
                    <Card key={teamId} className="border-[#E0E0E0]">
                      <CardContent className="p-4">
                        <div className="font-semibold text-[#1A1A1A] mb-3">{team?.name}</div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>Functionality: {scores.codeFunctionality}/10</div>
                          <div>Innovation: {scores.innovation}/10</div>
                          <div>Presentation: {scores.presentation}/10</div>
                          <div>Problem Relevance: {scores.problemRelevance}/10</div>
                          <div>Feasibility: {scores.feasibility}/10</div>
                          <div>Collaboration: {scores.collaboration}/10</div>
                        </div>
                        {scores.comments && (
                          <div className="mt-3 pt-3 border-t border-[#E0E0E0]">
                            <div className="text-xs text-[#4A4A4A] mb-1">Comments:</div>
                            <div className="text-sm text-[#1A1A1A]">{scores.comments}</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Warnings */}
            {Object.values(teamScores).some((s: any) => !s.isLocked) && (
              <Card className="bg-[#FACC15]/10 border-[#FACC15]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-[#FACC15]" />
                    <div className="text-sm text-[#1A1A1A]">
                      Some scores are not locked. Please lock all scores before submission.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#E0E0E0]"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-[#0077CC] hover:bg-[#005FA3]"
            disabled={Object.values(teamScores).some((s: any) => !s.isLocked)}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Submit Final Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

