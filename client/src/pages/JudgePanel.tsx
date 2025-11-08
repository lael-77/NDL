import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import useAuthStore from "@/store/useAuthStore";
import useMatchesStore from "@/store/useMatchesStore";
import { useQuery } from "@tanstack/react-query";
import { Gavel, CheckCircle, Clock, Users, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion } from "framer-motion";

const JudgePanel = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { matches, fetchMatches } = useMatchesStore();
  const { toast } = useToast();
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [scores, setScores] = useState({
    innovation: [50],
    functionality: [50],
    teamwork: [50],
    presentation: [50],
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "judge") {
      navigate("/auth");
    } else {
      fetchMatches();
    }
  }, [isAuthenticated, user, navigate, fetchMatches]);

  const pendingMatches = matches.filter((m: any) => m.status === "in_progress" || m.status === "completed");

  const handleScoreChange = (category: string, value: number[]) => {
    setScores((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmitScores = () => {
    if (!selectedMatch) return;

    const totalScore = Object.values(scores).reduce((sum, arr) => sum + arr[0], 0);
    
    toast({
      title: "Scores Submitted",
      description: `Total score: ${totalScore}/100 for ${selectedMatch.homeTeam?.name} vs ${selectedMatch.awayTeam?.name}`,
    });

    // TODO: Implement API call to submit scores
    setSelectedMatch(null);
    setScores({
      innovation: [50],
      functionality: [50],
      teamwork: [50],
      presentation: [50],
    });
  };

  if (!isAuthenticated || user?.role !== "judge") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Judge Panel</h1>
            <p className="text-muted-foreground">Evaluate matches and rate team performance</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Match Evaluation</CardTitle>
                  <CardDescription>Rate teams on innovation, functionality, teamwork, and presentation</CardDescription>
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
                              {format(new Date(selectedMatch.scheduledAt), "MMM dd, yyyy HH:mm")}
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
                            <Label>Teamwork</Label>
                            <span className="text-sm font-semibold">{scores.teamwork[0]}/100</span>
                          </div>
                          <Slider
                            value={scores.teamwork}
                            onValueChange={(value) => handleScoreChange("teamwork", value)}
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
                          Submit Scores
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedMatch(null)}>
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
                  <CardTitle>Pending Evaluations</CardTitle>
                  <CardDescription>Matches awaiting your evaluation</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingMatches.length > 0 ? (
                    <div className="space-y-3">
                      {pendingMatches.map((match: any) => (
                        <motion.div
                          key={match.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedMatch?.id === match.id
                              ? "bg-primary/10 border-primary"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedMatch(match)}
                        >
                          <div className="font-semibold mb-1">
                            {match.homeTeam?.name || "Team A"} vs {match.awayTeam?.name || "Team B"}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {format(new Date(match.scheduledAt), "MMM dd, HH:mm")}
                          </div>
                          <Badge variant="outline">{match.status}</Badge>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No pending evaluations</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default JudgePanel;

