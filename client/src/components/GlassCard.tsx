import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard = ({ children, className, hover = true }: GlassCardProps) => {
  return (
    <motion.div
      className={cn(
        "bg-white border border-[#E0E0E0] rounded-xl",
        "shadow-sm",
        hover && "hover:shadow-md hover:border-[#0077CC]/30 transition-all duration-300",
        className
      )}
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

