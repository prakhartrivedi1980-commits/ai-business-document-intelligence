import { useRef, useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [documentId, setDocumentId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // RAG chat state
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  const fileInputRef = useRef(null);

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      setFile(null);
      setResult(null);
      setDocumentId(null);
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setDocumentId(null);
    setMessages([]);
    setQuestion("");
    setError("");
    setChatError("");
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

  const handleAnalyze = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError("");
      setResult(null);
      setDocumentId(null);
      setMessages([]);

      const response = await fetch(
        "http://127.0.0.1:8000/analyze-document",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      console.log("Analyze response:", data);

      setDocumentId(data.document_id);
      setResult(data.analysis);

    } catch (error) {
      console.error("Analysis error:", error);

      setError(
        "Unable to analyze the document. Make sure FastAPI, n8n, Ollama, and Qdrant are running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || !documentId || chatLoading) {
      return;
    }

    const userMessage = {
      role: "user",
      content: trimmedQuestion,
    };

    // Show user's question immediately
    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setQuestion("");
    setChatError("");
    setChatLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/ask-document",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            document_id: documentId,
            question: trimmedQuestion,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}`
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

    } catch (error) {
      console.error("Chat error:", error);

      setChatError(
        "Unable to answer the question. Please try again."
      );
    } finally {
      setChatLoading(false);
    }
  };

  const handleQuestionKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleAskQuestion();
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setDocumentId(null);

    setQuestion("");
    setMessages([]);
    setChatLoading(false);
    setChatError("");

    setError("");
    setDragActive(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <main className="app">
      <div className="container">

        <header className="hero">
          <p className="eyebrow">
            AI DOCUMENT READER
          </p>

          <h1>AI Document Intelligence</h1>

          <p className="subtitle">
            Upload a PDF, extract structured insights,
            and chat with your document.
          </p>
        </header>

        <section className="upload-card">

          <div
            className={`drop-zone ${
              dragActive ? "drag-active" : ""
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

            <h3>Drop your PDF here</h3>

            <p>
              or click to browse your files
            </p>

          </div>

          {file && (
            <div className="selected-file-card">

              <div>
                <span className="file-label">
                  Selected PDF
                </span>

                <strong>{file.name}</strong>
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
            onClick={handleAnalyze}
            disabled={!file || loading}
          >
            {loading
              ? "Analyzing Document..."
              : "Analyze Document"}
          </button>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

        </section>

        {loading && (
          <section className="loading-card">

            <div className="spinner"></div>

            <p>
              AI is analyzing and indexing your
              document...
            </p>

          </section>
        )}

        {result && (
          <section className="results">

            <div className="result-header">

              <div>

                <span className="document-type">
                  {result.document_type}
                </span>

                <h2>{result.title}</h2>

              </div>

              <button
                className="reset-button"
                onClick={handleReset}
              >
                Analyze Another Document
              </button>

            </div>

            <div className="result-card">
              <h3>Summary</h3>
              <p>{result.summary}</p>
            </div>

            <div className="result-grid">

              <div className="result-card">
                <h3>Key Points</h3>

                {result.key_points?.length > 0 ? (
                  <ul>
                    {result.key_points.map(
                      (point, index) => (
                        <li key={index}>
                          {point}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>No key points found.</p>
                )}
              </div>

              <div className="result-card">
                <h3>Important Dates</h3>

                {result.important_dates?.length > 0 ? (
                  <div className="tags">

                    {result.important_dates.map(
                      (date, index) => (
                        <span
                          className="tag"
                          key={index}
                        >
                          {date}
                        </span>
                      )
                    )}

                  </div>
                ) : (
                  <p>No important dates found.</p>
                )}
              </div>

              <div className="result-card">
                <h3>Entities</h3>

                {result.entities?.length > 0 ? (
                  <div className="tags">

                    {result.entities.map(
                      (entity, index) => (
                        <span
                          className="tag"
                          key={index}
                        >
                          {entity}
                        </span>
                      )
                    )}

                  </div>
                ) : (
                  <p>No entities found.</p>
                )}
              </div>

              <div className="result-card">
                <h3>Action Items</h3>

                {result.action_items?.length > 0 ? (
                  <ul>
                    {result.action_items.map(
                      (item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>No action items found.</p>
                )}
              </div>

            </div>

            <div className="result-card">

              <h3>Keywords</h3>

              {result.keywords?.length > 0 ? (
                <div className="tags">

                  {result.keywords.map(
                    (keyword, index) => (
                      <span
                        className="tag keyword-tag"
                        key={index}
                      >
                        {keyword}
                      </span>
                    )
                  )}

                </div>
              ) : (
                <p>No keywords found.</p>
              )}

            </div>


            {/* DOCUMENT CHAT */}

            {documentId && (
              <section className="chat-card">

                <div className="chat-header">
                  <div>
                    <p className="chat-eyebrow">
                      RAG DOCUMENT CHAT
                    </p>

                    <h3>Ask This Document</h3>

                    <p>
                      Ask questions and receive answers
                      grounded in the uploaded PDF.
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
                        What would you like to know?
                      </h4>

                      <p>
                        Try asking about important facts,
                        dates, projects, people, or a
                        specific section of the document.
                      </p>

                    </div>
                  )}


                  {messages.map((message, index) => (
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

                      <p>{message.content}</p>

                      {message.role === "assistant" &&
                        message.sources?.length > 0 && (
                          <details className="sources">

                            <summary>
                              View retrieved source
                            </summary>

                            {message.sources.map(
                              (source, sourceIndex) => (
                                <div
                                  className="source-chunk"
                                  key={sourceIndex}
                                >
                                  {source}
                                </div>
                              )
                            )}

                          </details>
                        )}

                    </div>
                  ))}


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
                      setQuestion(event.target.value)
                    }
                    onKeyDown={handleQuestionKeyDown}
                    placeholder="Ask something about this document..."
                    rows="1"
                    disabled={chatLoading}
                  />

                  <button
                    className="send-button"
                    onClick={handleAskQuestion}
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
                  Press Enter to send · Shift + Enter
                  for a new line
                </p>

              </section>
            )}

          </section>
        )}

      </div>
    </main>
  );
}

export default App;