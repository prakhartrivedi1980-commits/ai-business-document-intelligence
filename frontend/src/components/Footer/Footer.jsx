import {
  ArrowUp,
  FileSpreadsheet,
  FileText,
  Sparkles,
} from "lucide-react";

import "./Footer.css";


function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  return (
    <footer className="footer">

      <div className="footer__glow" />


      <div className="footer__container">

        {/* TOP */}

        <div className="footer__top">

          {/* BRAND */}

          <div className="footer__brand">

            <a
              href="/"
              className="footer__logo"
            >
              <span className="footer__logo-icon">
                <Sparkles size={18} />
              </span>

              <span className="footer__logo-name">
                Doc<span>Intel</span>
              </span>
            </a>


            <p>
              Turn documents into searchable,
              conversational knowledge with
              AI-powered extraction, retrieval
              and generation.
            </p>


            <div className="footer__formats">

              <span>
                <FileText size={13} />
                PDF
              </span>

              <span>
                <FileSpreadsheet size={13} />
                XLSX
              </span>

              <span>
                <FileSpreadsheet size={13} />
                CSV
              </span>

            </div>

          </div>


          {/* NAVIGATION */}

          <div className="footer__links">

            <div className="footer__column">

              <span className="footer__column-title">
                PRODUCT
              </span>

              <a href="#features">
                Features
              </a>

              <a href="#how-it-works">
                How it works
              </a>

              <a href="#supported">
                Supported files
              </a>

              <a href="#upload">
                Analyze document
              </a>

            </div>


            <div className="footer__column">

              <span className="footer__column-title">
                INTELLIGENCE
              </span>

              <span>
                Document Chat
              </span>

              <span>
                AI Summaries
              </span>

              <span>
                Key Insights
              </span>

              <span>
                OCR Extraction
              </span>

            </div>


            <div className="footer__column">

              <span className="footer__column-title">
                TECHNOLOGY
              </span>

              <span>
                FastAPI
              </span>

              <span>
                Ollama
              </span>

              <span>
                Qdrant
              </span>

              <span>
                React
              </span>

            </div>

          </div>

        </div>


        {/* DIVIDER */}

        <div className="footer__divider" />


        {/* BOTTOM */}

        <div className="footer__bottom">

          <div className="footer__bottom-left">

            <span>
              © 2026 DocIntel
            </span>

            <span className="footer__dot" />

            <span>
              AI Document Intelligence
            </span>

          </div>


          <div className="footer__bottom-right">

            <span className="footer__built">
              Built with AI
            </span>


            <button
              type="button"
              className="footer__top-button"
              onClick={scrollToTop}
              aria-label="Back to top"
            >
              <ArrowUp size={15} />
            </button>

          </div>

        </div>

      </div>

    </footer>
  );
}


export default Footer;