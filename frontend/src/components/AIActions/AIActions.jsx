import {
  ArrowRight,
  FileText,
  Lightbulb,
  Sparkles,
} from "lucide-react";

import { motion } from "motion/react";

import "./AIActions.css";


function AIActions({
  summary,
  summaryLoading,
  keyPoints,
  keyPointsLoading,
  handleSummarize,
  handleKeyPoints,
}) {
  return (
    <motion.section
      className="ai-actions"
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
    >
      <div className="ai-actions__heading">
        <div>
          <span className="ai-actions__eyebrow">
            <Sparkles size={12} />
            AI ACTIONS
          </span>

          <h3>
            Turn your document into insights
          </h3>

          <p>
            Generate intelligence on demand without
            leaving your workspace.
          </p>
        </div>
      </div>


      <div className="ai-actions__grid">

        {/* SUMMARY */}

        <button
          type="button"
          className="ai-action-card"
          onClick={handleSummarize}
          disabled={summaryLoading}
        >
          <div className="ai-action-card__top">

            <div className="ai-action-card__icon">
              <FileText size={20} />
            </div>

            <ArrowRight
              className="ai-action-card__arrow"
              size={17}
            />

          </div>


          <div className="ai-action-card__content">

            <span>
              SUMMARIZATION
            </span>

            <h4>
              {summary
                ? "Regenerate summary"
                : "Generate summary"}
            </h4>

            <p>
              Condense the document into a clear,
              factual overview of its most important
              information.
            </p>

          </div>


          <div className="ai-action-card__status">

            {summaryLoading ? (
              <>
                <span className="ai-action-card__loader" />
                AI is summarizing...
              </>
            ) : summary ? (
              <>
                <span className="ai-action-card__complete" />
                Summary ready
              </>
            ) : (
              "Generate on demand"
            )}

          </div>
        </button>


        {/* KEY POINTS */}

        <button
          type="button"
          className="ai-action-card ai-action-card--blue"
          onClick={handleKeyPoints}
          disabled={keyPointsLoading}
        >
          <div className="ai-action-card__top">

            <div className="ai-action-card__icon">
              <Lightbulb size={20} />
            </div>

            <ArrowRight
              className="ai-action-card__arrow"
              size={17}
            />

          </div>


          <div className="ai-action-card__content">

            <span>
              KEY INSIGHTS
            </span>

            <h4>
              {keyPoints.length > 0
                ? "Regenerate key points"
                : "Extract key points"}
            </h4>

            <p>
              Surface the decisions, facts, findings,
              numbers and details that matter most.
            </p>

          </div>


          <div className="ai-action-card__status">

            {keyPointsLoading ? (
              <>
                <span className="ai-action-card__loader" />
                Extracting insights...
              </>
            ) : keyPoints.length > 0 ? (
              <>
                <span className="ai-action-card__complete" />
                {keyPoints.length} insights ready
              </>
            ) : (
              "Generate on demand"
            )}

          </div>
        </button>

      </div>
    </motion.section>
  );
}


export default AIActions;