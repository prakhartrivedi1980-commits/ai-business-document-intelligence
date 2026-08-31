import {
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  RotateCcw,
} from "lucide-react";

import { motion } from "motion/react";

import "./DocumentInfo.css";


function DocumentInfo({
  documentInfo,
  handleReset,
}) {
  const fileType =
    documentInfo.fileType?.toLowerCase();

  const metadata =
    documentInfo.metadata || {};


  const getDocumentIcon = () => {
    if (
      fileType === "xlsx" ||
      fileType === "csv"
    ) {
      return <FileSpreadsheet size={22} />;
    }

    return <FileText size={22} />;
  };


  const renderMetadata = () => {
    if (fileType === "pdf") {
      return (
        <>
          <span>
            {metadata.page_count ?? 0}{" "}
            {metadata.page_count === 1
              ? "page"
              : "pages"}
          </span>

          {metadata.ocr_page_count > 0 && (
            <span>
              {metadata.ocr_page_count} OCR
            </span>
          )}
        </>
      );
    }


    if (fileType === "xlsx") {
      return (
        <>
          <span>
            {metadata.sheet_count ?? 0}{" "}
            {metadata.sheet_count === 1
              ? "sheet"
              : "sheets"}
          </span>

          {metadata.sheets?.length > 0 && (
            <span>
              {metadata.sheets[0]}
            </span>
          )}
        </>
      );
    }


    if (fileType === "csv") {
      return (
        <>
          <span>
            {metadata.row_count ?? 0} rows
          </span>

          <span>
            {metadata.column_count ?? 0} columns
          </span>
        </>
      );
    }

    return null;
  };


  return (
    <motion.div
      className="premium-document-info"
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
      <div className="premium-document-info__main">

        <div className="premium-document-info__icon">
          {getDocumentIcon()}
        </div>


        <div className="premium-document-info__content">

          <div className="premium-document-info__label">
            CURRENT DOCUMENT
          </div>

          <h2>
            {documentInfo.filename}
          </h2>


          <div className="premium-document-info__meta">

            <span className="premium-document-info__type">
              {fileType?.toUpperCase()}
            </span>

            {renderMetadata()}

            <span className="premium-document-info__ready">
              <CheckCircle2 size={13} />
              Ready
            </span>

          </div>

        </div>

      </div>


      <button
        type="button"
        className="premium-document-info__reset"
        onClick={handleReset}
      >
        <RotateCcw size={15} />

        Upload another
      </button>

    </motion.div>
  );
}


export default DocumentInfo;