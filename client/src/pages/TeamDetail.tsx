import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { teamsApi } from "@/api/teams";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Trophy, TrendingUp, Users, Calendar, Play, Award, Star, Heart } from "lucide-react";
import { format } from "date-fns";
import useMatchesStore from "@/store/useMatchesStore";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { matches, fetchMatches } = useMatchesStore();

  const { data: team, isLoading } = useQuery({
    queryKey: ["team", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await teamsApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Team not found</p>
              <Button onClick={() => navigate("/teams")} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Teams
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const teamMatches = matches.filter(
    (match: any) => match.homeTeam?.id === id || match.awayTeam?.id === id
  );

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      beginner: "bg-gray-100 text-gray-800",
      intermediate: "bg-green-100 text-green-800",
      advanced: "bg-blue-100 text-blue-800",
      regional: "bg-yellow-100 text-yellow-800",
      national: "bg-red-100 text-red-800",
    };
    return colors[tier?.toLowerCase()] || colors.beginner;
  };

  // Mock players data - replace with actual API call
  const players = [
    { id: "1", name: "John Doe", role: "Captain", xp: 1250, rank: 45, avatar: null },
    { id: "2", name: "Jane Smith", role: "Member", xp: 980, rank: 67, avatar: null },
    { id: "3", name: "Bob Johnson", role: "Member", xp: 750, rank: 89, avatar: null },
  ];

  // Mock awards data
  const awards = [
    { id: "1", title: "Best Innovation", description: "Awarded for outstanding innovation in Q1 2024", date: "2024-01-15" },
    { id: "2", title: "Top Performer", description: "Highest scoring team in Regional Tier", date: "2024-02-20" },
  ];

  // Performance chart data
  const performanceData = teamMatches
    .filter((m: any) => m.status === "completed")
    .map((match: any, index: number) => {
      const isHome = match.homeTeam?.id === id;
      const teamScore = isHome ? match.homeScore : match.awayScore;
      const opponentScore = isHome ? match.awayScore : match.homeScore;
      return {
        match: `M${index + 1}`,
        points: teamScore > opponentScore ? 3 : teamScore === opponentScore ? 1 : 0,
      };
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <Button variant="ghost" onClick={() => navigate("/teams")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teams
        </Button>

        {/* Team Header */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold">
                  {team.name?.charAt(0) || "T"}
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">{team.name}</h1>
                  <div className="flex items-center gap-3">
                    <p className="text-muted-foreground">{team.school?.name || "Independent"}</p>
                    {team.school?.tier && (
                      <Badge className={getTierColor(team.school.tier)}>
                        {team.school.tier}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Heart className="mr-2 h-4 w-4" />
                  Follow Team
                </Button>
                <Button variant="outline">
                  View Arena
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-3xl font-bold text-primary mb-1">{team.points || 0}</div>
                <div className="text-sm text-muted-foreground">Points</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{team.wins || 0}</div>
                <div className="text-sm text-muted-foreground">Wins</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-1">{team.draws || 0}</div>
                <div className="text-sm text-muted-foreground">Draws</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">{team.losses || 0}</div>
                <div className="text-sm text-muted-foreground">Losses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="matches">Match History</TabsTrigger>
            <TabsTrigger value="awards">Awards & Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {team.captain && (
                      <div>
                        <div className="text-sm text-muted-foreground">Captain</div>
                        <div className="font-semibold">{team.captain.fullName}</div>
                        <div className="text-sm text-muted-foreground">{team.captain.email}</div>
                      </div>
                    )}
                    {team.school && (
                      <div>
                        <div className="text-sm text-muted-foreground">School</div>
                        <div className="font-semibold">{team.school.name}</div>
                        {team.school.location && (
                          <div className="text-sm text-muted-foreground">{team.school.location}</div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Matches Played</span>
                      <span className="font-bold">{team.wins + team.draws + team.losses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Win Rate</span>
                      <span className="font-semibold">
                        {team.wins + team.draws + team.losses > 0
                          ? Math.round((team.wins / (team.wins + team.draws + team.losses)) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Position</span>
                      <span className="font-bold text-primary">#{team.rank || "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {performanceData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance Chart</CardTitle>
                  <CardDescription>Points earned per match</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="match" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="points" stroke="#00ccff" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="players" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Players</CardTitle>
                <CardDescription>Members of {team.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">
                              {player.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold">{player.name}</div>
                              <Badge variant="outline" className="text-xs mt-1">
                                {player.role}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2 pt-3 border-t">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">XP</span>
                              <span className="font-semibold">{player.xp.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Rank</span>
                              <span className="font-semibold">#{player.rank}</span>
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

          <TabsContent value="matches" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Match History</CardTitle>
                <CardDescription>All matches for {team.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {teamMatches.length > 0 ? (
                  <div className="space-y-3">
                    {teamMatches.map((match: any) => {
                      const isHome = match.homeTeam?.id === id;
                      const opponent = isHome ? match.awayTeam : match.homeTeam;
                      const teamScore = isHome ? match.homeScore : match.awayScore;
                      const opponentScore = isHome ? match.awayScore : match.homeScore;

                      return (
                        <div
                          key={match.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => navigate(`/matches/${match.id}`)}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                              {opponent?.name?.charAt(0) || "O"}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold">{opponent?.name || "Opponent"}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(match.scheduledAt), "MMM dd, yyyy")}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {teamScore ?? "-"} - {opponentScore ?? "-"}
                            </div>
                            <Badge
                              className={
                                match.status === "completed"
                                  ? teamScore > opponentScore
                                    ? "bg-green-500"
                                    : teamScore < opponentScore
                                    ? "bg-red-500"
                                    : "bg-yellow-500"
                                  : "bg-blue-500"
                              }
                            >
                              {match.status === "completed" ? "FT" : match.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No matches found for this team</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="awards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Awards & Achievements</CardTitle>
                <CardDescription>Recognition and challenges completed</CardDescription>
              </CardHeader>
              <CardContent>
                {awards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {awards.map((award) => (
                      <Card key={award.id} className="border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                              <Award className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold">{award.title}</div>
                              <div className="text-sm text-muted-foreground mt-1">{award.description}</div>
                              <div className="text-xs text-muted-foreground mt-2">
                                {format(new Date(award.date), "MMM dd, yyyy")}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No awards yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeamDetail;
