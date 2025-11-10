import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuthStore from "@/store/useAuthStore";
import useMatchesStore from "@/store/useMatchesStore";
import { useQuery } from "@tanstack/react-query";
import { Gavel, CheckCircle, Clock, FileText, History, BarChart3, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const JudgePanel = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { matches, fetchMatches } = useMatchesStore();
  const { toast } = useToast();
  const [activeMenu, setActiveMenu] = useState("active");
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [scores, setScores] = useState({
    innovation: [50],
    functionality: [50],
    presentation: [50],
    impact: [50],
  });
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "judge") {
      navigate("/auth");
    } else {
      fetchMatches();
    }
  }, [isAuthenticated, user, navigate, fetchMatches]);

  // Get assigned matches (filter by judge's assigned region/tier)
  const assignedMatches = matches.filter((m: any) => 
    m.status === "in_progress" || m.status === "completed"
  );

  const handleScoreChange = (category: string, value: number[]) => {
    setScores((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmitScores = () => {
    if (!selectedMatch) return;

    const totalScore = Object.values(scores).reduce((sum, arr) => sum + arr[0], 0);
    
    toast({
      title: "Scores Submitted",
      description: `Evaluation submitted for ${selectedMatch.homeTeam?.name} vs ${selectedMatch.awayTeam?.name}`,
    });

    // TODO: Implement API call to submit scores
    setSelectedMatch(null);
    setScores({
      innovation: [50],
      functionality: [50],
      presentation: [50],
      impact: [50],
    });
    setNotes("");
  };

  if (!isAuthenticated || user?.role !== "judge") {
    return null;
  }

  const menuItems = [
    { id: "active", label: "Active Matches", icon: Gavel },
    { id: "pending", label: "Pending Reviews", icon: Clock },
    { id: "history", label: "Feedback History", icon: History },
    { id: "scoreboard", label: "Scoreboard Access", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
      <Navbar />
      
      {/* Top Bar */}
      <div className="border-b bg-white/95 backdrop-blur-sm sticky top-16 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-[#1A1A1A]">
                {user?.fullName?.charAt(0) || "J"}
              </div>
              <div>
                <div className="font-semibold text-[#1A1A1A]">{user?.fullName || "Judge"}</div>
                <div className="text-sm text-[#4A4A4A]">
                  Assigned Region: Kigali • Tier: All
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Menu */}
        <aside className="w-64 border-r bg-card/50 min-h-[calc(100vh-8rem)]">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeMenu === item.id
                      ? "bg-primary/20 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeMenu === "active" && (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Judge Dashboard</h1>
                <p className="text-muted-foreground">Evaluate matches and provide fair scoring</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Match Evaluation</CardTitle>
                      <CardDescription>Rate teams on innovation, functionality, presentation, and impact</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedMatch ? (
                        <div className="space-y-6">
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <div className="text-2xl font-bold">
                                  {selectedMatch.homeTeam?.name || "Team A"} vs {selectedMatch.awayTeam?.name || "Team B"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Match ID: {selectedMatch.id?.slice(0, 8)} • {format(new Date(selectedMatch.scheduledAt), "MMM dd, yyyy HH:mm")}
                                </div>
                                <div className="mt-2">
                                  <Badge variant="outline">{selectedMatch.homeTeam?.tier || selectedMatch.homeTeam?.school?.tier}</Badge>
                                </div>
                              </div>
                              <Badge>{selectedMatch.status}</Badge>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Innovation</Label>
                                <span className="text-sm font-semibold">{scores.innovation[0]}/100</span>
                              </div>
                              <Slider
                                value={scores.innovation}
                                onValueChange={(value) => handleScoreChange("innovation", value)}
                                max={100}
                                step={1}
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Functionality</Label>
                                <span className="text-sm font-semibold">{scores.functionality[0]}/100</span>
                              </div>
                              <Slider
                                value={scores.functionality}
                                onValueChange={(value) => handleScoreChange("functionality", value)}
                                max={100}
                                step={1}
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Presentation</Label>
                                <span className="text-sm font-semibold">{scores.presentation[0]}/100</span>
                              </div>
                              <Slider
                                value={scores.presentation}
                                onValueChange={(value) => handleScoreChange("presentation", value)}
                                max={100}
                                step={1}
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Impact</Label>
                                <span className="text-sm font-semibold">{scores.impact[0]}/100</span>
                              </div>
                              <Slider
                                value={scores.impact}
                                onValueChange={(value) => handleScoreChange("impact", value)}
                                max={100}
                                step={1}
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Notes/Comments</Label>
                            <Textarea
                              placeholder="Add qualitative feedback..."
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              className="mt-2"
                              rows={4}
                            />
                          </div>

                          <div className="p-4 bg-primary/10 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Total Score</span>
                              <span className="text-2xl font-bold text-primary">
                                {Object.values(scores).reduce((sum, arr) => sum + arr[0], 0)}/400
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button onClick={handleSubmitScores} className="flex-1">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Submit Score
                            </Button>
                            <Button variant="outline" onClick={() => {
                              setSelectedMatch(null);
                              setScores({
                                innovation: [50],
                                functionality: [50],
                                presentation: [50],
                                impact: [50],
                              });
                              setNotes("");
                            }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">Select a match to evaluate</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Matches</CardTitle>
                      <CardDescription>Matches awaiting evaluation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {assignedMatches.length > 0 ? (
                        <div className="space-y-3">
                          {assignedMatches.map((match: any) => (
                            <div
                              key={match.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedMatch?.id === match.id
                                  ? "bg-primary/10 border-primary"
                                  : "hover:bg-muted/50"
                              }`}
                              onClick={() => setSelectedMatch(match)}
                            >
                              <div className="font-semibold mb-1 text-sm">
                                {match.homeTeam?.name || "Team A"} vs {match.awayTeam?.name || "Team B"}
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">
                                {format(new Date(match.scheduledAt), "MMM dd, HH:mm")}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{match.status}</Badge>
                                <Badge variant="outline" className="text-xs">
                                  {match.homeTeam?.tier || match.homeTeam?.school?.tier}
                                </Badge>
                              </div>
                              <Button size="sm" className="w-full mt-2" variant="outline">
                                Evaluate
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No active matches</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}

          {activeMenu === "pending" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Pending Reviews</h2>
              <div className="space-y-4">
                {assignedMatches
                  .filter((m: any) => m.status === "completed")
                  .map((match: any) => (
                    <Card key={match.id} className="cursor-pointer hover:border-primary" onClick={() => setSelectedMatch(match)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-lg">
                              {match.homeTeam?.name} vs {match.awayTeam?.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(match.scheduledAt), "MMM dd, yyyy HH:mm")}
                            </div>
                          </div>
                          <Button>Evaluate</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {activeMenu === "history" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Feedback History</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Past Evaluations</CardTitle>
                  <CardDescription>History of feedback sent to teams</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignedMatches
                      .filter((m: any) => m.status === "completed")
                      .slice(0, 10)
                      .map((match: any) => (
                        <div key={match.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold">
                              {match.homeTeam?.name} vs {match.awayTeam?.name}
                            </div>
                            <Badge variant="outline">
                              {format(new Date(match.scheduledAt), "MMM dd, yyyy")}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Score: 320/400 • Status: Submitted
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "scoreboard" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Scoreboard Access</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Evaluation Scoreboard</CardTitle>
                  <CardDescription>View all match scores and evaluations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/leaderboard")} className="w-full">
                    View Full Leaderboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JudgePanel;
