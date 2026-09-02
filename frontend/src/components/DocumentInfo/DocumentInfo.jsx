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


  // =========================================================
  // DOCUMENT ICON
  // =========================================================

  const getDocumentIcon = () => {
    if (
      fileType === "xlsx" ||
      fileType === "csv"
    ) {
      return (
        <FileSpreadsheet size={22} />
      );
    }

    return <FileText size={22} />;
  };


  // =========================================================
  // FORMAT-SPECIFIC METADATA
  // =========================================================

  const renderMetadata = () => {

    // ---------------------------------------------------------
    // PDF
    // ---------------------------------------------------------

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
              {metadata.ocr_page_count}{" "}
              {metadata.ocr_page_count === 1
                ? "OCR page"
                : "OCR pages"}
            </span>
          )}
        </>
      );
    }


    // ---------------------------------------------------------
    // DOCX
    // ---------------------------------------------------------

    if (fileType === "docx") {
      return (
        <>
          <span>
            {metadata.paragraph_count ?? 0}{" "}
            {metadata.paragraph_count === 1
              ? "paragraph"
              : "paragraphs"}
          </span>


          <span>
            {metadata.table_count ?? 0}{" "}
            {metadata.table_count === 1
              ? "table"
              : "tables"}
          </span>


          {metadata.table_row_count > 0 && (
            <span>
              {metadata.table_row_count}{" "}
              {metadata.table_row_count === 1
                ? "table row"
                : "table rows"}
            </span>
          )}
        </>
      );
    }


    // ---------------------------------------------------------
    // TXT
    // ---------------------------------------------------------

    if (fileType === "txt") {
      return (
        <>
          <span>
            {metadata.word_count ?? 0}{" "}
            {metadata.word_count === 1
              ? "word"
              : "words"}
          </span>


          <span>
            {metadata.line_count ?? 0}{" "}
            {metadata.line_count === 1
              ? "line"
              : "lines"}
          </span>


          <span>
            {metadata.character_count ?? 0}{" "}
            {metadata.character_count === 1
              ? "character"
              : "characters"}
          </span>
        </>
      );
    }


    // ---------------------------------------------------------
    // XLSX
    // ---------------------------------------------------------

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


    // ---------------------------------------------------------
    // CSV
    // ---------------------------------------------------------

    if (fileType === "csv") {
      return (
        <>
          <span>
            {metadata.row_count ?? 0}{" "}
            {metadata.row_count === 1
              ? "row"
              : "rows"}
          </span>


          <span>
            {metadata.column_count ?? 0}{" "}
            {metadata.column_count === 1
              ? "column"
              : "columns"}
          </span>
        </>
      );
    }


    return null;
  };


  // =========================================================
  // UI
  // =========================================================

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

      {/* =====================================================
          DOCUMENT
      ====================================================== */}

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


          {/* =================================================
              METADATA
          ================================================== */}

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


      {/* =====================================================
          RESET
      ====================================================== */}

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