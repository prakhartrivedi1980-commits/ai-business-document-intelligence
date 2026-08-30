import { ArrowUpRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import "./navbar.css";

function Navbar() {
  return (
    <motion.header
      className="navbar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="navbar__inner">

        <a href="/" className="navbar__brand">
          <span className="navbar__logo">
            <Sparkles size={18} />
          </span>

          <span className="navbar__name">
            Doc<span>Intel</span>
          </span>
        </a>

        <nav className="navbar__links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#supported">Supported files</a>
        </nav>

        <a
          href="#upload"
          className="navbar__cta"
        >
          Analyze document
          <ArrowUpRight size={16} />
        </a>

      </div>
    </motion.header>
  );
}

export default Navbar;