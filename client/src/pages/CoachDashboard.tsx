import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useAuthStore from "@/store/useAuthStore";
import useMatchesStore from "@/store/useMatchesStore";
import { teamsApi } from "@/api/teams";
import { dashboardApi } from "@/api/dashboard";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, Users, Calendar, TrendingUp, BookOpen, MessageSquare, 
  FileText, BarChart3, Plus, UserPlus, UserMinus, Send, 
  Trophy, Award, CheckCircle, Clock, Building2
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";

const CoachDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { fetchMatches } = useMatchesStore();
  const { toast } = useToast();
  const [activeMenu, setActiveMenu] = useState("overview");

  // Set up real-time updates via WebSocket
  useRealtimeUpdates();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard } = useQuery({
    queryKey: ["coachDashboard"],
    queryFn: async () => {
      const response = await dashboardApi.getCoachDashboard();
      return response.data;
    },
    enabled: isAuthenticated,
    // Real-time updates handled via WebSocket (no polling)
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    } else {
      fetchMatches();
    }
  }, [isAuthenticated, navigate, fetchMatches]);

  // Extract data from dashboard
  const coach = dashboardData?.coach;
  const coachSchool = dashboardData?.school;
  const coachTeams = dashboardData?.teams || [];
  const players = dashboardData?.players || [];
  const matches = dashboardData?.matches || [];
  const stats = dashboardData?.stats || {};

  // Calculate stats from dashboard data
  const coachStats = {
    totalTeams: stats.totalTeams || coachTeams.length,
    totalPlayers: stats.totalPlayers || players.length,
    totalWins: stats.totalWins || coachTeams.reduce((sum: number, team: any) => sum + (team.wins || 0), 0),
    totalPoints: stats.totalPoints || coachTeams.reduce((sum: number, team: any) => sum + (team.points || 0), 0),
    upcomingMatches: stats.upcomingMatches || matches.filter((m: any) => {
      const matchDate = new Date(m.scheduledAt);
      return matchDate > new Date() && m.status === "scheduled";
    }).length,
  };

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "players", label: "Players", icon: Users },
    { id: "matches", label: "Matches", icon: Calendar },
    { id: "training", label: "Training", icon: BookOpen },
    { id: "submissions", label: "Submissions", icon: FileText },
    { id: "communication", label: "Communication", icon: MessageSquare },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
      <Navbar />
      
      {/* Top Bar */}
      <div className="border-b bg-white/95 backdrop-blur-sm sticky top-16 z-30 mt-16">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-[#1A1A1A]">
                {coachSchool?.name?.charAt(0) || "S"}
              </div>
              <div>
                <div className="font-semibold text-[#1A1A1A]">{user?.fullName || "Coach"}</div>
                <div className="flex items-center gap-2 text-sm text-[#4A4A4A]">
                  <Building2 className="h-4 w-4" />
                  <span>{coachSchool?.name || "No School"}</span>
                  {coachSchool?.tier && (
                    <Badge variant="outline">
                      {coachSchool.tier.charAt(0).toUpperCase() + coachSchool.tier.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <MessageSquare className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
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
          {activeMenu === "overview" && (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Coach Dashboard</h1>
                <p className="text-muted-foreground">Manage your teams and players</p>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{coachStats.totalTeams}</div>
                    <p className="text-xs text-muted-foreground">Teams managed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                    <UserPlus className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{coachStats.totalPlayers}</div>
                    <p className="text-xs text-muted-foreground">Players coached</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Wins</CardTitle>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{coachStats.totalWins}</div>
                    <p className="text-xs text-muted-foreground">Match victories</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                    <Award className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{coachStats.totalPoints}</div>
                    <p className="text-xs text-muted-foreground">Accumulated points</p>
                  </CardContent>
                </Card>
              </div>

              {/* Team Overview */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Team Overview</CardTitle>
                      <CardDescription>Player list and progress summary</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Player
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Player to Team</DialogTitle>
                            <DialogDescription>Invite a player to join your team</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Player Email</label>
                              <Input placeholder="player@example.com" />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Select Team</label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose team" />
                                </SelectTrigger>
                                <SelectContent>
                                  {coachTeams.map((team: any) => (
                                    <SelectItem key={team.id} value={team.id}>
                                      {team.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button className="w-full">Send Invitation</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="outline">
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remove Player
                      </Button>
                      <Button size="sm" variant="outline">
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {coachTeams.map((team: any) => (
                      <div key={team.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-semibold text-lg">{team.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {team.members?.length || 0} players
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-primary">{team.points || 0}</div>
                              <div className="text-xs text-muted-foreground">Points</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">{team.wins || 0}</div>
                              <div className="text-xs text-muted-foreground">Wins</div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {team.members?.slice(0, 4).map((member: any) => (
                            <div
                              key={member.id}
                              className="p-2 border rounded text-center cursor-pointer hover:bg-muted/50"
                              onClick={() => navigate(`/players/${member.player?.id}`)}
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold mx-auto mb-1">
                                {member.player?.fullName?.charAt(0) || "P"}
                              </div>
                              <div className="text-xs font-medium truncate">{member.player?.fullName || "Player"}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Matches */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Matches</CardTitle>
                  <CardDescription>Fixtures and opponent information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {matches
                      .filter((m: any) => {
                        const matchDate = new Date(m.scheduledAt);
                        return matchDate > new Date() && m.status === "scheduled" &&
                               coachTeams.some((team: any) => team.id === m.homeTeamId || team.id === m.awayTeamId);
                      })
                      .slice(0, 5)
                      .map((match: any) => {
                        const teamInMatch = coachTeams.find((t: any) => t.id === match.homeTeamId || t.id === match.awayTeamId);
                        const opponent = match.homeTeamId === teamInMatch?.id ? match.awayTeam : match.homeTeam;
                        
                        return (
                          <div
                            key={match.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/matches/${match.id}`)}
                          >
                            <div className="flex-1">
                              <div className="font-semibold">
                                {teamInMatch?.name} vs {opponent?.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(match.scheduledAt), "MMM dd, yyyy HH:mm")}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{match.status}</Badge>
                              <Button size="sm" variant="outline">
                                Submit Results
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeMenu === "players" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Players</h2>
              <div className="space-y-4">
                {coachTeams.map((team: any) => (
                  <Card key={team.id}>
                    <CardHeader>
                      <CardTitle>{team.name} - Players</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {team.members?.map((member: any) => (
                          <div
                            key={member.id}
                            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/players/${member.player?.id}`)}
                          >
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold mb-3 mx-auto">
                              {member.player?.fullName?.charAt(0) || "P"}
                            </div>
                            <div className="text-center">
                              <div className="font-semibold">{member.player?.fullName || "Player"}</div>
                              <div className="text-sm text-muted-foreground">{member.player?.studentRole || "Member"}</div>
                              <div className="text-xs text-muted-foreground mt-1">XP: {member.player?.xp || 0}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeMenu === "matches" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Matches</h2>
              <Tabs defaultValue="upcoming">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past Matches</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="mt-6">
                  <div className="space-y-4">
                    {matches
                      .filter((m: any) => {
                        const matchDate = new Date(m.scheduledAt);
                        return matchDate > new Date() && m.status === "scheduled" &&
                               coachTeams.some((team: any) => team.id === m.homeTeamId || team.id === m.awayTeamId);
                      })
                      .map((match: any) => (
                        <Card key={match.id} className="cursor-pointer hover:border-primary" onClick={() => navigate(`/matches/${match.id}`)}>
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
                              <Button size="sm">Submit Results</Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
                <TabsContent value="past" className="mt-6">
                  <div className="space-y-4">
                    {matches
                      .filter((m: any) => {
                        const matchDate = new Date(m.scheduledAt);
                        return matchDate < new Date() && m.status === "completed" &&
                               coachTeams.some((team: any) => team.id === m.homeTeamId || team.id === m.awayTeamId);
                      })
                      .map((match: any) => (
                        <Card key={match.id} className="cursor-pointer hover:border-primary" onClick={() => navigate(`/matches/${match.id}`)}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-lg">
                                  {match.homeTeam?.name} {match.homeScore} - {match.awayScore} {match.awayTeam?.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {format(new Date(match.scheduledAt), "MMM dd, yyyy")}
                                </div>
                              </div>
                              <Badge>{match.status}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeMenu === "training" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Training Progress</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Academy Course Completion</CardTitle>
                  <CardDescription>Progress by player</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {coachTeams.flatMap((team: any) => 
                      team.members?.map((member: any) => (
                        <div key={member.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{member.player?.fullName || "Player"}</div>
                            <Badge>65% Complete</Badge>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: "65%" }}></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "reports" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Performance Reports</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Performance Summary</CardTitle>
                  <CardDescription>Auto-generated insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold mb-2">Team Performance</div>
                      <div className="text-sm text-muted-foreground">
                        Your teams have won {coachStats.totalWins} matches this week, earning {coachStats.totalPoints} points.
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold mb-2">Player Growth</div>
                      <div className="text-sm text-muted-foreground">
                        Average XP increase: 15% across all players
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CoachDashboard;

