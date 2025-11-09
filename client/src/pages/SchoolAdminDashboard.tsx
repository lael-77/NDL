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
import { teamsApi } from "@/api/teams";
import { leaderboardApi } from "@/api/leaderboard";
import { dashboardApi } from "@/api/dashboard";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, Users, Building2, GraduationCap, BarChart3, FileText,
  MapPin, Trophy, TrendingUp, Plus, Settings, CheckCircle,
  Clock, Award, XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGate, PermissionButton } from "@/components/PermissionGate";

const SchoolAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const { can, permissions } = usePermissions();
  const [activeMenu, setActiveMenu] = useState("overview");

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard } = useQuery({
    queryKey: ["schoolAdminDashboard"],
    queryFn: async () => {
      const response = await dashboardApi.getSchoolAdminDashboard();
      return response.data;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const response = await leaderboardApi.getGlobal();
      return response.data;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  // Extract data from dashboard
  const schoolData = dashboardData?.school || {
    name: "Your School",
    tier: "beginner",
    location: "Kigali",
    motto: "Excellence in Education",
    sponsor: null,
  };
  const schoolTeams = schoolData?.teams || [];
  const stats = dashboardData?.stats || {};
  const players = dashboardData?.players || [];
  const coaches = dashboardData?.coaches || [];
  const sponsors = dashboardData?.sponsors || [];

  // Calculate school stats from dashboard data
  const schoolStats = {
    totalTeams: stats.totalTeams || schoolTeams.length,
    totalPlayers: stats.totalPlayers || schoolTeams.reduce((sum: number, team: any) => sum + (team.members?.length || 0), 0),
    totalWins: stats.totalWins || schoolTeams.reduce((sum: number, team: any) => sum + (team.wins || 0), 0),
    totalPoints: stats.totalPoints || schoolTeams.reduce((sum: number, team: any) => sum + (team.points || 0), 0),
    coaches: stats.coaches || (schoolData?.coaches?.length || 0),
    arenas: stats.arenas || (schoolData?.arenas?.length || 0),
    pendingApplications: stats.pendingApplications || 0,
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

  const refetchTeams = refetchDashboard;

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      beginner: "bg-gray-100 text-gray-800",
      amateur: "bg-blue-100 text-blue-800",
      regular: "bg-green-100 text-green-800",
      professional: "bg-purple-100 text-purple-800",
      legendary: "bg-orange-100 text-orange-800",
      national: "bg-red-100 text-red-800",
    };
    return colors[tier?.toLowerCase()] || colors.beginner;
  };

  const menuItems = [
    { id: "overview", label: "School Overview", icon: Home },
    { id: "teams", label: "Teams", icon: Users },
    { id: "players", label: "Players", icon: Users },
    { id: "coaches", label: "Coaches", icon: GraduationCap },
    { id: "sponsors", label: "Sponsors", icon: Trophy },
    { id: "arenas", label: "Arenas", icon: MapPin },
    { id: "performance", label: "Performance", icon: BarChart3 },
    { id: "applications", label: "Applications", icon: FileText },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
      <Navbar />
      
      {/* Top Bar */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-16 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold">
                {schoolData.name?.charAt(0) || "S"}
              </div>
              <div>
                <div className="font-semibold">{schoolData.name}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{schoolData.location || "Location"}</span>
                  {schoolData.tier && (
                    <Badge className={getTierColor(schoolData.tier)}>
                      {schoolData.tier.charAt(0).toUpperCase() + schoolData.tier.slice(1)}
                    </Badge>
                  )}
                  {schoolData.sponsor && (
                    <Badge variant="outline">Sponsored by {schoolData.sponsor}</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Arena Status: Active
              </Badge>
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
                <h1 className="text-4xl font-bold mb-2">School Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage your school's teams and performance</p>
              </div>

              {/* Performance Snapshot */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{schoolStats.totalTeams}</div>
                    <p className="text-xs text-muted-foreground">Across all tiers</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{schoolStats.totalPlayers}</div>
                    <p className="text-xs text-muted-foreground">Active students</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Wins</CardTitle>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{schoolStats.totalWins}</div>
                    <p className="text-xs text-muted-foreground">Match victories</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                    <Award className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{schoolStats.totalPoints}</div>
                    <p className="text-xs text-muted-foreground">Accumulated points</p>
                  </CardContent>
                </Card>
              </div>

              {/* Teams Panel */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Teams by Tier</CardTitle>
                      <CardDescription>List of school teams organized by tier</CardDescription>
                    </div>
                    <PermissionGate action="manage:team">
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Team
                      </Button>
                    </PermissionGate>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['beginner', 'amateur', 'regular', 'professional', 'legendary', 'national'].map((tier) => {
                      const tierTeams = schoolTeams.filter((team: any) => team.tier?.toLowerCase() === tier);
                      if (tierTeams.length === 0) return null;

                      return (
                        <div key={tier} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge className={getTierColor(tier)}>
                                {tier.charAt(0).toUpperCase() + tier.slice(1)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {tierTeams.length} team{tierTeams.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {tierTeams.map((team: any) => (
                              <div
                                key={team.id}
                                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => navigate(`/teams/${team.id}`)}
                              >
                                <div className="font-semibold mb-1">{team.name}</div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">{team.members?.length || 0} players</span>
                                  <span className="font-bold text-primary">{team.points || 0} pts</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // View coach
                                    }}
                                  >
                                    View Coach
                                  </Button>
                                  <PermissionGate action="manage:coach" resourceId={team.id}>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Replace coach
                                      }}
                                    >
                                      Replace Coach
                                    </Button>
                                  </PermissionGate>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeMenu === "teams" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Teams Management</h2>
              <div className="space-y-4">
                {schoolTeams.map((team: any) => (
                  <Card key={team.id} className="cursor-pointer hover:border-primary" onClick={() => navigate(`/teams/${team.id}`)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-lg">{team.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {team.members?.length || 0} players • {team.wins}W - {team.losses}L
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{team.points || 0}</div>
                            <div className="text-xs text-muted-foreground">Points</div>
                          </div>
                          <Badge className={getTierColor(team.tier)}>
                            {team.tier?.charAt(0).toUpperCase() + team.tier?.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeMenu === "arenas" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Arena Management</h2>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Host Requests</CardTitle>
                      <CardDescription>Manage arena hosting applications</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Apply to Host
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Apply to Host Arena</DialogTitle>
                          <DialogDescription>Submit an application to host matches at your school</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Tier Level</label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tier" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="amateur">Amateur</SelectItem>
                                <SelectItem value="regular">Regular</SelectItem>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="legendary">Legendary</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Capacity</label>
                            <Input type="number" placeholder="Number of seats" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Facilities</label>
                            <Input placeholder="WiFi, Projectors, etc." />
                          </div>
                          <Button className="w-full">Submit Application</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">Arena Hosting Request</div>
                          <div className="text-sm text-muted-foreground">Professional Tier • Capacity: 200</div>
                        </div>
                        <Badge variant="outline">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "players" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Players</h2>
              <Card>
                <CardHeader>
                  <CardTitle>School Players</CardTitle>
                  <CardDescription>All players in your school ({players.length} total)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {players.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No players found in your school
                      </div>
                    ) : (
                      players.map((player: any) => (
                        <div key={player.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">
                                {player.fullName?.charAt(0) || "P"}
                              </div>
                              <div>
                                <div className="font-semibold">{player.fullName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {player.email} • {player.teamName ? `Team: ${player.teamName}` : "No team"}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline">XP: {player.xp || 0}</Badge>
                                  {player.studentRole && <Badge variant="secondary">{player.studentRole}</Badge>}
                                  {player.teamTier && <Badge className={getTierColor(player.teamTier)}>{player.teamTier}</Badge>}
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/teams/${player.teamId}`)}>
                              View Team
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "coaches" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Coaches</h2>
              <Card>
                <CardHeader>
                  <CardTitle>School Coaches</CardTitle>
                  <CardDescription>Manage coaching staff ({coaches.length} total)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {coaches.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No coaches assigned to your school
                      </div>
                    ) : (
                      coaches.map((coach: any) => (
                        <div key={coach.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">
                                {coach.fullName?.charAt(0) || "C"}
                              </div>
                              <div>
                                <div className="font-semibold">{coach.fullName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {coach.email} • {coach.coachProfile?.school?.name || schoolData.name}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge>{coach.role}</Badge>
                                  {coach.coachProfile?.school?.tier && (
                                    <Badge className={getTierColor(coach.coachProfile.school.tier)}>
                                      {coach.coachProfile.school.tier}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">View Details</Button>
                              <PermissionGate action="manage:coach" resourceId={coach.id}>
                                <Button variant="outline" size="sm">Edit Coach</Button>
                              </PermissionGate>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "sponsors" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Sponsors</h2>
              <Card>
                <CardHeader>
                  <CardTitle>School Sponsors</CardTitle>
                  <CardDescription>Sponsors associated with your school ({sponsors.length} total)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sponsors.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No sponsors associated with your school
                      </div>
                    ) : (
                      sponsors.map((sponsor: any) => (
                        <div key={sponsor.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">
                                {sponsor.fullName?.charAt(0) || "S"}
                              </div>
                              <div>
                                <div className="font-semibold">{sponsor.fullName}</div>
                                <div className="text-sm text-muted-foreground">{sponsor.email}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge>{sponsor.role}</Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">View Details</Button>
                              <PermissionGate action="manage:coach" resourceId={coach.id}>
                                <Button variant="outline" size="sm">Edit Coach</Button>
                              </PermissionGate>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "performance" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Points Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {schoolTeams.map((team: any) => (
                        <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{team.name}</div>
                            <div className="text-sm text-muted-foreground">{team.tier}</div>
                          </div>
                          <div className="text-2xl font-bold text-primary">{team.points || 0}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Match Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Wins</span>
                        <span className="font-bold text-green-600">{schoolStats.totalWins}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Losses</span>
                        <span className="font-bold text-red-600">
                          {schoolTeams.reduce((sum: number, team: any) => sum + (team.losses || 0), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Win Rate</span>
                        <span className="font-bold">
                          {schoolStats.totalWins > 0 
                            ? Math.round((schoolStats.totalWins / (schoolStats.totalWins + schoolTeams.reduce((sum: number, team: any) => sum + (team.losses || 0), 0))) * 100)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeMenu === "applications" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Applications</h2>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Player Registrations</CardTitle>
                    <CardDescription>Approve new player applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">New Player Application</div>
                            <div className="text-sm text-muted-foreground">John Doe • john@example.com</div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline">
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Tier Applications</CardTitle>
                    <CardDescription>Apply to join new tiers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Apply to New Tier
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;

