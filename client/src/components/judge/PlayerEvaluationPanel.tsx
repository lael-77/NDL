import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";

interface Player {
  id: string;
  fullName: string;
  studentRole?: string;
}

interface PlayerEvaluationPanelProps {
  teamId: string;
  teamName: string;
  players: Player[];
  scores?: Record<string, {
    rolePerformance: number;
    initiative: number;
    technicalMastery: number;
    creativity: number;
    collaboration: number;
    notes?: string;
  }>;
  onSubmit: (playerId: string, scores: any, notes: string) => void;
}

const playerCriteriaWeights = {
  rolePerformance: 0.30,
  initiative: 0.20,
  technicalMastery: 0.25,
  creativity: 0.15,
  collaboration: 0.10,
};

export const PlayerEvaluationPanel = ({
  teamId,
  teamName,
  players,
  scores = {},
  onSubmit,
}: PlayerEvaluationPanelProps) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0]?.id || "");
  const [playerScores, setPlayerScores] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    players.forEach((player) => {
      initial[player.id] = scores[player.id] || {
        rolePerformance: 0,
        initiative: 0,
        technicalMastery: 0,
        creativity: 0,
        collaboration: 0,
        notes: "",
      };
    });
    return initial;
  });

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);
  const currentScores = playerScores[selectedPlayerId] || {
    rolePerformance: 0,
    initiative: 0,
    technicalMastery: 0,
    creativity: 0,
    collaboration: 0,
    notes: "",
  };

  const calculateWeightedScore = (playerId: string) => {
    const ps = playerScores[playerId];
    return Object.entries(playerCriteriaWeights).reduce((sum, [key, weight]) => {
      return sum + (ps[key as keyof typeof ps] * weight * 10);
    }, 0);
  };

  const handleScoreChange = (criterion: string, value: number[]) => {
    setPlayerScores((prev) => ({
      ...prev,
      [selectedPlayerId]: {
        ...prev[selectedPlayerId],
        [criterion]: value[0],
      },
    }));
  };

  const handleNotesChange = (notes: string) => {
    setPlayerScores((prev) => ({
      ...prev,
      [selectedPlayerId]: {
        ...prev[selectedPlayerId],
        notes,
      },
    }));
  };

  const handleSubmit = () => {
    const playerScore = playerScores[selectedPlayerId];
    onSubmit(selectedPlayerId, {
      rolePerformance: playerScore.rolePerformance,
      initiative: playerScore.initiative,
      technicalMastery: playerScore.technicalMastery,
      creativity: playerScore.creativity,
      collaboration: playerScore.collaboration,
    }, playerScore.notes || "");
  };

  return (
    <Card className="bg-white border-[#E0E0E0]">
      <CardHeader>
        <CardTitle className="text-[#1A1A1A]">Individual Player Evaluation</CardTitle>
        <CardDescription className="text-[#4A4A4A]">Rate each player in {teamName}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {players.map((player) => (
              <TabsTrigger key={player.id} value={player.id} className="text-xs">
                {player.fullName.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {players.map((player) => (
            <TabsContent key={player.id} value={player.id} className="space-y-4">
              <div className="p-3 bg-[#F5F7FA] rounded-lg">
                <div className="font-semibold text-[#1A1A1A]">{player.fullName}</div>
                <div className="text-sm text-[#4A4A4A]">
                  Role: {player.studentRole || "Player"}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[#1A1A1A]">Role Performance (30%)</Label>
                    <span className="text-sm font-semibold text-[#0077CC]">
                      {playerScores[player.id]?.rolePerformance || 0}/10
                    </span>
                  </div>
                  <Slider
                    value={[playerScores[player.id]?.rolePerformance || 0]}
                    onValueChange={(value) => handleScoreChange("rolePerformance", value)}
                    max={10}
                    min={0}
                    step={0.5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[#1A1A1A]">Initiative & Leadership (20%)</Label>
                    <span className="text-sm font-semibold text-[#0077CC]">
                      {playerScores[player.id]?.initiative || 0}/10
                    </span>
                  </div>
                  <Slider
                    value={[playerScores[player.id]?.initiative || 0]}
                    onValueChange={(value) => handleScoreChange("initiative", value)}
                    max={10}
                    min={0}
                    step={0.5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[#1A1A1A]">Technical Mastery (25%)</Label>
                    <span className="text-sm font-semibold text-[#0077CC]">
                      {playerScores[player.id]?.technicalMastery || 0}/10
                    </span>
                  </div>
                  <Slider
                    value={[playerScores[player.id]?.technicalMastery || 0]}
                    onValueChange={(value) => handleScoreChange("technicalMastery", value)}
                    max={10}
                    min={0}
                    step={0.5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[#1A1A1A]">Creativity (15%)</Label>
                    <span className="text-sm font-semibold text-[#0077CC]">
                      {playerScores[player.id]?.creativity || 0}/10
                    </span>
                  </div>
                  <Slider
                    value={[playerScores[player.id]?.creativity || 0]}
                    onValueChange={(value) => handleScoreChange("creativity", value)}
                    max={10}
                    min={0}
                    step={0.5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[#1A1A1A]">Team Collaboration (10%)</Label>
                    <span className="text-sm font-semibold text-[#0077CC]">
                      {playerScores[player.id]?.collaboration || 0}/10
                    </span>
                  </div>
                  <Slider
                    value={[playerScores[player.id]?.collaboration || 0]}
                    onValueChange={(value) => handleScoreChange("collaboration", value)}
                    max={10}
                    min={0}
                    step={0.5}
                  />
                </div>
              </div>

              <div>
                <Label className="text-[#1A1A1A]">Notes</Label>
                <Textarea
                  value={playerScores[player.id]?.notes || ""}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Add notes about this player's performance..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="p-4 bg-[#0077CC]/10 rounded-lg border border-[#0077CC]/20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1A1A1A]">Weighted Total Score</span>
                  <span className="text-2xl font-bold text-[#0077CC]">
                    {calculateWeightedScore(player.id).toFixed(1)}/100
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-[#0077CC] hover:bg-[#005FA3]"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Player Scores
              </Button>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

