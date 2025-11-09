import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "@/api/axios";
import { format } from "date-fns";

export const AnimatedTicker = () => {
  const { data: matches } = useQuery({
    queryKey: ["nextMatches"],
    queryFn: async () => {
      const response = await axios.get("/matches");
      return response.data;
    },
  });

  const [tickerItems, setTickerItems] = useState<string[]>([]);

  useEffect(() => {
    if (matches && matches.length > 0) {
      const upcoming = matches
        .filter((m: any) => m.status === "scheduled" && new Date(m.scheduledAt) > new Date())
        .slice(0, 5);

      if (upcoming.length > 0) {
        const items = upcoming.map((match: any) => {
          const date = format(new Date(match.scheduledAt), "EEEE MMM dd 'at' h:mm a");
          return `Next Match: ${match.homeTeam?.name || "Team A"} vs ${match.awayTeam?.name || "Team B"} | ${date} | ${match.arena?.name || "Arena"}`;
        });

        // Duplicate items for seamless loop
        setTickerItems([...items, ...items]);
      } else {
        setTickerItems([
          "Next Match: Green Hills vs Riviera | Saturday 3PM | Arena Kigali",
          "Next Match: Saint Andre vs International | Sunday 2PM | Arena Bugesera",
        ]);
      }
    } else {
      setTickerItems([
        "Next Match: Green Hills vs Riviera | Saturday 3PM | Arena Kigali",
        "Next Match: Saint Andre vs International | Sunday 2PM | Arena Bugesera",
      ]);
    }
  }, [matches]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#0077CC]/20 via-[#0077CC]/10 to-[#0077CC]/20 border-y border-[#0077CC]/30">
      <div className="flex whitespace-nowrap">
        <motion.div
          className="flex"
          animate={{
            x: [0, -50 + "%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {tickerItems.map((item, index) => (
            <div key={index} className="px-8 py-2 text-sm font-medium text-[#002B5C]">
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

