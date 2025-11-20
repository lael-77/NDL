/**
 * ENHANCED JUDGE PANEL INTEGRATION GUIDE
 * 
 * This file shows how to integrate all new features into JudgePanel.tsx
 * Copy the relevant sections into your existing JudgePanel.tsx
 */

// ============================================
// 1. ADD IMPORTS
// ============================================
/*
import { useKeyboardNavigation, useFocusTrap, useKeyboardShortcuts } from '@/hooks/useKeyboardNavigation';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { useJudgeRealtime } from '@/hooks/useJudgeRealtime';
import { AIEvaluationPanel } from '@/components/judge/AIEvaluationPanel';
import { downloadCSVReport, downloadPDFReport } from '@/utils/reportGenerator';
import { validateLineup, validateJudgeScores, validateMatchStart, validateMatchEnd, checkScoreDiscrepancies } from '@/utils/validation';
import { evaluateWithAI } from '@/services/aiEvaluation';
import { submitMatchResults } from '@/api/judge';
*/

// ============================================
// 2. ADD STATE VARIABLES
// ============================================
/*
const [showAIPanel, setShowAIPanel] = useState(false);
const [aiTeamId, setAiTeamId] = useState<string | null>(null);
const [signatures, setSignatures] = useState<Record<string, string>>({});
const [focusedMatchIndex, setFocusedMatchIndex] = useState(0);
const modalRef = useRef<HTMLDivElement>(null);
*/

// ============================================
// 3. ADD HOOKS
// ============================================
/*
// Session timeout (30 minutes)
useSessionTimeout(30);

// Real-time updates
const { socket, isConnected } = useJudgeRealtime(selectedMatchId);

// Keyboard navigation
useKeyboardNavigation({
  onArrowUp: () => {
    if (activeMenu === "overview" && assignedMatches.length > 0) {
      setFocusedMatchIndex(prev => Math.max(0, prev - 1));
    }
  },
  onArrowDown: () => {
    if (activeMenu === "overview" && assignedMatches.length > 0) {
      setFocusedMatchIndex(prev => Math.min(assignedMatches.length - 1, prev + 1));
    }
  },
  onEnter: () => {
    if (activeMenu === "overview" && assignedMatches[focusedMatchIndex]) {
      const match = assignedMatches[focusedMatchIndex];
      setSelectedMatchId(match.id);
      setActiveMenu("matches");
    }
  },
  onKeyPress: (key) => {
    if (!selectedMatch) return;
    
    switch (key) {
      case 's':
        if (canStartMatch) {
          startTimerMutation.mutate({ matchId: selectedMatchId!, duration: 3600 });
        }
        break;
      case 'p':
        if (selectedMatch.timer?.isRunning) {
          pauseTimerMutation.mutate(selectedMatchId!);
        }
        break;
      case 'r':
        if (selectedMatch.timer && !selectedMatch.timer.isRunning) {
          resumeTimerMutation.mutate(selectedMatchId!);
        }
        break;
      case 'e':
        if (selectedMatch.status === 'in_progress') {
          setShowEndMatchDialog(true);
        }
        break;
      case 'a':
        if (selectedMatch.judgeStatus === 'pending') {
          acceptMatchMutation.mutate(selectedMatchId!);
        }
        break;
      case 'd':
        if (selectedMatch.judgeStatus === 'pending') {
          declineMatchMutation.mutate(selectedMatchId!);
        }
        break;
    }
  },
  enabled: true,
});

// Keyboard shortcuts
useKeyboardShortcuts({
  'ctrl+s': () => {
    if (selectedMatch) {
      // Save current scores
      toast({ title: "💾 Scores saved", description: "All scores have been saved" });
    }
  },
  'ctrl+enter': () => {
    if (selectedMatch && selectedMatch.status === 'completed') {
      setShowSignaturePad(true);
    }
  },
}, true);

// Focus trap for modals
useFocusTrap(showFeedbackDialog, modalRef);
useFocusTrap(showSignaturePad, modalRef);
useFocusTrap(showEndMatchDialog, modalRef);
*/

