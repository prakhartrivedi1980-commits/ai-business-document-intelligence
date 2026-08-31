import {
  ArrowDown,
  BrainCircuit,
  FileSearch,
  Sparkles,
  UploadCloud,
  WandSparkles,
} from "lucide-react";

import { motion } from "motion/react";

import "./HowItWorks.css";


const steps = [
  {
    number: "01",
    icon: UploadCloud,
    title: "Upload your document",
    description:
      "Drop a PDF, Excel workbook or CSV dataset into your workspace.",
    detail: "PDF · XLSX · CSV",
  },
  {
    number: "02",
    icon: FileSearch,
    title: "We extract the content",
    description:
      "Text and structured information are normalized automatically, with OCR fallback for scanned PDF pages.",
    detail: "Extraction + OCR",
  },
  {
    number: "03",
    icon: BrainCircuit,
    title: "AI builds knowledge",
    description:
      "Your content is chunked, converted into embeddings and indexed for semantic retrieval.",
    detail: "Embeddings + Vector Search",
  },
  {
    number: "04",
    icon: WandSparkles,
    title: "You unlock intelligence",
    description:
      "Chat with the document, generate summaries and surface key insights whenever you need them.",
    detail: "RAG + Generative AI",
  },
];


function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="how-it-works"
    >
      <div className="how-it-works__glow" />

      <div className="how-it-works__container">

        {/* HEADING */}

        <motion.div
          className="how-it-works__heading"
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
          <span className="how-it-works__eyebrow">
            <Sparkles size={13} />
            HOW IT WORKS
          </span>

          <h2>
            From document to intelligence
            <br />

            <span>
              in four simple steps.
            </span>
          </h2>

          <p>
            Behind the interface, DocIntel turns
            raw document content into searchable,
            AI-ready knowledge.
          </p>
        </motion.div>


        {/* PIPELINE */}

        <div className="how-it-works__pipeline">

          {steps.map(
            (
              {
                number,
                icon: Icon,
                title,
                description,
                detail,
              },
              index
            ) => (
              <div
                className="how-it-works__step-wrapper"
                key={title}
              >

                <motion.article
                  className="how-step"
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
                    duration: 0.5,
                    delay: index * 0.1,
                  }}
                  whileHover={{
                    y: -6,
                  }}
                >
                  <div className="how-step__top">

                    <span className="how-step__number">
                      {number}
                    </span>

                    <div className="how-step__icon">
                      <Icon size={21} />
                    </div>

                  </div>


                  <div className="how-step__content">

                    <h3>
                      {title}
                    </h3>

                    <p>
                      {description}
                    </p>

                  </div>


                  <div className="how-step__detail">
                    {detail}
                  </div>

                </motion.article>


                {/* Connector between cards */}

                {index < steps.length - 1 && (
                  <motion.div
                    className="how-step__connector"
                    initial={{
                      opacity: 0,
                      scaleX: 0,
                    }}
                    whileInView={{
                      opacity: 1,
                      scaleX: 1,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.5,
                      delay:
                        0.25 + index * 0.1,
                    }}
                  >
                    <span />
                  </motion.div>
                )}

              </div>
            )
          )}

        </div>


        {/* MOBILE FLOW INDICATOR */}

        <div className="how-it-works__mobile-flow">
          <ArrowDown size={18} />
          Intelligence ready
        </div>

      </div>
    </section>
  );
}


export default HowItWorks;