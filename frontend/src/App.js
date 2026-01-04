import React, { useState, useRef, useEffect } from "react";
import "./App.css";

const API_BASE = "http://127.0.0.1:8000";

function App() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF file first.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setUploadStatus("Uploading...");
    try {
      const resp = await fetch(`${API_BASE}/uploads`, {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();
      if (!resp.ok) {
        console.error(data);
        setUploadStatus("Upload failed.");
        return;
      }
      setUploadStatus(`✓ Indexed ${data.chunks_indexed} chunks`);
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadStatus("");
        setFile(null);
      }, 2000);
    } catch (err) {
      console.error(err);
      setUploadStatus("Error uploading.");
    }
  };

  const handleSend = async () => {
    const q = question.trim();
    if (!q) return;

    setMessages((msgs) => [...msgs, { from: "user", text: q }]);
    setQuestion("");
    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        console.error(data);
        setMessages((msgs) => [
          ...msgs,
          { from: "bot", text: "Error from server.", sources: [] },
        ]);
      } else {
        setMessages((msgs) => [
          ...msgs,
          { from: "bot", text: data.answer, sources: data.sources || [] },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: "Network error.", sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="app">

      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Document</h2>
              <button 
                className="modal-close"
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="file-upload-area">
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileChange}
                  id="file-input"
                  className="file-input"
                />
                <label htmlFor="file-input" className="file-label">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                  <p className="file-label-text">
                    {file ? file.name : "Click to select PDF or drag and drop"}
                  </p>
                </label>
              </div>
              {uploadStatus && (
                <div className="upload-status">{uploadStatus}</div>
              )}
              <button 
                className="upload-btn-primary"
                onClick={handleUpload}
                disabled={!file || uploadStatus === "Uploading..."}
              >
                {uploadStatus === "Uploading..." ? "Uploading..." : "Upload & Index"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="chat-container">
        <div className="chat-window">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-icon">📚</div>
              <h2>Welcome to ResearchIQ</h2>
              <p>Upload a PDF document and start asking questions about its content</p>
            </div>
          ) : (
            <>
              {messages.map((m, idx) => (
                <div key={idx} className={`message-wrapper ${m.from}`}>
                  <div className="message-content">
                    <div className="message-avatar">
                      {m.from === "user" ? (
                        <div className="avatar user-avatar">You</div>
                      ) : (
                        <div className="avatar bot-avatar">🤖</div>
                      )}
                    </div>
                    <div className="message-text">
                      <div className="message-body">{m.text}</div>
                      {m.sources && m.sources.length > 0 && (
                        <div className="sources">
                          <div className="sources-header">Sources:</div>
                          {m.sources.map((src, i) => (
                            <div key={i} className="source-item">
                              <span className="source-label">
                                📄 {src.source} (Page {src.page})
                              </span>
                              {src.content && (
                                <div className="source-preview">{src.content}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message-wrapper bot">
                  <div className="message-content">
                    <div className="message-avatar">
                      <div className="avatar bot-avatar">🤖</div>
                    </div>
                    <div className="message-text">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="input-container">
          <div className="input-wrapper">
            <button 
              className="upload-btn-inline"
              onClick={() => setShowUploadModal(true)}
              title="Upload PDF"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
            </button>
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              rows="1"
              disabled={loading}
            />
            <button 
              className="send-button"
              onClick={handleSend} 
              disabled={loading || !question.trim()}
            >
              {loading ? (
                <svg className="spinner" width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" fill="none"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
