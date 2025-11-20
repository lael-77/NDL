import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getMatchForJudging } from "@/api/judge";
import { format } from "date-fns";

interface LiveMatchViewerProps {
  matchId: string;
  onClose?: () => void;
}

/**
 * Component for players to view live match progress
 * Connects judge dashboard with player dashboard
 */
export const LiveMatchViewer = ({ matchId, onClose }: LiveMatchViewerProps) => {
  const { data: match, isLoading } = useQuery({
    queryKey: ["live-match", matchId],
    queryFn: () => getMatchForJudging(matchId),
    enabled: !!matchId,
    refetchInterval: 5000, // Update every 5 seconds
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-[#0b0f19] to-[#1a1f2e] border-[#00ffc3]/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-[#00ffc3]/20 rounded w-3/4"></div>
            <div className="h-4 bg-[#00ffc3]/20 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!match) {
    return (
      <Card className="bg-gradient-to-br from-[#0b0f19] to-[#1a1f2e] border-red-500/20">
        <CardContent className="p-6">
          <p className="text-red-400">Match not found</p>
        </CardContent>
      </Card>
    );
  }

  const timer = match.timer;
  const isLive = match.status === "in_progress" && timer?.isRunning;

  return (
    <Card className="bg-gradient-to-br from-[#0b0f19] to-[#1a1f2e] border-[#00ffc3]/20 shadow-xl">
      <CardHeader className="border-b border-[#00ffc3]/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#00ffc3] text-xl">
            {match.homeTeam?.name} vs {match.awayTeam?.name}
          </CardTitle>
          {isLive && (
            <Badge className="bg-red-500 animate-pulse">
              🔴 LIVE
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Match Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Date</p>
            <p className="text-white">
              {format(new Date(match.scheduledAt), "MMM dd, yyyy HH:mm")}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Status</p>
            <Badge
              className={
                match.status === "in_progress"
                  ? "bg-green-500"
                  : match.status === "completed"
                  ? "bg-gray-500"
                  : "bg-blue-500"
              }
            >
              {match.status}
            </Badge>
          </div>
        </div>

        {/* Timer */}
        {timer && isLive && (
          <div className="bg-[#1a1f2e] p-4 rounded-lg border border-[#00ffc3]/20">
            <p className="text-gray-400 text-sm mb-2">Match Timer</p>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-[#00ffc3]">
                {formatTimer(timer)}
              </div>
              <Badge className="bg-[#00ffc3]/20 text-[#00ffc3]">
                {timer.halftimeStatus || "Running"}
              </Badge>
            </div>
          </div>
        )}

        {/* Scores */}
        {(match.homeScore !== null || match.awayScore !== null) && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a1f2e] p-4 rounded-lg border border-[#00ffc3]/20">
              <p className="text-gray-400 text-sm mb-1">{match.homeTeam?.name}</p>
              <p className="text-3xl font-bold text-[#00ffc3]">
                {match.homeScore ?? 0}
              </p>
            </div>
            <div className="bg-[#1a1f2e] p-4 rounded-lg border border-[#00ffc3]/20">
              <p className="text-gray-400 text-sm mb-1">{match.awayTeam?.name}</p>
              <p className="text-3xl font-bold text-[#00ffc3]">
                {match.awayScore ?? 0}
              </p>
            </div>
          </div>
        )}

        {/* Judges */}
        {match.judges && match.judges.length > 0 && (
          <div>
            <p className="text-gray-400 text-sm mb-2">Judges</p>
            <div className="flex flex-wrap gap-2">
              {match.judges.map((judge: any) => (
                <Badge
                  key={judge.judgeId}
                  className="bg-[#00ffc3]/20 text-[#00ffc3]"
                >
                  {judge.judge?.fullName || "Judge"}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {onClose && (
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-[#00ffc3]/50 text-[#00ffc3] hover:bg-[#00ffc3]/10"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Full Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const formatTimer = (timer: any): string => {
  if (!timer) return "00:00";

  const now = new Date();
  const startTime = timer.startTime ? new Date(timer.startTime) : now;
  const elapsed = timer.elapsedSeconds || 0;
  const currentElapsed = timer.isRunning
    ? Math.floor((now.getTime() - startTime.getTime()) / 1000) + elapsed
    : elapsed;

  const totalSeconds = timer.duration || 3600;
  const remaining = Math.max(0, totalSeconds - currentElapsed);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

