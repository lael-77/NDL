import { motion } from "framer-motion";
import { Trophy, Medal, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "./GlassCard";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface StandingsSectionProps {
  leaderboard: any[];
}

const tierConfig = {
  beginner: {
    color: "text-[#22C55E]",
    bgColor: "bg-[#22C55E]",
    glow: "glow-beginner",
    label: "Beginner",
  },
  amateur: {
    color: "text-[#22C55E]",
    bgColor: "bg-[#22C55E]",
    glow: "glow-beginner",
    label: "Amateur",
  },
  intermediate: {
    color: "text-[#FACC15]",
    bgColor: "bg-[#FACC15]",
    glow: "glow-intermediate",
    label: "Intermediate",
  },
  regular: {
    color: "text-[#FACC15]",
    bgColor: "bg-[#FACC15]",
    glow: "glow-intermediate",
    label: "Regular",
  },
  advanced: {
    color: "text-[#3B82F6]",
    bgColor: "bg-[#3B82F6]",
    glow: "glow-advanced",
    label: "Advanced",
  },
  professional: {
    color: "text-[#3B82F6]",
    bgColor: "bg-[#3B82F6]",
    glow: "glow-advanced",
    label: "Professional",
  },
  legendary: {
    color: "text-[#3B82F6]",
    bgColor: "bg-[#3B82F6]",
    glow: "glow-advanced",
    label: "Legendary",
  },
  national: {
    color: "text-[#E11D48]",
    bgColor: "bg-[#E11D48]",
    glow: "glow-national",
    label: "National",
  },
};

export const StandingsSection = ({ leaderboard }: StandingsSectionProps) => {
  const navigate = useNavigate();
  const [showViewAll, setShowViewAll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const threshold = 100; // Show button when 100px from bottom

      setShowViewAll(scrollPosition >= documentHeight - threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tierOrder = ["national", "legendary", "professional", "regular", "amateur", "beginner"];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="h-6 w-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-300" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-400" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <section className="py-20 relative bg-[#F5F7FA]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-5xl font-bold mb-4 relative inline-block">
            <span className="text-[#1A1A1A]">Standings</span>
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#002B5C] to-[#0077CC] rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </h2>
          <p className="text-[#4A4A4A] text-lg mt-4">
            Top teams competing across all tiers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tierOrder.map((tier, tierIndex) => {
            const config = tierConfig[tier as keyof typeof tierConfig];
            const tierTeams = leaderboard
              .filter((team: any) => {
                const teamTier = (team.tier || team.school?.tier)?.toLowerCase();
                return teamTier === tier;
              })
              .sort((a: any, b: any) => b.points - a.points)
              .slice(0, 3);

            if (tierTeams.length === 0) return null;

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: tierIndex * 0.1 }}
              >
                <GlassCard hover>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Trophy className={`h-5 w-5 ${config.color}`} />
                        <h3 className={`text-xl font-bold ${config.color}`}>
                          {config.label} Tier
                        </h3>
                      </div>
                      <Badge variant="outline" className={`${config.glow} border-[#E0E0E0]`}>
                        {tierTeams.length} teams
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {tierTeams.map((team: any, index: number) => (
                        <motion.div
                          key={team.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-card/30 hover:bg-card/50 transition-all cursor-pointer group"
                          whileHover={{ scale: 1.02 }}
                          onClick={() => navigate(`/teams/${team.id}`)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {getRankIcon(index + 1)}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold truncate">{team.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {team.school?.name || "School"}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[#0077CC]">{team.points || 0}</div>
                            <div className="text-xs text-[#4A4A4A]">pts</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full mt-4 group"
                      onClick={() => navigate("/leaderboard")}
                    >
                      View Full Table
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Floating View All Button */}
        {showViewAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <Button
              size="lg"
              className="bg-[#0077CC] hover:bg-[#005FA3] text-white border-0 shadow-lg"
              onClick={() => navigate("/leaderboard")}
            >
              <Trophy className="mr-2 h-5 w-5" />
              View Full Standings
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

