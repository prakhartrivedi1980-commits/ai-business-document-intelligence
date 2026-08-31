import {
  ArrowRight,
  FileText,
  Sparkles,
} from "lucide-react";

import { motion } from "motion/react";

import "./FinalCTA.css";


function FinalCTA() {
  const scrollToUpload = () => {
    const uploadSection =
      document.getElementById("upload");

    if (uploadSection) {
      uploadSection.scrollIntoView({
        behavior: "smooth",
      });
    }
  };


  return (
    <section className="final-cta">

      <div className="final-cta__glow" />

      <motion.div
        className="final-cta__card"
        initial={{
          opacity: 0,
          y: 30,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.3,
        }}
        transition={{
          duration: 0.65,
        }}
      >
        {/* Decorative elements */}

        <div className="final-cta__grid" />

        <motion.div
          className="final-cta__floating final-cta__floating--left"
          animate={{
            y: [0, -8, 0],
            rotate: [-4, -1, -4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <FileText size={20} />
        </motion.div>


        <motion.div
          className="final-cta__floating final-cta__floating--right"
          animate={{
            y: [0, 8, 0],
            rotate: [5, 2, 5],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkles size={19} />
        </motion.div>


        {/* Content */}

        <div className="final-cta__content">

          <span className="final-cta__eyebrow">
            <Sparkles size={13} />
            READY WHEN YOU ARE
          </span>


          <h2>
            Your next document already
            <br />

            <span>
              has answers inside it.
            </span>
          </h2>


          <p>
            Upload it, turn it into searchable
            knowledge, and start asking better
            questions.
          </p>


          <button
            type="button"
            className="final-cta__button"
            onClick={scrollToUpload}
          >
            Analyze a document

            <ArrowRight size={17} />
          </button>

        </div>

      </motion.div>

    </section>
  );
}


export default FinalCTA;