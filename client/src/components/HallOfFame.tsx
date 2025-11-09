import { motion } from "framer-motion";
import { Trophy, Award, Calendar, School, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "./GlassCard";
import { useNavigate } from "react-router-dom";

// Sample Hall of Fame projects - replace with real data from API
const hallOfFameProjects = [
  {
    id: 1,
    name: "E-Commerce Platform",
    year: 2024,
    school: "Green Hills Academy",
    tier: "Professional",
    description: "A full-stack e-commerce solution with payment integration",
  },
  {
    id: 2,
    name: "AI Learning Assistant",
    year: 2024,
    school: "International School of Kigali",
    tier: "Legendary",
    description: "Machine learning-powered educational tool",
  },
  {
    id: 3,
    name: "Health Management System",
    year: 2023,
    school: "Saint Andre",
    tier: "Professional",
    description: "Comprehensive healthcare management platform",
  },
  {
    id: 4,
    name: "Smart City Dashboard",
    year: 2023,
    school: "Lycee de Kigali",
    tier: "Legendary",
    description: "Real-time city data visualization and analytics",
  },
];

export const HallOfFame = () => {
  const navigate = useNavigate();

  const getTierGradient = (tier: string) => {
    const gradients: Record<string, string> = {
      beginner: "bg-[#22C55E]",
      amateur: "bg-[#22C55E]",
      intermediate: "bg-[#FACC15]",
      regular: "bg-[#FACC15]",
      advanced: "bg-[#3B82F6]",
      professional: "bg-[#3B82F6]",
      legendary: "bg-[#3B82F6]",
      national: "bg-[#E11D48]",
    };
    return gradients[tier?.toLowerCase()] || gradients.beginner;
  };

  return (
    <section className="py-20 relative bg-[#F5F7FA] overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-5xl font-bold mb-4 text-[#1A1A1A]">Hall of Fame</h2>
          <p className="text-[#4A4A4A] text-lg">
            Celebrating the most innovative projects from NDL competitions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hallOfFameProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50, rotateY: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ rotateY: 5, y: -10 }}
              style={{ perspective: 1000 }}
            >
              <GlassCard>
                <div className="p-6 h-full flex flex-col">
                  <div className={`w-full h-32 rounded-lg mb-4 ${getTierGradient(project.tier)} flex items-center justify-center`}>
                    <Trophy className="h-12 w-12 text-white/80" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-[#1A1A1A]">{project.name}</h3>
                      <Badge variant="outline" className="text-xs border-[#E0E0E0]">
                        {project.year}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-[#4A4A4A]">
                      <School className="h-4 w-4" />
                      {project.school}
                    </div>

                    <p className="text-sm text-[#4A4A4A] line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex items-center gap-2">
                      <Award className={`h-4 w-4 ${getTierGradient(project.tier).replace('bg-', 'text-')}`} />
                      <span className={`text-xs font-semibold ${getTierGradient(project.tier).replace('bg-', 'text-')}`}>
                        {project.tier} Tier
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            variant="outline"
            className="group border-2 border-[#0077CC] hover:border-[#005FA3] hover:bg-[#0077CC]/10 text-[#0077CC] relative overflow-hidden"
            onClick={() => navigate("/archive")}
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Archive
            </span>
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

