import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import Footer from "./Footer";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export const PageWrapper = ({ children, className = "" }: PageWrapperProps) => {
  return (
    <div className={`min-h-screen bg-[#0D1117] text-white ${className}`}>
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

