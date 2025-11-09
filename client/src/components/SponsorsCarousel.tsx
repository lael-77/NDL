import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { useEffect, useState } from "react";

// Sample sponsors - replace with real data from API
const sponsors = [
  { name: "TechCorp Rwanda", logo: "TC" },
  { name: "Innovate Africa", logo: "IA" },
  { name: "Digital Solutions", logo: "DS" },
  { name: "CodeHub Kigali", logo: "CH" },
  { name: "Future Tech", logo: "FT" },
  { name: "Silicon Valley Africa", logo: "SV" },
];

export const SponsorsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 relative bg-[#F5F7FA] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0077CC]/5 via-[#002B5C]/5 to-[#0077CC]/5 animate-shimmer" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm text-[#4A4A4A] mb-2">Powered by the innovators of Africa</p>
          <h2 className="text-3xl font-bold text-[#1A1A1A]">Our Partners & Sponsors</h2>
        </motion.div>

        <div className="relative h-32 flex items-center justify-center">
          <div className="flex gap-8 items-center overflow-hidden w-full">
            {sponsors.map((sponsor, index) => {
              const isActive = index === currentIndex;
              const offset = index - currentIndex;
              
              return (
                <motion.div
                  key={sponsor.name}
                  className="flex-shrink-0"
                  initial={{ opacity: 0.3, scale: 0.8, grayscale: 1 }}
                  animate={{
                    opacity: isActive ? 1 : 0.3,
                    scale: isActive ? 1 : 0.8,
                    grayscale: isActive ? 0 : 1,
                    x: offset * 200,
                  }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.1, grayscale: 0 }}
                >
                  <div className="w-32 h-32 rounded-lg bg-white border border-[#E0E0E0] flex items-center justify-center hover:border-[#0077CC] transition-all cursor-pointer shadow-sm hover:shadow-md">
                    <div className="text-center">
                      <Building2 className="h-8 w-8 mx-auto mb-2 text-[#0077CC]" />
                      <div className="text-xs font-semibold text-[#1A1A1A]">{sponsor.logo}</div>
                      <div className="text-xs text-[#4A4A4A] mt-1">{sponsor.name}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Auto-scroll indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {sponsors.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-[#0077CC]"
                  : "w-2 bg-[#E0E0E0]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

