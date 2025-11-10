import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import useAuthStore from "@/store/useAuthStore";
import { teamsApi } from "@/api/teams";
import { leaderboardApi } from "@/api/leaderboard";
import { dashboardApi } from "@/api/dashboard";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, Users, TrendingUp, DollarSign, Image as ImageIcon, 
  BarChart3, Building2, Trophy, Award, Upload, Eye, 
  MessageSquare, Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const SponsorDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [activeMenu, setActiveMenu] = useState("overview");

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["sponsorDashboard"],
    queryFn: async () => {
      const response = await dashboardApi.getSponsorDashboard();
      return response.data;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  // Extract data from dashboard
  const sponsor = dashboardData?.sponsor;
  const sponsoredSchools = dashboardData?.sponsoredSchools || [];
  const stats = dashboardData?.stats || {};

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

  // Get all teams from sponsored schools
  const sponsoredTeams = sponsoredSchools.flatMap((school: any) => school.teams || []);

  // Calculate sponsor stats from dashboard data
  const sponsorStats = {
    schoolsSponsored: stats.sponsoredSchools || sponsoredSchools.length,
    totalPlayers: stats.totalPlayers || sponsoredTeams.reduce((sum: number, team: any) => sum + (team.members?.length || 0), 0),
    totalWins: stats.totalWins || sponsoredTeams.reduce((sum: number, team: any) => sum + (team.wins || 0), 0),
    totalPoints: stats.totalPoints || sponsoredTeams.reduce((sum: number, team: any) => sum + (team.points || 0), 0),
    brandReach: 12500, // Mock data - can be calculated from views/engagement
    totalFunding: 50000, // Mock data - can be tracked separately
  };

  const menuItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "teams", label: "Sponsored Teams", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "funding", label: "Funding & Support", icon: DollarSign },
    { id: "media", label: "Media Exposure", icon: ImageIcon },
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
                {user?.fullName?.charAt(0) || "S"}
              </div>
              <div>
                <div className="font-semibold text-[#1A1A1A]">{user?.fullName || "Sponsor"}</div>
                <div className="text-sm text-[#4A4A4A]">
                  Sponsored Tier(s): Professional, Legendary
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2 text-[#1A1A1A]">
                <Building2 className="h-4 w-4" />
                {sponsorStats.schoolsSponsored} Schools
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
                <h1 className="text-4xl font-bold mb-2">Sponsor Dashboard</h1>
                <p className="text-muted-foreground">Track your sponsorship impact and brand visibility</p>
              </div>

              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Schools Sponsored</CardTitle>
                    <Building2 className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{sponsorStats.schoolsSponsored}</div>
                    <p className="text-xs text-muted-foreground">Active partnerships</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{sponsorStats.totalPlayers}</div>
                    <p className="text-xs text-muted-foreground">Active students</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Brand Reach</CardTitle>
                    <Eye className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{sponsorStats.brandReach.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total impressions</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Funding</CardTitle>
                    <DollarSign className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">${sponsorStats.totalFunding.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Invested</p>
                  </CardContent>
                </Card>
              </div>

              {/* Sponsored Teams */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Sponsored Teams</CardTitle>
                  <CardDescription>Teams you sponsor with logos and rank trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sponsoredTeams.map((team: any) => (
                      <Card
                        key={team.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => navigate(`/teams/${team.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">
                              {team.name?.charAt(0) || "T"}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold">{team.name}</div>
                              <div className="text-sm text-muted-foreground">{team.school?.name}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-lg font-bold text-primary">{team.points || 0}</div>
                              <div className="text-xs text-muted-foreground">Points</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-green-600">+5</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeMenu === "teams" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Sponsored Teams</h2>
              <div className="space-y-4">
                {sponsoredTeams.map((team: any) => (
                  <Card key={team.id} className="cursor-pointer hover:border-primary" onClick={() => navigate(`/teams/${team.id}`)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold">
                            {team.name?.charAt(0) || "T"}
                          </div>
                          <div>
                            <div className="font-semibold text-lg">{team.name}</div>
                            <div className="text-sm text-muted-foreground">{team.school?.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{team.tier}</Badge>
                              <span className="text-xs text-muted-foreground">Rank: #{team.points || 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{team.points || 0}</div>
                          <div className="text-xs text-muted-foreground">Points</div>
                          <div className="flex items-center gap-1 mt-1 justify-end">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-600">+5</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeMenu === "analytics" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Views</span>
                        <span className="font-bold">{sponsorStats.brandReach.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Team Wins</span>
                        <span className="font-bold text-green-600">{sponsorStats.totalWins}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Brand Mentions</span>
                        <span className="font-bold">245</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Win Rate</span>
                        <span className="font-bold">
                          {sponsorStats.totalWins > 0 ? Math.round((sponsorStats.totalWins / sponsoredTeams.length) * 10) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Points</span>
                        <span className="font-bold">
                          {sponsoredTeams.length > 0 
                            ? Math.round(sponsoredTeams.reduce((sum: number, team: any) => sum + (team.points || 0), 0) / sponsoredTeams.length)
                            : 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeMenu === "funding" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Funding & Support</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Track Donations & Resources</CardTitle>
                  <CardDescription>Manage funding provided to schools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sponsoredSchools.map((school: any) => (
                      <div key={school.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{school.name}</div>
                            <div className="text-sm text-muted-foreground">{school.location}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">$10,000</div>
                            <div className="text-xs text-muted-foreground">Total Funding</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "media" && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-[#1A1A1A]">Media Exposure</h2>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Promotional Content</CardTitle>
                      <CardDescription>Upload logos, banners, and promotional materials</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Content
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upload Promotional Content</DialogTitle>
                          <DialogDescription>Add your brand assets to sponsored teams</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Logo</label>
                            <Input type="file" accept="image/*" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Banner</label>
                            <Input type="file" accept="image/*" />
                          </div>
                          <Button className="w-full">Upload</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <div className="text-sm font-medium">Company Logo</div>
                      <div className="text-xs text-muted-foreground">Uploaded</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <div className="text-sm font-medium">Banner</div>
                      <div className="text-xs text-muted-foreground">Not uploaded</div>
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

export default SponsorDashboard;

