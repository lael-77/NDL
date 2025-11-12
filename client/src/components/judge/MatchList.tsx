import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Eye, Clock, Calendar, MapPin, Users, Trophy } from "lucide-react";
import { format } from "date-fns";

interface MatchListProps {
  matches: any[];
  onAccept: (matchId: string) => void;
  onDecline: (matchId: string) => void;
  onViewDetails: (matchId: string) => void;
  isLoading?: boolean;
}

export const MatchList = ({
  matches,
  onAccept,
  onDecline,
  onViewDetails,
  isLoading,
}: MatchListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading matches...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
        <Clock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 text-lg font-semibold mb-2">No matches assigned</p>
        <p className="text-gray-500 text-sm">You'll see matches here once they're assigned to you</p>
      </div>
    );
  }

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
    <div className="space-y-4">
      {matches.map((match) => (
        <Card
          key={match.id}
          className="bg-white border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                {/* Match Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-bold text-xl text-gray-800 mb-1">
                      {match.homeTeam?.name || "Team A"} vs {match.awayTeam?.name || "Team B"}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(match.scheduledAt), "MMM dd, yyyy HH:mm")}
                      </div>
                      {match.arena?.name && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {match.arena.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${getJudgeStatusColor(match.judgeStatus || "pending")} text-white px-3 py-1`}>
                    {match.judgeStatus || "pending"}
                  </Badge>
                  <Badge className={`${getStatusColor(match.status)} text-white px-3 py-1`}>
                    {match.status}
                  </Badge>
                  {match.homeTeam?.tier && (
                    <Badge variant="outline" className="px-3 py-1 border-gray-300 text-gray-700">
                      <Trophy className="h-3 w-3 mr-1" />
                      {match.homeTeam.tier}
                    </Badge>
                  )}
                  {match.isMainJudge && (
                    <Badge className="bg-purple-600 text-white px-3 py-1">
                      <Users className="h-3 w-3 mr-1" />
                      Main Judge
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {match.judgeStatus === "pending" && (
                  <>
                    <Button
                      onClick={() => onAccept(match.id)}
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => onDecline(match.id)}
                      size="lg"
                      variant="destructive"
                      className="shadow-lg"
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Decline
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => onViewDetails(match.id)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
