import { useRef, useState } from "react";

import "./App.css";

import Navbar from "./components/Navbar/Navbar.jsx";
import Hero from "./components/Hero/Hero.jsx";
import UploadZone from "./components/UploadZone/UploadZone.jsx";
import DocumentInfo from "./components/DocumentInfo/DocumentInfo.jsx";
import Summary from "./components/Summary/Summary.jsx";
import KeyPoints from "./components/KeyPoints/KeyPoints.jsx";
import Chat from "./components/Chat/Chat.jsx";
import AIActions from "./components/AIActions/AIActions.jsx";
import Invoice from "./components/Invoice/Invoice.jsx";
import Features from "./components/Features/Features.jsx";
import HowItWorks from "./components/HowItWorks/HowItWorks.jsx";
import SupportedFiles from "./components/SupportedFiles/SupportedFiles.jsx";
import FinalCTA from "./components/FinalCTA/FinalCTA.jsx";
import Footer from "./components/Footer/Footer.jsx";


const API_BASE_URL =
  "http://127.0.0.1:8000";


function App() {

  // =========================================================
  // SELECTED FILES
  // =========================================================

  const [files, setFiles] =
    useState([]);


  // =========================================================
  // UPLOADED DOCUMENTS
  // =========================================================

  const [documents, setDocuments] =
    useState([]);


  // =========================================================
  // ACTIVE DOCUMENT
  // =========================================================

  const [documentInfo, setDocumentInfo] =
    useState(null);

  const [documentId, setDocumentId] =
    useState(null);


  // =========================================================
  // PER-DOCUMENT AI RESULTS
  // =========================================================

  /*
   * AI results are stored separately for
   * every uploaded document.
   *
   * Example:
   *
   * {
   *   "document-id-1": {
   *     summary: "...",
   *     keyPoints: [...],
   *     invoice: {...}
   *   },
   *
   *   "document-id-2": {
   *     summary: "...",
   *     keyPoints: [...],
   *     invoice: {...}
   *   }
   * }
   */

  const [
    documentResults,
    setDocumentResults,
  ] = useState({});


  // =========================================================
  // UPLOAD
  // =========================================================

  const [uploadLoading, setUploadLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [dragActive, setDragActive] =
    useState(false);


  // =========================================================
  // AI LOADING STATES
  // =========================================================

  const [summaryLoading, setSummaryLoading] =
    useState(false);

  const [
    keyPointsLoading,
    setKeyPointsLoading,
  ] = useState(false);

  const [
    invoiceLoading,
    setInvoiceLoading,
  ] = useState(false);


  // =========================================================
  // SHARED MULTI-DOCUMENT CHAT
  // =========================================================

  /*
   * Chat belongs to the complete uploaded
   * document collection, not to the active
   * document.
   *
   * Therefore switching documents must NOT
   * clear these states.
   */

  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [chatLoading, setChatLoading] =
    useState(false);

  const [chatError, setChatError] =
    useState("");


  // =========================================================
  // REFERENCES
  // =========================================================

  const fileInputRef =
    useRef(null);


  // =========================================================
  // CURRENT DOCUMENT AI RESULTS
  // =========================================================

  /*
   * Whenever documentId changes, these values
   * automatically point to that document's
   * cached AI results.
   */

  const currentDocumentResults =
    documentId
      ? documentResults[documentId] || {}
      : {};


  const summary =
    currentDocumentResults.summary || "";


  const keyPoints =
    currentDocumentResults.keyPoints || [];


  const invoice =
    currentDocumentResults.invoice || null;


  // =========================================================
  // UPDATE ONE DOCUMENT'S AI RESULTS
  // =========================================================

  const updateDocumentResults = (
    targetDocumentId,
    updates
  ) => {

    if (!targetDocumentId) {
      return;
    }


    setDocumentResults(
      (previousResults) => ({
        ...previousResults,

        [targetDocumentId]: {
          ...(
            previousResults[
              targetDocumentId
            ] || {}
          ),

          ...updates,
        },
      })
    );
  };


  // =========================================================
  // RESET COMPLETE DOCUMENT WORKSPACE
  // =========================================================

  const resetDocumentWorkspace = () => {

    setDocumentInfo(null);

    setDocumentId(null);

    setDocumentResults({});


    setQuestion("");

    setMessages([]);

    setChatError("");


    setSummaryLoading(false);

    setKeyPointsLoading(false);

    setInvoiceLoading(false);

    setChatLoading(false);
  };


  // =========================================================
  // FILE VALIDATION
  // =========================================================

  const validateAndSetFiles = (
    selectedFiles
  ) => {

    if (
      !selectedFiles ||
      selectedFiles.length === 0
    ) {
      return;
    }


    const allowedExtensions = [
      ".pdf",
      ".docx",
      ".txt",
      ".xlsx",
      ".csv",
    ];


    const incomingFiles =
      Array.from(
        selectedFiles
      );


    const validFiles = [];

    const invalidFiles = [];


    incomingFiles.forEach(
      (selectedFile) => {

        const filename =
          selectedFile.name
            .toLowerCase();


        const isSupported =
          allowedExtensions.some(
            (extension) =>
              filename.endsWith(
                extension
              )
          );


        if (isSupported) {

          validFiles.push(
            selectedFile
          );

        } else {

          invalidFiles.push(
            selectedFile.name
          );
        }
      }
    );


    // -------------------------------------------------------
    // INVALID FILES
    // -------------------------------------------------------

    if (
      invalidFiles.length > 0
    ) {

      setError(
        `Unsupported file type: ${invalidFiles.join(
          ", "
        )}. Please upload PDF, DOCX, TXT, XLSX, or CSV documents.`
      );

    } else {

      setError("");
    }


    // -------------------------------------------------------
    // ADD VALID FILES
    // -------------------------------------------------------

    if (
      validFiles.length > 0
    ) {

      setFiles(
        (previousFiles) => {

          const existingKeys =
            new Set(
              previousFiles.map(
                (file) =>
                  `${file.name}-${file.size}-${file.lastModified}`
              )
            );


          const newFiles =
            validFiles.filter(
              (file) => {

                const key =
                  `${file.name}-${file.size}-${file.lastModified}`;


                return !existingKeys.has(
                  key
                );
              }
            );


          return [
            ...previousFiles,
            ...newFiles,
          ];
        }
      );
    }
  };


  // =========================================================
  // FILE INPUT
  // =========================================================

  const handleFileChange = (
    event
  ) => {

    validateAndSetFiles(
      event.target.files
    );


    /*
     * Allows the same file to be selected
     * again after removing it.
     */

    event.target.value = "";
  };


  // =========================================================
  // DRAG AND DROP
  // =========================================================

  const handleDragOver = (
    event
  ) => {

    event.preventDefault();

    setDragActive(true);
  };


  const handleDragLeave = () => {

    setDragActive(false);
  };


  const handleDrop = (
    event
  ) => {

    event.preventDefault();

    setDragActive(false);


    validateAndSetFiles(
      event.dataTransfer.files
    );
  };


  // =========================================================
  // REMOVE ONE SELECTED FILE
  // =========================================================

  const handleRemoveFile = (
    fileToRemove
  ) => {

    setFiles(
      (previousFiles) =>
        previousFiles.filter(
          (file) =>
            !(
              file.name ===
                fileToRemove.name &&
              file.size ===
                fileToRemove.size &&
              file.lastModified ===
                fileToRemove.lastModified
            )
        )
    );


    setError("");
  };


  // =========================================================
  // CLEAR SELECTED FILES
  // =========================================================

  const handleClearFiles = () => {

    setFiles([]);

    setError("");


    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        "";
    }
  };


  // =========================================================
  // UPLOAD + INDEX MULTIPLE DOCUMENTS
  // =========================================================

  const handleUpload =
    async () => {

      if (
        files.length === 0 ||
        uploadLoading
      ) {
        return;
      }


      const formData =
        new FormData();


      files.forEach(
        (file) => {

          formData.append(
            "files",
            file
          );
        }
      );


      try {

        setUploadLoading(true);

        setError("");


        const response =
          await fetch(
            `${API_BASE_URL}/documents/upload-multiple`,
            {
              method: "POST",
              body: formData,
            }
          );


        if (!response.ok) {

          throw new Error(
            `Upload failed with status ${response.status}`
          );
        }


        const data =
          await response.json();


        console.log(
          "Multiple document upload response:",
          data
        );


        // ---------------------------------------------------
        // SUCCESSFUL DOCUMENTS
        // ---------------------------------------------------

        const uploadedDocuments =
          data.documents || [];


        setDocuments(
          uploadedDocuments
        );


        /*
         * A new upload batch creates a
         * completely new document workspace.
         */

        setDocumentResults({});

        setMessages([]);

        setQuestion("");

        setChatError("");


        // ---------------------------------------------------
        // PARTIAL FAILURES
        // ---------------------------------------------------

        if (
          data.failed > 0
        ) {

          const failedFiles =
            (data.errors || [])
              .map(
                (item) =>
                  item.filename
              )
              .join(", ");


          setError(
            `${data.failed} document${
              data.failed === 1
                ? ""
                : "s"
            } failed to process${
              failedFiles
                ? `: ${failedFiles}`
                : "."
            }`
          );
        }


        // ---------------------------------------------------
        // SELECT FIRST SUCCESSFUL DOCUMENT
        // ---------------------------------------------------

        if (
          uploadedDocuments.length > 0
        ) {

          const firstDocument =
            uploadedDocuments[0];


          setDocumentId(
            firstDocument.document_id
          );


          setDocumentInfo({
            filename:
              firstDocument.filename,

            fileType:
              firstDocument.file_type,

            metadata:
              firstDocument.metadata ||
              {},

            status:
              firstDocument.status,
          });


          // Clear local file selection.

          setFiles([]);


          if (
            fileInputRef.current
          ) {

            fileInputRef.current.value =
              "";
          }

        } else {

          // -------------------------------------------------
          // ALL FILES FAILED
          // -------------------------------------------------

          setDocumentId(null);

          setDocumentInfo(null);


          if (
            data.errors?.length
          ) {

            setError(
              data.errors
                .map(
                  (item) =>
                    `${item.filename}: ${item.error}`
                )
                .join(" | ")
            );

          } else {

            setError(
              "Unable to process the selected documents."
            );
          }
        }

      } catch (
        uploadError
      ) {

        console.error(
          "Upload error:",
          uploadError
        );


        setError(
          "Unable to process the documents. Make sure FastAPI, Ollama, and Qdrant are running."
        );

      } finally {

        setUploadLoading(false);
      }
    };


  // =========================================================
  // SELECT ACTIVE DOCUMENT
  // =========================================================

  const handleSelectDocument = (
    document
  ) => {

    if (
      !document ||
      document.document_id ===
        documentId
    ) {
      return;
    }


    setDocumentId(
      document.document_id
    );


    setDocumentInfo({
      filename:
        document.filename,

      fileType:
        document.file_type,

      metadata:
        document.metadata || {},

      status:
        document.status,
    });


    /*
     * IMPORTANT:
     *
     * We intentionally DO NOT clear:
     *
     * - summary
     * - key points
     * - invoice
     * - messages
     * - question
     * - chat error
     *
     * Summary/key points/invoice are cached
     * separately by document ID.
     *
     * Chat belongs to all uploaded documents.
     */


    setError("");
  };


  // =========================================================
  // SUMMARY
  // =========================================================

  const handleSummarize =
    async () => {

      if (
        !documentId ||
        summaryLoading
      ) {
        return;
      }


      /*
       * Capture the ID now.
       *
       * This ensures the result is stored
       * against the correct document even if
       * the active document changes while the
       * request is running.
       */

      const targetDocumentId =
        documentId;


      try {

        setSummaryLoading(true);

        setError("");


        const response =
          await fetch(
            `${API_BASE_URL}/documents/${targetDocumentId}/summary`,
            {
              method: "POST",
            }
          );


        if (!response.ok) {

          throw new Error(
            `Summary request failed with status ${response.status}`
          );
        }


        const data =
          await response.json();


        updateDocumentResults(
          targetDocumentId,
          {
            summary:
              data.summary || "",
          }
        );

      } catch (
        summaryError
      ) {

        console.error(
          "Summary error:",
          summaryError
        );


        setError(
          "Unable to summarize this document. Please try again."
        );

      } finally {

        setSummaryLoading(false);
      }
    };


  // =========================================================
  // KEY POINTS
  // =========================================================

  const handleKeyPoints =
    async () => {

      if (
        !documentId ||
        keyPointsLoading
      ) {
        return;
      }


      const targetDocumentId =
        documentId;


      try {

        setKeyPointsLoading(true);

        setError("");


        const response =
          await fetch(
            `${API_BASE_URL}/documents/${targetDocumentId}/key-points`,
            {
              method: "POST",
            }
          );


        if (!response.ok) {

          throw new Error(
            `Key-points request failed with status ${response.status}`
          );
        }


        const data =
          await response.json();


        updateDocumentResults(
          targetDocumentId,
          {
            keyPoints:
              data.key_points || [],
          }
        );

      } catch (
        keyPointError
      ) {

        console.error(
          "Key points error:",
          keyPointError
        );


        setError(
          "Unable to generate key points. Please try again."
        );

      } finally {

        setKeyPointsLoading(false);
      }
    };


  // =========================================================
  // INVOICE EXTRACTION
  // =========================================================

  const handleExtractInvoice =
    async () => {

      if (
        !documentId ||
        invoiceLoading
      ) {
        return;
      }


      const targetDocumentId =
        documentId;


      try {

        setInvoiceLoading(true);

        setError("");


        const response =
          await fetch(
            `${API_BASE_URL}/documents/${targetDocumentId}/invoice`,
            {
              method: "POST",
            }
          );


        if (!response.ok) {

          throw new Error(
            `Invoice extraction failed with status ${response.status}`
          );
        }


        const data =
          await response.json();


        console.log(
          "Invoice extraction response:",
          data
        );


        updateDocumentResults(
          targetDocumentId,
          {
            invoice:
              data.invoice || null,
          }
        );

      } catch (
        invoiceError
      ) {

        console.error(
          "Invoice extraction error:",
          invoiceError
        );


        setError(
          "Unable to extract invoice information. Make sure the document contains recognizable invoice data."
        );

      } finally {

        setInvoiceLoading(false);
      }
    };


  // =========================================================
  // MULTI-DOCUMENT CONVERSATION-AWARE RAG CHAT
  // =========================================================

  const handleAskQuestion =
    async () => {

      const trimmedQuestion =
        question.trim();


      if (
        !trimmedQuestion ||
        documents.length === 0 ||
        chatLoading
      ) {
        return;
      }


      // -----------------------------------------------------
      // COLLECT ALL UPLOADED DOCUMENT IDS
      // -----------------------------------------------------

      const documentIds =
        documents
          .map(
            (document) =>
              document.document_id
          )
          .filter(Boolean);


      if (
        documentIds.length === 0
      ) {

        setChatError(
          "No uploaded documents are available for chat."
        );

        return;
      }


      // -----------------------------------------------------
      // CONVERSATION HISTORY
      // -----------------------------------------------------

      const conversationHistory =
        messages.map(
          (message) => ({
            role:
              message.role,

            content:
              message.content,
          })
        );


      // -----------------------------------------------------
      // USER MESSAGE
      // -----------------------------------------------------

      const userMessage = {
        role: "user",

        content:
          trimmedQuestion,
      };


      setMessages(
        (previousMessages) => [
          ...previousMessages,
          userMessage,
        ]
      );


      setQuestion("");

      setChatError("");

      setChatLoading(true);


      try {

        // ---------------------------------------------------
        // MULTI-DOCUMENT RAG
        // ---------------------------------------------------

        const response =
          await fetch(
            `${API_BASE_URL}/ask-documents`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  document_ids:
                    documentIds,

                  question:
                    trimmedQuestion,

                  history:
                    conversationHistory,
                }),
            }
          );


        if (!response.ok) {

          throw new Error(
            `Chat request failed with status ${response.status}`
          );
        }


        const data =
          await response.json();


        /*
         * We intentionally do NOT store
         * data.sources.
         *
         * Retrieved sources have been removed
         * from the frontend chat interface.
         */

        const assistantMessage = {
          role: "assistant",

          content:
            data.answer,
        };


        setMessages(
          (previousMessages) => [
            ...previousMessages,
            assistantMessage,
          ]
        );

      } catch (
        chatRequestError
      ) {

        console.error(
          "Multi-document chat error:",
          chatRequestError
        );


        setChatError(
          "Unable to answer the question across the uploaded documents. Please try again."
        );

      } finally {

        setChatLoading(false);
      }
    };


  // =========================================================
  // CHAT KEYBOARD HANDLING
  // =========================================================

  const handleQuestionKeyDown =
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        handleAskQuestion();
      }
    };


  // =========================================================
  // RESET WORKSPACE
  // =========================================================

  const handleReset = () => {

    setFiles([]);

    setDocuments([]);


    resetDocumentWorkspace();


    setUploadLoading(false);

    setError("");

    setDragActive(false);


    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        "";
    }
  };


  // =========================================================
  // UI
  // =========================================================

  return (
    <>

      <Navbar />

      <Hero />


      {/* =====================================================
          MAIN PRODUCT EXPERIENCE
      ====================================================== */}

      <main className="app">

        <div className="container">


          {/* =================================================
              UPLOAD
          ================================================== */}

          {!documentInfo && (

            <UploadZone
              files={
                files
              }

              dragActive={
                dragActive
              }

              uploadLoading={
                uploadLoading
              }

              fileInputRef={
                fileInputRef
              }

              handleFileChange={
                handleFileChange
              }

              handleDragOver={
                handleDragOver
              }

              handleDragLeave={
                handleDragLeave
              }

              handleDrop={
                handleDrop
              }

              handleUpload={
                handleUpload
              }

              handleRemoveFile={
                handleRemoveFile
              }

              handleClearFiles={
                handleClearFiles
              }

              handleReset={
                handleReset
              }
            />

          )}


          {/* =================================================
              GLOBAL ERROR
          ================================================== */}

          {error && (

            <div
              className="error-message"
              role="alert"
            >
              {error}
            </div>

          )}


          {/* =================================================
              DOCUMENT WORKSPACE
          ================================================== */}

          {documentInfo &&
            documentId && (

              <section className="workspace">


                {/* ===========================================
                    MULTIPLE DOCUMENT SELECTOR
                ============================================ */}

                {documents.length > 1 && (

                  <div className="document-selector">

                    <div className="document-selector__header">

                      <span>
                        DOCUMENTS
                      </span>

                      <strong>
                        {documents.length} uploaded
                      </strong>

                    </div>


                    <div className="document-selector__list">

                      {documents.map(
                        (document) => (

                          <button
                            type="button"
                            key={
                              document.document_id
                            }
                            className={`document-selector__item ${
                              document.document_id ===
                              documentId
                                ? "document-selector__item--active"
                                : ""
                            }`}
                            onClick={() =>
                              handleSelectDocument(
                                document
                              )
                            }
                          >

                            <span className="document-selector__name">
                              {
                                document.filename
                              }
                            </span>

                            <span className="document-selector__type">
                              {
                                document.file_type
                              }
                            </span>

                          </button>

                        )
                      )}

                    </div>

                  </div>

                )}


                {/* ===========================================
                    DOCUMENT INFORMATION
                ============================================ */}

                <DocumentInfo
                  documentInfo={
                    documentInfo
                  }

                  handleReset={
                    handleReset
                  }
                />


                {/* ===========================================
                    AI ACTIONS
                ============================================ */}

                <AIActions
                  summary={
                    summary
                  }

                  summaryLoading={
                    summaryLoading
                  }

                  keyPoints={
                    keyPoints
                  }

                  keyPointsLoading={
                    keyPointsLoading
                  }

                  invoice={
                    invoice
                  }

                  invoiceLoading={
                    invoiceLoading
                  }

                  handleSummarize={
                    handleSummarize
                  }

                  handleKeyPoints={
                    handleKeyPoints
                  }

                  handleExtractInvoice={
                    handleExtractInvoice
                  }
                />


                {/* ===========================================
                    SUMMARY
                ============================================ */}

                {(summary ||
                  summaryLoading) && (

                  <Summary
                    summary={
                      summary
                    }

                    summaryLoading={
                      summaryLoading
                    }

                    handleSummarize={
                      handleSummarize
                    }
                  />

                )}


                {/* ===========================================
                    KEY POINTS
                ============================================ */}

                {(keyPoints.length >
                  0 ||
                  keyPointsLoading) && (

                  <KeyPoints
                    keyPoints={
                      keyPoints
                    }

                    keyPointsLoading={
                      keyPointsLoading
                    }

                    handleKeyPoints={
                      handleKeyPoints
                    }
                  />

                )}


                {/* ===========================================
                    INVOICE INTELLIGENCE
                ============================================ */}

                {(invoice ||
                  invoiceLoading) && (

                  <Invoice
                    invoice={
                      invoice
                    }

                    invoiceLoading={
                      invoiceLoading
                    }

                    handleExtractInvoice={
                      handleExtractInvoice
                    }
                  />

                )}


                {/* ===========================================
                    SHARED MULTI-DOCUMENT CHAT
                ============================================ */}

                <Chat
                  question={
                    question
                  }

                  setQuestion={
                    setQuestion
                  }

                  messages={
                    messages
                  }

                  chatLoading={
                    chatLoading
                  }

                  chatError={
                    chatError
                  }

                  handleAskQuestion={
                    handleAskQuestion
                  }

                  handleQuestionKeyDown={
                    handleQuestionKeyDown
                  }
                />

              </section>

            )}

        </div>

      </main>


      {/* =====================================================
          LANDING PAGE CONTENT
      ====================================================== */}

      <Features />

      <HowItWorks />

      <SupportedFiles />

      <FinalCTA />

      <Footer />

    </>
  );
}


export default App;