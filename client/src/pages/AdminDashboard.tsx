import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useAuthStore from "@/store/useAuthStore";
import useMatchesStore from "@/store/useMatchesStore";
import { teamsApi } from "@/api/teams";
import { leaderboardApi } from "@/api/leaderboard";
import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, Trophy, TrendingUp, Settings, CheckCircle, XCircle, Plus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { matches, fetchMatches } = useMatchesStore();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string>("all");

  const { data: teams, refetch: refetchTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await teamsApi.getAll();
      return response.data;
    },
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard", selectedTier],
    queryFn: async () => {
      if (selectedTier === "all") {
        const response = await leaderboardApi.getGlobal();
        return response.data;
      } else {
        const response = await leaderboardApi.getByTier(selectedTier);
        return response.data;
      }
    },
    enabled: isAuthenticated && user?.role === "admin",
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/auth");
    } else {
      fetchMatches();
    }
  }, [isAuthenticated, user, navigate, fetchMatches]);

  const handlePromotionRelegation = async () => {
    toast({
      title: "Processing...",
      description: "Processing tier promotions and relegations",
    });
    // TODO: Implement API call
  };

  const handleApproveSubmission = (id: string) => {
    toast({
      title: "Approved",
      description: "Challenge submission approved",
    });
    // TODO: Implement API call
  };

  const handleRejectSubmission = (id: string) => {
    toast({
      title: "Rejected",
      description: "Challenge submission rejected",
      variant: "destructive",
    });
    // TODO: Implement API call
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  // Mock pending submissions
  const pendingSubmissions = [
    { id: "1", team: "Team Alpha", challenge: "Challenge 1", submittedAt: new Date() },
    { id: "2", team: "Team Beta", challenge: "Challenge 2", submittedAt: new Date() },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage schools, teams, players, and competitions</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{teams?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Registered teams</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{matches.length}</div>
                <p className="text-xs text-muted-foreground">Matches played</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pendingSubmissions.length}</div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leaderboard</CardTitle>
                <Trophy className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{leaderboard?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Ranked teams</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="tiers">Tier Management</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Match
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Register New Team
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Schools
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={handlePromotionRelegation}>
                      <Trophy className="mr-2 h-4 w-4" />
                      Process Tier Changes
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest system events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">Match completed</div>
                          <div className="text-xs text-muted-foreground">Team Alpha vs Team Beta</div>
                        </div>
                        <div className="text-xs text-muted-foreground">2 hours ago</div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">New team registered</div>
                          <div className="text-xs text-muted-foreground">Team Gamma</div>
                        </div>
                        <div className="text-xs text-muted-foreground">5 hours ago</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="submissions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Challenge Submissions</CardTitle>
                  <CardDescription>Review and approve challenge solutions</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingSubmissions.length > 0 ? (
                    <div className="space-y-4">
                      {pendingSubmissions.map((submission) => (
                        <div
                          key={submission.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <div className="font-semibold">{submission.team}</div>
                            <div className="text-sm text-muted-foreground">{submission.challenge}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Submitted: {submission.submittedAt.toLocaleString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectSubmission(submission.id)}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => handleApproveSubmission(submission.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No pending submissions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tiers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tier Management</CardTitle>
                  <CardDescription>Process promotions and relegations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Select value={selectedTier} onValueChange={setSelectedTier}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="regional">Regional</SelectItem>
                        <SelectItem value="national">National</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handlePromotionRelegation}>
                      Process Tier Changes
                    </Button>
                  </div>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <div className="font-semibold text-yellow-500">Important</div>
                        <div className="text-sm text-muted-foreground">
                          Processing tier changes will promote the top 3 teams and relegate the bottom 3 teams in each tier.
                          This action cannot be undone.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

