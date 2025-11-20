import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import useAuthStore from "@/store/useAuthStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useKeyboardNavigation, useFocusTrap, useKeyboardShortcuts } from "@/hooks/useKeyboardNavigation";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useJudgeRealtime } from "@/hooks/useJudgeRealtime";
import { AIEvaluationPanel } from "@/components/judge/AIEvaluationPanel";
import { downloadCSVReport, downloadPDFReport } from "@/utils/reportGenerator";
import { validateLineup, validateJudgeScores, validateMatchStart, validateMatchEnd, checkScoreDiscrepancies } from "@/utils/validation";
import { submitMatchResults } from "@/api/judge";
import {
  Gavel,
  Clock,
  History,
  BarChart3,
  CheckCircle,
  XCircle,
  Bell,
  Users,
  FileText,
  Settings,
  MessageSquare,
  Play,
  Pause,
  Square,
  TrendingUp,
  Award,
  AlertCircle,
  Eye,
  Calendar,
  MapPin,
  Timer,
  Zap,
  Target,
  Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  getAssignedMatches,
  acceptMatch,
  declineMatch,
  getMatchForJudging,
  startMatchTimer,
  pauseMatchTimer,
  resumeMatchTimer,
  endMatch,
  submitJudgeScores,
  lockJudgeScores,
  submitPlayerScores,
  submitFeedback,
  getCoJudgeScores,
  submitAutoScores,
  submitLineup,
  approveLineup,
} from "@/api/judge";
import { MatchTimer } from "@/components/judge/MatchTimer";
import { AutoJudgePanel } from "@/components/judge/AutoJudgePanel";
import { TeamEvaluationPanel } from "@/components/judge/TeamEvaluationPanel";
import { PlayerEvaluationPanel } from "@/components/judge/PlayerEvaluationPanel";
import { MatchList } from "@/components/judge/MatchList";
import { SystemClock } from "@/components/judge/SystemClock";
import { NotificationPanel } from "@/components/judge/NotificationPanel";
import { LineupApproval } from "@/components/judge/LineupApproval";
import { ReportModal } from "@/components/judge/ReportModal";
import { SignaturePad } from "@/components/judge/SignaturePad";
import { JudgeChat } from "@/components/judge/JudgeChat";
import { EndMatchConfirmation } from "@/components/judge/EndMatchConfirmation";
import { MatchDetailsModal } from "@/components/judge/MatchDetailsModal";
import { useJudgeStore } from "@/store/useJudgeStore";

