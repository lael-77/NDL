import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Calendar,
  MapPin,
  User,
  Gavel,
  Settings,
  LogOut,
} from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const playerNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { path: "/matches", label: "Matches", icon: Calendar },
    { path: "/teams", label: "Teams", icon: Users },
    { path: "/fixtures", label: "Arenas", icon: MapPin },
  ];

  const adminNavItems = [
    { path: "/admin", label: "Admin Panel", icon: Settings },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { path: "/matches", label: "Matches", icon: Calendar },
    { path: "/teams", label: "Teams", icon: Users },
  ];

  const judgeNavItems = [
    { path: "/judge", label: "Judge Panel", icon: Gavel },
    { path: "/matches", label: "Matches", icon: Calendar },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  const getNavItems = () => {
    if (user?.role === "admin") return adminNavItems;
    if (user?.role === "judge") return judgeNavItems;
    return playerNavItems;
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-border bg-card/50 backdrop-blur-sm z-40">
      <div className="flex flex-col h-full p-4">
        <nav className="flex-1 space-y-2">
          {getNavItems().map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                  isActive(item.path)
                    ? "bg-primary/20 text-primary font-semibold border border-primary/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-border">
          <div className="px-4 py-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName || "User"}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role || "player"}</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

