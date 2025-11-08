import { Button } from "./ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import { useNavigate } from "react-router-dom";
import { Code2, Trophy, Zap } from "lucide-react";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background"></div>
      </div>

      {/* Animated floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Code2 className="absolute top-1/4 left-1/4 w-16 h-16 text-primary/20 animate-pulse" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <Trophy className="absolute top-1/3 right-1/4 w-20 h-20 text-accent/20 animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <Zap className="absolute bottom-1/3 left-1/3 w-12 h-12 text-primary/20 animate-pulse" style={{ animationDelay: '2s', animationDuration: '3.5s' }} />
        <Code2 className="absolute bottom-1/4 right-1/3 w-14 h-14 text-accent/20 animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '4s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="inline-block mb-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-semibold animate-fade-in">
          🏆 Season 1 Now Live
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Code. Compete. Conquer.
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 mb-4 max-w-3xl mx-auto animate-fade-in font-medium" style={{ animationDelay: '0.2s' }}>
          The first national high school computing league where coding meets competition.
        </p>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Battle in trimester challenges, climb through competitive tiers, and prove your coding prowess.
        </p>
        <div className="flex gap-4 justify-center animate-fade-in flex-wrap" style={{ animationDelay: '0.4s' }}>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="text-lg px-8 shadow-[0_0_30px_rgba(0,204,255,0.3)] hover:shadow-[0_0_40px_rgba(0,204,255,0.5)] transition-all"
          >
            Join the League
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/leaderboard')}
            className="text-lg px-8"
          >
            View Rankings
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary">500+</div>
            <div className="text-sm text-muted-foreground mt-1">Active Players</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-accent">50+</div>
            <div className="text-sm text-muted-foreground mt-1">Schools</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary">100+</div>
            <div className="text-sm text-muted-foreground mt-1">Teams</div>
          </div>
        </div>
      </div>
    </div>
  );
};