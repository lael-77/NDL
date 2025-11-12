import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, GraduationCap, Building2, Medal, Award, Star, Search } from "lucide-react";
import { leaderboardApi } from "@/api/leaderboard";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { sortTeamsByPoints } from "@/lib/sortTeams";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";

type LeaderboardType = "teams" | "students" | "coaches" | "schools";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LeaderboardType>("teams");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Set up real-time updates via WebSocket
  useRealtimeUpdates();

  // Teams leaderboard
  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ["leaderboard-teams", selectedTier],
    queryFn: async () => {
      const response = await leaderboardApi.getTeams(selectedTier);
      return response.data;
    },
    enabled: activeTab === "teams",
  });

  // Students leaderboard
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["leaderboard-students", selectedTier],
    queryFn: async () => {
      const response = await leaderboardApi.getStudents(selectedTier);
      return response.data;
    },
    enabled: activeTab === "students",
  });

  // Coaches leaderboard
  const { data: coachesData, isLoading: coachesLoading } = useQuery({
    queryKey: ["leaderboard-coaches", selectedTier],
    queryFn: async () => {
      const response = await leaderboardApi.getCoaches(selectedTier);
      return response.data;
    },
    enabled: activeTab === "coaches",
  });

  // Schools leaderboard
  const { data: schoolsData, isLoading: schoolsLoading } = useQuery({
    queryKey: ["leaderboard-schools", selectedTier],
    queryFn: async () => {
      const response = await leaderboardApi.getSchools(selectedTier);
      return response.data;
    },
    enabled: activeTab === "schools",
  });

  const getTierColor = (tier: string) => {
    const normalizedTier = tier?.toLowerCase() || 'beginner';
    const colors: Record<string, string> = {
      beginner: "bg-gray-100 text-gray-800 border-gray-300",
      amateur: "bg-blue-100 text-blue-800 border-blue-300",
      regular: "bg-green-100 text-green-800 border-green-300",
      professional: "bg-purple-100 text-purple-800 border-purple-300",
      legendary: "bg-orange-100 text-orange-800 border-orange-300",
      national: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[normalizedTier] || colors.beginner;
  };

  const getRankGlow = (index: number) => {
    if (index === 0) return "shadow-[0_0_20px_rgba(234,179,8,0.6)] border-yellow-400";
    if (index === 1) return "shadow-[0_0_20px_rgba(156,163,175,0.6)] border-gray-400";
    if (index === 2) return "shadow-[0_0_20px_rgba(217,119,6,0.6)] border-amber-600";
    return "";
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Trophy className="h-5 w-5 text-amber-600" />;
    return <span className="font-semibold text-muted-foreground">{index + 1}</span>;
  };

  // Filter function
  const filterData = (data: any[], query: string, type: LeaderboardType) => {
    if (!query.trim()) return data;
    
    const lowerQuery = query.toLowerCase();
    return data.filter((item: any) => {
      if (type === "teams") {
        return (
          item.name?.toLowerCase().includes(lowerQuery) ||
          item.school?.name?.toLowerCase().includes(lowerQuery) ||
          item.captain?.fullName?.toLowerCase().includes(lowerQuery)
        );
      } else if (type === "students") {
        return (
          item.fullName?.toLowerCase().includes(lowerQuery) ||
          item.currentTeam?.school?.name?.toLowerCase().includes(lowerQuery) ||
          item.currentTeam?.name?.toLowerCase().includes(lowerQuery)
        );
      } else if (type === "coaches") {
        return (
          item.fullName?.toLowerCase().includes(lowerQuery) ||
          item.school?.name?.toLowerCase().includes(lowerQuery)
        );
      } else if (type === "schools") {
        return (
          item.name?.toLowerCase().includes(lowerQuery) ||
          item.location?.toLowerCase().includes(lowerQuery) ||
          item.motto?.toLowerCase().includes(lowerQuery)
        );
      }
      return false;
    });
  };

  // Teams Table Component
  const TeamsTable = () => {
    const allTeams = teamsData ? sortTeamsByPoints(teamsData) : [];
    const teams = filterData(allTeams, searchQuery, "teams");
    const isLoading = teamsLoading;

    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      );
    }

    if (teams.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No teams found in this tier.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold">Rank</th>
                      <th className="text-left p-4 font-semibold">Team</th>
                      <th className="text-left p-4 font-semibold">School</th>
                      <th className="text-center p-4 font-semibold">P</th>
                      <th className="text-center p-4 font-semibold">W</th>
                      <th className="text-center p-4 font-semibold">L</th>
                      <th className="text-right p-4 font-semibold">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team: any, index: number) => {
                      const played = team.wins + team.draws + team.losses;
                      const isTop3 = index < 3;
                      
                      return (
                        <tr
                          key={team.id}
                          className={`border-b hover:bg-muted/30 transition-colors ${
                            isTop3 ? getRankGlow(index) : ""
                          }`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getRankIcon(index)}
                            </div>
                          </td>
                          <td className="p-4">
                            <Link
                              to={`/teams/${team.id}`}
                              className="hover:text-primary font-semibold"
                            >
                              {team.name}
                            </Link>
                            {team.captain && (
                              <div className="text-xs text-muted-foreground">
                                {team.captain.fullName}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/schools/${team.school?.id || ''}`}
                                className="hover:text-primary"
                              >
                                {team.school?.name || "Independent"}
                              </Link>
                              {(team.tier || team.school?.tier) && (
                                <Badge className={getTierColor(team.tier || team.school?.tier)}>
                                  {((team.tier || team.school?.tier)?.charAt(0).toUpperCase() + (team.tier || team.school?.tier)?.slice(1))}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">{played}</td>
                          <td className="p-4 text-center text-green-600 font-semibold">{team.wins}</td>
                          <td className="p-4 text-center text-red-600">{team.losses}</td>
                          <td className="p-4 text-right">
                            <span className="font-bold text-primary text-lg">{team.points}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {teams.map((team: any, index: number) => {
            const played = team.wins + team.draws + team.losses;
            const isTop3 = index < 3;
            
            return (
              <div key={team.id}>
                <Card
                  className={`hover:shadow-lg transition-all cursor-pointer ${
                    isTop3 ? getRankGlow(index) : ""
                  }`}
                  onClick={() => navigate(`/teams/${team.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getRankIcon(index)}
                        <div>
                          <div className="font-semibold">{team.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {team.school?.name || "Independent"}
                          </div>
                        </div>
                      </div>
                      <Badge className={getTierColor(team.tier || team.school?.tier)}>
                        {((team.tier || team.school?.tier)?.charAt(0).toUpperCase() + (team.tier || team.school?.tier)?.slice(1))}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center pt-3 border-t">
                      <div>
                        <div className="text-lg font-bold">{team.points}</div>
                        <div className="text-xs text-muted-foreground">Points</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">{team.wins}</div>
                        <div className="text-xs text-muted-foreground">Wins</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-red-600">{team.losses}</div>
                        <div className="text-xs text-muted-foreground">Losses</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{played}</div>
                        <div className="text-xs text-muted-foreground">Played</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // Students Table Component
  const StudentsTable = () => {
    const allStudents = studentsData || [];
    const students = filterData(allStudents, searchQuery, "students");
    const isLoading = studentsLoading;

    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      );
    }

    if (students.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No students found.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold">Rank</th>
                      <th className="text-left p-4 font-semibold">Player</th>
                      <th className="text-left p-4 font-semibold">School</th>
                      <th className="text-left p-4 font-semibold">Team</th>
                      <th className="text-right p-4 font-semibold">Total Points</th>
                      <th className="text-center p-4 font-semibold">Awards</th>
                      <th className="text-right p-4 font-semibold">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student: any, index: number) => {
                      const isTop3 = index < 3;
                      
                      return (
                        <tr
                          key={student.id}
                          className={`border-b hover:bg-muted/30 transition-colors ${
                            isTop3 ? getRankGlow(index) : ""
                          }`}
                        >
                          <td className="p-4">{getRankIcon(index)}</td>
                          <td className="p-4">
                            <Link
                              to={`/players/${student.id}`}
                              className="hover:text-primary font-semibold"
                            >
                              {student.fullName}
                            </Link>
                            {student.studentRole && (
                              <div className="text-xs text-muted-foreground">
                                {student.studentRole}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {student.currentTeam?.school?.name || "N/A"}
                          </td>
                          <td className="p-4">
                            {student.currentTeam?.name || "N/A"}
                          </td>
                          <td className="p-4 text-right font-bold text-primary">
                            {student.totalPoints || student.xp || 0}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex gap-1 justify-center">
                              {isTop3 && <Medal className="h-4 w-4 text-yellow-500" />}
                              {student.totalWins > 10 && <Award className="h-4 w-4 text-blue-500" />}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold">
                                {Math.round((student.totalPoints || student.xp || 0) / 10)}
                              </span>
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
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {students.map((student: any, index: number) => {
            const isTop3 = index < 3;
            
            return (
              <div key={student.id}>
                <Card
                  className={`hover:shadow-lg transition-all cursor-pointer ${
                    isTop3 ? getRankGlow(index) : ""
                  }`}
                  onClick={() => navigate(`/players/${student.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getRankIcon(index)}
                        <div>
                          <div className="font-semibold">{student.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            {student.currentTeam?.school?.name || "N/A"}
                          </div>
                        </div>
                      </div>
                      {student.studentRole && (
                        <Badge variant="outline">{student.studentRole}</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t">
                      <div>
                        <div className="text-lg font-bold text-primary">{student.totalPoints || student.xp || 0}</div>
                        <div className="text-xs text-muted-foreground">Points</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">{student.totalWins || 0}</div>
                        <div className="text-xs text-muted-foreground">Wins</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{student.matchesPlayed || 0}</div>
                        <div className="text-xs text-muted-foreground">Matches</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // Coaches Table Component
  const CoachesTable = () => {
    const allCoaches = coachesData || [];
    const coaches = filterData(allCoaches, searchQuery, "coaches");
    const isLoading = coachesLoading;

    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading coaches...</p>
        </div>
      );
    }

    if (coaches.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No coaches found.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold">Rank</th>
                      <th className="text-left p-4 font-semibold">Coach</th>
                      <th className="text-left p-4 font-semibold">School</th>
                      <th className="text-center p-4 font-semibold">Teams</th>
                      <th className="text-center p-4 font-semibold">Wins</th>
                      <th className="text-right p-4 font-semibold">Total Points</th>
                      <th className="text-right p-4 font-semibold">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coaches.map((coach: any, index: number) => {
                      const isTop3 = index < 3;
                      
                      return (
                        <tr
                          key={coach.id}
                          className={`border-b hover:bg-muted/30 transition-colors ${
                            isTop3 ? getRankGlow(index) : ""
                          }`}
                        >
                          <td className="p-4">{getRankIcon(index)}</td>
                          <td className="p-4">
                            <Link
                              to={`/coaches/${coach.id}`}
                              className="hover:text-primary font-semibold"
                            >
                              {coach.fullName}
                            </Link>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/schools/${coach.school?.id || ''}`}
                                className="hover:text-primary"
                              >
                                {coach.school?.name || "N/A"}
                              </Link>
                              {coach.school?.tier && (
                                <Badge className={getTierColor(coach.school.tier)}>
                                  {coach.school.tier.charAt(0).toUpperCase() + coach.school.tier.slice(1)}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">{coach.totalTeams || 0}</td>
                          <td className="p-4 text-center text-green-600 font-semibold">{coach.totalWins || 0}</td>
                          <td className="p-4 text-right font-bold text-primary">{coach.totalPoints || 0}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold">{coach.rating || 0}</span>
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
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {coaches.map((coach: any, index: number) => {
            const isTop3 = index < 3;
            
            return (
              <div key={coach.id}>
                <Card
                  className={`hover:shadow-lg transition-all cursor-pointer ${
                    isTop3 ? getRankGlow(index) : ""
                  }`}
                  onClick={() => navigate(`/coaches/${coach.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getRankIcon(index)}
                        <div>
                          <div className="font-semibold">{coach.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            {coach.school?.name || "N/A"}
                          </div>
                        </div>
                      </div>
                      {coach.school?.tier && (
                        <Badge className={getTierColor(coach.school.tier)}>
                          {coach.school.tier.charAt(0).toUpperCase() + coach.school.tier.slice(1)}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center pt-3 border-t">
                      <div>
                        <div className="text-lg font-bold text-primary">{coach.totalPoints || 0}</div>
                        <div className="text-xs text-muted-foreground">Points</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">{coach.totalWins || 0}</div>
                        <div className="text-xs text-muted-foreground">Wins</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{coach.totalTeams || 0}</div>
                        <div className="text-xs text-muted-foreground">Teams</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{coach.rating || 0}</div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // Schools Table Component
  const SchoolsTable = () => {
    const allSchools = schoolsData || [];
    const schools = filterData(allSchools, searchQuery, "schools");
    const isLoading = schoolsLoading;

    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading schools...</p>
        </div>
      );
    }

    if (schools.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No schools found.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold">Rank</th>
                      <th className="text-left p-4 font-semibold">School</th>
                      <th className="text-left p-4 font-semibold">Tier(s)</th>
                      <th className="text-center p-4 font-semibold">Teams</th>
                      <th className="text-center p-4 font-semibold">Wins</th>
                      <th className="text-right p-4 font-semibold">Total Points</th>
                      <th className="text-right p-4 font-semibold">National Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools.map((school: any, index: number) => {
                      const isTop3 = index < 3;
                      
                      return (
                        <tr
                          key={school.id}
                          className={`border-b hover:bg-muted/30 transition-colors ${
                            isTop3 ? getRankGlow(index) : ""
                          }`}
                        >
                          <td className="p-4">{getRankIcon(index)}</td>
                          <td className="p-4">
                            <Link
                              to={`/schools/${school.id}`}
                              className="hover:text-primary font-semibold"
                            >
                              {school.name}
                            </Link>
                            {school.location && (
                              <div className="text-xs text-muted-foreground">
                                {school.location}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {school.tiers?.map((tier: string) => (
                                <Badge key={tier} className={getTierColor(tier)}>
                                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-center">{school.totalTeams || 0}</td>
                          <td className="p-4 text-center text-green-600 font-semibold">{school.totalWins || 0}</td>
                          <td className="p-4 text-right font-bold text-primary">{school.totalPoints || 0}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold">{school.nationalRating || 0}</span>
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
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {schools.map((school: any, index: number) => {
            const isTop3 = index < 3;
            
            return (
              <div key={school.id}>
                <Card
                  className={`hover:shadow-lg transition-all cursor-pointer ${
                    isTop3 ? getRankGlow(index) : ""
                  }`}
                  onClick={() => navigate(`/schools/${school.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getRankIcon(index)}
                        <div>
                          <div className="font-semibold">{school.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {school.location || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {school.tiers?.slice(0, 2).map((tier: string) => (
                          <Badge key={tier} className={getTierColor(tier)}>
                            {tier.charAt(0).toUpperCase() + tier.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center pt-3 border-t">
                      <div>
                        <div className="text-lg font-bold text-primary">{school.totalPoints || 0}</div>
                        <div className="text-xs text-muted-foreground">Points</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">{school.totalWins || 0}</div>
                        <div className="text-xs text-muted-foreground">Wins</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{school.totalTeams || 0}</div>
                        <div className="text-xs text-muted-foreground">Teams</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{school.nationalRating || 0}</div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Leaderboards</h1>
              <p className="text-xl text-muted-foreground">
                Rankings across teams, students, coaches, and schools
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="amateur">Amateur</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="legendary">Legendary</SelectItem>
                  <SelectItem value="national">National</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LeaderboardType)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="teams" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Teams</span>
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Students</span>
              </TabsTrigger>
              <TabsTrigger value="coaches" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Coaches</span>
              </TabsTrigger>
              <TabsTrigger value="schools" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Schools</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teams" className="mt-0">
              <TeamsTable />
            </TabsContent>

            <TabsContent value="students" className="mt-0">
              <StudentsTable />
            </TabsContent>

            <TabsContent value="coaches" className="mt-0">
              <CoachesTable />
            </TabsContent>

            <TabsContent value="schools" className="mt-0">
              <SchoolsTable />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
