import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const Leaderboard = () => {
  const { data: teams, isLoading } = useQuery({
    queryKey: ["teams-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select(`
          *,
          school:schools(name, tier)
        `)
        .order("points", { ascending: false })
        .order("wins", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getTierColor = (tier: string) => {
    const colors = {
      beginner: "bg-muted",
      intermediate: "bg-success/20 text-success",
      advanced: "bg-info/20 text-info",
      regional: "bg-warning/20 text-warning",
      national: "bg-destructive/20 text-destructive",
    };
    return colors[tier as keyof typeof colors] || colors.beginner;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Global Leaderboard</h1>
          <p className="text-xl text-muted-foreground">
            Top teams competing across all tiers
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-4">
            {teams?.map((team, index) => (
              <Card key={team.id} className="p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-12 text-center">
                    {index < 3 ? (
                      <Trophy className={`h-8 w-8 mx-auto ${
                        index === 0 ? "text-warning" :
                        index === 1 ? "text-muted-foreground" :
                        "text-warning/60"
                      }`} />
                    ) : (
                      <span className="text-2xl font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{team.name}</h3>
                      <Badge className={getTierColor(team.school?.tier || "beginner")}>
                        {team.school?.tier || "N/A"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {team.school?.name || "Independent"}
                    </p>
                  </div>

                  <div className="flex items-center gap-8 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{team.points}</div>
                      <div className="text-xs text-muted-foreground">Points</div>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-lg font-semibold text-success">{team.wins}W</div>
                      <div className="text-xs text-muted-foreground">Wins</div>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-lg font-semibold text-muted-foreground">{team.draws}D</div>
                      <div className="text-xs text-muted-foreground">Draws</div>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-lg font-semibold text-destructive">{team.losses}L</div>
                      <div className="text-xs text-muted-foreground">Losses</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
