import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Code, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "./GlassCard";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const courses = [
  { name: "Introduction to Programming", icon: Code, tier: "Beginner" },
  { name: "Web Development Basics", icon: BookOpen, tier: "Beginner" },
  { name: "React Mastery", icon: Code, tier: "Intermediate" },
  { name: "Node.js Backend", icon: Target, tier: "Professional" },
  { name: "Advanced Algorithms", icon: Code, tier: "Professional" },
];

export const AcademySpotlight = () => {
  const navigate = useNavigate();
  const [currentCourse, setCurrentCourse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCourse((prev) => (prev + 1) % courses.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = courses[currentCourse].icon;

  return (
    <section className="py-20 relative bg-[#F5F7FA] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0077CC]/5 via-[#002B5C]/5 to-[#0077CC]/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-[#1A1A1A]">
                <span className="bg-gradient-to-r from-[#002B5C] to-[#0077CC] bg-clip-text text-transparent">
                  Learn.
                </span>{" "}
                <span className="bg-gradient-to-r from-[#0077CC] to-[#002B5C] bg-clip-text text-transparent">
                  Build.
                </span>{" "}
                <span className="bg-gradient-to-r from-[#002B5C] to-[#0077CC] bg-clip-text text-transparent">
                  Compete.
                </span>
              </h2>
              <p className="text-xl text-[#4A4A4A] leading-relaxed">
                The NDL Academy is where Rwanda's future developers hone their skills.
                From beginner fundamentals to advanced professional courses, we provide
                the tools and knowledge to excel in competitive programming.
              </p>
              <p className="text-muted-foreground">
                Join thousands of students already learning and building the next generation
                of tech solutions. Your journey to becoming a top developer starts here.
              </p>
            </div>

            <Button
              size="lg"
              className="group relative overflow-hidden bg-[#0077CC] hover:bg-[#005FA3] text-white border-0 transition-all duration-300"
              onClick={() => navigate("/academy")}
            >
              <span className="relative z-10 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Enter Academy
              </span>
            </Button>
          </motion.div>

          {/* Right: Animated Course Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[400px]"
          >
            {courses.map((course, index) => {
              const Icon = course.icon;
              const isActive = index === currentCourse;
              
              return (
                <motion.div
                  key={course.name}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    scale: isActive ? 1 : 0.8,
                    rotateY: isActive ? 0 : -90,
                    zIndex: isActive ? 10 : 0,
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <GlassCard hover={false}>
                    <div className="p-8 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-lg bg-[#0077CC] flex items-center justify-center">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <Badge variant="outline" className="border-[#E0E0E0]">{course.tier}</Badge>
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-[#1A1A1A]">{course.name}</h3>
                        <p className="text-[#4A4A4A]">
                          Master the fundamentals and advanced concepts of {course.name.toLowerCase()}.
                          Build real-world projects and compete with peers.
                        </p>
                      </div>
                      <Button variant="ghost" className="w-full group">
                        Start Learning
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

