import {
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import { motion } from "motion/react";

import "./UploadZone.css";


function UploadZone({
  files,
  dragActive,
  uploadLoading,
  fileInputRef,
  handleFileChange,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleUpload,
  handleRemoveFile,
  handleClearFiles,
}) {

  // =========================================================
  // FILE ICON
  // =========================================================

  const getFileIcon = (
    file
  ) => {

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();


    if (
      extension === "xlsx" ||
      extension === "csv"
    ) {

      return (
        <FileSpreadsheet
          size={22}
        />
      );
    }


    return (
      <FileText
        size={22}
      />
    );
  };


  // =========================================================
  // FILE SIZE
  // =========================================================

  const formatFileSize = (
    bytes
  ) => {

    if (!bytes) {
      return "0 KB";
    }


    if (
      bytes <
      1024 * 1024
    ) {

      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }


    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };


  // =========================================================
  // OPEN FILE PICKER
  // =========================================================

  const openFilePicker = (
    event
  ) => {

    event?.stopPropagation();


    if (!uploadLoading) {

      fileInputRef.current?.click();
    }
  };


  // =========================================================
  // REMOVE FILE
  // =========================================================

  const removeFile = (
    event,
    file
  ) => {

    event.stopPropagation();


    if (!uploadLoading) {

      handleRemoveFile(
        file
      );
    }
  };


  // =========================================================
  // CLEAR FILES
  // =========================================================

  const clearFiles = (
    event
  ) => {

    event.stopPropagation();


    if (!uploadLoading) {

      handleClearFiles();
    }
  };


  // =========================================================
  // UI
  // =========================================================

  return (
    <section
      id="upload"
      className="premium-upload"
    >

      {/* =====================================================
          HEADING
      ====================================================== */}

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
          Bring your documents.
          <br />

          <span>
            We'll handle the intelligence.
          </span>
        </h2>


        <p>
          Upload one or multiple supported
          documents and turn them into
          searchable, conversational knowledge.
        </p>

      </motion.div>


      {/* =====================================================
          UPLOAD CARD
      ====================================================== */}

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

        {/* ===================================================
            DROP ZONE
        ==================================================== */}

        <div
          className={`premium-drop-zone ${
            dragActive
              ? "premium-drop-zone--active"
              : ""
          } ${
            files.length > 0
              ? "premium-drop-zone--selected"
              : ""
          }`}
          onDragOver={
            handleDragOver
          }
          onDragLeave={
            handleDragLeave
          }
          onDrop={
            handleDrop
          }
          onClick={
            openFilePicker
          }
        >

          <input
            ref={
              fileInputRef
            }
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.xlsx,.csv"
            onChange={
              handleFileChange
            }
            className="hidden-file-input"
          />


          <div
            className="premium-drop-zone__glow"
          />


          {/* =================================================
              NO FILES SELECTED
          ================================================== */}

          {files.length === 0 ? (
            <>

              <motion.div
                className="premium-drop-zone__icon"
                animate={{
                  y: [
                    0,
                    -5,
                    0,
                  ],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >

                <UploadCloud
                  size={30}
                />

              </motion.div>


              <h3>
                Drop your documents here
              </h3>


              <p>
                Drag & drop one or multiple
                files or{" "}

                <strong>
                  click to browse
                </strong>
              </p>


              {/* =============================================
                  SUPPORTED FORMATS
              ============================================== */}

              <div
                className="premium-drop-zone__formats"
              >

                <span>
                  <FileText
                    size={14}
                  />

                  PDF
                </span>


                <span>
                  <FileText
                    size={14}
                  />

                  DOCX
                </span>


                <span>
                  <FileText
                    size={14}
                  />

                  TXT
                </span>


                <span>
                  <FileSpreadsheet
                    size={14}
                  />

                  XLSX
                </span>


                <span>
                  <FileSpreadsheet
                    size={14}
                  />

                  CSV
                </span>

              </div>

            </>

          ) : (

            /* ===============================================
               MULTIPLE FILES SELECTED
            ================================================ */

            <div
              className="premium-selected-files"
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >

              {/* =============================================
                  SELECTED HEADER
              ============================================== */}

              <div
                className="premium-selected-files__header"
              >

                <div
                  className="premium-selected-files__title"
                >

                  <div
                    className="premium-selected-files__status-icon"
                  >
                    <CheckCircle2
                      size={18}
                    />
                  </div>


                  <div>
                    <span>
                      READY TO ANALYZE
                    </span>

                    <strong>
                      {files.length}{" "}
                      {files.length === 1
                        ? "document"
                        : "documents"}{" "}
                      selected
                    </strong>
                  </div>

                </div>


                <button
                  type="button"
                  className="premium-selected-files__clear"
                  onClick={
                    clearFiles
                  }
                  disabled={
                    uploadLoading
                  }
                >
                  <Trash2
                    size={14}
                  />

                  Clear all
                </button>

              </div>


              {/* =============================================
                  FILE LIST
              ============================================== */}

              <div
                className="premium-selected-files__list"
              >

                {files.map(
                  (
                    file,
                    index
                  ) => (

                    <motion.div
                      className="premium-selected-file"
                      key={
                        `${file.name}-${file.size}-${file.lastModified}`
                      }
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.25,
                        delay:
                          Math.min(
                            index * 0.04,
                            0.2
                          ),
                      }}
                    >

                      <div
                        className="premium-selected-file__icon"
                      >
                        {getFileIcon(
                          file
                        )}
                      </div>


                      <div
                        className="premium-selected-file__info"
                      >

                        <strong>
                          {file.name}
                        </strong>


                        <p>
                          {formatFileSize(
                            file.size
                          )}
                        </p>

                      </div>


                      <div
                        className="premium-selected-file__ready"
                      >
                        Ready
                      </div>


                      <button
                        type="button"
                        className="premium-selected-file__remove"
                        aria-label={`Remove ${file.name}`}
                        onClick={(
                          event
                        ) =>
                          removeFile(
                            event,
                            file
                          )
                        }
                        disabled={
                          uploadLoading
                        }
                      >
                        <X
                          size={16}
                        />
                      </button>

                    </motion.div>

                  )
                )}

              </div>


              {/* =============================================
                  ADD MORE
              ============================================== */}

              <button
                type="button"
                className="premium-selected-files__add"
                onClick={
                  openFilePicker
                }
                disabled={
                  uploadLoading
                }
              >

                <Plus
                  size={16}
                />

                Add more documents

              </button>

            </div>

          )}

        </div>


        {/* ===================================================
            FILE ACTIONS
        ==================================================== */}

        {files.length > 0 && (

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
              onClick={
                handleClearFiles
              }
              disabled={
                uploadLoading
              }
            >

              <X
                size={16}
              />

              Clear selection

            </button>


            <button
              type="button"
              className="premium-upload__analyze"
              onClick={
                handleUpload
              }
              disabled={
                uploadLoading
              }
            >

              {uploadLoading ? (
                <>

                  <span
                    className="premium-upload__spinner"
                  />

                  Building intelligence...

                </>

              ) : (
                <>

                  Analyze{" "}
                  {files.length === 1
                    ? "document"
                    : `${files.length} documents`}

                  <ArrowRight
                    size={17}
                  />

                </>
              )}

            </button>

          </motion.div>

        )}


        {/* ===================================================
            PROCESSING
        ==================================================== */}

        {uploadLoading && (

          <div
            className="premium-processing"
          >

            <div
              className="premium-processing__line"
            >
              <span />
            </div>


            <p>
              Extracting content, generating
              embeddings and building knowledge
              indexes for your documents...
            </p>

          </div>

        )}


        {/* ===================================================
            FOOTER
        ==================================================== */}

        <div
          className="premium-upload__footer"
        >

          <span>
            <CheckCircle2
              size={13}
            />

            PDF, DOCX, TXT, XLSX & CSV
          </span>


          <span
            className="premium-upload__footer-dot"
          />


          <span>
            Multiple document upload supported
          </span>

        </div>

      </motion.div>

    </section>
  );
}


export default UploadZone;