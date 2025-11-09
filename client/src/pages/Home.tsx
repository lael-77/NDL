import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { AnimatedTicker } from "@/components/AnimatedTicker";
import { StandingsSection } from "@/components/StandingsSection";
import { UpcomingArenas } from "@/components/UpcomingArenas";
import { AcademySpotlight } from "@/components/AcademySpotlight";
import { HallOfFame } from "@/components/HallOfFame";
import { SponsorsCarousel } from "@/components/SponsorsCarousel";
import { leaderboardApi } from "@/api/leaderboard";
import { useQuery } from "@tanstack/react-query";
import { initSocket } from "@/lib/socket";
import useAuthStore from "@/store/useAuthStore";
import { sortTeamsByTierAndPoints } from "@/lib/sortTeams";

const Home = () => {
  const { isAuthenticated, user } = useAuthStore();

  const { data: leaderboardRaw, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const response = await leaderboardApi.getGlobal();
      return response.data;
    },
    retry: 3,
    refetchOnWindowFocus: true,
  });

  // Sort leaderboard by tier priority and points
  const leaderboard = leaderboardRaw ? sortTeamsByTierAndPoints(leaderboardRaw) : [];

  useEffect(() => {
    // Initialize socket connection (optional - fails gracefully if server doesn't support it)
    if (isAuthenticated && user) {
      try {
        const token = localStorage.getItem("token");
        initSocket(token || undefined);
      } catch (error) {
        // Socket.io is optional, continue without it
        console.warn("Socket.io not available, continuing without real-time updates");
      }
    }
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Animated Ticker */}
      <AnimatedTicker />

      {/* Standings Section */}
      {!leaderboardLoading && leaderboard && leaderboard.length > 0 && (
        <StandingsSection leaderboard={leaderboard} />
      )}

      {/* Upcoming Arenas */}
      <UpcomingArenas />

      {/* Academy Spotlight */}
      <AcademySpotlight />

      {/* Hall of Fame */}
      <HallOfFame />

      {/* Sponsors Carousel */}
      <SponsorsCarousel />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
