import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useMatchesStore from "@/store/useMatchesStore";
import { format } from "date-fns";
import { ArrowLeft, Clock, Calendar, Trophy, Users, Play, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentMatch, fetchMatchById, updateMatch, loading } = useMatchesStore();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    homeScore: 0,
    awayScore: 0,
    status: "scheduled",
  });

  useEffect(() => {
    if (id) {
      fetchMatchById(id);
    }
  }, [id, fetchMatchById]);

  const handleUpdate = async () => {
    if (!id) return;

    const result = await updateMatch(id, formData);
    if (result.success) {
      toast({
        title: "Success",
        description: "Match updated successfully",
      });
      setIsEditOpen(false);
      fetchMatchById(id);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update match",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      scheduled: { label: "Scheduled", color: "bg-blue-500", icon: Clock },
      in_progress: { label: "LIVE", color: "bg-red-500 animate-pulse", icon: Play },
      completed: { label: "Full Time", color: "bg-green-500", icon: CheckCircle },
      cancelled: { label: "Cancelled", color: "bg-gray-500", icon: Clock },
    };
    return statusConfig[status] || statusConfig.scheduled;
  };

  if (loading && !currentMatch) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Match not found</p>
              <Button onClick={() => navigate("/matches")} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Matches
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusBadge(currentMatch.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <Button variant="ghost" onClick={() => navigate("/matches")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Matches
        </Button>

        {/* Match Header */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <Badge className={`${statusConfig.color} text-[#1A1A1A] text-lg px-4 py-2`}>
                <StatusIcon className="mr-2 h-4 w-4" />
                {statusConfig.label}
              </Badge>
              <div className="text-right">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(currentMatch.scheduledAt), "EEEE, MMMM dd, yyyy")}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-4 w-4" />
                  {format(new Date(currentMatch.scheduledAt), "HH:mm")}
                </div>
              </div>
            </div>

            {/* Match Score */}
            <div className="grid grid-cols-3 gap-8 items-center mb-8">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {currentMatch.homeTeam?.name?.charAt(0) || "H"}
                </div>
                <h2 className="text-2xl font-bold">{currentMatch.homeTeam?.name || "Home Team"}</h2>
                {currentMatch.homeTeam?.school?.name && (
                  <p className="text-sm text-muted-foreground mt-1">{currentMatch.homeTeam.school.name}</p>
                )}
              </div>

              <div className="text-center">
                <div className="text-6xl font-bold mb-2">
                  {currentMatch.homeScore ?? 0} - {currentMatch.awayScore ?? 0}
                </div>
                {currentMatch.status === "completed" && currentMatch.winner && (
                  <div className="text-sm text-muted-foreground">
                    Winner: <span className="font-semibold">{currentMatch.winner.name}</span>
                  </div>
                )}
              </div>

              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {currentMatch.awayTeam?.name?.charAt(0) || "A"}
                </div>
                <h2 className="text-2xl font-bold">{currentMatch.awayTeam?.name || "Away Team"}</h2>
                {currentMatch.awayTeam?.school?.name && (
                  <p className="text-sm text-muted-foreground mt-1">{currentMatch.awayTeam.school.name}</p>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={() => {
                setFormData({
                  homeScore: currentMatch.homeScore || 0,
                  awayScore: currentMatch.awayScore || 0,
                  status: currentMatch.status,
                });
                setIsEditOpen(true);
              }}>
                Update Score
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>{currentMatch.homeTeam?.name || "Home Team"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Points</span>
                  <span className="font-bold">{currentMatch.homeTeam?.points || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wins</span>
                  <span className="font-semibold text-green-600">{currentMatch.homeTeam?.wins || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Draws</span>
                  <span className="font-semibold text-yellow-600">{currentMatch.homeTeam?.draws || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Losses</span>
                  <span className="font-semibold text-red-600">{currentMatch.homeTeam?.losses || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{currentMatch.awayTeam?.name || "Away Team"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Points</span>
                  <span className="font-bold">{currentMatch.awayTeam?.points || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wins</span>
                  <span className="font-semibold text-green-600">{currentMatch.awayTeam?.wins || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Draws</span>
                  <span className="font-semibold text-yellow-600">{currentMatch.awayTeam?.draws || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Losses</span>
                  <span className="font-semibold text-red-600">{currentMatch.awayTeam?.losses || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Update Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Match Score</DialogTitle>
              <DialogDescription>Update the match result and status</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Home Score</Label>
                  <Input
                    type="number"
                    value={formData.homeScore}
                    onChange={(e) => setFormData({ ...formData, homeScore: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Away Score</Label>
                  <Input
                    type="number"
                    value={formData.awayScore}
                    onChange={(e) => setFormData({ ...formData, awayScore: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdate} className="w-full" disabled={loading}>
                Update Match
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MatchDetail;

