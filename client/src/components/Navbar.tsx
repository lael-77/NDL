import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, LogOut } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import NotificationBell from "@/components/NotificationBell";

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-2 border-primary/20 bg-background/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="rounded-lg bg-gradient-to-br from-primary to-primary/80 p-2 shadow-lg">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                NDL LiveScore
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-sm font-semibold hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-primary/10"
            >
              Live
            </Link>
            <Link 
              to="/matches" 
              className="text-sm font-semibold hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-primary/10"
            >
              Matches
            </Link>
            <Link 
              to="/leaderboard" 
              className="text-sm font-semibold hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-primary/10"
            >
              Table
            </Link>
            <Link 
              to="/teams" 
              className="text-sm font-semibold hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-primary/10"
            >
              Teams
            </Link>
            {isAuthenticated && (
              <Link 
                to="/dashboard" 
                className="text-sm font-semibold hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-primary/10"
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <span className="text-sm text-muted-foreground hidden md:block font-medium">
                  {user?.fullName || user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="bg-gradient-to-r from-primary to-info shadow-md hover:shadow-lg">
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
