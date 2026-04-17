import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import "./App.css";

const API = "http://localhost:3001";

interface Message {
  role: "user" | "codelens";
  content: string;
  loading?: boolean;
}

interface IngestedPath {
  folderPath: string;
  ingestedAt: string;
  fileCount?: number;
  chunkCount?: number;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "codelens",
      content: "## 🔍 Welcome to Code Lens\n\n**Engineer AI** — Your AI Software Engineering Assistant.\n\nEnter a codebase path below and click **Ingest**, or select a previously ingested codebase from the history.",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [folderPath, setFolderPath] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestedPaths, setIngestedPaths] = useState<IngestedPath[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load paths + check health on mount
  useEffect(() => {
    checkHealth();
    loadPaths();
  }, []);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function checkHealth() {
    try {
      const res = await axios.get(`${API}/health`);
      if (res.data.isReady) {
        setIsReady(true);
        setMessages([{
          role: "codelens",
          content: `## 🔍 Code Lens Ready\n\n**Auto-restored** from: \`${res.data.activePath}\`\n\nAsk me anything about this codebase!`,
        }]);
      }
    } catch {
      // Server not ready yet
    }
  }

  async function loadPaths() {
    try {
      const res = await axios.get(`${API}/paths`);
      setIngestedPaths(res.data.paths || []);
    } catch {
      // No paths yet
    }
  }

  async function handleIngest(pathToIngest?: string) {
    const targetPath = pathToIngest || folderPath;
    if (!targetPath.trim()) return;

    setIsIngesting(true);
    setShowHistory(false);
    setMessages(prev => [...prev, {
      role: "codelens",
      content: `⏳ Ingesting codebase...\n\n\`${targetPath}\`\n\nThis may take a few minutes.`,
    }]);

    try {
      const res = await axios.post(`${API}/ingest`, { folderPath: targetPath });
      setIsReady(true);
      setIngestedPaths(res.data.paths || []);
      setMessages(prev => [...prev, {
        role: "codelens",
        content: `## ✅ Codebase Ready!\n\nI now understand \`${targetPath}\`\n\nAsk me anything!`,
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: "codelens",
        content: `❌ **Error:** ${error.response?.data?.error || error.message}`,
      }]);
    } finally {
      setIsIngesting(false);
    }
  }

  async function handleAsk() {
    if (!question.trim() || isLoading) return;

    const userQuestion = question.trim();
    setQuestion("");

    setMessages(prev => [
      ...prev,
      { role: "user", content: userQuestion },
      { role: "codelens", content: "", loading: true },
    ]);

    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/ask`, { question: userQuestion });
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: "codelens", content: response.data.answer },
      ]);
    } catch (error: any) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: "codelens",
          content: `❌ **Error:** ${error.response?.data?.error || error.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReset() {
    try {
      await axios.post(`${API}/reset`);
      setIsReady(false);
      setFolderPath("");
      setMessages([{
        role: "codelens",
        content: "## 🔍 Code Lens Reset\n\nEnter a new codebase path to get started.",
      }]);
    } catch (error: any) {
      console.error("Reset failed:", error);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    });
  }

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <span className="logo">⚙️</span>
          <div>
            <h1>Engineer AI</h1>
            <span className="phase-label">Code Lens — Phase 1</span>
          </div>
        </div>
        <div className="header-right">
          <div className={`status ${isReady ? "ready" : "not-ready"}`}>
            {isReady ? "● Ready" : "● Not ingested"}
          </div>
          {isReady && (
            <button className="reset-btn" onClick={handleReset}>
              🔄 Reset
            </button>
          )}
        </div>
      </div>

      {/* Ingest bar */}
      {!isReady && (
        <div className="ingest-section">
          <div className="ingest-bar">
            <input
              type="text"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              placeholder="Enter codebase path e.g. C:/Projects/my-app/src"
              disabled={isIngesting}
              onKeyDown={(e) => e.key === "Enter" && handleIngest()}
            />
            <button onClick={() => handleIngest()} disabled={isIngesting || !folderPath.trim()}>
              {isIngesting ? "⏳ Ingesting..." : "⚡ Ingest"}
            </button>
          </div>

          {/* Path history */}
          {ingestedPaths.length > 0 && (
            <div className="history-section">
              <button
                className="history-toggle"
                onClick={() => setShowHistory(!showHistory)}
              >
                🕒 Previously ingested ({ingestedPaths.length})
                {showHistory ? " ▲" : " ▼"}
              </button>

              {showHistory && (
                <div className="history-table-wrapper">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Path</th>
                        <th>Ingested At</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingestedPaths.map((p, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td className="path-cell">{p.folderPath}</td>
                          <td className="date-cell">{formatDate(p.ingestedAt)}</td>
                          <td>
                            <button
                              className="use-btn"
                              onClick={() => handleIngest(p.folderPath)}
                              disabled={isIngesting}
                            >
                              ⚡ Use
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="avatar">
              {msg.role === "codelens" ? "⚙️" : "👤"}
            </div>
            <div className="bubble">
              {msg.loading ? (
                <div className="typing">
                  <span></span><span></span><span></span>
                </div>
              ) : (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="input-bar">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isReady
              ? "Ask anything about your codebase... (Enter to send, Shift+Enter for new line)"
              : "Ingest a codebase first..."
          }
          disabled={!isReady || isLoading}
          rows={1}
        />
        <button onClick={handleAsk} disabled={!isReady || isLoading}>
          {isLoading ? "⏳" : "➤"}
        </button>
      </div>
    </div>
  );
}

export default App;