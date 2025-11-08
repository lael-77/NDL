import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuthStore from "@/store/useAuthStore";
import useMatchesStore from "@/store/useMatchesStore";
import { teamsApi } from "@/api/teams";
import { leaderboardApi } from "@/api/leaderboard";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Users, Calendar, TrendingUp, Award, Target, Zap, Bell, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const PlayerDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { matches, fetchMatches } = useMatchesStore();

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await teamsApi.getAll();
      return response.data;
    },
    enabled: isAuthenticated,
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

  // Mock player data - replace with actual API call
  const playerData = {
    xp: 1250,
    rank: 45,
    level: 12,
    matchesPlayed: 23,
    wins: 15,
    losses: 8,
    challengesCompleted: 18,
    currentTeam: teams?.[0] || null,
  };

  // Mock progress data for charts
  const progressData = [
    { trimester: "T1", xp: 200, matches: 5 },
    { trimester: "T2", xp: 450, matches: 8 },
    { trimester: "T3", xp: 600, matches: 10 },
  ];

  const upcomingMatches = matches.filter((m: any) => {
    const matchDate = new Date(m.scheduledAt);
    return matchDate > new Date() && m.status === "scheduled";
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Player Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.fullName || "Player"}! Track your progress and compete.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">XP Points</CardTitle>
                  <Zap className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{playerData.xp.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Level {playerData.level}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Global Rank</CardTitle>
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">#{playerData.rank}</div>
                  <p className="text-xs text-muted-foreground">Out of {leaderboard?.length || 0} players</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Matches</CardTitle>
                  <Calendar className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{playerData.matchesPlayed}</div>
                  <p className="text-xs text-muted-foreground">
                    {playerData.wins}W - {playerData.losses}L
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Challenges</CardTitle>
                  <Target className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{playerData.challengesCompleted}</div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Team</CardTitle>
                    <CardDescription>Your active team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {playerData.currentTeam ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
                            {playerData.currentTeam.name?.charAt(0) || "T"}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{playerData.currentTeam.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {playerData.currentTeam.school?.name || "No school"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{playerData.currentTeam.points || 0}</div>
                            <div className="text-xs text-muted-foreground">Points</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{playerData.currentTeam.wins || 0}</div>
                            <div className="text-xs text-muted-foreground">Wins</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{playerData.currentTeam.wins + playerData.currentTeam.draws + playerData.currentTeam.losses || 0}</div>
                            <div className="text-xs text-muted-foreground">Played</div>
                          </div>
                        </div>
                        <Button asChild className="w-full">
                          <Link to={`/teams/${playerData.currentTeam.id}`}>View Team</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">You're not on a team yet</p>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Join a Team
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Matches</CardTitle>
                    <CardDescription>Your scheduled matches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {upcomingMatches.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingMatches.slice(0, 5).map((match: any) => (
                          <div
                            key={match.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/matches/${match.id}`)}
                          >
                            <div>
                              <div className="font-semibold">
                                {match.homeTeam?.name || "Team A"} vs {match.awayTeam?.name || "Team B"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(match.scheduledAt), "MMM dd, yyyy HH:mm")}
                              </div>
                            </div>
                            <Badge variant="outline">{match.status}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No upcoming matches</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Recent updates and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Bell className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">New Challenge Available</div>
                        <div className="text-sm text-muted-foreground">
                          A new coding challenge has been released. Submit your solution before the deadline.
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">2 hours ago</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Trophy className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">Rank Up!</div>
                        <div className="text-sm text-muted-foreground">
                          Congratulations! You've moved up to rank #{playerData.rank}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">1 day ago</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>XP Progress</CardTitle>
                  <CardDescription>Your experience points over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="trimester" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="xp" stroke="#00ccff" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Match Performance</CardTitle>
                  <CardDescription>Matches played per trimester</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="trimester" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="matches" fill="#00ccff" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default PlayerDashboard;

