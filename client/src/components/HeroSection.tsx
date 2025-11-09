import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ParticleBackground } from "./ParticleBackground";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F5F7FA]">
      <ParticleBackground />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy + CTA */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.h1
              className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="bg-gradient-to-r from-[#002B5C] to-[#0077CC] bg-clip-text text-transparent animate-gradient">
                Where Code
              </span>
              <br />
              <span className="text-[#1A1A1A]">Meets Competition.</span>
            </motion.h1>

            <motion.p
              className="text-xl text-muted-foreground max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              The National Developers League — where Rwanda's brightest minds compete,
              learn, and build the future of technology.
            </motion.p>

            <motion.div
              className="flex gap-4 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Button
                size="lg"
                className="group relative overflow-hidden bg-[#0077CC] hover:bg-[#005FA3] text-white border-0 transition-all duration-300"
                onClick={() => navigate("/academy")}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Join the Academy
                </span>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="group border-2 border-[#0077CC] hover:border-[#005FA3] hover:bg-[#0077CC]/10 text-[#0077CC] relative overflow-hidden"
                onClick={() => navigate("/leaderboard")}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  View Standings
                </span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right: Animated Visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative w-full h-[500px] flex items-center justify-center">
              {/* 3D Globe / Code Particle Effect */}
              <div className="relative w-full h-full">
                {/* Animated Code Blocks */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <div className="w-64 h-64 border-2 border-[#0077CC]/30 rounded-full" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    rotate: [360, 0],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <div className="w-48 h-48 border-2 border-[#0077CC]/20 rounded-full" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <div className="w-32 h-32 border-2 border-[#0077CC]/10 rounded-full" />
                </motion.div>

                {/* Central Code Symbol */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="text-6xl font-bold text-[#0077CC]"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {"</>"}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