const JudgePanel = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeMenu, setActiveMenu] = useState("overview");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showEndMatchDialog, setShowEndMatchDialog] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ message: "", isPublic: false, teamId: "", playerId: "" });
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiTeamId, setAiTeamId] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const [focusedMatchIndex, setFocusedMatchIndex] = useState(0);
  const [showMatchDetailsModal, setShowMatchDetailsModal] = useState(false);
  const [selectedMatchForDetails, setSelectedMatchForDetails] = useState<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Zustand store
  const {
    setMatches,
    setActiveMatch,
    setScore,
    getScore,
    setAutoJudgeResult,
    getAutoJudgeResult,
    addNotification,
  } = useJudgeStore();

  // Session timeout (30 minutes)
  useSessionTimeout(30);

  // Real-time updates
  const { socket, isConnected } = useJudgeRealtime(selectedMatchId);

  // Fetch assigned matches
  const { data: assignedMatches = [], isLoading: matchesLoading, error: matchesError } = useQuery<any[]>({
    queryKey: ["judge-matches"],
    queryFn: async () => {
      const data = await getAssignedMatches();
      return data;
    },
    enabled: isAuthenticated && user?.role === "judge",
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Update Zustand store when matches are fetched
  useEffect(() => {
    if (Array.isArray(assignedMatches) && assignedMatches.length > 0) {
      setMatches(assignedMatches as any[]);
    }
  }, [assignedMatches, setMatches]);

  // Mock notifications
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: "match" as const,
      title: "New Match Assignment",
      message: "You have been assigned to judge a match",
      timestamp: new Date(),
      read: false,
    },
  ]);

  // Fetch selected match details
  const { data: selectedMatch, isLoading: matchLoading } = useQuery({
    queryKey: ["judge-match", selectedMatchId],
    queryFn: () => getMatchForJudging(selectedMatchId!),
    enabled: !!selectedMatchId,
  });

  // Set up refetch interval based on match status
  useEffect(() => {
    if (selectedMatch?.status === "in_progress") {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["judge-match", selectedMatchId] });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedMatch?.status, selectedMatchId, queryClient]);

  // Fetch co-judge scores
  const { data: coJudgeScores = [] } = useQuery({
    queryKey: ["co-judge-scores", selectedMatchId],
    queryFn: () => getCoJudgeScores(selectedMatchId!),
    enabled: !!selectedMatchId && selectedMatch?.status === "in_progress",
    refetchInterval: 10000,
  });

  // Mutations
  const acceptMatchMutation = useMutation({
    mutationFn: (matchId: string) => acceptMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["judge-matches"] });
      queryClient.invalidateQueries({ queryKey: ["judge-match", selectedMatchId] });
      toast({ title: "✅ Match accepted", description: "You are now assigned to this match" });
    },
  });

  const declineMatchMutation = useMutation({
    mutationFn: (matchId: string) => declineMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["judge-matches"] });
      toast({ title: "Match declined", description: "You have declined this match assignment" });
    },
  });

  const startTimerMutation = useMutation({
    mutationFn: ({ matchId, duration }: { matchId: string; duration?: number }) =>
      startMatchTimer(matchId, duration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["judge-match", selectedMatchId] });
      toast({ title: "🚀 Match started", description: "Timer is now running" });
    },
  });

  const pauseTimerMutation = useMutation({
    mutationFn: (matchId: string) => pauseMatchTimer(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["judge-match", selectedMatchId] });
      toast({ title: "⏸️ Match paused", description: "Timer has been paused" });
    },
  });

  const resumeTimerMutation = useMutation({
    mutationFn: (matchId: string) => resumeMatchTimer(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["judge-match", selectedMatchId] });
      toast({ title: "▶️ Match resumed", description: "Timer is running again" });
    },
  });

  const endMatchMutation = useMutation({
    mutationFn: ({ matchId, comments }: { matchId: string; comments: string }) => 
      endMatch(matchId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["judge-match", selectedMatchId] });
      queryClient.invalidateQueries({ queryKey: ["judge-matches"] });
      toast({ title: "✅ Match ended", description: "Match has been completed" });
    },
  });

  const submitScoresMutation = useMutation({
    mutationFn: ({ matchId, teamId, scores, comments }: any) =>
      submitJudgeScores(matchId, teamId, scores, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["judge-match", selectedMatchId] });
      toast({ title: "💾 Scores saved", description: "Team scores have been saved" });
    },
  });

  const lockScoresMutation = useMutation({
    mutationFn: ({ matchId, teamId }: { matchId: string; teamId: string }) =>
      lockJudgeScores(matchId, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["judge-match", selectedMatchId] });
      toast({ title: "🔒 Scores locked", description: "Scores have been finalized" });
    },
  });

  const submitPlayerScoresMutation = useMutation({
    mutationFn: ({ matchId, playerId, scores, notes }: any) =>
      submitPlayerScores(matchId, playerId, scores, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["judge-match", selectedMatchId] });
      toast({ title: "💾 Player scores saved", description: "Individual scores have been saved" });
    },
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: ({ matchId, teamId, playerId, message, isPublic }: any) =>
      submitFeedback(matchId, teamId, playerId, message, isPublic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["judge-match", selectedMatchId] });
      setShowFeedbackDialog(false);
      setFeedbackData({ message: "", isPublic: false, teamId: "", playerId: "" });
      toast({ title: "💬 Feedback submitted", description: "Feedback has been sent" });
    },
  });

  const submitAutoScoresMutation = useMutation({
    mutationFn: ({ matchId, teamId, scores }: any) => submitAutoScores(matchId, teamId, scores),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["judge-match", selectedMatchId] });
      toast({ title: "🤖 Auto-evaluation complete", description: "AI scores have been generated" });
    },
  });

  const approveLineupMutation = useMutation({
    mutationFn: ({ matchId, teamId }: { matchId: string; teamId: string }) =>
      approveLineup(matchId, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["judge-match", selectedMatchId] });
      toast({ title: "✅ Lineup approved", description: "Team lineup has been approved" });
    },
  });

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

  // Auto-evaluate function (now uses AI Evaluation Panel)
  const handleAutoEvaluate = async (teamId: string) => {
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

  // Validation functions
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

  // Report generation
  const handleExportReport = async (format: 'csv' | 'pdf') => {
    if (!selectedMatch) return;

    const calculateAverageScore = (teamId: string) => {
      const teamScores = (selectedMatch as any).judgeScores?.filter((s: any) => s.teamId === teamId) || [];
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
          autoScore: (selectedMatch as any).autoScores?.find((s: any) => s.teamId === selectedMatch.homeTeamId),
          judgeScores: (selectedMatch as any).judgeScores?.filter((s: any) => s.teamId === selectedMatch.homeTeamId) || [],
          averageScore: calculateAverageScore(selectedMatch.homeTeamId),
        },
        [selectedMatch.awayTeamId]: {
          autoScore: (selectedMatch as any).autoScores?.find((s: any) => s.teamId === selectedMatch.awayTeamId),
          judgeScores: (selectedMatch as any).judgeScores?.filter((s: any) => s.teamId === selectedMatch.awayTeamId) || [],
          averageScore: calculateAverageScore(selectedMatch.awayTeamId),
        },
      },
      playerScores: (selectedMatch as any).playerScores || [],
      feedback: (selectedMatch as any).feedback || [],
    };

    try {
      if (format === 'csv') {
        downloadCSVReport(reportData as any);
        toast({ title: "✅ CSV Report Downloaded" });
      } else {
        await downloadPDFReport(reportData as any);
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

  // Co-judge discrepancy checking
  const coJudgeDiscrepancies = useMemo(() => {
    if (!selectedMatch || !coJudgeScores.length) return [];
    
    const allScores = [
      ...((selectedMatch as any).judgeScores?.filter((s: any) => s.judgeId === user?.id) || []),
      ...(coJudgeScores as any[]),
    ];
    
    return checkScoreDiscrepancies(allScores, 2);
  }, [selectedMatch, coJudgeScores, user?.id]);

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
          if ((selectedMatch as any).timer?.isRunning) {
            pauseTimerMutation.mutate(selectedMatchId!);
          }
          break;
        case 'r':
          if ((selectedMatch as any).timer && !(selectedMatch as any).timer.isRunning) {
            resumeTimerMutation.mutate(selectedMatchId!);
          }
          break;
        case 'e':
          if (selectedMatch.status === 'in_progress') {
            setShowEndMatchDialog(true);
          }
          break;
        case 'a':
          if ((selectedMatch as any).judgeStatus === 'pending') {
            acceptMatchMutation.mutate(selectedMatchId!);
          }
          break;
        case 'd':
          if ((selectedMatch as any).judgeStatus === 'pending') {
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

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "judge") {
      navigate("/auth");
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== "judge") {
    return null;
  }

  const pendingMatches = (assignedMatches as any[]).filter((m: any) => m.judgeStatus === "pending");
  const acceptedMatches = (assignedMatches as any[]).filter((m: any) => m.judgeStatus === "accepted");
  const inProgressMatches = (assignedMatches as any[]).filter((m: any) => m.status === "in_progress");
  const completedMatches = (assignedMatches as any[]).filter((m: any) => m.status === "completed");

  const menuItems = [
    { id: "overview", label: "Overview", icon: Gavel, color: "text-blue-600" },
    { id: "matches", label: "Match Management", icon: Clock, color: "text-green-600" },
    { id: "history", label: "History", icon: History, color: "text-gray-600" },
    { id: "reports", label: "Reports", icon: BarChart3, color: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      {/* Enhanced Top Bar with Gradient */}
      <div className="border-b bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white fixed top-16 left-0 right-0 z-40 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 shadow-lg">
                {user?.fullName?.charAt(0) || "J"}
              </div>
              <div>
                <div className="font-bold text-lg">{user?.fullName || "Judge"}</div>
                <div className="text-sm text-white/80 flex items-center gap-2">
                  <Gavel className="h-3 w-3" />
                  NDL Judge Dashboard
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <SystemClock />
              <NotificationPanel
                notifications={notifications}
                onMarkAsRead={(id) => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                  );
                }}
                onClearAll={() => setNotifications([])}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-[140px]"></div>

      <div className="flex gap-6 container mx-auto px-6">
        {/* Enhanced Left Sidebar */}
        <aside className="w-72 bg-white/80 backdrop-blur-sm border-r border-gray-200 min-h-[calc(100vh-140px)] sticky top-[140px] self-start rounded-r-xl shadow-lg">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    if (item.id !== "matches") setSelectedMatchId(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-white" : item.color}`} />
                  <span className="font-semibold">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Stats in Sidebar */}
          <div className="p-4 mt-4 border-t border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Quick Stats</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Pending</span>
                <Badge className="bg-blue-600">{pendingMatches.length}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Accepted</span>
                <Badge className="bg-green-600">{acceptedMatches.length}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                <span className="text-sm text-gray-600">In Progress</span>
                <Badge className="bg-yellow-600">{inProgressMatches.length}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Completed</span>
                <Badge className="bg-gray-600">{completedMatches.length}</Badge>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-[calc(100vh-140px)] pb-8">
          {activeMenu === "overview" && (
            <div className="space-y-6">
              {/* Welcome Header */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                <h1 className="text-4xl font-bold mb-2">Welcome Back, {user?.fullName?.split(" ")[0] || "Judge"}!</h1>
                <p className="text-blue-100 text-lg">Manage matches, evaluate teams, and provide feedback</p>
              </div>

              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-blue-100 mb-1">Pending Assignments</div>
                        <div className="text-3xl font-bold">{pendingMatches.length}</div>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-green-100 mb-1">Accepted Matches</div>
                        <div className="text-3xl font-bold">{acceptedMatches.length}</div>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-yellow-100 mb-1">In Progress</div>
                        <div className="text-3xl font-bold">{inProgressMatches.length}</div>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Play className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-100 mb-1">Completed</div>
                        <div className="text-3xl font-bold">{completedMatches.length}</div>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Award className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Assigned Matches Panel - Enhanced */}
              <Card className="bg-white border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
                        <Gavel className="h-6 w-6 text-blue-600" />
                        Assigned Matches
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        All matches assigned to you for evaluation
                      </CardDescription>
                    </div>
                    <Badge className="bg-blue-600 text-white px-3 py-1">
                      {assignedMatches.length} Total
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {matchesError && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg mb-4">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-semibold">Error loading matches</p>
                      </div>
                      <p className="text-sm text-red-600 mt-1">{String(matchesError)}</p>
                      <p className="text-xs text-red-500 mt-2">Check browser console (F12) for details</p>
                    </div>
                  )}
                  <MatchList
                    matches={assignedMatches as any[]}
                    onAccept={(matchId: string) => {
                      const match = assignedMatches.find((m: any) => m.id === matchId);
                      if (match && match.judgeStatus === "pending") {
                        setSelectedMatchForDetails(match);
                        setShowMatchDetailsModal(true);
                      } else {
                        acceptMatchMutation.mutate(matchId);
                      }
                    }}
                    onDecline={(matchId: string) => {
                      const match = assignedMatches.find((m: any) => m.id === matchId);
                      if (match && match.judgeStatus === "pending") {
                        setSelectedMatchForDetails(match);
                        setShowMatchDetailsModal(true);
                      } else {
                        declineMatchMutation.mutate(matchId);
                      }
                    }}
                    onViewDetails={(matchId: string) => {
                      const match = assignedMatches.find((m: any) => m.id === matchId);
                      // If match is pending, show modal for decision
                      if (match && match.judgeStatus === "pending") {
                        setSelectedMatchForDetails(match);
                        setShowMatchDetailsModal(true);
                      } else {
                        // If match is accepted, show full judging panel
                        setSelectedMatchId(matchId);
                        setActiveMenu("matches");
                      }
                    }}
                    isLoading={matchesLoading}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "matches" && (
            <div className="space-y-6">
              {!selectedMatchId ? (
                <div>
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-6 shadow-xl">
                    <h2 className="text-3xl font-bold mb-2">Select a Match</h2>
                    <p className="text-blue-100">Choose a match to view details and start evaluation</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(assignedMatches as any[]).map((match: any) => (
                      <Card
                        key={match.id}
                        className="bg-white border-2 border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        onClick={() => setSelectedMatchId(match.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <Badge
                              className={
                                match.status === "in_progress"
                                  ? "bg-green-600"
                                  : match.status === "completed"
                                  ? "bg-gray-600"
                                  : "bg-blue-600"
                              }
                            >
                              {match.status}
                            </Badge>
                            <Badge variant="outline">{match.judgeStatus}</Badge>
                          </div>
                          <div className="font-bold text-lg text-gray-800 mb-2">
                            {match.homeTeam?.name} vs {match.awayTeam?.name}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(match.scheduledAt), "MMM dd, yyyy HH:mm")}
                            </div>
                            {match.arena?.name && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {match.arena.name}
                              </div>
                            )}
                          </div>
                          <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : matchLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading match details...</p>
                </div>
              ) : !selectedMatch ? (
                <div className="text-center py-12 text-gray-600">Match not found</div>
              ) : selectedMatch && (
                <div className="space-y-6">
                  {/* Enhanced Match Header */}
                  <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-3xl font-bold mb-2">
                            {selectedMatch.homeTeam?.name} vs {selectedMatch.awayTeam?.name}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-blue-100">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(selectedMatch.scheduledAt), "MMM dd, yyyy HH:mm")}
                            </div>
                            {selectedMatch.arena?.name && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {selectedMatch.arena.name}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {(selectedMatch as any).judgeStatus === "pending" && (
                            <>
                              <Button
                                onClick={() => acceptMatchMutation.mutate(selectedMatchId!)}
                                className="bg-green-600 hover:bg-green-700 shadow-lg"
                                size="lg"
                              >
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Accept
                              </Button>
                              <Button
                                onClick={() => declineMatchMutation.mutate(selectedMatchId!)}
                                variant="destructive"
                                size="lg"
                                className="shadow-lg"
                              >
                                <XCircle className="h-5 w-5 mr-2" />
                                Decline
                              </Button>
                            </>
                          )}
                          <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                            {selectedMatch.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Pre-Match Lineup Approval */}
                  {(selectedMatch as any).judgeStatus === "accepted" && (selectedMatch as any).status === "scheduled" && (
                    <LineupApproval
                      match={selectedMatch}
                      lineups={(selectedMatch as any).lineups || []}
                      onApprove={(teamId: string) => {
                        handleApproveLineup(teamId);
                      }}
                      onReject={(teamId: string) => {
                        toast({
                          title: "Lineup rejected",
                          description: "Requested changes to lineup. Team will be notified.",
                          variant: "destructive",
                        });
                      }}
                    />
                  )}

                  {/* Judge Chat */}
                  {(selectedMatch as any).judgeStatus === "accepted" && (selectedMatch as any).judges && (selectedMatch as any).judges.length > 1 && (
                    <JudgeChat
                      matchId={selectedMatchId!}
                      judges={(selectedMatch as any).judges.map((j: any) => j.judge)}
                      messages={(selectedMatch as any).feedback?.filter((f: any) => !f.teamId && !f.playerId) || []}
                      onSendMessage={(message: string, isPublic: boolean) => {
                        submitFeedbackMutation.mutate({
                          matchId: selectedMatchId!,
                          teamId: undefined,
                          playerId: undefined,
                          message,
                          isPublic,
                        });
                      }}
                    />
                  )}

                  {/* Match Timer - Enhanced */}
                  {(selectedMatch as any).judgeStatus === "accepted" && (selectedMatch as any).status === "scheduled" && canStartMatch && (
                    <Card className="bg-green-50 border-2 border-green-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-green-800 mb-2">Ready to Start</h3>
                            <p className="text-sm text-green-600">All judges have accepted and lineups are approved</p>
                          </div>
                          <Button
                            onClick={() => startTimerMutation.mutate({ matchId: selectedMatchId!, duration: 3600 })}
                            className="bg-green-600 hover:bg-green-700"
                            size="lg"
                          >
                            <Play className="h-5 w-5 mr-2" />
                            Start Match
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {(selectedMatch as any).judgeStatus === "accepted" && (selectedMatch as any).status === "in_progress" && (
                    <MatchTimer
                      matchId={selectedMatchId!}
                      timer={(selectedMatch as any).timer}
                      onStart={(duration) => startTimerMutation.mutate({ matchId: selectedMatchId!, duration })}
                      onPause={() => pauseTimerMutation.mutate(selectedMatchId!)}
                      onResume={() => resumeTimerMutation.mutate(selectedMatchId!)}
                      onEnd={() => setShowEndMatchDialog(true)}
                    />
                  )}

                  {/* Main Evaluation Tabs - Enhanced */}
                  {(selectedMatch as any).judgeStatus === "accepted" && (
                    <Tabs defaultValue="teams" className="space-y-6">
                      <TabsList className="bg-white border-2 border-gray-200 p-1 rounded-xl shadow-md">
                        <TabsTrigger value="teams" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
                          <Users className="h-4 w-4 mr-2" />
                          Team Evaluation
                        </TabsTrigger>
                        <TabsTrigger value="players" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
                          <Star className="h-4 w-4 mr-2" />
                          Individual Evaluation
                        </TabsTrigger>
                        <TabsTrigger value="feedback" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Feedback
                        </TabsTrigger>
                        {(selectedMatch as any).status === "completed" && (
                          <TabsTrigger value="report" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
                            <FileText className="h-4 w-4 mr-2" />
                            Final Report
                          </TabsTrigger>
                        )}
                      </TabsList>

                      <TabsContent value="teams" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Team A Evaluation */}
                          <div className="space-y-4">
                            <AutoJudgePanel
                              autoScore={selectedMatch.autoScores?.find((s: any) => s.teamId === selectedMatch.homeTeamId)}
                              teamName={selectedMatch.homeTeam?.name || "Team A"}
                              onEvaluate={() => handleAutoEvaluate(selectedMatch.homeTeamId)}
                            />
                            {coJudgeDiscrepancies.length > 0 && coJudgeDiscrepancies.some((d: any) => 
                              (selectedMatch as any).judgeScores?.some((s: any) => s.teamId === selectedMatch.homeTeamId)
                            ) && (
                              <Card className="bg-yellow-500/10 border-yellow-500/50">
                                <CardHeader>
                                  <CardTitle className="text-yellow-400 text-sm">⚠️ Score Discrepancies Detected</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-xs text-yellow-300">
                                    Review co-judge scores for significant differences
                                  </p>
                                </CardContent>
                              </Card>
                            )}
                            <TeamEvaluationPanel
                              teamId={selectedMatch.homeTeamId}
                              teamName={selectedMatch.homeTeam?.name || "Team A"}
                              scores={(selectedMatch as any).judgeScores?.find(
                                (s: any) => s.teamId === selectedMatch.homeTeamId && s.judgeId === user?.id
                              )}
                              autoScore={(selectedMatch as any).autoScores?.find((s: any) => s.teamId === selectedMatch.homeTeamId)}
                              coJudgeScores={(coJudgeScores as any[]).filter((s: any) => s.teamId === selectedMatch.homeTeamId)}
                              onSubmit={(scores, comments) =>
                                handleSubmitScores(selectedMatch.homeTeamId, scores, comments)
                              }
                              onLock={() =>
                                lockScoresMutation.mutate({
                                  matchId: selectedMatchId!,
                                  teamId: selectedMatch.homeTeamId,
                                })
                              }
                            />
                          </div>

                          {/* Team B Evaluation */}
                          <div className="space-y-4">
                            <AutoJudgePanel
                              autoScore={(selectedMatch as any).autoScores?.find((s: any) => s.teamId === selectedMatch.awayTeamId)}
                              teamName={selectedMatch.awayTeam?.name || "Team B"}
                              onEvaluate={() => handleAutoEvaluate(selectedMatch.awayTeamId)}
                            />
                            {coJudgeDiscrepancies.length > 0 && coJudgeDiscrepancies.some((d: any) => 
                              (selectedMatch as any).judgeScores?.some((s: any) => s.teamId === selectedMatch.awayTeamId)
                            ) && (
                              <Card className="bg-yellow-500/10 border-yellow-500/50">
                                <CardHeader>
                                  <CardTitle className="text-yellow-400 text-sm">⚠️ Score Discrepancies Detected</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-xs text-yellow-300">
                                    Review co-judge scores for significant differences
                                  </p>
                                </CardContent>
                              </Card>
                            )}
                            <TeamEvaluationPanel
                              teamId={selectedMatch.awayTeamId}
                              teamName={selectedMatch.awayTeam?.name || "Team B"}
                              scores={(selectedMatch as any).judgeScores?.find(
                                (s: any) => s.teamId === selectedMatch.awayTeamId && s.judgeId === user?.id
                              )}
                              autoScore={(selectedMatch as any).autoScores?.find((s: any) => s.teamId === selectedMatch.awayTeamId)}
                              coJudgeScores={(coJudgeScores as any[]).filter((s: any) => s.teamId === selectedMatch.awayTeamId)}
                              onSubmit={(scores, comments) =>
                                handleSubmitScores(selectedMatch.awayTeamId, scores, comments)
                              }
                              onLock={() =>
                                lockScoresMutation.mutate({
                                  matchId: selectedMatchId!,
                                  teamId: selectedMatch.awayTeamId,
                                })
                              }
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="players" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <PlayerEvaluationPanel
                            teamId={selectedMatch.homeTeamId}
                            teamName={selectedMatch.homeTeam?.name || "Team A"}
                            players={selectedMatch.homeTeam?.members?.map((m: any) => m.player) || []}
                            scores={selectedMatch.playerScores
                              ?.filter((s: any) => selectedMatch.homeTeam?.members?.some((m: any) => m.playerId === s.playerId))
                              .reduce((acc: any, s: any) => {
                                acc[s.playerId] = s;
                                return acc;
                              }, {})}
                            onSubmit={(playerId, scores, notes) =>
                              submitPlayerScoresMutation.mutate({
                                matchId: selectedMatchId!,
                                playerId,
                                scores,
                                notes,
                              })
                            }
                          />
                          <PlayerEvaluationPanel
                            teamId={selectedMatch.awayTeamId}
                            teamName={selectedMatch.awayTeam?.name || "Team B"}
                            players={(selectedMatch as any).awayTeam?.members?.map((m: any) => m.player) || []}
                            scores={(selectedMatch as any).playerScores
                              ?.filter((s: any) => (selectedMatch as any).awayTeam?.members?.some((m: any) => m.playerId === s.playerId))
                              .reduce((acc: any, s: any) => {
                                acc[s.playerId] = s;
                                return acc;
                              }, {})}
                            onSubmit={(playerId, scores, notes) =>
                              submitPlayerScoresMutation.mutate({
                                matchId: selectedMatchId!,
                                playerId,
                                scores,
                                notes,
                              })
                            }
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="feedback" className="space-y-6">
                        <Card className="bg-white border-2 border-gray-200 shadow-lg">
                          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                              <MessageSquare className="h-5 w-5 text-blue-600" />
                              Submit Feedback
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                              Provide constructive feedback to teams or individual players
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div>
                                <Label className="text-gray-800 font-semibold mb-3 block">Select Recipient</Label>
                                <div className="grid grid-cols-2 gap-4">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setFeedbackData({ ...feedbackData, teamId: selectedMatch.homeTeamId, playerId: "" });
                                      setShowFeedbackDialog(true);
                                    }}
                                    className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 h-20 text-lg"
                                  >
                                    <div className="text-center">
                                      <div className="font-bold">{selectedMatch.homeTeam?.name}</div>
                                      <div className="text-xs text-gray-500">Team Feedback</div>
                                    </div>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setFeedbackData({ ...feedbackData, teamId: selectedMatch.awayTeamId, playerId: "" });
                                      setShowFeedbackDialog(true);
                                    }}
                                    className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 h-20 text-lg"
                                  >
                                    <div className="text-center">
                                      <div className="font-bold">{selectedMatch.awayTeam?.name}</div>
                                      <div className="text-xs text-gray-500">Team Feedback</div>
                                    </div>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Previous Feedback */}
                        {selectedMatch.feedback && selectedMatch.feedback.length > 0 && (
                          <Card className="bg-white border-2 border-gray-200 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                              <CardTitle className="text-xl text-gray-800">Previous Feedback</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                {selectedMatch.feedback.map((fb: any) => (
                                  <div key={fb.id} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="font-semibold text-gray-800">{fb.judge?.fullName}</div>
                                      <Badge variant={fb.isPublic ? "default" : "outline"} className={fb.isPublic ? "bg-green-600" : ""}>
                                        {fb.isPublic ? "Public" : "Private"}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-gray-700">{fb.message}</div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>

                      {(selectedMatch as any).status === "completed" && (
                        <TabsContent value="report" className="space-y-6">
                          <Card className="bg-white border-2 border-gray-200 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-green-600" />
                                Final Match Report
                              </CardTitle>
                              <CardDescription className="text-gray-600">
                                Review and submit the final match results
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                  All scores have been locked. Review the final report and submit with your signature.
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleExportReport('csv')}
                                    variant="outline"
                                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                                  >
                                    📊 Export CSV
                                  </Button>
                                  <Button
                                    onClick={() => handleExportReport('pdf')}
                                    variant="outline"
                                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                                  >
                                    📄 Export PDF
                                  </Button>
                                  <Button
                                    onClick={() => setShowReportModal(true)}
                                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg"
                                    size="lg"
                                  >
                                    <FileText className="h-5 w-5 mr-2" />
                                    Review Final Report
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      )}
                    </Tabs>
                  )}
                </div>
              )}
            </div>
          )}

          {activeMenu === "history" && (
            <div>
              <div className="bg-gradient-to-r from-gray-600 to-gray-800 rounded-2xl p-8 text-white mb-6 shadow-xl">
                <h2 className="text-3xl font-bold mb-2">Match History</h2>
                <p className="text-gray-200">View all your completed match evaluations</p>
              </div>
              <div className="space-y-4">
                {(completedMatches as any[]).map((match: any) => (
                  <Card key={match.id} className="bg-white border-2 border-gray-200 hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg text-gray-800 mb-2">
                            {match.homeTeam?.name} vs {match.awayTeam?.name}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(match.scheduledAt), "MMM dd, yyyy HH:mm")}
                            </div>
                            {match.arena?.name && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {match.arena.name}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedMatchId(match.id);
                            setActiveMenu("matches");
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeMenu === "reports" && (
            <div>
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-6 shadow-xl">
                <h2 className="text-3xl font-bold mb-2">Reports & Analytics</h2>
                <p className="text-purple-100">View evaluation statistics and performance metrics</p>
              </div>
              <Card className="bg-white border-2 border-gray-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="text-xl text-gray-800">Evaluation Statistics</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Button onClick={() => navigate("/leaderboard")} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    View Full Leaderboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {selectedMatch && (
        <>
          <ReportModal
            open={showReportModal}
            onClose={() => setShowReportModal(false)}
            onConfirm={() => {
              setShowReportModal(false);
              setShowSignaturePad(true);
            }}
            match={selectedMatch}
            teamScores={{
              [selectedMatch.homeTeamId]: (selectedMatch as any).judgeScores?.find(
                (s: any) => s.teamId === selectedMatch.homeTeamId && s.judgeId === user?.id
              ) || {},
              [selectedMatch.awayTeamId]: (selectedMatch as any).judgeScores?.find(
                (s: any) => s.teamId === selectedMatch.awayTeamId && s.judgeId === user?.id
              ) || {},
            }}
            playerScores={{}}
            autoScores={{
              [selectedMatch.homeTeamId]: (selectedMatch as any).autoScores?.find(
                (s: any) => s.teamId === selectedMatch.homeTeamId
              ),
              [selectedMatch.awayTeamId]: (selectedMatch as any).autoScores?.find(
                (s: any) => s.teamId === selectedMatch.awayTeamId
              ),
            }}
          />

          <EndMatchConfirmation
            open={showEndMatchDialog}
            onClose={() => setShowEndMatchDialog(false)}
            onConfirm={(comments) => {
              endMatchMutation.mutate({ 
                matchId: selectedMatchId!, 
                comments 
              });
              setShowEndMatchDialog(false);
            }}
            match={selectedMatch}
            judges={(selectedMatch as any).judges?.map((j: any) => ({
              id: j.judge.id,
              fullName: j.judge.fullName,
              isMain: j.isMain,
            })) || []}
            currentJudgeId={user?.id || ""}
            isMainJudge={(selectedMatch as any).judges?.some((j: any) => j.judgeId === user?.id && j.isMain) || false}
          />
        </>
      )}

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

      {/* AI Evaluation Panel */}
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

      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gray-800">Submit Feedback</DialogTitle>
            <DialogDescription className="text-gray-600">
              Provide constructive feedback for the team or player
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-800 font-semibold">Feedback Message</Label>
              <Textarea
                value={feedbackData.message}
                onChange={(e) => setFeedbackData({ ...feedbackData, message: e.target.value })}
                placeholder="Enter your feedback..."
                className="mt-2"
                rows={6}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={feedbackData.isPublic}
                onCheckedChange={(checked) => setFeedbackData({ ...feedbackData, isPublic: checked })}
              />
              <Label className="text-gray-800">Make feedback public (visible to team)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFeedbackDialog(false)}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                submitFeedbackMutation.mutate({
                  matchId: selectedMatchId!,
                  teamId: feedbackData.teamId || undefined,
                  playerId: feedbackData.playerId || undefined,
                  message: feedbackData.message,
                  isPublic: feedbackData.isPublic,
                })
              }
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!feedbackData.message.trim()}
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Match Details Modal */}
      <MatchDetailsModal
        match={selectedMatchForDetails}
        isOpen={showMatchDetailsModal}
        onClose={() => {
          setShowMatchDetailsModal(false);
          setSelectedMatchForDetails(null);
        }}
        onAccept={(matchId: string) => {
          acceptMatchMutation.mutate(matchId, {
            onSuccess: () => {
              setShowMatchDetailsModal(false);
              setSelectedMatchForDetails(null);
              toast({
                title: "Match Accepted",
                description: "You have successfully accepted the match assignment.",
              });
            },
          });
        }}
        onDecline={(matchId: string) => {
          declineMatchMutation.mutate(matchId, {
            onSuccess: () => {
              setShowMatchDetailsModal(false);
              setSelectedMatchForDetails(null);
              toast({
                title: "Match Declined",
                description: "You have declined the match assignment.",
                variant: "destructive",
              });
            },
          });
        }}
        isLoading={acceptMatchMutation.isPending || declineMatchMutation.isPending}
      />
    </div>
  );
};

export default JudgePanel;
