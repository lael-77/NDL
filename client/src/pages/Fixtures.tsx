import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useMatchesStore from "@/store/useMatchesStore";
import { teamsApi } from "@/api/teams";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Calendar, Clock, Play, CheckCircle, List, Map, Plus, Building2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const Fixtures = () => {
  const navigate = useNavigate();
  const { matches, fetchMatches } = useMatchesStore();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await teamsApi.getAll();
      return response.data;
    },
  });

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      scheduled: { label: "Scheduled", color: "bg-blue-500", icon: Clock },
      in_progress: { label: "LIVE", color: "bg-red-500 animate-pulse", icon: Play },
      completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
      cancelled: { label: "Cancelled", color: "bg-gray-500", icon: Clock },
    };
    return statusConfig[status] || statusConfig.scheduled;
  };

  const filteredMatches = selectedStatus === "all" 
    ? matches 
    : matches.filter((m: any) => m.status === selectedStatus);

  // Mock arenas data - replace with actual API call
  const arenas = [
    { id: "1", name: "Green Hills Academy", location: "Kigali, Rwanda", capacity: 500, tier: "national" },
    { id: "2", name: "Kigali International School", location: "Kigali, Rwanda", capacity: 300, tier: "regional" },
    { id: "3", name: "APAPER School", location: "Kigali, Rwanda", capacity: 200, tier: "advanced" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Fixtures & Arenas</h1>
              <p className="text-muted-foreground">View scheduled matches and explore hosting arenas</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
              >
                <List className="mr-2 h-4 w-4" />
                List View
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                onClick={() => setViewMode("map")}
              >
                <Map className="mr-2 h-4 w-4" />
                Map View
              </Button>
            </div>
          </div>

          <Tabs defaultValue="fixtures" className="space-y-6">
            <TabsList>
              <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
              <TabsTrigger value="arenas">Arenas</TabsTrigger>
            </TabsList>

            <TabsContent value="fixtures" className="space-y-6">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus("all")}
                >
                  All
                </Button>
                <Button
                  variant={selectedStatus === "scheduled" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus("scheduled")}
                >
                  Scheduled
                </Button>
                <Button
                  variant={selectedStatus === "in_progress" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus("in_progress")}
                >
                  Live
                </Button>
                <Button
                  variant={selectedStatus === "completed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus("completed")}
                >
                  Completed
                </Button>
              </div>

              {viewMode === "list" ? (
                <div className="space-y-3">
                  {filteredMatches.map((match: any, index: number) => {
                    const statusConfig = getStatusBadge(match.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50"
                          onClick={() => navigate(`/matches/${match.id}`)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <Badge className={`${statusConfig.color} text-white`}>
                                  <StatusIcon className="mr-1 h-3 w-3" />
                                  {statusConfig.label}
                                </Badge>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                                        {match.homeTeam?.name?.charAt(0) || "H"}
                                      </div>
                                      <span className="font-semibold">{match.homeTeam?.name || "Home Team"}</span>
                                    </div>
                                    <span className="text-2xl font-bold">
                                      {match.homeScore ?? "-"}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                                        {match.awayTeam?.name?.charAt(0) || "A"}
                                      </div>
                                      <span className="font-semibold">{match.awayTeam?.name || "Away Team"}</span>
                                    </div>
                                    <span className="text-2xl font-bold">
                                      {match.awayScore ?? "-"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {format(new Date(match.scheduledAt), "MMM dd")}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <Clock className="h-4 w-4" />
                                  {format(new Date(match.scheduledAt), "HH:mm")}
                                </div>
                                {match.school?.location && (
                                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="h-4 w-4" />
                                    {match.school.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center py-12">
                      <Map className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Map view coming soon</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Interactive map showing match locations and arenas
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="arenas" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Hosting Arenas</CardTitle>
                      <CardDescription>Schools that host matches and competitions</CardDescription>
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Apply to Host
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {arenas.map((arena, index) => (
                      <motion.div
                        key={arena.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-lg transition-all">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-lg">{arena.name}</h3>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                  <MapPin className="h-4 w-4" />
                                  {arena.location}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Capacity</span>
                                <span className="font-semibold">{arena.capacity} seats</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Tier</span>
                                <Badge variant="outline" className="capitalize">
                                  {arena.tier}
                                </Badge>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full mt-4">
                              View Details
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Fixtures;

