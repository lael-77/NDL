import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Users, Trophy, Target, Zap, Award, ArrowRight, Sparkles, TrendingUp, School, BookOpen, Heart, Building2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
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

      {/* Story Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-semibold mb-4">
                <Sparkles className="w-4 h-4" />
                Our Story
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Computing as a Sport
              </h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground mb-6">
                The National Developers League (NDL) was founded by <strong>Silicon Valley of Africa</strong> with a revolutionary vision: 
                to transform coding from a solitary activity into a competitive sport that brings together the brightest young minds across the continent.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                We believe that computing should be celebrated with the same passion and intensity as traditional sports. 
                Just as athletes train, compete, and rise through leagues, developers should have the opportunity to showcase 
                their skills, work in teams, and compete for glory.
              </p>
              <p className="text-lg text-muted-foreground">
                NDL creates an ecosystem where high school students can form teams, represent their schools, compete in structured 
                matches, and progress through competitive tiers—all while building real-world skills and creating innovative projects 
                that solve real problems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-24 bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering the next generation of African developers
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: School, value: "150+", label: "Schools Participating" },
              { icon: Users, value: "2,500+", label: "Active Players" },
              { icon: Code, value: "500+", label: "Projects Incubated" },
              { icon: Trophy, value: "1,200+", label: "Matches Played" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <div className="text-4xl font-bold mb-2">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Leadership Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The visionaries behind NDL
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Dr. Kwame Mensah", role: "Founder & CEO", org: "Silicon Valley of Africa", bio: "Visionary leader passionate about tech education" },
              { name: "Ama Asante", role: "League Director", org: "NDL", bio: "Expert in competitive programming and education" },
              { name: "Kofi Adjei", role: "Technical Lead", org: "NDL", bio: "Full-stack developer and systems architect" },
            ].map((leader, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-info mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-[#1A1A1A]">
                      {leader.name.charAt(0)}
                    </div>
                    <h3 className="text-xl font-bold mb-1">{leader.name}</h3>
                    <Badge className="mb-2">{leader.role}</Badge>
                    <p className="text-sm text-muted-foreground mb-2">{leader.org}</p>
                    <p className="text-sm text-muted-foreground">{leader.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-semibold mb-4">
              <Building2 className="w-4 h-4" />
              Our Partners
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Partners & Sponsors</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Organizations supporting the future of African tech talent
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {[
              { name: "Silicon Valley of Africa", logo: "SVOA", tier: "Founding Partner" },
              { name: "TechCorp", logo: "TC", tier: "Platinum" },
              { name: "CodeHub", logo: "CH", tier: "Gold" },
              { name: "DevTools", logo: "DT", tier: "Silver" },
              { name: "InnovateLab", logo: "IL", tier: "Silver" },
              { name: "FutureTech", logo: "FT", tier: "Bronze" },
            ].map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all hover:border-primary/50 text-center h-full">
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[140px]">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-info/20 flex items-center justify-center mb-3">
                      <span className="text-2xl font-bold text-primary">{partner.logo}</span>
                    </div>
                    <div className="font-semibold text-sm mb-1">{partner.name}</div>
                    <div className="text-xs text-muted-foreground">{partner.tier}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-y border-primary/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join the Movement
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of Africa's premier coding championship. Form your team, represent your school, and compete for glory.
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
              onClick={() => navigate('/contact')}
              className="text-lg px-8"
            >
              Become a Sponsor
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/academy')}
              className="text-lg px-8"
            >
              Join the Academy
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
