import { Link } from "react-router-dom";
import { Trophy, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { motion } from "framer-motion";

const sponsors = [
  { name: "TechCorp", logo: "TC", url: "#" },
  { name: "CodeHub", logo: "CH", url: "#" },
  { name: "DevSpace", logo: "DS", url: "#" },
  { name: "InnovateLab", logo: "IL", url: "#" },
  { name: "FutureTech", logo: "FT", url: "#" },
];

const Footer = () => {
  return (
    <footer className="border-t border-[#E0E0E0] bg-white backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {/* Left: Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-[#1A1A1A]">Competition</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/leaderboard" className="text-[#4A4A4A] hover:text-[#0077CC] transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/matches" className="text-[#4A4A4A] hover:text-[#0077CC] transition-colors">
                  Matches
                </Link>
              </li>
              <li>
                <Link to="/teams" className="text-[#4A4A4A] hover:text-[#0077CC] transition-colors">
                  Teams
                </Link>
              </li>
              <li>
                <Link to="/fixtures" className="text-[#4A4A4A] hover:text-[#0077CC] transition-colors">
                  Arenas
                </Link>
              </li>
              <li>
                <Link to="/academy" className="text-[#4A4A4A] hover:text-[#0077CC] transition-colors">
                  Academy
                </Link>
              </li>
            </ul>
          </div>

          {/* Center: NDL Motto */}
          <div className="text-center">
            <Link to="/" className="flex items-center justify-center gap-2 mb-4">
              <div className="rounded-lg bg-[#0077CC] p-2">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#002B5C]">
                NDL
              </span>
            </Link>
            <p className="text-sm text-[#4A4A4A] italic">
              "The Future of Tech Starts in Our Schools."
            </p>
            <p className="text-xs text-[#4A4A4A] mt-4">
              National Developers League
            </p>
          </div>

          {/* Right: Socials */}
          <div className="text-right md:text-left">
            <h4 className="font-semibold mb-4 text-[#1A1A1A]">Connect</h4>
            <div className="flex gap-4 justify-end md:justify-start">
              <motion.a
                href="#"
                className="w-10 h-10 rounded-lg bg-white border border-[#E0E0E0] flex items-center justify-center hover:bg-[#0077CC]/10 hover:border-[#0077CC] hover:text-[#0077CC] transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                className="w-10 h-10 rounded-lg bg-white border border-[#E0E0E0] flex items-center justify-center hover:bg-[#0077CC]/10 hover:border-[#0077CC] hover:text-[#0077CC] transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Linkedin className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                className="w-10 h-10 rounded-lg bg-white border border-[#E0E0E0] flex items-center justify-center hover:bg-[#0077CC]/10 hover:border-[#0077CC] hover:text-[#0077CC] transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                className="w-10 h-10 rounded-lg bg-white border border-[#E0E0E0] flex items-center justify-center hover:bg-[#0077CC]/10 hover:border-[#0077CC] hover:text-[#0077CC] transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail className="h-5 w-5" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="pt-8 border-t border-[#E0E0E0] text-center">
          <p className="text-sm text-[#4A4A4A]">
            © Silicon Valley of Africa | 2025
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

