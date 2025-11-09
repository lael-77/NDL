import { motion } from "framer-motion";
import { MapPin, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "./GlassCard";
import { useQuery } from "@tanstack/react-query";
import axios from "@/api/axios";
import { format, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";

export const UpcomingArenas = () => {
  const { data: matches } = useQuery({
    queryKey: ["upcomingMatches"],
    queryFn: async () => {
      const response = await axios.get("/matches");
      return response.data;
    },
  });

  const upcomingMatches = matches
    ?.filter((m: any) => m.status === "scheduled" && new Date(m.scheduledAt) > new Date())
    .slice(0, 6) || [];

  const CountdownTimer = ({ date }: { date: Date }) => {
    const now = new Date();
    const days = differenceInDays(date, now);
    const hours = differenceInHours(date, now) % 24;
    const minutes = differenceInMinutes(date, now) % 60;

    return (
      <div className="flex items-center gap-2 text-2xl font-bold text-[#0077CC]">
        <span className="bg-white px-3 py-1 rounded border border-[#E0E0E0]">{String(days).padStart(2, "0")}d</span>
        <span>:</span>
        <span className="bg-white px-3 py-1 rounded border border-[#E0E0E0]">{String(hours).padStart(2, "0")}h</span>
        <span>:</span>
        <span className="bg-white px-3 py-1 rounded border border-[#E0E0E0]">{String(minutes).padStart(2, "0")}m</span>
      </div>
    );
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      beginner: "bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30",
      amateur: "bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30",
      intermediate: "bg-[#FACC15]/20 text-[#FACC15] border-[#FACC15]/30",
      regular: "bg-[#FACC15]/20 text-[#FACC15] border-[#FACC15]/30",
      advanced: "bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30",
      professional: "bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30",
      legendary: "bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30",
      national: "bg-[#E11D48]/20 text-[#E11D48] border-[#E11D48]/30",
    };
    return colors[tier?.toLowerCase()] || colors.beginner;
  };

  return (
    <section className="py-20 relative bg-[#F5F7FA] overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-5xl font-bold mb-4 text-[#1A1A1A]">Upcoming Arenas</h2>
          <p className="text-[#4A4A4A] text-lg">Next matches and venues</p>
        </motion.div>

        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {upcomingMatches.map((match: any, index: number) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex-shrink-0 w-[400px]"
            >
              <GlassCard>
                <div className="p-6">
                  {/* Arena Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#0077CC]" />
                        <span className="font-semibold">{match.arena?.name || "Arena"}</span>
                      </div>
                    {match.homeTeam?.tier && (
                      <Badge className={getTierColor(match.homeTeam.tier)}>
                        {match.homeTeam.tier}
                      </Badge>
                    )}
                  </div>

                  {/* Teams */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold">
                          {match.homeTeam?.name?.charAt(0) || "H"}
                        </div>
                        <span className="font-semibold">{match.homeTeam?.name || "Home Team"}</span>
                      </div>
                    </div>
                    <div className="text-center text-muted-foreground">VS</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold">
                          {match.awayTeam?.name?.charAt(0) || "A"}
                        </div>
                        <span className="font-semibold">{match.awayTeam?.name || "Away Team"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Countdown */}
                  <div className="border-t border-[#E0E0E0] pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-[#4A4A4A]" />
                      <span className="text-sm text-[#4A4A4A]">
                        {format(new Date(match.scheduledAt), "EEEE, MMM dd, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <CountdownTimer date={new Date(match.scheduledAt)} />
                  </div>

                  {/* Location */}
                  {match.arena?.school?.location && (
                    <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
                      <div className="flex items-center gap-2 text-sm text-[#4A4A4A]">
                        <MapPin className="h-4 w-4" />
                        {match.arena.school.location}
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

