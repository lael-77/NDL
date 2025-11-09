import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Trophy, Star, Award, Code, Github, Linkedin, 
  TrendingUp, Target, Medal, CheckCircle, ExternalLink, 
  Calendar, Users, Zap, BookOpen 
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PlayerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock player data - replace with actual API call
  const player = {
    id: id || "1",
    name: "Alex Chen",
    email: "alex.chen@example.com",
    school: "Lincoln Tech High",
    tier: "National",
    role: "Developer",
    avatar: null,
    xp: 12500,
    rank: 45,
    matchesPlayed: 24,
    wins: 18,
    losses: 4,
    draws: 2,
    points: 156,
    skills: ["JavaScript", "Python", "React", "Node.js", "TypeScript"],
    badges: [
      { id: "1", name: "First Win", icon: "🏆", earned: "2024-01-15" },
      { id: "2", name: "Perfect Score", icon: "⭐", earned: "2024-02-20" },
      { id: "3", name: "Team Player", icon: "👥", earned: "2024-03-10" },
      { id: "4", name: "Innovator", icon: "💡", earned: "2024-04-05" },
    ],
    achievements: [
      { id: "1", title: "Top Scorer", description: "Highest points in Q1 2024", date: "2024-01-15" },
      { id: "2", title: "MVP", description: "Most Valuable Player in Regional Finals", date: "2024-02-20" },
    ],
    projects: [
      { id: "1", name: "Smart City App", description: "AI-powered traffic optimization", github: "https://github.com", status: "completed" },
      { id: "2", name: "E-Learning Platform", description: "Interactive LMS", github: "https://github.com", status: "in_progress" },
    ],
    portfolio: {
      github: "https://github.com/alexchen",
      linkedin: "https://linkedin.com/in/alexchen",
    },
    performanceData: [
      { month: "Jan", xp: 2000 },
      { month: "Feb", xp: 3500 },
      { month: "Mar", xp: 5200 },
      { month: "Apr", xp: 7800 },
      { month: "May", xp: 10000 },
      { month: "Jun", xp: 12500 },
    ],
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      National: "text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.4)]",
      Regional: "text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-[0_0_30px_rgba(251,146,60,0.4)]",
      Advanced: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_30px_rgba(0,204,255,0.4)]",
      Intermediate: "text-green-500 bg-green-500/10 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.4)]",
      Beginner: "text-gray-500 bg-gray-500/10 border-gray-500/20",
    };
    return colors[tier] || colors.Beginner;
  };

  const winRate = player.matchesPlayed > 0 
    ? Math.round((player.wins / player.matchesPlayed) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-primary/20 via-info/20 to-primary/20" />
          <CardContent className="p-8 -mt-16">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-4xl font-bold text-[#1A1A1A] shadow-lg border-4 border-background">
                {player.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{player.name}</h1>
                  <Badge className={getTierColor(player.tier)}>
                    {player.tier}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-2">{player.school}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{player.role}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">Rank #{player.rank}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{player.xp.toLocaleString()} XP</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {player.portfolio.github && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={player.portfolio.github} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                )}
                {player.portfolio.linkedin && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={player.portfolio.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="mr-2 h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold">{player.matchesPlayed}</div>
              <div className="text-sm text-muted-foreground">Matches</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-3xl font-bold">{player.wins}</div>
              <div className="text-sm text-muted-foreground">Wins</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold">{winRate}%</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-3xl font-bold">{player.points}</div>
              <div className="text-sm text-muted-foreground">Points</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                  <CardDescription>Technical competencies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {player.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Match Statistics</CardTitle>
                  <CardDescription>Performance breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Wins</span>
                        <span className="font-semibold">{player.wins}</span>
                      </div>
                      <Progress value={(player.wins / player.matchesPlayed) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Losses</span>
                        <span className="font-semibold">{player.losses}</span>
                      </div>
                      <Progress value={(player.losses / player.matchesPlayed) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Draws</span>
                        <span className="font-semibold">{player.draws}</span>
                      </div>
                      <Progress value={(player.draws / player.matchesPlayed) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                  <CardDescription>Earned achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {player.badges.map((badge) => (
                      <motion.div
                        key={badge.id}
                        whileHover={{ scale: 1.05 }}
                        className="p-4 rounded-lg border-2 border-primary/20 hover:border-primary/50 transition-all cursor-pointer text-center"
                      >
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <div className="font-semibold text-sm">{badge.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(new Date(badge.earned), "MMM yyyy")}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Major accomplishments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {player.achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                          <Award className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{achievement.title}</div>
                          <div className="text-sm text-muted-foreground mt-1">{achievement.description}</div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {format(new Date(achievement.date), "MMM dd, yyyy")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Projects & Portfolio</CardTitle>
                <CardDescription>Completed and ongoing projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {player.projects.map((project) => (
                    <Card key={project.id} className="hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg mb-1">{project.name}</h3>
                            <p className="text-sm text-muted-foreground">{project.description}</p>
                          </div>
                          <Badge variant={project.status === "completed" ? "default" : "secondary"}>
                            {project.status === "completed" ? "Completed" : "In Progress"}
                          </Badge>
                        </div>
                        {project.github && (
                          <Button variant="outline" size="sm" asChild className="w-full">
                            <a href={project.github} target="_blank" rel="noopener noreferrer">
                              <Github className="mr-2 h-4 w-4" />
                              View on GitHub
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Chart</CardTitle>
                <CardDescription>XP progression over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={player.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="xp" 
                      stroke="#00ccff" 
                      strokeWidth={2}
                      dot={{ fill: "#00ccff", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default PlayerProfile;

