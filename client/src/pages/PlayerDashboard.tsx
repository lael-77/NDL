import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuthStore from "@/store/useAuthStore";
import useMatchesStore from "@/store/useMatchesStore";
import { teamsApi } from "@/api/teams";
import { leaderboardApi } from "@/api/leaderboard";
import { dashboardApi } from "@/api/dashboard";
import { useQuery } from "@tanstack/react-query";
import { 
  Trophy, Users, Calendar, TrendingUp, Award, Target, Zap, Bell, 
  Home, BarChart3, User, BookOpen, MessageSquare, Clock, 
  CheckCircle, XCircle, ArrowRight, GraduationCap
} from "lucide-react";
import { Link } from "react-router-dom";
import { format, differenceInHours } from "date-fns";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { LiveMatchViewer } from "@/components/judge/LiveMatchViewer";

const PlayerDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { fetchMatches } = useMatchesStore();
  const [activeMenu, setActiveMenu] = useState("home");

  // Set up real-time updates via WebSocket
  useRealtimeUpdates();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ["playerDashboard"],
    queryFn: async () => {
      try {
        const response = await dashboardApi.getPlayerDashboard();
        return response.data;
      } catch (error: any) {
        console.error('Error fetching player dashboard:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
    // Real-time updates handled via WebSocket (no polling)
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
    } else {
      fetchMatches();
    }
  }, [isAuthenticated, navigate, fetchMatches]);

  // Extract data from dashboard response
  const player = dashboardData?.player;
  const playerTeam = dashboardData?.team;
  const matches = dashboardData?.matches || [];
  const notifications = dashboardData?.notifications || [];
  const messages = dashboardData?.messages || [];
  const academyProgress = dashboardData?.academyProgress || [];
  const challengeSubmissions = dashboardData?.challengeSubmissions || [];
  const stats = dashboardData?.stats || {};

  // Debug: Log dashboard data (remove in production)
  useEffect(() => {
    if (dashboardData) {
      console.log('Dashboard Data:', {
        player,
        playerTeam,
        matchesCount: matches.length,
        academyProgressCount: academyProgress.length,
        notificationsCount: notifications.length,
        stats
      });
    }
  }, [dashboardData, player, playerTeam, matches.length, academyProgress.length, notifications.length, stats]);

  // Calculate player stats from dashboard data
  const playerStats = {
    xp: player?.xp || stats.xp || 0,
    rank: stats.rank || (leaderboard ? leaderboard.findIndex((t: any) => t.id === playerTeam?.id) + 1 : 45),
    level: stats.level || Math.floor((player?.xp || 0) / 100) + 1,
    matchesPlayed: stats.matchesPlayed || (playerTeam ? (playerTeam.wins + playerTeam.draws + playerTeam.losses) : 0),
    wins: stats.wins || playerTeam?.wins || 0,
    losses: stats.losses || playerTeam?.losses || 0,
    draws: stats.draws || playerTeam?.draws || 0,
    points: stats.points || playerTeam?.points || 0,
    challengesCompleted: stats.challengesCompleted || challengeSubmissions.filter((s: any) => s.status === 'approved').length,
    projectsCompleted: challengeSubmissions.filter((s: any) => s.status === 'approved').length,
    tier: playerTeam?.tier || "beginner",
  };

  // Get tier color
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

  // Get next match
  const nextMatch = matches
    .filter((m: any) => {
      const matchDate = new Date(m.scheduledAt);
      return matchDate > new Date() && m.status === "scheduled" && 
             (m.homeTeamId === playerTeam?.id || m.awayTeamId === playerTeam?.id);
    })
    .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">
            {(dashboardError as any)?.response?.data?.error || (dashboardError as any)?.message || "Failed to load dashboard data"}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // XP progress calculation
  const currentLevelXP = (playerStats.level - 1) * 100;
  const nextLevelXP = playerStats.level * 100;
  const xpProgress = ((playerStats.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  if (!isAuthenticated) {
    return null;
  }

  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "stats", label: "My Stats", icon: BarChart3 },
    { id: "team", label: "My Team", icon: Users },
    { id: "academy", label: "Academy Progress", icon: GraduationCap },
    { id: "challenges", label: "Challenges", icon: Target },
    { id: "matches", label: "Matches", icon: Calendar },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
      <Navbar />
      
      {/* Top Bar */}
      <div className="border-b bg-white/95 backdrop-blur-sm sticky top-16 z-30 mt-16">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-[#1A1A1A]">
                {user?.fullName?.charAt(0) || "P"}
              </div>
              <div>
                <div className="font-semibold text-[#1A1A1A]">{user?.fullName || "Player"}</div>
                <div className="flex items-center gap-2 text-sm text-[#4A4A4A]">
                  <span>{playerTeam?.school?.name || "No School"}</span>
                  {playerStats.tier && (
                    <Badge className={getTierColor(playerStats.tier)}>
                      {playerStats.tier.charAt(0).toUpperCase() + playerStats.tier.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
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
          {activeMenu === "home" && (
            <>
              {/* Overview Panel */}
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tier Rank</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold">#{playerStats.rank}</span>
                        <Badge className={getTierColor(playerStats.tier)}>
                          {playerStats.tier.charAt(0).toUpperCase() + playerStats.tier.slice(1)}
                        </Badge>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>XP Progress</span>
                          <span>{playerStats.xp} / {nextLevelXP} XP</span>
                        </div>
                        <Progress value={xpProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">Level {playerStats.level}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Next Match</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {nextMatch ? (
                        <>
                          <div className="mb-3">
                            <div className="font-semibold text-lg mb-1">
                              {nextMatch.homeTeam?.name} vs {nextMatch.awayTeam?.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(nextMatch.scheduledAt), "MMM dd, yyyy HH:mm")}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>
                              {differenceInHours(new Date(nextMatch.scheduledAt), new Date())} hours
                            </span>
                          </div>
                          <Button size="sm" className="w-full mt-4" onClick={() => navigate(`/matches/${nextMatch.id}`)}>
                            View Details
                          </Button>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No upcoming matches</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Coach Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Great progress on API design!</div>
                            <div className="text-xs text-muted-foreground">2 days ago</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Focus on error handling</div>
                            <div className="text-xs text-muted-foreground">5 days ago</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Stats Card */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Your Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{playerStats.matchesPlayed}</div>
                        <div className="text-sm text-muted-foreground">Matches Played</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{playerStats.wins}</div>
                        <div className="text-sm text-muted-foreground">Wins</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{playerStats.points}</div>
                        <div className="text-sm text-muted-foreground">Total Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{playerStats.projectsCompleted}</div>
                        <div className="text-sm text-muted-foreground">Projects</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Academy Tracker */}
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Academy Progress</CardTitle>
                        <CardDescription>Your course completion status</CardDescription>
                      </div>
                      <Button size="sm">
                        <Target className="mr-2 h-4 w-4" />
                        Enroll in Challenge
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {academyProgress && academyProgress.length > 0 ? (
                      <div className="space-y-4">
                        {academyProgress.slice(0, 3).map((course: any, index: number) => (
                          <div key={course.id || index}>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium">{course.courseName || course.course || "Course"}</span>
                              <span className="text-muted-foreground">{course.progress || 0}%</span>
                            </div>
                            <Progress value={course.progress || 0} className="h-2" />
                            <div className="flex justify-between mt-1">
                              <Badge variant="outline" className="text-xs">{(course.courseTier || course.tier || "beginner").charAt(0).toUpperCase() + (course.courseTier || course.tier || "beginner").slice(1)}</Badge>
                              {(course.progress || 0) >= 80 && (
                                <Badge className="bg-green-500 text-xs">Passed</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                        {academyProgress.length > 3 && (
                          <Button variant="outline" className="w-full" onClick={() => setActiveMenu("academy")}>
                            View All Courses ({academyProgress.length})
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <GraduationCap className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No courses enrolled yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Team Panel */}
                {playerTeam && (
                  <Card className="mb-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>My Team</CardTitle>
                          <CardDescription>{playerTeam.name}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/teams/${playerTeam.id}`}>
                            View Team Profile
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
                          {playerTeam.name?.charAt(0) || "T"}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg">{playerTeam.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {playerTeam.school?.name || "Independent"}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getTierColor(playerTeam.tier)}>
                              {playerTeam.tier?.charAt(0).toUpperCase() + playerTeam.tier?.slice(1)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {playerTeam.members?.length || 0} members
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{playerTeam.points || 0}</div>
                          <div className="text-xs text-muted-foreground">Points</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{playerTeam.wins || 0}</div>
                          <div className="text-xs text-muted-foreground">Wins</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{playerTeam.wins + playerTeam.draws + playerTeam.losses || 0}</div>
                          <div className="text-xs text-muted-foreground">Played</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notifications Feed */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Recent updates and alerts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {notifications.length > 0 ? (
                        notifications.map((notif: any) => {
                          const Icon = notif.icon || Bell;
                          return (
                            <div
                              key={notif.id || Math.random()}
                              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <Icon className="h-5 w-5 text-primary mt-0.5" />
                              <div className="flex-1">
                                <div className="font-medium">{notif.message || notif.title || "Notification"}</div>
                                <div className="text-xs text-muted-foreground mt-1">{notif.time || notif.createdAt || "Recently"}</div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No notifications</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeMenu === "stats" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">My Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Win Rate</span>
                        <span className="font-bold">
                          {playerStats.matchesPlayed > 0 
                            ? Math.round((playerStats.wins / playerStats.matchesPlayed) * 100) 
                            : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Points per Match</span>
                        <span className="font-bold">
                          {playerStats.matchesPlayed > 0 
                            ? Math.round(playerStats.points / playerStats.matchesPlayed) 
                            : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Streak</span>
                        <span className="font-bold text-green-600">3 wins</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <Award className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                        <div className="text-sm font-medium">Code Warrior</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <Trophy className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                        <div className="text-sm font-medium">Team Player</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <Target className="h-8 w-8 mx-auto text-green-500 mb-2" />
                        <div className="text-sm font-medium">Challenge Master</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <Zap className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                        <div className="text-sm font-medium">Rising Star</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeMenu === "team" && playerTeam && (
            <div>
              <h2 className="text-3xl font-bold mb-6">My Team</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Team Roster</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {playerTeam.members?.slice(0, 8).map((member: any) => (
                      <div
                        key={member.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/players/${member.player?.id}`)}
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold mb-2">
                          {member.player?.fullName?.charAt(0) || "P"}
                        </div>
                        <div className="font-medium">{member.player?.fullName || "Player"}</div>
                        <div className="text-xs text-muted-foreground">{member.player?.studentRole || "Member"}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "academy" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Academy Progress</h2>
              {academyProgress && academyProgress.length > 0 ? (
                <div className="space-y-4">
                  {academyProgress.map((course: any, index: number) => (
                    <Card key={course.id || index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{course.courseName || course.course || "Course"}</CardTitle>
                            <CardDescription>{(course.courseTier || course.tier || "beginner").charAt(0).toUpperCase() + (course.courseTier || course.tier || "beginner").slice(1)} Tier Course</CardDescription>
                          </div>
                          <Badge>{course.progress || 0}% Complete</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Progress value={course.progress || 0} className="mb-4" />
                        {course.completed ? (
                          <Button className="w-full" variant="outline">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Course Completed
                          </Button>
                        ) : (course.progress || 0) >= 80 ? (
                          <Button className="w-full" variant="outline">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Ready to Complete
                          </Button>
                        ) : (
                          <Button className="w-full">
                            Continue Learning
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No academy courses enrolled yet</p>
                    <Button className="mt-4">
                      Browse Courses
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeMenu === "challenges" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Challenges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Challenges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg">
                        <div className="font-semibold mb-1">Build a REST API</div>
                        <div className="text-sm text-muted-foreground mb-3">
                          Create a fully functional REST API with authentication
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge>Regular Tier</Badge>
                          <Button size="sm">Start Challenge</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Completed Challenges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">Challenge {i}</div>
                              <div className="text-sm text-muted-foreground">Completed 2 days ago</div>
                            </div>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeMenu === "matches" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">My Matches</h2>
              <Tabs defaultValue="upcoming">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past Matches</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="mt-6">
                  <div className="space-y-4">
                    {/* Live Matches */}
                    {matches
                      .filter((m: any) => {
                        return m.status === "in_progress" &&
                               (m.homeTeamId === playerTeam?.id || m.awayTeamId === playerTeam?.id);
                      })
                      .map((match: any) => (
                        <LiveMatchViewer
                          key={match.id}
                          matchId={match.id}
                          onClose={() => navigate(`/matches/${match.id}`)}
                        />
                      ))}
                    
                    {/* Upcoming Scheduled Matches */}
                    {matches
                      .filter((m: any) => {
                        const matchDate = new Date(m.scheduledAt);
                        return matchDate > new Date() && m.status === "scheduled" &&
                               (m.homeTeamId === playerTeam?.id || m.awayTeamId === playerTeam?.id);
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
                              <Badge>{match.status}</Badge>
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
                               (m.homeTeamId === playerTeam?.id || m.awayTeamId === playerTeam?.id);
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
                              <Badge variant={match.winnerId === playerTeam?.id ? "default" : "outline"}>
                                {match.winnerId === playerTeam?.id ? "Won" : "Lost"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeMenu === "messages" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Messages</h2>
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No messages yet</p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PlayerDashboard;
