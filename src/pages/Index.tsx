import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Card } from "@/components/ui/card";
import { Code, Users, Trophy, Target, Zap, Award } from "lucide-react";

const Index = () => {
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
                <Card key={index} className="p-6 hover:border-primary/50 transition-colors">
                  <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
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
              { name: "National", color: "from-destructive/20 to-destructive/10", badge: "text-destructive" },
              { name: "Regional", color: "from-warning/20 to-warning/10", badge: "text-warning" },
              { name: "Advanced", color: "from-info/20 to-info/10", badge: "text-info" },
              { name: "Intermediate", color: "from-success/20 to-success/10", badge: "text-success" },
              { name: "Beginner", color: "from-muted/40 to-muted/20", badge: "text-muted-foreground" }
            ].map((tier, index) => (
              <div 
                key={tier.name}
                className={`p-6 rounded-xl bg-gradient-to-r ${tier.color} border border-border`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-muted-foreground">
                      {5 - index}
                    </span>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
