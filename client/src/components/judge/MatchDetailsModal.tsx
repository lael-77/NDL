import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Trophy,
  School,
  CheckCircle,
  XCircle,
  Building2,
  User,
  Award,
  Target,
} from "lucide-react";
import { format } from "date-fns";

interface MatchDetailsModalProps {
  match: any;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (matchId: string) => void;
  onDecline: (matchId: string) => void;
  isLoading?: boolean;
}

export const MatchDetailsModal = ({
  match,
  isOpen,
  onClose,
  onAccept,
  onDecline,
  isLoading = false,
}: MatchDetailsModalProps) => {
  if (!match) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-600";
      case "in_progress":
        return "bg-green-600";
      case "completed":
        return "bg-gray-600";
      case "cancelled":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const getJudgeStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-600";
      case "declined":
        return "bg-red-600";
      case "pending":
        return "bg-yellow-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-blue-600" />
            Match Details
          </DialogTitle>
          <DialogDescription className="text-base">
            Review all match information before accepting or declining
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Match Header */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-gray-800">
                  {match.homeTeam?.name || "Team A"} vs {match.awayTeam?.name || "Team B"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`${getJudgeStatusColor(match.judgeStatus || "pending")} text-white px-3 py-1`}>
                    {match.judgeStatus || "pending"}
                  </Badge>
                  <Badge className={`${getStatusColor(match.status)} text-white px-3 py-1`}>
                    {match.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Match Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold">Date & Time:</span>
                  <span>{format(new Date(match.scheduledAt), "EEEE, MMMM dd, yyyy 'at' HH:mm")}</span>
                </div>
                {match.arena && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">Arena:</span>
                    <span>{match.arena.name}</span>
                  </div>
                )}
                {match.arena?.school && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">Location:</span>
                    <span>{match.arena.school.name}</span>
                  </div>
                )}
                {match.arena?.school?.location && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">Address:</span>
                    <span>{match.arena.school.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Arena Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {match.arena && (
                  <>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-semibold">Capacity:</span>
                      <span>{match.arena.capacity || "N/A"} seats</span>
                    </div>
                    {match.arena.tier && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Trophy className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold">Tier:</span>
                        <Badge variant="outline">{match.arena.tier}</Badge>
                      </div>
                    )}
                    {match.arena.facilities && (
                      <div className="text-gray-700">
                        <span className="font-semibold">Facilities:</span>
                        <p className="text-sm mt-1 text-gray-600">{match.arena.facilities}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Teams Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Home Team */}
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-blue-600" />
                  Home Team: {match.homeTeam?.name || "Team A"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 mt-3">
                {match.homeTeam?.school && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <School className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">School:</span>
                    <span>{match.homeTeam.school.name}</span>
                  </div>
                )}
                {match.homeTeam?.tier && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Award className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">Tier:</span>
                    <Badge variant="outline">{match.homeTeam.tier}</Badge>
                  </div>
                )}
                {match.homeTeam?.school?.location && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">Location:</span>
                    <span>{match.homeTeam.school.location}</span>
                  </div>
                )}
                {match.homeTeam?.members && match.homeTeam.members.length > 0 && (
                  <div className="mt-3">
                    <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Team Members ({match.homeTeam.members.length})
                    </div>
                    <div className="space-y-1">
                      {match.homeTeam.members.slice(0, 5).map((member: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-3 w-3" />
                          <span>{member.player?.fullName || "Unknown"}</span>
                          {member.player?.studentRole && (
                            <Badge variant="outline" className="text-xs">
                              {member.player.studentRole}
                            </Badge>
                          )}
                        </div>
                      ))}
                      {match.homeTeam.members.length > 5 && (
                        <div className="text-xs text-gray-500 mt-1">
                          +{match.homeTeam.members.length - 5} more members
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {match.homeTeam?.points !== undefined && (
                  <div className="flex items-center gap-2 text-gray-700 mt-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">Team Stats:</span>
                    <span>Wins: {match.homeTeam.wins || 0} | Points: {match.homeTeam.points || 0}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Away Team */}
            <Card className="border-2 border-indigo-200">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-indigo-600" />
                  Away Team: {match.awayTeam?.name || "Team B"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 mt-3">
                {match.awayTeam?.school && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <School className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">School:</span>
                    <span>{match.awayTeam.school.name}</span>
                  </div>
                )}
                {match.awayTeam?.tier && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Award className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">Tier:</span>
                    <Badge variant="outline">{match.awayTeam.tier}</Badge>
                  </div>
                )}
                {match.awayTeam?.school?.location && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">Location:</span>
                    <span>{match.awayTeam.school.location}</span>
                  </div>
                )}
                {match.awayTeam?.members && match.awayTeam.members.length > 0 && (
                  <div className="mt-3">
                    <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Team Members ({match.awayTeam.members.length})
                    </div>
                    <div className="space-y-1">
                      {match.awayTeam.members.slice(0, 5).map((member: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-3 w-3" />
                          <span>{member.player?.fullName || "Unknown"}</span>
                          {member.player?.studentRole && (
                            <Badge variant="outline" className="text-xs">
                              {member.player.studentRole}
                            </Badge>
                          )}
                        </div>
                      ))}
                      {match.awayTeam.members.length > 5 && (
                        <div className="text-xs text-gray-500 mt-1">
                          +{match.awayTeam.members.length - 5} more members
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {match.awayTeam?.points !== undefined && (
                  <div className="flex items-center gap-2 text-gray-700 mt-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">Team Stats:</span>
                    <span>Wins: {match.awayTeam.wins || 0} | Points: {match.awayTeam.points || 0}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Judges Information */}
          {match.judges && match.judges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Assigned Judges ({match.judges.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {match.judges.map((judgeAssignment: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold">{judgeAssignment.judge?.fullName || "Unknown Judge"}</span>
                        {judgeAssignment.isMain && (
                          <Badge className="bg-purple-600 text-white text-xs">Main Judge</Badge>
                        )}
                      </div>
                      <Badge className={`${getJudgeStatusColor(judgeAssignment.status)} text-white`}>
                        {judgeAssignment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Action Buttons */}
          {match.judgeStatus === "pending" && (
            <div className="flex items-center justify-end gap-4 pt-4">
              <Button
                onClick={onClose}
                variant="outline"
                size="lg"
                disabled={isLoading}
              >
                Close
              </Button>
              <Button
                onClick={() => onDecline(match.id)}
                variant="destructive"
                size="lg"
                disabled={isLoading}
                className="shadow-lg"
              >
                <XCircle className="h-5 w-5 mr-2" />
                Decline Match
              </Button>
              <Button
                onClick={() => onAccept(match.id)}
                size="lg"
                disabled={isLoading}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Accept Match
              </Button>
            </div>
          )}

          {match.judgeStatus !== "pending" && (
            <div className="flex items-center justify-end pt-4">
              <Button
                onClick={onClose}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

