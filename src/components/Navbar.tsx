import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2">
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">CodeLeague</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">
              Leaderboard
            </Link>
            <Link to="/matches" className="text-sm font-medium hover:text-primary transition-colors">
              Matches
            </Link>
            <Link to="/teams" className="text-sm font-medium hover:text-primary transition-colors">
              Teams
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-primary to-info">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
