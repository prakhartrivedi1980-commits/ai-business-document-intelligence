import {
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  UploadCloud,
  X,
} from "lucide-react";

import { motion } from "motion/react";
import "./UploadZone.css";

function UploadZone({
  file,
  dragActive,
  uploadLoading,
  fileInputRef,
  handleFileChange,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleUpload,
  handleReset,
}) {
  const getFileIcon = () => {
    if (!file) {
      return <UploadCloud size={30} />;
    }

    const extension = file.name
      .split(".")
      .pop()
      ?.toLowerCase();

    if (extension === "xlsx" || extension === "csv") {
      return <FileSpreadsheet size={26} />;
    }

    return <FileText size={26} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "0 KB";
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <section
      id="upload"
      className="premium-upload"
    >
      <motion.div
        className="premium-upload__heading"
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
          duration: 0.6,
        }}
      >
        <span className="premium-upload__eyebrow">
          START ANALYZING
        </span>

        <h2>
          Bring your document.
          <br />
          <span>We'll handle the intelligence.</span>
        </h2>

        <p>
          Upload a supported document and turn it into
          searchable, conversational knowledge.
        </p>
      </motion.div>

      <motion.div
        className="premium-upload__card"
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
          duration: 0.65,
          delay: 0.1,
        }}
      >
        <div
          className={`premium-drop-zone ${
            dragActive
              ? "premium-drop-zone--active"
              : ""
          } ${
            file
              ? "premium-drop-zone--selected"
              : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!uploadLoading) {
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.xlsx,.csv"
            onChange={handleFileChange}
            className="hidden-file-input"
          />

          <div className="premium-drop-zone__glow" />

          {!file ? (
            <>
              <motion.div
                className="premium-drop-zone__icon"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <UploadCloud size={30} />
              </motion.div>

              <h3>
                Drop your document here
              </h3>

              <p>
                Drag & drop or{" "}
                <strong>click to browse</strong>
              </p>

              <div className="premium-drop-zone__formats">
                <span>
                  <FileText size={14} />
                  PDF
                </span>

                <span>
                  <FileSpreadsheet size={14} />
                  XLSX
                </span>

                <span>
                  <FileSpreadsheet size={14} />
                  CSV
                </span>
              </div>
            </>
          ) : (
            <div className="premium-selected-file">
              <div className="premium-selected-file__icon">
                {getFileIcon()}
              </div>

              <div className="premium-selected-file__info">
                <span>READY TO ANALYZE</span>

                <strong>
                  {file.name}
                </strong>

                <p>
                  {formatFileSize(file.size)}
                </p>
              </div>

              <CheckCircle2
                className="premium-selected-file__check"
                size={22}
              />
            </div>
          )}
        </div>

        {file && (
          <motion.div
            className="premium-upload__actions"
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <button
              type="button"
              className="premium-upload__remove"
              onClick={handleReset}
              disabled={uploadLoading}
            >
              <X size={16} />
              Remove
            </button>

            <button
              type="button"
              className="premium-upload__analyze"
              onClick={handleUpload}
              disabled={uploadLoading}
            >
              {uploadLoading ? (
                <>
                  <span className="premium-upload__spinner" />
                  Building intelligence...
                </>
              ) : (
                <>
                  Analyze document
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </motion.div>
        )}

        {uploadLoading && (
          <div className="premium-processing">
            <div className="premium-processing__line">
              <span />
            </div>

            <p>
              Extracting content, generating embeddings
              and building your document knowledge index...
            </p>
          </div>
        )}

        <div className="premium-upload__footer">
          <span>
            <CheckCircle2 size={13} />
            PDF, XLSX & CSV
          </span>

          <span className="premium-upload__footer-dot" />

          <span>
            Your document stays in your AI workspace
          </span>
        </div>
      </motion.div>
    </section>
  );
}

export default UploadZone;