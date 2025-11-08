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
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Sponsors Carousel */}
        <div className="mb-12">
          <h3 className="text-center text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wider">
            Our Sponsors
          </h3>
          <div className="flex items-center justify-center gap-8 overflow-x-auto pb-4">
            {sponsors.map((sponsor, index) => (
              <motion.div
                key={sponsor.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0"
              >
                <Link
                  to={sponsor.url}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-muted/50 transition-colors min-w-[120px]"
                >
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xl font-bold text-primary border border-primary/20">
                    {sponsor.logo}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{sponsor.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="rounded-lg bg-primary p-2">
                <Trophy className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                NDL
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              National Developers League - Where Computing Becomes a Sport
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Developed by Silicon Valley of Africa (SVA)
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Competition</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/leaderboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/matches" className="text-muted-foreground hover:text-primary transition-colors">
                  Matches
                </Link>
              </li>
              <li>
                <Link to="/teams" className="text-muted-foreground hover:text-primary transition-colors">
                  Teams
                </Link>
              </li>
              <li>
                <Link to="/fixtures" className="text-muted-foreground hover:text-primary transition-colors">
                  Arenas
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About NDL
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Rules & Regulations
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} National Developers League. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

