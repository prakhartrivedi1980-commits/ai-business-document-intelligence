import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError("");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await fetch(
        "http://127.0.0.1:8000/extract-text",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Analysis error:", error);
      setError("Unable to analyze the document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app">
      <div className="container">

        <header className="hero">
          <p className="eyebrow">AI DOCUMENT READER</p>
          <h1>AI Document Intelligence</h1>
          <p className="subtitle">
            Upload a PDF and extract structured insights using AI.
          </p>
        </header>

        <section className="upload-card">
          <label className="file-upload">
            <span>Choose PDF</span>

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </label>

          {file && (
            <div className="selected-file">
              <span>Selected:</span>
              <strong>{file.name}</strong>
            </div>
          )}

          <button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={!file || loading}
          >
            {loading ? "Analyzing Document..." : "Analyze Document"}
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
            <p>AI is analyzing your document...</p>
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
                    {result.key_points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No key points found.</p>
                )}
              </div>

              <div className="result-card">
                <h3>Important Dates</h3>

                {result.important_dates?.length > 0 ? (
                  <div className="tags">
                    {result.important_dates.map((date, index) => (
                      <span className="tag" key={index}>
                        {date}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>No important dates found.</p>
                )}
              </div>

              <div className="result-card">
                <h3>Entities</h3>

                {result.entities?.length > 0 ? (
                  <div className="tags">
                    {result.entities.map((entity, index) => (
                      <span className="tag" key={index}>
                        {entity}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>No entities found.</p>
                )}
              </div>

              <div className="result-card">
                <h3>Action Items</h3>

                {result.action_items?.length > 0 ? (
                  <ul>
                    {result.action_items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
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
                  {result.keywords.map((keyword, index) => (
                    <span className="tag keyword-tag" key={index}>
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No keywords found.</p>
              )}
            </div>

          </section>
        )}

      </div>
    </main>
  );
}

export default App;