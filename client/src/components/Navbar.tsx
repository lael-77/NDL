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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#E0E0E0] bg-[#002B5C] backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
            <div className="rounded-lg bg-[#0077CC] p-2 shadow-lg group-hover:shadow-[0_0_20px_rgba(0,119,204,0.5)] transition-shadow">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">
                NDL
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link 
              to="/" 
              className="text-sm font-medium text-white hover:text-[#0077CC] transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
            >
              Home
            </Link>
            <Link 
              to="/league" 
              className="text-sm font-medium text-white hover:text-[#0077CC] transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
            >
              League
            </Link>
            <Link 
              to="/matches" 
              className="text-sm font-medium text-white hover:text-[#0077CC] transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
            >
              Matches
            </Link>
            <Link 
              to="/leaderboard" 
              className="text-sm font-medium text-white hover:text-[#0077CC] transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
            >
              Leaderboard
            </Link>
            <Link 
              to="/academy" 
              className="text-sm font-medium text-white hover:text-[#0077CC] transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
            >
              Academy
            </Link>
            <Link 
              to="/archive" 
              className="text-sm font-medium text-white hover:text-[#0077CC] transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
            >
              Archive
            </Link>
            {isAuthenticated && (
              <Link 
                to="/dashboard" 
                className="text-sm font-medium text-white hover:text-[#0077CC] transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-white/20 hover:border-white/40 hover:bg-white/10 text-white"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="hover:bg-white/10 text-white"
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button 
                  size="sm" 
                  asChild 
                  className="bg-[#0077CC] hover:bg-[#005FA3] text-white shadow-md hover:shadow-lg border-0"
                >
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
