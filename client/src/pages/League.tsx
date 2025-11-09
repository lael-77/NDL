import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { teamsApi } from "@/api/teams";
import { leaderboardApi } from "@/api/leaderboard";
import useMatchesStore from "@/store/useMatchesStore";
import { 
  Trophy, Users, Calendar, MapPin, TrendingUp, BarChart3, 
  Filter, Search, Play, Award, Star, Target, ArrowRight 
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { sortTeamsByTierAndPoints, sortTeamsByPoints } from "@/lib/sortTeams";

const League = () => {
  const navigate = useNavigate();
  const { matches, fetchMatches } = useMatchesStore();
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await teamsApi.getAll();
      return response.data;
    },
  });

  const { data: leaderboardRaw } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const response = await leaderboardApi.getGlobal();
      return response.data;
    },
  });

  // Sort leaderboard by tier and points
  const leaderboard = leaderboardRaw ? sortTeamsByTierAndPoints(leaderboardRaw) : undefined;

  const getTierColor = (tier: string) => {
    const normalizedTier = tier?.toLowerCase() || 'beginner';
    const colors: Record<string, string> = {
      national: "text-red-500 bg-red-500/10 border-red-500/20",
      legendary: "text-orange-500 bg-orange-500/10 border-orange-500/20",
      professional: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      regular: "text-green-500 bg-green-500/10 border-green-500/20",
      amateur: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      beginner: "text-gray-500 bg-gray-500/10 border-gray-500/20",
    };
    return colors[normalizedTier] || colors.beginner;
  };

  const filteredLeaderboard = leaderboard?.filter((team: any) => {
    const teamTier = (team.tier || team.school?.tier)?.toLowerCase();
    const matchesTier = selectedTier === "all" || teamTier === selectedTier?.toLowerCase();
    const matchesSearch = searchQuery === "" || 
      team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.school?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  }) || [];

  const upcomingMatches = matches.filter((m: any) => 
    m.status === "scheduled" && new Date(m.scheduledAt) > new Date()
  );
  const pastMatches = matches.filter((m: any) => m.status === "completed");

  // Statistics data
  const tierDistribution = leaderboard?.reduce((acc: any, team: any) => {
    const tier = team.school?.tier || "UNKNOWN";
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {}) || {};

  const tierChartData = Object.entries(tierDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#ef4444', '#f97316', '#06b6d4', '#22c55e', '#64748b'];

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
            NDL League
          </h1>
          <p className="text-muted-foreground text-lg">
            Complete league overview, standings, fixtures, and statistics
          </p>
        </div>

        <Tabs defaultValue="standings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="arenas">Arena Map</TabsTrigger>
          </TabsList>

          {/* Standings Tab */}
          <TabsContent value="standings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>League Standings</CardTitle>
                    <CardDescription>Current rankings across all tiers</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={selectedTier} onValueChange={setSelectedTier}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filter by Tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="legendary">Legendary</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="amateur">Amateur</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search teams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-[200px]"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-semibold">Pos</th>
                        <th className="text-left p-4 font-semibold">Team</th>
                        <th className="text-center p-4 font-semibold">Tier</th>
                        <th className="text-center p-4 font-semibold">P</th>
                        <th className="text-center p-4 font-semibold">W</th>
                        <th className="text-center p-4 font-semibold">D</th>
                        <th className="text-center p-4 font-semibold">L</th>
                        <th className="text-right p-4 font-semibold">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeaderboard.map((team: any, index: number) => (
                        <motion.tr
                          key={team.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => navigate(`/teams/${team.id}`)}
                        >
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
                              <div className="font-semibold">{team.name || team.school?.name}</div>
                              {team.school?.name && (
                                <div className="text-xs text-muted-foreground">{team.school.name}</div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {(team.tier || team.school?.tier) && (
                              <Badge className={getTierColor(team.tier || team.school?.tier)}>
                                {((team.tier || team.school?.tier)?.charAt(0).toUpperCase() + (team.tier || team.school?.tier)?.slice(1))}
                              </Badge>
                            )}
                          </td>
                          <td className="p-4 text-center">{team.wins + team.draws + team.losses}</td>
                          <td className="p-4 text-center text-green-600 font-semibold">{team.wins}</td>
                          <td className="p-4 text-center text-yellow-600">{team.draws}</td>
                          <td className="p-4 text-center text-red-600">{team.losses}</td>
                          <td className="p-4 text-right font-bold text-primary">{team.points}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fixtures Tab */}
          <TabsContent value="fixtures" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Fixtures</CardTitle>
                <CardDescription>All scheduled matches by trimester</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingMatches.slice(0, 12).map((match: any, index: number) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer"
                        onClick={() => navigate(`/matches/${match.id}`)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge className="bg-blue-500">
                              <Calendar className="mr-1 h-3 w-3" />
                              {format(new Date(match.scheduledAt), "MMM dd")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(match.scheduledAt), "HH:mm")}
                            </span>
                          </div>
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{match.homeTeam?.name || "TBD"}</span>
                            </div>
                            <div className="text-center text-muted-foreground">vs</div>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{match.awayTeam?.name || "TBD"}</span>
                            </div>
                          </div>
                          {match.arena && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                              <MapPin className="h-3 w-3" />
                              {match.arena}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Match Results</CardTitle>
                <CardDescription>Completed matches with scores and MVPs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pastMatches.slice(0, 20).map((match: any, index: number) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card className="hover:shadow-md transition-all cursor-pointer"
                        onClick={() => navigate(`/matches/${match.id}`)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6 flex-1">
                              <div className="text-center min-w-[80px]">
                                <div className="text-xs text-muted-foreground mb-1">
                                  {format(new Date(match.scheduledAt), "MMM dd, yyyy")}
                                </div>
                                <Badge className={match.winner?.id === match.homeTeam?.id ? "bg-green-500" : "bg-gray-500"}>
                                  {match.homeScore} - {match.awayScore}
                                </Badge>
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold mb-1">{match.homeTeam?.name || "TBD"}</div>
                                <div className="text-sm text-muted-foreground">vs</div>
                                <div className="font-semibold mt-1">{match.awayTeam?.name || "TBD"}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              {match.winner && (
                                <div className="flex items-center gap-2 mb-2">
                                  <Award className="h-4 w-4 text-yellow-500" />
                                  <span className="text-sm font-semibold">{match.winner.name}</span>
                                </div>
                              )}
                              <Badge variant="outline" className="text-xs">
                                +{match.pointsEarned || 3} pts
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Teams</CardTitle>
                <CardDescription>Browse teams by tier and school</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams?.map((team: any, index: number) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer"
                        onClick={() => navigate(`/teams/${team.id}`)}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
                              {team.name?.charAt(0) || "T"}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-lg">{team.name}</div>
                              <div className="text-sm text-muted-foreground">{team.school?.name}</div>
                            </div>
                          </div>
                          {team.school?.tier && (
                            <Badge className={getTierColor(team.school.tier)}>
                              {team.school.tier}
                            </Badge>
                          )}
                          <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                            <div>
                              <div className="text-muted-foreground">Points</div>
                              <div className="font-bold text-primary">{team.points || 0}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-muted-foreground">Wins</div>
                              <div className="font-semibold text-green-600">{team.wins || 0}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Scorers</CardTitle>
                  <CardDescription>Teams with highest points</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard?.slice(0, 10).map((team: any, index: number) => (
                      <div key={team.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index < 3 ? 'bg-yellow-500/20 text-yellow-600' : 'bg-muted'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold">{team.name || team.school?.name}</div>
                            <div className="text-xs text-muted-foreground">{team.school?.name}</div>
                          </div>
                        </div>
                        <div className="font-bold text-primary">{team.points}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tier Distribution</CardTitle>
                  <CardDescription>Teams across competition tiers</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={tierChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {tierChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Arena Map Tab */}
          <TabsContent value="arenas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Arena Map</CardTitle>
                <CardDescription>Interactive map of hosting schools and arenas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "Lincoln Tech High", tier: "National", location: "Accra", capacity: 500, matches: 12 },
                    { name: "Innovation Academy", tier: "Regional", location: "Kumasi", capacity: 300, matches: 8 },
                    { name: "STEM Prep", tier: "Advanced", location: "Tamale", capacity: 250, matches: 6 },
                  ].map((arena, index) => (
                    <Card key={index} className="hover:shadow-lg transition-all hover:border-primary/50">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold">{arena.name}</div>
                            <div className="text-sm text-muted-foreground">{arena.location}</div>
                          </div>
                        </div>
                        <Badge className={getTierColor(arena.tier)}>{arena.tier}</Badge>
                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Capacity</span>
                            <span className="font-semibold">{arena.capacity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Matches Hosted</span>
                            <span className="font-semibold">{arena.matches}</span>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full mt-4" asChild>
                          <Link to="/arenas">View Details</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button asChild>
                    <Link to="/arenas">
                      View All Arenas
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default League;