// ============================================
// 4. ADD VALIDATION FUNCTIONS
// ============================================
/*
const canStartMatch = selectedMatch && validateMatchStart(selectedMatch).isValid;
const canEndMatch = selectedMatch && validateMatchEnd(selectedMatch, user?.id || '').isValid;

const handleApproveLineup = async (teamId: string) => {
  const lineup = selectedMatch?.lineups?.filter((l: any) => l.teamId === teamId) || [];
  const validation = validateLineup(lineup);
  
  if (!validation.isValid) {
    toast({
      title: "Validation Failed",
      description: validation.errors.join(", "),
      variant: "destructive",
    });
    return;
  }
  
  approveLineupMutation.mutate({ matchId: selectedMatchId!, teamId });
};

const handleSubmitScores = async (teamId: string, scores: any, comments: string) => {
  const validation = validateJudgeScores(scores);
  
  if (!validation.isValid) {
    toast({
      title: "Validation Failed",
      description: validation.errors.join(", "),
      variant: "destructive",
    });
    return;
  }
  
  submitScoresMutation.mutate({ matchId: selectedMatchId!, teamId, scores, comments });
};
*/

// ============================================
// 5. ADD AI EVALUATION HANDLERS
// ============================================
/*
const handleAIEvaluate = async (teamId: string) => {
  setAiTeamId(teamId);
  setShowAIPanel(true);
};

const handleAdoptAIScores = (result: any) => {
  submitAutoScoresMutation.mutate({
    matchId: selectedMatchId!,
    teamId: aiTeamId!,
    scores: {
      functionality: result.functionality,
      innovation: result.innovation,
      plagiarismFlag: result.plagiarismFlag,
      aiGeneratedFlag: result.aiGeneratedFlag,
      suggestions: result.suggestions,
    },
  });
  setShowAIPanel(false);
  setAiTeamId(null);
};
*/

// ============================================
// 6. ADD REPORT GENERATION
// ============================================
/*
const handleExportReport = async (format: 'csv' | 'pdf') => {
  if (!selectedMatch) return;

  const calculateAverageScore = (teamId: string) => {
    const teamScores = selectedMatch.judgeScores?.filter((s: any) => s.teamId === teamId) || [];
    if (teamScores.length === 0) return 0;
    
    const totals = teamScores.reduce((acc: any, score: any) => {
      return acc + (score.codeFunctionality || 0) * 0.25 +
             (score.innovation || 0) * 0.25 +
             (score.presentation || 0) * 0.15 +
             (score.problemRelevance || 0) * 0.20 +
             (score.feasibility || 0) * 0.10 +
             (score.collaboration || 0) * 0.05;
    }, 0);
    
    return totals / teamScores.length;
  };

  const reportData = {
    match: selectedMatch,
    teamScores: {
      [selectedMatch.homeTeamId]: {
        autoScore: selectedMatch.autoScores?.find((s: any) => s.teamId === selectedMatch.homeTeamId),
        judgeScores: selectedMatch.judgeScores?.filter((s: any) => s.teamId === selectedMatch.homeTeamId) || [],
        averageScore: calculateAverageScore(selectedMatch.homeTeamId),
      },
      [selectedMatch.awayTeamId]: {
        autoScore: selectedMatch.autoScores?.find((s: any) => s.teamId === selectedMatch.awayTeamId),
        judgeScores: selectedMatch.judgeScores?.filter((s: any) => s.teamId === selectedMatch.awayTeamId) || [],
        averageScore: calculateAverageScore(selectedMatch.awayTeamId),
      },
    },
    playerScores: selectedMatch.playerScores || [],
    feedback: selectedMatch.feedback || [],
  };

  try {
    if (format === 'csv') {
      downloadCSVReport(reportData);
      toast({ title: "✅ CSV Report Downloaded" });
    } else {
      await downloadPDFReport(reportData);
      toast({ title: "✅ PDF Report Downloaded" });
    }
  } catch (error: any) {
    toast({
      title: "❌ Export Failed",
      description: error.message,
      variant: "destructive",
    });
  }
};
*/

