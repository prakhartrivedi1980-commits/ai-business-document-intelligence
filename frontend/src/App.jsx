import { useRef, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function App() {
  // -----------------------------
  // Document state
  // -----------------------------

  const [file, setFile] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [documentId, setDocumentId] = useState(null);

  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // -----------------------------
  // On-demand AI operations
  // -----------------------------

  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [keyPoints, setKeyPoints] = useState([]);
  const [keyPointsLoading, setKeyPointsLoading] = useState(false);

  // -----------------------------
  // RAG chat state
  // -----------------------------

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  const fileInputRef = useRef(null);

  // -----------------------------
  // File selection
  // -----------------------------

  const resetDocumentResults = () => {
    setDocumentInfo(null);
    setDocumentId(null);

    setSummary("");
    setKeyPoints([]);

    setQuestion("");
    setMessages([]);

    setChatError("");
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    // Backend currently supports PDF only.
    // We will expand this in Sprint 5.4.
    if (selectedFile.type !== "application/pdf") {
      setError(
        "PDF is currently supported. More document formats are coming next."
      );

      setFile(null);
      resetDocumentResults();
      return;
    }

    setFile(selectedFile);
    setError("");

    resetDocumentResults();
  };

  const handleFileChange = (event) => {
    validateAndSetFile(event.target.files[0]);
  };

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

    const droppedFile = event.dataTransfer.files[0];

    validateAndSetFile(droppedFile);
  };

  // -----------------------------
  // Upload + index
  // -----------------------------

  const handleUpload = async () => {
    if (!file || uploadLoading) {
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

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

      const data = await response.json();

      console.log("Document upload response:", data);

      setDocumentId(data.document_id);

      setDocumentInfo({
        filename: data.filename,
        fileType: data.file_type,
        pages: data.pages,
        status: data.status,
      });
    } catch (uploadError) {
      console.error("Upload error:", uploadError);

      setError(
        "Unable to process the document. Make sure FastAPI, Ollama, and Qdrant are running."
      );
    } finally {
      setUploadLoading(false);
    }
  };

  // -----------------------------
  // On-demand summary
  // -----------------------------

  const handleSummarize = async () => {
    if (!documentId || summaryLoading) {
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

      const data = await response.json();

      setSummary(data.summary);
    } catch (summaryError) {
      console.error("Summary error:", summaryError);

      setError(
        "Unable to summarize this document. Please try again."
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  // -----------------------------
  // On-demand key points
  // -----------------------------

  const handleKeyPoints = async () => {
    if (!documentId || keyPointsLoading) {
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

      const data = await response.json();

      setKeyPoints(data.key_points || []);
    } catch (keyPointError) {
      console.error("Key points error:", keyPointError);

      setError(
        "Unable to generate key points. Please try again."
      );
    } finally {
      setKeyPointsLoading(false);
    }
  };

  // -----------------------------
  // Conversation-aware RAG chat
  // -----------------------------

  const handleAskQuestion = async () => {
    const trimmedQuestion = question.trim();

    if (
      !trimmedQuestion ||
      !documentId ||
      chatLoading
    ) {
      return;
    }

    const conversationHistory = messages.map(
      (message) => ({
        role: message.role,
        content: message.content,
      })
    );

    const userMessage = {
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setQuestion("");
    setChatError("");
    setChatLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/ask-document`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            document_id: documentId,
            question: trimmedQuestion,
            history: conversationHistory,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Chat request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      const assistantMessage = {
        role: "assistant",
        content: data.answer,
        sources: data.sources || [],
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        assistantMessage,
      ]);
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

  const handleQuestionKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleAskQuestion();
    }
  };

  // -----------------------------
  // Reset workspace
  // -----------------------------

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

  return (
    <main className="app">
      <div className="container">

        {/* HEADER */}

        <header className="hero">

          <p className="eyebrow">
            AI DOCUMENT INTELLIGENCE
          </p>

          <h1>
            Understand your documents with AI
          </h1>

          <p className="subtitle">
            Upload a document, chat with its
            contents, generate a summary, or
            extract key points on demand.
          </p>

        </header>


        {/* UPLOAD */}

        {!documentInfo && (
          <section className="upload-card">

            <div
              className={`drop-zone ${
                dragActive
                  ? "drag-active"
                  : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() =>
                fileInputRef.current?.click()
              }
            >

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden-file-input"
              />

              <div className="upload-icon">
                ↑
              </div>

              <h3>
                Drop your document here
              </h3>

              <p>
                or click to browse
              </p>

              <span className="supported-types">
                PDF supported currently
              </span>

            </div>


            {file && (
              <div className="selected-file-card">

                <div>

                  <span className="file-label">
                    Selected document
                  </span>

                  <strong>
                    {file.name}
                  </strong>

                </div>

                <button
                  className="remove-file-button"
                  onClick={handleReset}
                  type="button"
                >
                  Remove
                </button>

              </div>
            )}


            <button
              className="analyze-button"
              onClick={handleUpload}
              disabled={
                !file ||
                uploadLoading
              }
            >
              {uploadLoading
                ? "Processing Document..."
                : "Upload Document"}
            </button>


            {uploadLoading && (
              <div className="inline-loading">

                <div className="spinner"></div>

                <span>
                  Extracting and indexing...
                </span>

              </div>
            )}

          </section>
        )}


        {error && (
          <p className="error-message">
            {error}
          </p>
        )}


        {/* DOCUMENT WORKSPACE */}

        {documentInfo && documentId && (

          <section className="workspace">

            {/* DOCUMENT INFO */}

            <div className="document-bar">

              <div className="document-main-info">

                <div className="document-icon">
                  DOC
                </div>

                <div>

                  <span className="file-label">
                    Current document
                  </span>

                  <h2>
                    {documentInfo.filename}
                  </h2>

                  <div className="document-meta">

                    <span>
                      {documentInfo.fileType.toUpperCase()}
                    </span>

                    <span>
                      {documentInfo.pages}{" "}
                      {documentInfo.pages === 1
                        ? "page"
                        : "pages"}
                    </span>

                    <span className="ready-status">
                      ● Ready
                    </span>

                  </div>

                </div>

              </div>


              <button
                className="reset-button"
                onClick={handleReset}
              >
                Upload Another
              </button>

            </div>


            {/* AI ACTIONS */}

            <div className="action-panel">

              <div>

                <p className="chat-eyebrow">
                  AI ACTIONS
                </p>

                <h3>
                  What would you like to do?
                </h3>

              </div>


              <div className="action-buttons">

                <button
                  className="action-button"
                  onClick={handleSummarize}
                  disabled={summaryLoading}
                >
                  {summaryLoading
                    ? "Summarizing..."
                    : "Summarize"}
                </button>


                <button
                  className="action-button"
                  onClick={handleKeyPoints}
                  disabled={keyPointsLoading}
                >
                  {keyPointsLoading
                    ? "Extracting..."
                    : "Key Points"}
                </button>

              </div>

            </div>


            {/* SUMMARY - ONLY AFTER CLICK */}

            {(summary || summaryLoading) && (

              <section className="result-card">

                <div className="section-heading">

                  <h3>
                    Summary
                  </h3>

                  {summaryLoading && (
                    <div className="spinner small-spinner"></div>
                  )}

                </div>


                {summary ? (
                  <p>
                    {summary}
                  </p>
                ) : (
                  <p>
                    Generating summary...
                  </p>
                )}

              </section>

            )}


            {/* KEY POINTS - ONLY AFTER CLICK */}

            {(keyPoints.length > 0 ||
              keyPointsLoading) && (

              <section className="result-card">

                <div className="section-heading">

                  <h3>
                    Key Points
                  </h3>

                  {keyPointsLoading && (
                    <div className="spinner small-spinner"></div>
                  )}

                </div>


                {keyPoints.length > 0 ? (

                  <ul>

                    {keyPoints.map(
                      (point, index) => (

                        <li key={index}>
                          {point}
                        </li>

                      )
                    )}

                  </ul>

                ) : (

                  <p>
                    Extracting key points...
                  </p>

                )}

              </section>

            )}


            {/* CHAT */}

            <section className="chat-card">

              <div className="chat-header">

                <div>

                  <p className="chat-eyebrow">
                    DOCUMENT CHAT
                  </p>

                  <h3>
                    Chat with your document
                  </h3>

                  <p>
                    Ask questions grounded in
                    the uploaded content.
                  </p>

                </div>

              </div>


              <div className="chat-messages">

                {messages.length === 0 && (

                  <div className="chat-empty">

                    <div className="chat-icon">
                      ✦
                    </div>

                    <h4>
                      Ask anything about this document
                    </h4>

                    <p>
                      You can ask about specific facts,
                      sections, dates, people, values,
                      or request an explanation.
                    </p>

                  </div>

                )}


                {messages.map(
                  (message, index) => (

                    <div
                      key={index}
                      className={`chat-message ${
                        message.role === "user"
                          ? "user-message"
                          : "assistant-message"
                      }`}
                    >

                      <span className="message-role">

                        {message.role === "user"
                          ? "You"
                          : "Document AI"}

                      </span>


                      <p>
                        {message.content}
                      </p>


                      {message.role ===
                        "assistant" &&
                        message.sources?.length >
                          0 && (

                          <details className="sources">

                            <summary>
                              View retrieved source
                            </summary>


                            {message.sources.map(
                              (
                                source,
                                sourceIndex
                              ) => (

                                <div
                                  className="source-chunk"
                                  key={
                                    sourceIndex
                                  }
                                >
                                  {source}
                                </div>

                              )
                            )}

                          </details>

                        )}

                    </div>

                  )
                )}


                {chatLoading && (

                  <div className="chat-message assistant-message">

                    <span className="message-role">
                      Document AI
                    </span>

                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>

                  </div>

                )}

              </div>


              {chatError && (
                <p className="error-message">
                  {chatError}
                </p>
              )}


              <div className="chat-input-container">

                <textarea
                  value={question}
                  onChange={(event) =>
                    setQuestion(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleQuestionKeyDown
                  }
                  placeholder="Ask anything about this document..."
                  rows="1"
                  disabled={chatLoading}
                />


                <button
                  className="send-button"
                  onClick={
                    handleAskQuestion
                  }
                  disabled={
                    !question.trim() ||
                    chatLoading
                  }
                >
                  {chatLoading
                    ? "Thinking..."
                    : "Ask"}
                </button>

              </div>


              <p className="chat-hint">
                Press Enter to send ·
                Shift + Enter for a new line
              </p>

            </section>

          </section>

        )}

      </div>
    </main>
  );
}

export default App;