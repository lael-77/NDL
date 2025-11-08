import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useMatchesStore from "@/store/useMatchesStore";
import { teamsApi } from "@/api/teams";
import { leaderboardApi } from "@/api/leaderboard";
import { useQuery } from "@tanstack/react-query";
import { Clock, Calendar, Trophy, TrendingUp, Users, Play, CheckCircle, XCircle, ArrowRight, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { initSocket } from "@/lib/socket";
import useAuthStore from "@/store/useAuthStore";

const Home = () => {
  const navigate = useNavigate();
  const { matches, fetchMatches, loading } = useMatchesStore();
  const { isAuthenticated, user } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState<"live" | "today" | "upcoming">("live");

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await teamsApi.getAll();
      return response.data;
    },
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const response = await leaderboardApi.getGlobal();
      return response.data;
    },
  });

  useEffect(() => {
    fetchMatches();
    // Initialize socket connection (optional - fails gracefully if server doesn't support it)
    if (isAuthenticated && user) {
      try {
        const token = localStorage.getItem("token");
        initSocket(token || undefined);
      } catch (error) {
        // Socket.io is optional, continue without it
        console.warn("Socket.io not available, continuing without real-time updates");
      }
    }
  }, [fetchMatches, isAuthenticated, user]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      scheduled: { label: "Scheduled", color: "bg-blue-500", icon: Clock },
      in_progress: { label: "LIVE", color: "bg-red-500 animate-pulse", icon: Play },
      completed: { label: "FT", color: "bg-green-500", icon: CheckCircle },
      cancelled: { label: "Cancelled", color: "bg-gray-500", icon: XCircle },
    };
    return statusConfig[status] || statusConfig.scheduled;
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const liveMatches = matches.filter((m: any) => m.status === "in_progress");
  const todayMatches = matches.filter((m: any) => {
    const matchDate = new Date(m.scheduledAt);
    return matchDate >= today && matchDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
  });
  const upcomingMatches = matches.filter((m: any) => {
    const matchDate = new Date(m.scheduledAt);
    return matchDate > new Date(today.getTime() + 24 * 60 * 60 * 1000) && m.status === "scheduled";
  });

  const displayedMatches = selectedTab === "live" ? liveMatches : 
                          selectedTab === "today" ? todayMatches : 
                          upcomingMatches;

  // Top 5 schools for ticker
  const topSchools = leaderboard?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-info/10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              National Developers League
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-info to-primary bg-clip-text text-transparent animate-gradient">
              Where Computing Becomes a Sport
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Compete, innovate, and rise through the ranks in Africa's premier coding championship
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 shadow-[0_0_30px_rgba(0,204,255,0.3)] hover:shadow-[0_0_40px_rgba(0,204,255,0.5)]">
                Join the League
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/leaderboard")} className="text-lg px-8">
                View Leaderboard
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/fixtures")} className="text-lg px-8">
                Explore Arenas
              </Button>
            </div>
          </motion.div>

          {/* Dynamic Ticker */}
          {topSchools.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-12 bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="flex-shrink-0 font-semibold text-primary">Top Schools:</div>
                <div className="flex-1 flex gap-8 animate-scroll">
                  {[...topSchools, ...topSchools].map((school: any, index: number) => (
                    <div key={`${school.id}-${index}`} className="flex items-center gap-2 flex-shrink-0">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{school.school?.name || school.name}</span>
                      <Badge variant="outline" className="text-xs">{school.points} pts</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Live Matches Section */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Live Matches</h2>
            <p className="text-muted-foreground">Real-time match updates and standings</p>
          </div>

          {/* Match Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            <Button
              variant={selectedTab === "live" ? "default" : "ghost"}
              onClick={() => setSelectedTab("live")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Play className="mr-2 h-4 w-4" />
              Live ({liveMatches.length})
            </Button>
            <Button
              variant={selectedTab === "today" ? "default" : "ghost"}
              onClick={() => setSelectedTab("today")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Today ({todayMatches.length})
            </Button>
            <Button
              variant={selectedTab === "upcoming" ? "default" : "ghost"}
              onClick={() => setSelectedTab("upcoming")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Clock className="mr-2 h-4 w-4" />
              Upcoming ({upcomingMatches.length})
            </Button>
          </div>

          {/* Matches Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            </div>
          ) : displayedMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {displayedMatches.map((match: any, index: number) => {
                const statusConfig = getStatusBadge(match.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={`${statusConfig.color} text-white`}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(match.scheduledAt), "MMM dd, HH:mm")}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {/* Home Team */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                {match.homeTeam?.name?.charAt(0) || "H"}
                              </div>
                              <span className="font-semibold flex-1">{match.homeTeam?.name || "Home Team"}</span>
                            </div>
                            <span className="text-2xl font-bold w-12 text-right">
                              {match.homeScore ?? "-"}
                            </span>
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                {match.awayTeam?.name?.charAt(0) || "A"}
                              </div>
                              <span className="font-semibold flex-1">{match.awayTeam?.name || "Away Team"}</span>
                            </div>
                            <span className="text-2xl font-bold w-12 text-right">
                              {match.awayScore ?? "-"}
                            </span>
                          </div>
                        </div>

                        {match.winner && (
                          <div className="mt-3 pt-3 border-t text-center">
                            <span className="text-xs text-muted-foreground">
                              Winner: <span className="font-semibold">{match.winner.name}</span>
                            </span>
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => navigate(`/matches/${match.id}`)}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No {selectedTab} matches found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* League Table Section */}
      <section className="bg-card/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">League Table</h2>
              <p className="text-muted-foreground">Current standings</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/leaderboard">View Full Table</Link>
            </Button>
          </div>

          {leaderboard && leaderboard.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-semibold">Pos</th>
                        <th className="text-left p-4 font-semibold">Team</th>
                        <th className="text-center p-4 font-semibold">P</th>
                        <th className="text-center p-4 font-semibold">W</th>
                        <th className="text-center p-4 font-semibold">D</th>
                        <th className="text-center p-4 font-semibold">L</th>
                        <th className="text-right p-4 font-semibold">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.slice(0, 10).map((team: any, index: number) => (
                        <tr key={team.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            {index < 3 ? (
                              <Trophy className={`h-5 w-5 ${
                                index === 0 ? "text-yellow-500" :
                                index === 1 ? "text-gray-400" :
                                "text-amber-600"
                              }`} />
                            ) : (
                              <span className="font-semibold">{index + 1}</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-semibold">{team.name}</div>
                              {team.school?.name && (
                                <div className="text-xs text-muted-foreground">{team.school.name}</div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">{team.wins + team.draws + team.losses}</td>
                          <td className="p-4 text-center text-green-600 font-semibold">{team.wins}</td>
                          <td className="p-4 text-center text-yellow-600">{team.draws}</td>
                          <td className="p-4 text-center text-red-600">{team.losses}</td>
                          <td className="p-4 text-right font-bold text-primary">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No teams in leaderboard yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold">{teams?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Total Teams</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold">{matches.length}</div>
                <div className="text-sm text-muted-foreground">Total Matches</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Play className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <div className="text-3xl font-bold">{liveMatches.length}</div>
                <div className="text-sm text-muted-foreground">Live Matches</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold">{leaderboard?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Ranked Teams</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
