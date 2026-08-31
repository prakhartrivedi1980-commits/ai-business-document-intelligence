import {
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { motion } from "motion/react";

import "./Summary.css";


function Summary({
  summary,
  summaryLoading,
  handleSummarize,
}) {
  return (
    <motion.section
      className="premium-summary"
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
      }}
    >
      <div className="premium-summary__header">

        <div className="premium-summary__title">

          <div className="premium-summary__icon">
            <Sparkles size={18} />
          </div>

          <div>
            <span>AI GENERATED</span>
            <h3>Document Summary</h3>
          </div>

        </div>


        {summary && !summaryLoading && (
          <button
            type="button"
            className="premium-summary__regenerate"
            onClick={handleSummarize}
          >
            <RefreshCw size={14} />
            Regenerate
          </button>
        )}

      </div>


      {summaryLoading ? (
        <div className="premium-summary__loading">

          <div className="summary-skeleton summary-skeleton--large" />
          <div className="summary-skeleton" />
          <div className="summary-skeleton summary-skeleton--medium" />
          <div className="summary-skeleton summary-skeleton--large" />
          <div className="summary-skeleton summary-skeleton--small" />

          <div className="premium-summary__thinking">
            <span />
            AI is reading your document...
          </div>

        </div>
      ) : (
        <motion.p
          className="premium-summary__content"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.5,
          }}
        >
          {summary}
        </motion.p>
      )}

    </motion.section>
  );
}


export default Summary;