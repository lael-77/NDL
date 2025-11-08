import { Button } from "@/components/ui/button";
import { Trophy, Code2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">First-Ever Computing League for High Schools</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground">
            Where Coding Meets Competition
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join the arena where developers battle, teams compete, and champions rise through skill and strategy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" asChild className="bg-gradient-to-r from-primary to-info text-lg h-14 px-8">
              <Link to="/auth">Start Competing</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg h-14 px-8">
              <Link to="/leaderboard">View Leaderboard</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur">
              <Code2 className="h-8 w-8 text-primary mb-3 mx-auto" />
              <div className="text-3xl font-bold mb-1">5</div>
              <div className="text-sm text-muted-foreground">Competition Tiers</div>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur">
              <Users className="h-8 w-8 text-primary mb-3 mx-auto" />
              <div className="text-3xl font-bold mb-1">100+</div>
              <div className="text-sm text-muted-foreground">Schools Competing</div>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur">
              <Trophy className="h-8 w-8 text-primary mb-3 mx-auto" />
              <div className="text-3xl font-bold mb-1">3pts</div>
              <div className="text-sm text-muted-foreground">Per Victory</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
