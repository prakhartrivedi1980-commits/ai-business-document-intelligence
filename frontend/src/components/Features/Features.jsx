import {
  BrainCircuit,
  FileSearch,
  MessageSquareText,
  ScanText,
  Sparkles,
  TableProperties,
} from "lucide-react";

import { motion } from "motion/react";

import "./Features.css";


const features = [
  {
    icon: MessageSquareText,
    number: "01",
    title: "Chat with your documents",
    description:
      "Ask natural-language questions and receive answers grounded directly in your uploaded content.",
    tag: "Conversational RAG",
    className: "feature-card--purple",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "Instant AI summaries",
    description:
      "Turn lengthy documents into concise, factual summaries while preserving the information that matters.",
    tag: "AI Summarization",
    className: "feature-card--blue",
  },
  {
    icon: BrainCircuit,
    number: "03",
    title: "Extract key insights",
    description:
      "Surface important findings, decisions, dates, numbers and facts without manually searching every page.",
    tag: "Intelligence Extraction",
    className: "feature-card--violet",
  },
  {
    icon: ScanText,
    number: "04",
    title: "OCR when you need it",
    description:
      "Scanned PDF pages automatically fall back to OCR when usable embedded text isn't available.",
    tag: "Smart OCR",
    className: "feature-card--cyan",
  },
  {
    icon: TableProperties,
    number: "05",
    title: "Understand spreadsheets",
    description:
      "Analyze XLSX workbooks and CSV datasets through the same intelligence workflow as traditional documents.",
    tag: "Structured Data",
    className: "feature-card--indigo",
  },
  {
    icon: FileSearch,
    number: "06",
    title: "Grounded retrieval",
    description:
      "Semantic search retrieves relevant document sections before generation, keeping answers connected to your source.",
    tag: "Vector Search",
    className: "feature-card--green",
  },
];


function Features() {
  return (
    <section
      id="features"
      className="features"
    >
      <div className="features__glow" />

      <div className="features__container">

        <motion.div
          className="features__heading"
          initial={{
            opacity: 0,
            y: 24,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.4,
          }}
          transition={{
            duration: 0.6,
          }}
        >
          <span className="features__eyebrow">
            <Sparkles size={13} />
            DOCUMENT INTELLIGENCE
          </span>

          <h2>
            More than document search.
            <br />

            <span>
              Intelligence built in.
            </span>
          </h2>

          <p>
            One workspace for understanding,
            questioning and extracting knowledge
            from your documents.
          </p>
        </motion.div>


        <div className="features__grid">

          {features.map(
            (
              {
                icon: Icon,
                number,
                title,
                description,
                tag,
                className,
              },
              index
            ) => (
              <motion.article
                key={title}
                className={`feature-card ${className}`}
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
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.07,
                }}
                whileHover={{
                  y: -6,
                }}
              >
                <div className="feature-card__top">

                  <div className="feature-card__icon">
                    <Icon size={21} />
                  </div>

                  <span className="feature-card__number">
                    {number}
                  </span>

                </div>


                <div className="feature-card__content">

                  <h3>
                    {title}
                  </h3>

                  <p>
                    {description}
                  </p>

                </div>


                <div className="feature-card__footer">

                  <span>
                    {tag}
                  </span>

                </div>

              </motion.article>
            )
          )}

        </div>

      </div>
    </section>
  );
}


export default Features;