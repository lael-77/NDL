import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { teamsApi } from "@/api/teams";
import { useQuery } from "@tanstack/react-query";
import { Users, Plus, Trophy, TrendingUp, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Teams = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    schoolId: "",
    captainId: "",
    logoUrl: "",
  });

  const { data: teams, isLoading, refetch } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await teamsApi.getAll();
      return response.data;
    },
  });

  const handleCreate = async () => {
    try {
      await teamsApi.create(formData);
      toast({
        title: "Success",
        description: "Team created successfully",
      });
      setIsCreateOpen(false);
      setFormData({ name: "", schoolId: "", captainId: "", logoUrl: "" });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create team",
        variant: "destructive",
      });
    }
  };

  const getTierColor = (tier: string) => {
    const normalizedTier = tier?.toLowerCase() || 'beginner';
    const colors: Record<string, string> = {
      beginner: "bg-gray-100 text-gray-800",
      amateur: "bg-blue-100 text-blue-800",
      regular: "bg-green-100 text-green-800",
      professional: "bg-purple-100 text-purple-800",
      legendary: "bg-orange-100 text-orange-800",
      national: "bg-red-100 text-red-800",
    };
    return colors[normalizedTier] || colors.beginner;
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Teams</h1>
            <p className="text-muted-foreground">View all registered teams</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>Register a new team for the competition</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Team Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter team name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>School ID</Label>
                  <Input
                    value={formData.schoolId}
                    onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                    placeholder="Enter school ID (UUID)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Captain ID</Label>
                  <Input
                    value={formData.captainId}
                    onChange={(e) => setFormData({ ...formData, captainId: e.target.value })}
                    placeholder="Enter captain ID (UUID)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo URL (Optional)</Label>
                  <Input
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <Button onClick={handleCreate} className="w-full">
                  Create Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams?.map((team: any) => (
              <Card 
                key={team.id} 
                className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50"
                onClick={() => navigate(`/teams/${team.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">
                        {team.name?.charAt(0) || "T"}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <CardDescription>{team.school?.name || "No school"}</CardDescription>
                      </div>
                    </div>
                    {(team.tier || team.school?.tier) && (
                      <Badge className={getTierColor(team.tier || team.school?.tier)}>
                        {((team.tier || team.school?.tier)?.charAt(0).toUpperCase() + (team.tier || team.school?.tier)?.slice(1))}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="text-center flex-1">
                        <div className="text-2xl font-bold text-primary">{team.points}</div>
                        <div className="text-xs text-muted-foreground">Points</div>
                      </div>
                      <div className="h-12 w-px bg-border"></div>
                      <div className="text-center flex-1">
                        <div className="text-xl font-semibold">{team.wins + team.draws + team.losses}</div>
                        <div className="text-xs text-muted-foreground">Played</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-green-50 rounded">
                        <div className="text-lg font-semibold text-green-600">{team.wins}</div>
                        <div className="text-xs text-muted-foreground">Wins</div>
                      </div>
                      <div className="p-2 bg-yellow-50 rounded">
                        <div className="text-lg font-semibold text-yellow-600">{team.draws}</div>
                        <div className="text-xs text-muted-foreground">Draws</div>
                      </div>
                      <div className="p-2 bg-red-50 rounded">
                        <div className="text-lg font-semibold text-red-600">{team.losses}</div>
                        <div className="text-xs text-muted-foreground">Losses</div>
                      </div>
                    </div>

                    {team.captain && (
                      <div className="pt-2 border-t">
                        <div className="text-sm text-muted-foreground">Captain</div>
                        <div className="font-medium">{team.captain.fullName}</div>
                      </div>
                    )}

                    <Button variant="outline" className="w-full" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teams/${team.id}`);
                    }}>
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {teams && teams.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No teams found. Create your first team!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Teams;
