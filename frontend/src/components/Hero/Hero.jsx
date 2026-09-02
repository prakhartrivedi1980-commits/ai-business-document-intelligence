import {
  ArrowRight,
  FileSpreadsheet,
  FileText,
  MessageSquareText,
  ScanText,
  Sparkles,
} from "lucide-react";

import { motion } from "motion/react";

import "./Hero.css";


function Hero() {
  return (
    <section className="premium-hero">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="premium-hero__grid" />

      <div className="premium-hero__glow premium-hero__glow--one" />
      <div className="premium-hero__glow premium-hero__glow--two" />


      <div className="premium-hero__content">

        {/* ===================================================
            BADGE
        ==================================================== */}

        <motion.div
          className="premium-hero__badge"
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.15,
          }}
        >
          <Sparkles size={14} />

          <span>
            AI-powered document intelligence
          </span>

          <span className="premium-hero__badge-dot" />
        </motion.div>


        {/* ===================================================
            MAIN HEADING
        ==================================================== */}

        <motion.h1
          className="premium-hero__title"
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.25,
          }}
        >
          Your documents.
          <br />

          <span>
            Finally intelligent.
          </span>
        </motion.h1>


        {/* ===================================================
            DESCRIPTION
        ==================================================== */}

        <motion.p
          className="premium-hero__description"
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.38,
          }}
        >
          Turn complex documents into conversations and
          insights. Upload your files, ask questions,
          generate summaries and uncover what matters —
          powered by AI.
        </motion.p>


        {/* ===================================================
            CTA
        ==================================================== */}

        <motion.div
          className="premium-hero__actions"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            delay: 0.5,
          }}
        >
          <a
            href="#upload"
            className="premium-hero__primary"
          >
            Analyze a document

            <ArrowRight size={18} />
          </a>


          <a
            href="#features"
            className="premium-hero__secondary"
          >
            Explore features
          </a>
        </motion.div>


        {/* ===================================================
            SUPPORTED FORMATS
        ==================================================== */}

        <motion.div
          className="premium-hero__formats"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.7,
            delay: 0.65,
          }}
        >
          <span>
            Works with
          </span>


          <div>
            <FileText size={15} />
            PDF
          </div>


          <div>
            <FileText size={15} />
            DOCX
          </div>


          <div>
            <FileText size={15} />
            TXT
          </div>


          <div>
            <FileSpreadsheet size={15} />
            XLSX
          </div>


          <div>
            <FileSpreadsheet size={15} />
            CSV
          </div>

        </motion.div>


        {/* ===================================================
            PRODUCT PREVIEW
        ==================================================== */}

        <motion.div
          className="premium-hero__preview"
          initial={{
            opacity: 0,
            y: 50,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.9,
            delay: 0.7,
          }}
        >
          <div className="premium-hero__preview-glow" />


          <div className="preview-window">

            {/* ===============================================
                WINDOW TOP
            ================================================ */}

            <div className="preview-window__top">

              <div className="preview-window__dots">
                <span />
                <span />
                <span />
              </div>


              <span className="preview-window__filename">
                project-report.pdf
              </span>


              <div className="preview-window__status">
                <span />

                Ready
              </div>

            </div>


            {/* ===============================================
                WINDOW CONTENT
            ================================================ */}

            <div className="preview-window__body">

              {/* =============================================
                  DOCUMENT SIDE
              ============================================== */}

              <div className="preview-document">

                <div className="preview-document__header">

                  <div className="preview-document__icon">
                    <FileText size={21} />
                  </div>


                  <div>
                    <strong>
                      Project Report
                    </strong>

                    <span>
                      PDF · 24 pages
                    </span>
                  </div>

                </div>


                <div className="preview-document__lines">

                  <span className="preview-line preview-line--large" />

                  <span className="preview-line" />

                  <span className="preview-line preview-line--medium" />

                  <span className="preview-line preview-line--small" />


                  <div className="preview-document__highlight">
                    AI identifies relevant information
                    across the entire document.
                  </div>


                  <span className="preview-line preview-line--large" />

                  <span className="preview-line preview-line--medium" />

                  <span className="preview-line" />

                </div>

              </div>


              {/* =============================================
                  AI SIDE
              ============================================== */}

              <div className="preview-ai">

                <div className="preview-ai__title">
                  <Sparkles size={16} />

                  AI Intelligence
                </div>


                <div className="preview-insight">

                  <div className="preview-insight__icon">
                    <ScanText size={17} />
                  </div>


                  <div>
                    <strong>
                      Smart Summary
                    </strong>

                    <p>
                      Important information condensed
                      automatically.
                    </p>
                  </div>

                </div>


                <div className="preview-insight">

                  <div className="preview-insight__icon">
                    <MessageSquareText size={17} />
                  </div>


                  <div>
                    <strong>
                      Ask anything
                    </strong>

                    <p>
                      Have a conversation grounded in
                      your document.
                    </p>
                  </div>

                </div>


                <div className="preview-ai__question">

                  <span>
                    What are the main findings?
                  </span>

                  <ArrowRight size={15} />

                </div>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}


export default Hero;