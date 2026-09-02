import {
  FileSpreadsheet,
  FileText,
  ScanText,
  Sheet,
  Sparkles,
} from "lucide-react";

import { motion } from "motion/react";

import "./SupportedFiles.css";


const fileTypes = [
  // =========================================================
  // PDF
  // =========================================================

  {
    extension: "PDF",
    icon: FileText,
    title: "PDF Documents",

    description:
      "Analyze digital and scanned PDF documents with automatic text extraction and OCR fallback.",

    capabilities: [
      "Embedded text extraction",
      "Automatic OCR fallback",
      "Page metadata",
      "Document chat",
    ],

    accent: "purple",
  },


  // =========================================================
  // DOCX
  // =========================================================

  {
    extension: "DOCX",
    icon: FileText,
    title: "Word Documents",

    description:
      "Turn Microsoft Word documents, paragraphs and tables into searchable conversational knowledge.",

    capabilities: [
      "Paragraph extraction",
      "Table extraction",
      "Document structure metadata",
      "AI analysis",
    ],

    accent: "violet",
  },


  // =========================================================
  // TXT
  // =========================================================

  {
    extension: "TXT",
    icon: FileText,
    title: "Text Documents",

    description:
      "Analyze lightweight plain-text documents through the same retrieval, summarization and document-chat workflow.",

    capabilities: [
      "Plain-text extraction",
      "Word and line metadata",
      "Semantic indexing",
      "Conversational analysis",
    ],

    accent: "cyan",
  },


  // =========================================================
  // XLSX
  // =========================================================

  {
    extension: "XLSX",
    icon: FileSpreadsheet,
    title: "Excel Workbooks",

    description:
      "Turn workbook sheets and structured spreadsheet content into searchable AI knowledge.",

    capabilities: [
      "Multiple worksheets",
      "Sheet detection",
      "Structured extraction",
      "AI analysis",
    ],

    accent: "green",
  },


  // =========================================================
  // CSV
  // =========================================================

  {
    extension: "CSV",
    icon: Sheet,
    title: "CSV Datasets",

    description:
      "Upload tabular datasets and interact with their extracted rows and columns through the same AI workspace.",

    capabilities: [
      "Row detection",
      "Column detection",
      "Structured text conversion",
      "Conversational analysis",
    ],

    accent: "blue",
  },
];


function SupportedFiles() {
  return (
    <section
      id="supported"
      className="supported-files"
    >
      <div className="supported-files__glow" />


      <div className="supported-files__container">

        {/* ===================================================
            HEADING
        ==================================================== */}

        <motion.div
          className="supported-files__heading"
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
          <span className="supported-files__eyebrow">
            <Sparkles size={13} />

            MULTI-FORMAT INTELLIGENCE
          </span>


          <h2>
            Different files.
            <br />

            <span>
              One intelligent workspace.
            </span>
          </h2>


          <p>
            Work with documents, text and structured
            data through one consistent AI-powered
            experience.
          </p>

        </motion.div>


        {/* ===================================================
            FILE TYPE CARDS
        ==================================================== */}

        <div className="supported-files__grid">

          {fileTypes.map(
            (
              {
                extension,
                icon: Icon,
                title,
                description,
                capabilities,
                accent,
              },
              index
            ) => (

              <motion.article
                className={
                  `file-type-card file-type-card--${accent}`
                }
                key={extension}
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
                  amount: 0.25,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                whileHover={{
                  y: -7,
                }}
              >

                {/* ===========================================
                    CARD TOP
                ============================================ */}

                <div className="file-type-card__top">

                  <div className="file-type-card__icon">
                    <Icon size={25} />
                  </div>


                  <span className="file-type-card__extension">
                    .{extension.toLowerCase()}
                  </span>

                </div>


                {/* ===========================================
                    CARD CONTENT
                ============================================ */}

                <div className="file-type-card__content">

                  <span className="file-type-card__label">
                    {extension}
                  </span>


                  <h3>
                    {title}
                  </h3>


                  <p>
                    {description}
                  </p>

                </div>


                {/* ===========================================
                    CAPABILITIES
                ============================================ */}

                <div className="file-type-card__capabilities">

                  {capabilities.map(
                    (capability) => (

                      <div key={capability}>
                        <span />

                        {capability}
                      </div>

                    )
                  )}

                </div>

              </motion.article>

            )
          )}

        </div>


        {/* ===================================================
            OCR CALLOUT
        ==================================================== */}

        <motion.div
          className="supported-files__ocr"
          initial={{
            opacity: 0,
            y: 20,
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
            duration: 0.55,
            delay: 0.15,
          }}
        >

          <div className="supported-files__ocr-icon">
            <ScanText size={20} />
          </div>


          <div>

            <span>
              SMART OCR FALLBACK
            </span>


            <h4>
              Scanned PDFs aren't left behind.
            </h4>


            <p>
              When a PDF page contains little or no
              embedded text, DocIntel automatically
              switches to OCR extraction.
            </p>

          </div>

        </motion.div>

      </div>

    </section>
  );
}


export default SupportedFiles;