import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, BookOpen, Target, Award, CheckCircle, 
  Lock, ArrowRight, Trophy, Code, Zap, Star, Play 
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Academy = () => {
  const [enrolled, setEnrolled] = useState(true);
  const [overallProgress] = useState(78);

  const courses = [
    {
      id: "1",
      name: "Beginner Fundamentals",
      tier: "Beginner",
      description: "Introduction to programming concepts and basic algorithms",
      progress: 100,
      completed: true,
      lessons: 12,
      duration: "8 weeks",
    },
    {
      id: "2",
      name: "Intermediate Development",
      tier: "Intermediate",
      description: "Web development, databases, and API integration",
      progress: 85,
      completed: false,
      lessons: 15,
      duration: "10 weeks",
    },
    {
      id: "3",
      name: "Advanced Systems",
      tier: "Advanced",
      description: "System design, architecture, and optimization",
      progress: 0,
      completed: false,
      lessons: 18,
      duration: "12 weeks",
      locked: true,
    },
    {
      id: "4",
      name: "Regional Competition Prep",
      tier: "Regional",
      description: "Advanced algorithms and competitive programming",
      progress: 0,
      completed: false,
      lessons: 20,
      duration: "14 weeks",
      locked: true,
    },
    {
      id: "5",
      name: "National Excellence",
      tier: "National",
      description: "Master-level concepts and real-world projects",
      progress: 0,
      completed: false,
      lessons: 24,
      duration: "16 weeks",
      locked: true,
    },
  ];

  const challenges = [
    {
      id: "1",
      title: "Build a Todo App",
      description: "Create a full-stack todo application",
      difficulty: "Easy",
      points: 50,
      completed: true,
      dueDate: "2024-01-15",
    },
    {
      id: "2",
      title: "API Integration Challenge",
      description: "Integrate with a public API and display data",
      difficulty: "Medium",
      points: 100,
      completed: false,
      dueDate: "2024-02-20",
    },
    {
      id: "3",
      title: "System Design Project",
      description: "Design and implement a scalable system",
      difficulty: "Hard",
      points: 200,
      completed: false,
      dueDate: "2024-03-30",
    },
  ];

  const certificates = [
    {
      id: "1",
      name: "Beginner Fundamentals Certificate",
      tier: "Beginner",
      earned: "2024-01-15",
      verified: true,
    },
    {
      id: "2",
      name: "Intermediate Developer Certificate",
      tier: "Intermediate",
      earned: null,
      verified: false,
    },
  ];

  const quizzes = [
    {
      id: "1",
      title: "JavaScript Basics",
      questions: 10,
      timeLimit: 30,
      completed: true,
      score: 85,
    },
    {
      id: "2",
      title: "React Fundamentals",
      questions: 15,
      timeLimit: 45,
      completed: false,
      score: null,
    },
  ];

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

  const canJoinLeague = overallProgress >= 80;

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-semibold mb-4">
            <GraduationCap className="w-4 h-4" />
            NDL Academy
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
            Learn, Practice, Compete
          </h1>
          <p className="text-muted-foreground text-lg">
            Progress through courses from Beginner to National tier
          </p>
        </div>

        {/* Enrollment Status */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">Enrollment Status</h2>
                  {enrolled ? (
                    <Badge className="bg-green-500">Enrolled</Badge>
                  ) : (
                    <Badge variant="outline">Not Enrolled</Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">
                  {enrolled 
                    ? "You're currently enrolled in the NDL Academy program"
                    : "Enroll now to start your learning journey"}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-semibold">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                </div>
              </div>
              <div className="text-center">
                {canJoinLeague ? (
                  <div>
                    <Badge className="bg-green-500 mb-2">Ready to Join League</Badge>
                    <Button asChild>
                      <Link to="/auth">Join the League</Link>
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {80 - overallProgress}% more to unlock
                    </p>
                    <Button variant="outline" disabled>
                      <Lock className="mr-2 h-4 w-4" />
                      Join League (80% required)
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full ${course.locked ? 'opacity-60' : ''} hover:shadow-lg transition-all`}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getTierColor(course.tier)}>
                          {course.tier}
                        </Badge>
                        {course.locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                        {course.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                      </div>
                      <CardTitle>{course.name}</CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {course.lessons} lessons
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            {course.duration}
                          </div>
                        </div>
                        <Button 
                          className="w-full" 
                          disabled={course.locked}
                          variant={course.completed ? "outline" : "default"}
                        >
                          {course.completed ? "Review Course" : course.locked ? "Locked" : "Continue Learning"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trimester Challenges</CardTitle>
                <CardDescription>Complete challenges to earn points and certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {challenges.map((challenge, index) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={challenge.completed ? "border-green-500/50" : ""}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-lg">{challenge.title}</h3>
                                {challenge.completed && (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                )}
                                <Badge variant={
                                  challenge.difficulty === "Easy" ? "default" :
                                  challenge.difficulty === "Medium" ? "secondary" : "destructive"
                                }>
                                  {challenge.difficulty}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground mb-3">{challenge.description}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                  {challenge.points} points
                                </div>
                                <div className="text-muted-foreground">
                                  Due: {new Date(challenge.dueDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant={challenge.completed ? "outline" : "default"}
                              className="ml-4"
                            >
                              {challenge.completed ? "View Solution" : "Start Challenge"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Certificates Earned</CardTitle>
                <CardDescription>Your achievements and certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certificates.map((cert, index) => (
                    <motion.div
                      key={cert.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`h-full ${cert.earned ? '' : 'opacity-60'}`}>
                        <CardContent className="p-6 text-center">
                          <div className="w-24 h-24 mx-auto mb-4 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center">
                            <Award className="h-12 w-12 text-yellow-500" />
                          </div>
                          <h3 className="font-bold text-lg mb-2">{cert.name}</h3>
                          <Badge className={getTierColor(cert.tier)}>{cert.tier}</Badge>
                          {cert.earned ? (
                            <div className="mt-4">
                              <p className="text-sm text-muted-foreground mb-2">
                                Earned: {new Date(cert.earned).toLocaleDateString()}
                              </p>
                              {cert.verified && (
                                <Badge className="bg-green-500">Verified</Badge>
                              )}
                              <Button variant="outline" className="w-full mt-4">
                                Download Certificate
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-4">
                              Complete course to earn this certificate
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trimester Tests</CardTitle>
                <CardDescription>Test your knowledge with interactive quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizzes.map((quiz, index) => (
                    <Card key={quiz.id} className={quiz.completed ? "border-green-500/50" : ""}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg mb-1">{quiz.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{quiz.questions} questions</span>
                              <span>{quiz.timeLimit} min</span>
                            </div>
                          </div>
                          {quiz.completed && (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-500">{quiz.score}%</div>
                              <div className="text-xs text-muted-foreground">Score</div>
                            </div>
                          )}
                        </div>
                        <Button 
                          className="w-full" 
                          variant={quiz.completed ? "outline" : "default"}
                        >
                          {quiz.completed ? "Review Quiz" : "Start Quiz"}
                          <Play className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Academy;

