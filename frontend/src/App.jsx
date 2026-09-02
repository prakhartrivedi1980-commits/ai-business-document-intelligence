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
import Features from "./components/Features/Features.jsx";
import HowItWorks from "./components/HowItWorks/HowItWorks.jsx";
import SupportedFiles from "./components/SupportedFiles/SupportedFiles.jsx";
import FinalCTA from "./components/FinalCTA/FinalCTA.jsx";
import Footer from "./components/Footer/Footer.jsx";


const API_BASE_URL = "http://127.0.0.1:8000";


function App() {
  // =========================================================
  // DOCUMENT STATE
  // =========================================================

  const [file, setFile] = useState(null);

  const [documentInfo, setDocumentInfo] =
    useState(null);

  const [documentId, setDocumentId] =
    useState(null);

  const [uploadLoading, setUploadLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [dragActive, setDragActive] =
    useState(false);


  // =========================================================
  // ON-DEMAND AI OPERATIONS
  // =========================================================

  const [summary, setSummary] =
    useState("");

  const [summaryLoading, setSummaryLoading] =
    useState(false);


  const [keyPoints, setKeyPoints] =
    useState([]);

  const [keyPointsLoading, setKeyPointsLoading] =
    useState(false);


  // =========================================================
  // RAG CHAT STATE
  // =========================================================

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

  const fileInputRef = useRef(null);


  // =========================================================
  // RESET DOCUMENT RESULTS
  // =========================================================

  const resetDocumentResults = () => {
    setDocumentInfo(null);
    setDocumentId(null);

    setSummary("");
    setKeyPoints([]);

    setQuestion("");
    setMessages([]);

    setChatError("");
  };


  // =========================================================
  // FILE VALIDATION
  // =========================================================

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    const allowedExtensions = [
      ".pdf",
      ".docx",
      ".txt",
      ".xlsx",
      ".csv",
    ];

    const filename =
      selectedFile.name.toLowerCase();

    const isSupported =
      allowedExtensions.some(
        (extension) =>
          filename.endsWith(extension)
      );

    if (!isSupported) {
      setError(
        "Unsupported file type. Please upload a PDF, DOCX, TXT, XLSX, or CSV document."
      );

      setFile(null);

      resetDocumentResults();

      return;
    }

    setFile(selectedFile);

    setError("");

    resetDocumentResults();
  };


  // =========================================================
  // FILE INPUT
  // =========================================================

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    validateAndSetFile(selectedFile);
  };


  // =========================================================
  // DRAG AND DROP
  // =========================================================

  const handleDragOver = (event) => {
    event.preventDefault();

    setDragActive(true);
  };


  const handleDragLeave = () => {
    setDragActive(false);
  };


  const handleDrop = (event) => {
    event.preventDefault();

    setDragActive(false);

    const droppedFile =
      event.dataTransfer.files?.[0];

    validateAndSetFile(droppedFile);
  };


  // =========================================================
  // UPLOAD + INDEX DOCUMENT
  // =========================================================

  const handleUpload = async () => {
    if (
      !file ||
      uploadLoading
    ) {
      return;
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    try {
      setUploadLoading(true);

      setError("");

      resetDocumentResults();


      const response = await fetch(
        `${API_BASE_URL}/documents/upload`,
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
        "Document upload response:",
        data
      );


      setDocumentId(
        data.document_id
      );


      setDocumentInfo({
        filename: data.filename,
        fileType: data.file_type,
        metadata: data.metadata || {},
        status: data.status,
      });

    } catch (uploadError) {
      console.error(
        "Upload error:",
        uploadError
      );

      setError(
        "Unable to process the document. Make sure FastAPI, Ollama, and Qdrant are running."
      );

    } finally {
      setUploadLoading(false);
    }
  };


  // =========================================================
  // ON-DEMAND SUMMARY
  // =========================================================

  const handleSummarize = async () => {
    if (
      !documentId ||
      summaryLoading
    ) {
      return;
    }

    try {
      setSummaryLoading(true);

      setError("");


      const response = await fetch(
        `${API_BASE_URL}/documents/${documentId}/summary`,
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


      setSummary(
        data.summary || ""
      );

    } catch (summaryError) {
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
  // ON-DEMAND KEY POINTS
  // =========================================================

  const handleKeyPoints = async () => {
    if (
      !documentId ||
      keyPointsLoading
    ) {
      return;
    }

    try {
      setKeyPointsLoading(true);

      setError("");


      const response = await fetch(
        `${API_BASE_URL}/documents/${documentId}/key-points`,
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


      setKeyPoints(
        data.key_points || []
      );

    } catch (keyPointError) {
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
  // CONVERSATION-AWARE RAG CHAT
  // =========================================================

  const handleAskQuestion = async () => {
    const trimmedQuestion =
      question.trim();


    if (
      !trimmedQuestion ||
      !documentId ||
      chatLoading
    ) {
      return;
    }


    /*
     * Send only messages that already existed
     * before the current question.
     */
    const conversationHistory =
      messages.map(
        (message) => ({
          role: message.role,
          content: message.content,
        })
      );


    const userMessage = {
      role: "user",
      content: trimmedQuestion,
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
      const response = await fetch(
        `${API_BASE_URL}/ask-document`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            document_id:
              documentId,

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


      const assistantMessage = {
        role: "assistant",

        content:
          data.answer,

        sources:
          data.sources || [],
      };


      setMessages(
        (previousMessages) => [
          ...previousMessages,
          assistantMessage,
        ]
      );

    } catch (chatRequestError) {
      console.error(
        "Chat error:",
        chatRequestError
      );


      setChatError(
        "Unable to answer the question. Please try again."
      );

    } finally {
      setChatLoading(false);
    }
  };


  // =========================================================
  // CHAT KEYBOARD HANDLING
  // =========================================================

  const handleQuestionKeyDown = (event) => {
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
    setFile(null);

    resetDocumentResults();


    setSummaryLoading(false);

    setKeyPointsLoading(false);

    setChatLoading(false);


    setError("");

    setDragActive(false);


    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      <Navbar />

      <Hero />


      {/* MAIN PRODUCT EXPERIENCE */}

      <main className="app">
        <div className="container">

          {!documentInfo && (
            <UploadZone
              file={file}
              dragActive={dragActive}
              uploadLoading={uploadLoading}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
              handleUpload={handleUpload}
              handleReset={handleReset}
            />
          )}


          {error && (
            <div
              className="error-message"
              role="alert"
            >
              {error}
            </div>
          )}


          {documentInfo && documentId && (
            <section className="workspace">

              <DocumentInfo
                documentInfo={documentInfo}
                handleReset={handleReset}
              />


              <AIActions
                summary={summary}
                summaryLoading={summaryLoading}
                keyPoints={keyPoints}
                keyPointsLoading={keyPointsLoading}
                handleSummarize={handleSummarize}
                handleKeyPoints={handleKeyPoints}
              />


              {(summary || summaryLoading) && (
                <Summary
                  summary={summary}
                  summaryLoading={summaryLoading}
                  handleSummarize={handleSummarize}
                />
              )}


              {(keyPoints.length > 0 ||
                keyPointsLoading) && (
                  <KeyPoints
                    keyPoints={keyPoints}
                    keyPointsLoading={keyPointsLoading}
                    handleKeyPoints={handleKeyPoints}
                  />
                )}


              <Chat
                question={question}
                setQuestion={setQuestion}
                messages={messages}
                chatLoading={chatLoading}
                chatError={chatError}
                handleAskQuestion={handleAskQuestion}
                handleQuestionKeyDown={
                  handleQuestionKeyDown
                }
              />

            </section>
          )}

        </div>
      </main>


      {/* LANDING PAGE CONTENT */}

      <Features />

      <HowItWorks />

      <SupportedFiles />

      <FinalCTA />

      <Footer />
    </>
  );
}


export default App;