import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PlayerDashboard from "./pages/PlayerDashboard";
import CoachDashboard from "./pages/CoachDashboard";
import SchoolAdminDashboard from "./pages/SchoolAdminDashboard";
import SchoolAdminStudents from "./pages/SchoolAdminStudents";
import SchoolAdminTeams from "./pages/SchoolAdminTeams";
import SchoolAdminSettings from "./pages/SchoolAdminSettings";
import CreateStudent from "./pages/CreateStudent";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSubdomainRoute from "./components/AdminSubdomainRoute";
import JudgePanel from "./pages/JudgePanel";
import SponsorDashboard from "./pages/SponsorDashboard";
import Leaderboard from "./pages/Leaderboard";
import Matches from "./pages/Matches";
import MatchDetail from "./pages/MatchDetail";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import Fixtures from "./pages/Fixtures";
import League from "./pages/League";
import PlayerProfile from "./pages/PlayerProfile";
import Academy from "./pages/Academy";
import Archive from "./pages/Archive";
import Contact from "./pages/Contact";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Refetch when user returns to the tab
      refetchInterval: false, // Disable automatic polling - use WebSocket for real-time updates
      staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes (reduced for better UX)
      cacheTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
      refetchOnMount: true, // Always fetch data on mount (needed for initial load)
      refetchOnReconnect: true, // Refetch when reconnecting to network
      retry: 1, // Retry failed requests once
      retryDelay: 1000, // Wait 1 second before retrying
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/player" element={<PlayerDashboard />} />
          <Route path="/coach" element={<CoachDashboard />} />
          <Route path="/school-admin" element={<SchoolAdminDashboard />} />
          <Route path="/school-admin/students" element={<SchoolAdminStudents />} />
          <Route path="/school-admin/students/new" element={<CreateStudent />} />
          <Route path="/school-admin/teams" element={<SchoolAdminTeams />} />
          <Route path="/school-admin/settings" element={<SchoolAdminSettings />} />
          <Route path="/admin" element={<AdminSubdomainRoute />} />
          <Route path="/judge" element={<JudgePanel />} />
          <Route path="/sponsor" element={<SponsorDashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:id" element={<MatchDetail />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id" element={<TeamDetail />} />
          <Route path="/fixtures" element={<Fixtures />} />
          <Route path="/league" element={<League />} />
          <Route path="/players/:id" element={<PlayerProfile />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/hall-of-fame" element={<Archive />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
