import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, Award, Star, Search, Filter, Calendar, 
  ExternalLink, TrendingUp, Users, Code 
} from "lucide-react";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { format } from "date-fns";

const Archive = () => {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const featuredProjects = [
    {
      id: "1",
      title: "Smart City Traffic System",
      team: "Tech Pioneers",
      school: "Lincoln Tech High",
      year: "2024",
      tier: "National",
      category: "AI/ML",
      description: "AI-powered traffic optimization platform that reduces congestion by 40%",
      image: null,
      award: "Best Innovation",
      github: "https://github.com",
    },
    {
      id: "2",
      title: "E-Learning Platform",
      team: "Code Masters",
      school: "Innovation Academy",
      year: "2024",
      tier: "Regional",
      category: "Web Development",
      description: "Interactive learning management system with real-time collaboration",
      image: null,
      award: "Top Project",
      github: "https://github.com",
    },
    {
      id: "3",
      title: "Healthcare App",
      team: "MedTech Squad",
      school: "STEM Prep",
      year: "2023",
      tier: "Advanced",
      category: "Mobile",
      description: "Mobile health monitoring solution with telemedicine features",
      image: null,
      award: "Innovation Award",
      github: "https://github.com",
    },
  ];

  const allProjects = [
    ...featuredProjects,
    {
      id: "4",
      title: "Blockchain Voting System",
      team: "CryptoDevs",
      school: "Tech Institute",
      year: "2023",
      tier: "National",
      category: "Blockchain",
      description: "Secure and transparent voting platform using blockchain technology",
      image: null,
      award: "Security Excellence",
      github: "https://github.com",
    },
    {
      id: "5",
      title: "IoT Smart Home",
      team: "IoT Innovators",
      school: "Future High",
      year: "2023",
      tier: "Regional",
      category: "IoT",
      description: "Complete smart home automation system",
      image: null,
      award: "Best Design",
      github: "https://github.com",
    },
  ];

  const topPlayers = [
    { id: "1", name: "Alex Chen", school: "Lincoln Tech High", points: 12500, tier: "National", year: "2024" },
    { id: "2", name: "Maya Patel", school: "Innovation Academy", points: 11200, tier: "Regional", year: "2024" },
    { id: "3", name: "Jordan Lee", school: "STEM Prep", points: 9800, tier: "Advanced", year: "2024" },
  ];

  const topSchools = [
    { id: "1", name: "Lincoln Tech High", points: 45000, tier: "National", year: "2024" },
    { id: "2", name: "Innovation Academy", points: 38000, tier: "Regional", year: "2024" },
    { id: "3", name: "STEM Prep", points: 32000, tier: "Advanced", year: "2024" },
  ];

  const historicStandings = [
    { year: "2024", champion: "Tech Pioneers", runnerUp: "Code Masters", third: "MedTech Squad" },
    { year: "2023", champion: "CryptoDevs", runnerUp: "IoT Innovators", third: "Tech Pioneers" },
  ];

  const filteredProjects = allProjects.filter((project) => {
    const matchesYear = selectedYear === "all" || project.year === selectedYear;
    const matchesTier = selectedTier === "all" || project.tier === selectedTier;
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.team.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesYear && matchesTier && matchesCategory && matchesSearch;
  });

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      National: "text-red-500 bg-red-500/10 border-red-500/20",
      Regional: "text-orange-500 bg-orange-500/10 border-orange-500/20",
      Advanced: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
      Intermediate: "text-green-500 bg-green-500/10 border-green-500/20",
      Beginner: "text-gray-500 bg-gray-500/10 border-gray-500/20",
    };
    return colors[tier] || colors.Beginner;
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-600 text-sm font-semibold mb-4">
            <Award className="w-4 h-4" />
            Hall of Fame
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
            Archive & Hall of Fame
          </h1>
          <p className="text-muted-foreground text-lg">
            Celebrating excellence in coding innovation and competition
          </p>
        </div>

        {/* Featured Projects Carousel */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Featured Projects</h2>
          <Carousel className="w-full">
            <CarouselContent>
              {featuredProjects.map((project, index) => (
                <CarouselItem key={project.id} className="md:basis-1/2 lg:basis-1/3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-xl transition-all hover:border-yellow-500/50">
                      <div className="h-48 bg-gradient-to-br from-primary/20 via-info/20 to-primary/20 relative">
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                            {project.award}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="mb-3">
                          <h3 className="font-bold text-xl mb-1">{project.title}</h3>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <Badge className={getTierColor(project.tier)}>{project.tier}</Badge>
                          <Badge variant="outline">{project.category}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-4">
                          <div className="font-semibold">{project.team}</div>
                          <div>{project.school} • {project.year}</div>
                        </div>
                        <Button variant="outline" className="w-full" asChild>
                          <a href={project.github} target="_blank" rel="noopener noreferrer">
                            View Project
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="w-[180px]">
                  <Trophy className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="National">National</SelectItem>
                  <SelectItem value="Regional">Regional</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="AI/ML">AI/ML</SelectItem>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                  <SelectItem value="Blockchain">Blockchain</SelectItem>
                  <SelectItem value="IoT">IoT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">All Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50">
                  <div className="h-40 bg-gradient-to-br from-primary/20 via-info/20 to-primary/20 relative">
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                        {project.award}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={getTierColor(project.tier)}>{project.tier}</Badge>
                      <Badge variant="outline">{project.category}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      <div className="font-semibold">{project.team}</div>
                      <div>{project.school} • {project.year}</div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                        View Project
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Top Players and Schools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Top Players</CardTitle>
              <CardDescription>All-time highest scoring players</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPlayers.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                        index === 1 ? 'bg-gray-400/20 text-gray-600' :
                        'bg-amber-600/20 text-amber-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{player.name}</div>
                        <div className="text-sm text-muted-foreground">{player.school}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{player.points.toLocaleString()}</div>
                      <Badge className={getTierColor(player.tier)} variant="outline">
                        {player.tier}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Schools</CardTitle>
              <CardDescription>Leading schools by total points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSchools.map((school, index) => (
                  <div key={school.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                        index === 1 ? 'bg-gray-400/20 text-gray-600' :
                        'bg-amber-600/20 text-amber-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{school.name}</div>
                        <Badge className={getTierColor(school.tier)} variant="outline">
                          {school.tier}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{school.points.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historic Standings */}
        <Card>
          <CardHeader>
            <CardTitle>Historic Standings</CardTitle>
            <CardDescription>Champions by year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {historicStandings.map((standing) => (
                <div key={standing.year} className="p-6 rounded-lg border-2 border-primary/20 hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-6 w-6 text-primary" />
                    <h3 className="text-2xl font-bold">{standing.year}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <span className="font-semibold">Champion</span>
                      </div>
                      <div className="font-bold text-lg">{standing.champion}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-400/10 border border-gray-400/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-gray-400" />
                        <span className="font-semibold">Runner-Up</span>
                      </div>
                      <div className="font-bold text-lg">{standing.runnerUp}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-600/10 border border-amber-600/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-amber-600" />
                        <span className="font-semibold">Third Place</span>
                      </div>
                      <div className="font-bold text-lg">{standing.third}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Archive;

