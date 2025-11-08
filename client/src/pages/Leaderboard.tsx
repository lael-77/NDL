import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { leaderboardApi } from "@/api/leaderboard";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

const Leaderboard = () => {
  const [selectedTier, setSelectedTier] = useState<string>("all");

  const { data: leaderboard, isLoading } = useQuery({
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
  });

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">League Table</h1>
              <p className="text-xl text-muted-foreground">
                Current standings and rankings
              </p>
            </div>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger className="w-[180px]">
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
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold">Pos</th>
                      <th className="text-left p-4 font-semibold">Team</th>
                      <th className="text-left p-4 font-semibold">School</th>
                      <th className="text-center p-4 font-semibold">P</th>
                      <th className="text-center p-4 font-semibold">W</th>
                      <th className="text-center p-4 font-semibold">D</th>
                      <th className="text-center p-4 font-semibold">L</th>
                      <th className="text-right p-4 font-semibold">GD</th>
                      <th className="text-right p-4 font-semibold">Pts</th>
                      <th className="text-center p-4 font-semibold">Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard?.map((team: any, index: number) => {
                      const played = team.wins + team.draws + team.losses;
                      const goalDiff = (team.points || 0) - (team.losses * 3 || 0); // Simplified GD
                      
                      return (
                        <tr 
                          key={team.id} 
                          className="border-b hover:bg-muted/30 transition-colors"
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
                            <Link to={`/teams/${team.id}`} className="hover:text-primary">
                              <div className="font-semibold">{team.name}</div>
                              {team.captain && (
                                <div className="text-xs text-muted-foreground">
                                  {team.captain.fullName}
                                </div>
                              )}
                            </Link>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {team.school?.name || "Independent"}
                              {team.school?.tier && (
                                <Badge className={getTierColor(team.school.tier)}>
                                  {team.school.tier}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">{played}</td>
                          <td className="p-4 text-center text-green-600 font-semibold">{team.wins}</td>
                          <td className="p-4 text-center text-yellow-600">{team.draws}</td>
                          <td className="p-4 text-center text-red-600">{team.losses}</td>
                          <td className="p-4 text-right">
                            <span className={goalDiff >= 0 ? "text-green-600" : "text-red-600"}>
                              {goalDiff >= 0 ? "+" : ""}{goalDiff}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="font-bold text-primary text-lg">{team.points}</span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex gap-1 justify-center">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                  key={i}
                                  className="w-2 h-2 rounded-full bg-green-500"
                                  title="Win"
                                />
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {leaderboard && leaderboard.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No teams found in this tier.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
