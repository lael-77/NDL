import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Users, Trophy, Target, Zap, Award, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: Code,
      title: "Real Challenges",
      description: "Solve authentic coding problems released every trimester"
    },
    {
      icon: Users,
      title: "Team Competition",
      description: "Form teams, represent your school, and compete together"
    },
    {
      icon: Trophy,
      title: "Tier System",
      description: "Progress from Beginner to National through 5 competitive tiers"
    },
    {
      icon: Target,
      title: "Points & Rankings",
      description: "Win matches to earn points and climb the global leaderboard"
    },
    {
      icon: Zap,
      title: "Live Matches",
      description: "Scheduled arena events with real-time scoring and results"
    },
    {
      icon: Award,
      title: "Recognition",
      description: "Earn achievements and showcase your coding prowess"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Compete, learn, and rise through the ranks in the ultimate coding competition
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,204,255,0.2)] hover:-translate-y-1 animate-fade-in group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Student Success Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Where Champions Are Made
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "This league transformed how I think about coding. It's not just about solving problems—it's about outsmarting the competition.",
                author: "Alex Chen",
                school: "Lincoln Tech High",
                achievement: "National Tier Champion"
              },
              {
                quote: "The pressure of live matches pushed me to level up my skills faster than I ever thought possible.",
                author: "Maya Patel",
                school: "Innovation Academy",
                achievement: "Regional Rising Star"
              },
              {
                quote: "Competing with my team taught me more than any textbook. We learned to code together, debug together, win together.",
                author: "Jordan Lee",
                school: "STEM Prep",
                achievement: "Best Team Player"
              }
            ].map((testimonial, index) => (
              <Card 
                key={index} 
                className="p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,204,255,0.2)] animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="mb-4">
                  <Trophy className="w-8 h-8 text-primary/50" />
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-bold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.school}</div>
                  <div className="text-xs text-primary mt-1">{testimonial.achievement}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tier System Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Competition Tiers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Rise through the ranks. Top 3 teams promote, bottom 3 relegate each trimester.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { name: "National", color: "from-destructive/20 to-destructive/10", badge: "text-destructive", glow: "hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]" },
              { name: "Regional", color: "from-warning/20 to-warning/10", badge: "text-warning", glow: "hover:shadow-[0_0_30px_rgba(251,146,60,0.3)]" },
              { name: "Advanced", color: "from-info/20 to-info/10", badge: "text-info", glow: "hover:shadow-[0_0_30px_rgba(0,204,255,0.3)]" },
              { name: "Intermediate", color: "from-success/20 to-success/10", badge: "text-success", glow: "hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]" },
              { name: "Beginner", color: "from-muted/40 to-muted/20", badge: "text-muted-foreground", glow: "hover:shadow-[0_0_20px_rgba(100,116,139,0.2)]" }
            ].map((tier, index) => (
              <div 
                key={tier.name}
                className={`p-6 rounded-xl bg-gradient-to-r ${tier.color} border border-border transition-all duration-300 ${tier.glow} hover:-translate-x-2 cursor-pointer animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-card/50 flex items-center justify-center">
                      <span className="text-3xl font-bold text-muted-foreground">
                        {5 - index}
                      </span>
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${tier.badge}`}>
                        {tier.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {index === 0 ? "Elite competitors" : 
                         index === 1 ? "Top regional teams" :
                         index === 2 ? "Skilled developers" :
                         index === 3 ? "Growing teams" :
                         "Starting your journey"}
                      </p>
                    </div>
                  </div>
                  <Trophy className={`w-6 h-6 ${tier.badge} opacity-50`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-y border-primary/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Join the Arena?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Form your team, represent your school, and compete for glory in the ultimate high school coding championship.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="text-lg px-8 shadow-[0_0_30px_rgba(0,204,255,0.3)] hover:shadow-[0_0_40px_rgba(0,204,255,0.5)] transition-all group"
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/leaderboard')}
              className="text-lg px-8"
            >
              Explore Leaderboard
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
