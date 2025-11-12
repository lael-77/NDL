import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Users, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EndMatchConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (comments: string) => void;
  match: any;
  judges: Array<{ id: string; fullName: string; isMain: boolean }>;
  currentJudgeId: string;
  isMainJudge: boolean;
}

export const EndMatchConfirmation = ({
  open,
  onClose,
  onConfirm,
  match,
  judges,
  currentJudgeId,
  isMainJudge,
}: EndMatchConfirmationProps) => {
  const [comments, setComments] = useState("");
  const [confirmedJudges, setConfirmedJudges] = useState<string[]>([]);

  // Check if both main and co-judge have confirmed
  const mainJudge = judges.find((j) => j.isMain);
  const coJudges = judges.filter((j) => !j.isMain);
  const allJudgesConfirmed = judges.length > 0 && confirmedJudges.length >= Math.min(2, judges.length);

  const handleConfirm = () => {
    if (!comments.trim()) {
      return; // Comments are mandatory
    }
    onConfirm(comments);
    setComments("");
    setConfirmedJudges([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#1A1A1A] flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#FACC15]" />
            End Match Confirmation
          </DialogTitle>
          <DialogDescription className="text-[#4A4A4A]">
            Ending the match requires confirmation from both main and co-judge (if assigned)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Judge Status */}
          <div className="p-4 bg-[#F5F7FA] rounded-lg border border-[#E0E0E0]">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-[#0077CC]" />
              <span className="font-semibold text-[#1A1A1A]">Judge Confirmations</span>
            </div>
            <div className="space-y-2">
              {mainJudge && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#1A1A1A]">
                      {mainJudge.fullName} {mainJudge.id === currentJudgeId && "(You)"}
                    </span>
                    <Badge variant="outline" className="border-[#0077CC] text-[#0077CC]">
                      Main Judge
                    </Badge>
                  </div>
                  {confirmedJudges.includes(mainJudge.id) ? (
                    <CheckCircle className="h-5 w-5 text-[#22C55E]" />
                  ) : (
                    <span className="text-xs text-[#4A4A4A]">Pending</span>
                  )}
                </div>
              )}
              {coJudges.map((judge) => (
                <div key={judge.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#1A1A1A]">
                      {judge.fullName} {judge.id === currentJudgeId && "(You)"}
                    </span>
                    <Badge variant="outline">Co-Judge</Badge>
                  </div>
                  {confirmedJudges.includes(judge.id) ? (
                    <CheckCircle className="h-5 w-5 text-[#22C55E]" />
                  ) : (
                    <span className="text-xs text-[#4A4A4A]">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Comments */}
          <div>
            <Label className="text-[#1A1A1A]">
              Final Comments <span className="text-[#E11D48]">*</span>
            </Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide mandatory final comments about the match..."
              className="mt-2 min-h-[100px]"
              rows={4}
            />
            <p className="text-xs text-[#4A4A4A] mt-1">
              Final comments are required before ending the match
            </p>
          </div>

          {/* Warning */}
          {!allJudgesConfirmed && (
            <div className="p-3 bg-[#FACC15]/10 border border-[#FACC15] rounded text-sm text-[#1A1A1A]">
              ⚠️ Waiting for confirmation from all assigned judges before ending the match.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-[#E0E0E0]">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-[#E11D48] hover:bg-[#BE123C]"
            disabled={!comments.trim() || !allJudgesConfirmed}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            End Match
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

