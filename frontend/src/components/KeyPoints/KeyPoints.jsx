import {
  Lightbulb,
  RefreshCw,
} from "lucide-react";

import { motion } from "motion/react";

import "./KeyPoints.css";


function KeyPoints({
  keyPoints,
  keyPointsLoading,
  handleKeyPoints,
}) {
  return (
    <motion.section
      className="premium-keypoints"
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
      {/* HEADER */}

      <div className="premium-keypoints__header">

        <div className="premium-keypoints__title">

          <div className="premium-keypoints__icon">
            <Lightbulb size={18} />
          </div>

          <div>
            <span>AI EXTRACTED</span>
            <h3>Key Insights</h3>
          </div>

        </div>


        {keyPoints.length > 0 &&
          !keyPointsLoading && (
            <button
              type="button"
              className="premium-keypoints__regenerate"
              onClick={handleKeyPoints}
            >
              <RefreshCw size={14} />
              Regenerate
            </button>
          )}

      </div>


      {/* LOADING */}

      {keyPointsLoading ? (
        <div className="premium-keypoints__loading">

          {[1, 2, 3].map((item) => (
            <div
              className="premium-keypoints__skeleton"
              key={item}
            >
              <div className="premium-keypoints__skeleton-number" />

              <div className="premium-keypoints__skeleton-content">
                <span />
                <span />
              </div>
            </div>
          ))}

          <div className="premium-keypoints__thinking">
            <span />
            Extracting the most important insights...
          </div>

        </div>
      ) : (

        /* KEY POINTS */

        <div className="premium-keypoints__list">

          {keyPoints.map(
            (point, index) => (
              <motion.div
                className="premium-keypoint"
                key={`${index}-${point}`}
                initial={{
                  opacity: 0,
                  x: -12,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.07,
                }}
              >
                <div className="premium-keypoint__number">
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </div>

                <p>
                  {point}
                </p>
              </motion.div>
            )
          )}

        </div>
      )}

    </motion.section>
  );
}


export default KeyPoints;