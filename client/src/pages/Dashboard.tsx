import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/useAuthStore";
import useMatchesStore from "@/store/useMatchesStore";
import { teamsApi } from "@/api/teams";
import { leaderboardApi } from "@/api/leaderboard";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Users, Calendar, TrendingUp, LogOut, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { matches, fetchMatches } = useMatchesStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    } else {
      // Redirect to role-specific dashboard
      const role = user?.role?.toLowerCase();
      // Check if on admin subdomain
      const hostname = window.location.hostname;
      const isAdminSubdomain = hostname.startsWith('admin.') || hostname === 'admin.localhost';
      
      if (role === "admin") {
        // Admin can access via /admin path (development) or subdomain (production)
        // For development, just use /admin path
        // For production with subdomain configured, it will work automatically
        navigate("/admin");
      } else if (role === "judge") {
        navigate("/judge");
      } else if (role === "player") {
        navigate("/player");
      } else if (role === "coach") {
        navigate("/coach");
      } else if (role === "school_admin" || role === "schooladmin") {
        navigate("/school-admin");
      } else if (role === "sponsor") {
        navigate("/sponsor");
      } else {
        // Default to player dashboard if role is unknown
        navigate("/player");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await teamsApi.getAll();
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const response = await leaderboardApi.getGlobal();
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.fullName || user?.email}!
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Registered teams</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matches?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Matches played</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leaderboard</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaderboard?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Teams ranked</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Quick Actions</CardTitle>
              </div>
              <CardDescription>Manage your competition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/matches">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Matches
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/teams">
                  <Users className="mr-2 h-4 w-4" />
                  View Teams
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/leaderboard">
                  <Trophy className="mr-2 h-4 w-4" />
                  View Leaderboard
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
              <CardDescription>Latest match results</CardDescription>
            </CardHeader>
            <CardContent>
              {matches && matches.length > 0 ? (
                <div className="space-y-2">
                  {matches.slice(0, 5).map((match: any) => (
                    <div key={match.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">
                          {match.homeTeam?.name || "Team A"} vs {match.awayTeam?.name || "Team B"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(match.scheduledAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {match.homeScore || 0} - {match.awayScore || 0}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {match.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No matches yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

