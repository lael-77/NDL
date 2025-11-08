import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useMatchesStore from "@/store/useMatchesStore";
import { teamsApi } from "@/api/teams";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Plus, Play, Clock, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const Matches = () => {
  const navigate = useNavigate();
  const { matches, fetchMatches, createMatch, loading } = useMatchesStore();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    homeTeamId: "",
    awayTeamId: "",
    scheduledAt: "",
    status: "scheduled",
  });

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

  const handleCreate = async () => {
    const result = await createMatch({
      homeTeamId: formData.homeTeamId,
      awayTeamId: formData.awayTeamId,
      scheduledAt: formData.scheduledAt,
      status: formData.status,
    });

    if (result.success) {
      toast({
        title: "Success",
        description: "Match created successfully",
      });
      setIsCreateOpen(false);
      setFormData({
        homeTeamId: "",
        awayTeamId: "",
        scheduledAt: "",
        status: "scheduled",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create match",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      scheduled: { label: "Scheduled", color: "bg-blue-500", icon: Clock },
      in_progress: { label: "LIVE", color: "bg-red-500 animate-pulse", icon: Play },
      completed: { label: "FT", color: "bg-green-500", icon: CheckCircle },
      cancelled: { label: "Cancelled", color: "bg-gray-500", icon: XCircle },
    };
    return statusConfig[status] || statusConfig.scheduled;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">All Matches</h1>
            <p className="text-muted-foreground">View and manage all matches</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Match
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Match</DialogTitle>
                <DialogDescription>Schedule a new match between two teams</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Home Team</Label>
                  <Select value={formData.homeTeamId} onValueChange={(value) => setFormData({ ...formData, homeTeamId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select home team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams?.map((team: any) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Away Team</Label>
                  <Select value={formData.awayTeamId} onValueChange={(value) => setFormData({ ...formData, awayTeamId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select away team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams?.map((team: any) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Scheduled Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={loading}>
                  Create Match
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading && matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match: any) => {
              const statusConfig = getStatusBadge(match.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <Card 
                  key={match.id} 
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
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(match.scheduledAt), "MMM dd")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(match.scheduledAt), "HH:mm")}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {matches.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No matches found. Create your first match!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Matches;
