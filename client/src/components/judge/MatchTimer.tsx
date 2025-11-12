import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Clock } from "lucide-react";
import { format } from "date-fns";

interface MatchTimerProps {
  matchId: string;
  timer?: {
    isRunning: boolean;
    elapsedSeconds: number;
    duration: number;
    halfDuration?: number;
    currentHalf?: number;
    halftimeStatus?: string;
    startTime?: string;
    pausedAt?: string;
  };
  onStart: (duration?: number) => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
}

export const MatchTimer = ({
  matchId,
  timer,
  onStart,
  onPause,
  onResume,
  onEnd,
}: MatchTimerProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState<45 | 60>(60);

  useEffect(() => {
    if (!timer) {
      setCurrentTime(0);
      return;
    }

    if (timer.isRunning && timer.startTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const start = new Date(timer.startTime!);
        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000) + timer.elapsedSeconds;
        setCurrentTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCurrentTime(timer.elapsedSeconds);
    }
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const halfDuration = timer?.halfDuration || (selectedDuration * 60);
  const totalDuration = timer?.duration || (selectedDuration * 60 * 2);
  const currentHalf = timer?.currentHalf || 1;
  const halftimeStatus = timer?.halftimeStatus;
  
  // Calculate time in current half
  const timeInHalf = currentHalf === 1 
    ? currentTime 
    : Math.max(0, currentTime - halfDuration);
  
  const remainingInHalf = Math.max(0, halfDuration - timeInHalf);
  const remainingTime = Math.max(0, totalDuration - currentTime);
  const progress = timer ? (currentTime / totalDuration) * 100 : 0;
  const halfProgress = timer ? (timeInHalf / halfDuration) * 100 : 0;

  // Auto-detect halftime
  const isHalftime = !timer?.isRunning && halftimeStatus === "halftime";
  const isFirstHalf = currentHalf === 1 && timeInHalf < halfDuration;
  const isSecondHalf = currentHalf === 2;

  return (
    <Card className="sticky top-[137px] z-30 bg-white/95 backdrop-blur-sm border-2 border-[#0077CC]/20 shadow-md">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Match Duration Selector (only before start) */}
          {!timer && (
            <div className="flex items-center gap-4 pb-3 border-b border-[#E0E0E0]">
              <span className="text-sm text-[#4A4A4A]">Match Duration:</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={selectedDuration === 45 ? "default" : "outline"}
                  onClick={() => setSelectedDuration(45)}
                  className={selectedDuration === 45 ? "bg-[#0077CC]" : ""}
                >
                  45 min halves
                </Button>
                <Button
                  size="sm"
                  variant={selectedDuration === 60 ? "default" : "outline"}
                  onClick={() => setSelectedDuration(60)}
                  className={selectedDuration === 60 ? "bg-[#0077CC]" : ""}
                >
                  60 min halves
                </Button>
              </div>
            </div>
          )}

          {/* Timer Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#0077CC]" />
                <div>
                  <div className="text-2xl font-bold text-[#0077CC]">
                    {formatTime(currentTime)}
                  </div>
                  <div className="text-xs text-[#4A4A4A]">
                    Remaining: {formatTime(remainingTime)}
                  </div>
                </div>
              </div>

              {/* Half Indicator */}
              {timer && (
                <div className="flex flex-col items-center gap-1">
                  <Badge 
                    variant={isHalftime ? "default" : "outline"}
                    className={isHalftime ? "bg-[#FACC15] text-[#1A1A1A]" : ""}
                  >
                    {isHalftime ? "HALFTIME" : `Half ${currentHalf}`}
                  </Badge>
                  <div className="text-xs text-[#4A4A4A]">
                    {formatTime(timeInHalf)} / {formatTime(halfDuration)}
                  </div>
                </div>
              )}

              {/* Progress Bars */}
              <div className="flex flex-col gap-1">
                <div className="w-32 h-2 bg-[#E0E0E0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0077CC] transition-all duration-1000"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
                {timer && (
                  <div className="w-32 h-1 bg-[#E0E0E0] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        currentHalf === 1 ? "bg-[#22C55E]" : "bg-[#FACC15]"
                      }`}
                      style={{ width: `${Math.min(100, halfProgress)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              {!timer || !timer.isRunning ? (
                timer ? (
                  <Button onClick={onResume} size="sm" className="bg-[#0077CC] hover:bg-[#005FA3]">
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                ) : (
                  <Button 
                    onClick={() => onStart(selectedDuration * 60 * 2)} 
                    size="sm" 
                    className="bg-[#0077CC] hover:bg-[#005FA3]"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Match
                  </Button>
                )
              ) : (
                <Button onClick={onPause} size="sm" variant="outline" className="border-[#0077CC] text-[#0077CC]">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              {timer && (
                <Button onClick={onEnd} size="sm" variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  End Match
                </Button>
              )}
            </div>
          </div>

          {/* Halftime Status */}
          {isHalftime && (
            <div className="mt-2 p-2 bg-[#FACC15]/10 border border-[#FACC15] rounded text-center">
              <p className="text-sm font-semibold text-[#1A1A1A]">⏸️ Halftime Break</p>
              <p className="text-xs text-[#4A4A4A]">Match paused for halftime</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