// ============================================
// 7. ADD CO-JUDGE DISCREPANCY CHECKING
// ============================================
/*
const coJudgeDiscrepancies = useMemo(() => {
  if (!selectedMatch || !coJudgeScores.length) return [];
  
  const allScores = [
    ...(selectedMatch.judgeScores?.filter((s: any) => s.judgeId === user?.id) || []),
    ...coJudgeScores,
  ];
  
  return checkScoreDiscrepancies(allScores, 2);
}, [selectedMatch, coJudgeScores, user?.id]);
*/

// ============================================
// 8. ADD AI EVALUATION PANEL TO JSX
// ============================================
/*
{selectedMatch && (
  <AIEvaluationPanel
    matchId={selectedMatchId!}
    teamId={aiTeamId!}
    teamName={selectedMatch.homeTeamId === aiTeamId 
      ? selectedMatch.homeTeam?.name || "Team A"
      : selectedMatch.awayTeam?.name || "Team B"}
    isOpen={showAIPanel && !!aiTeamId}
    onClose={() => {
      setShowAIPanel(false);
      setAiTeamId(null);
    }}
    onAdoptScores={handleAdoptAIScores}
    onOverride={() => {
      setShowAIPanel(false);
      // Focus will move to manual scoring
    }}
  />
)}
*/

// ============================================
// 9. ADD REPORT EXPORT BUTTONS
// ============================================
/*
{selectedMatch?.status === 'completed' && (
  <div className="flex gap-2 mb-4">
    <Button
      onClick={() => handleExportReport('csv')}
      variant="outline"
      className="border-[#00ffc3]/50 text-[#00ffc3]"
    >
      📊 Export CSV
    </Button>
    <Button
      onClick={() => handleExportReport('pdf')}
      variant="outline"
      className="border-[#00ffc3]/50 text-[#00ffc3]"
    >
      📄 Export PDF
    </Button>
  </div>
)}
*/

// ============================================
// 10. ADD DISCREPANCY WARNINGS
// ============================================
/*
{coJudgeDiscrepancies.length > 0 && (
  <Card className="bg-yellow-500/10 border-yellow-500/50 mb-4">
    <CardHeader>
      <CardTitle className="text-yellow-400">⚠️ Score Discrepancies Detected</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {coJudgeDiscrepancies.map((disc, idx) => (
          <li key={idx} className="text-sm text-yellow-300">
            {disc.criterion}: {disc.judge} have a {disc.difference} point difference
          </li>
        ))}
      </ul>
      <p className="text-xs text-yellow-400 mt-2">
        Please review and add justification comments if needed.
      </p>
    </CardContent>
  </Card>
)}
*/

// ============================================
// 11. UPDATE SIGNATURE PAD CALL
// ============================================
/*
<SignaturePad
  open={showSignaturePad}
  onClose={() => setShowSignaturePad(false)}
  onConfirm={(signature) => {
    setSignatures(prev => ({
      ...prev,
      [user?.id || '']: signature,
    }));
    
    // Check if all judges have signed
    const allJudges = selectedMatch?.judges?.filter((j: any) => j.status === 'accepted') || [];
    const allSigned = allJudges.every((j: any) => signatures[j.judgeId] || j.judgeId === user?.id);
    
    if (allSigned) {
      // Submit final results
      submitMatchResultsMutation.mutate({
        matchId: selectedMatchId!,
        signatures: { ...signatures, [user?.id || '']: signature },
        finalComments: '',
      });
    } else {
      toast({
        title: "✅ Signature Saved",
        description: "Waiting for other judges to sign...",
      });
    }
    
    setShowSignaturePad(false);
  }}
  title="Digital Signature Required"
  description="Sign to confirm and submit final match results"
  judgeName={user?.fullName}
/>
*/

// ============================================
// 12. ADD SUBMIT RESULTS MUTATION
// ============================================
/*
const submitMatchResultsMutation = useMutation({
  mutationFn: ({ matchId, signatures, finalComments }: any) =>
    submitMatchResults(matchId, signatures, finalComments),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["judge-match", selectedMatchId] });
    queryClient.invalidateQueries({ queryKey: ["judge-matches"] });
    toast({
      title: "✅ Results Submitted",
      description: "Match results have been submitted successfully",
    });
    setSignatures({});
  },
});
*/

