import {
  ArrowRight,
  FileText,
  Lightbulb,
  ReceiptText,
  Sparkles,
} from "lucide-react";

import { motion } from "motion/react";

import "./AIActions.css";


function AIActions({
  summary,
  summaryLoading,

  keyPoints,
  keyPointsLoading,

  invoice,
  invoiceLoading,

  handleSummarize,
  handleKeyPoints,
  handleExtractInvoice,
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

      {/* =====================================================
          HEADING
      ====================================================== */}

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


      {/* =====================================================
          ACTION GRID
      ====================================================== */}

      <div className="ai-actions__grid">

        {/* ===================================================
            SUMMARY
        ==================================================== */}

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


        {/* ===================================================
            KEY POINTS
        ==================================================== */}

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


        {/* ===================================================
            INVOICE INTELLIGENCE
        ==================================================== */}

        <button
          type="button"
          className="ai-action-card ai-action-card--invoice"
          onClick={handleExtractInvoice}
          disabled={invoiceLoading}
        >

          <div className="ai-action-card__top">

            <div className="ai-action-card__icon">
              <ReceiptText size={20} />
            </div>


            <ArrowRight
              className="ai-action-card__arrow"
              size={17}
            />

          </div>


          <div className="ai-action-card__content">

            <span>
              INVOICE INTELLIGENCE
            </span>


            <h4>
              {invoice
                ? "Re-extract invoice data"
                : "Extract invoice data"}
            </h4>


            <p>
              Identify invoice parties, dates,
              line items, taxes, adjustments and
              reconciled financial totals.
            </p>

          </div>


          <div className="ai-action-card__status">

            {invoiceLoading ? (

              <>
                <span className="ai-action-card__loader" />

                Analyzing invoice...
              </>

            ) : invoice ? (

              <>
                <span className="ai-action-card__complete" />

                Invoice data ready
              </>

            ) : (

              "Extract on demand"

            )}

          </div>

        </button>

      </div>

    </motion.section>
  );
}


export default AIActions;