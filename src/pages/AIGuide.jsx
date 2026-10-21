import { useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

const suggestions = [
  "Tell me about Maharashtra's cultural heritage",
  "Which Indian festivals should I explore?",
  "What is special about Rajasthan's traditions?",
  "Show me India's most important heritage sites"
];

function AIGuide() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [matchedEntries, setMatchedEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSuggestion = (text) => {
    setQuestion(text);
    setAnswer("");
    setSources([]);
    setMatchedEntries([]);
    setError("");
  };

  const askGuide = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError("Ask the AI Guide a question first.");
      return;
    }

    setLoading(true);
    setAnswer("");
    setSources([]);
    setMatchedEntries([]);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/ask-guide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: trimmedQuestion
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to get a response.");
      }

      setAnswer(data.answer);
      setSources(Array.isArray(data.sources) ? data.sources : []);
      setMatchedEntries(Array.isArray(data.matchedEntries) ? data.matchedEntries : []);
    } catch (err) {
      console.error("AI Guide request failed:", err);

      setError(
        "The AI Guide could not respond right now. Make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-guide-page">
      <Navbar />

      <main className="ai-guide-main">
        <section className="ai-guide-hero">
          <span className="ai-guide-kicker">✦ THE CULTURAL COMPANION</span>

          <h1>
            Meet your
            <span> AI Guide.</span>
          </h1>

          <p>
            Ask about India's heritage, traditions, festivals, arts,
            cuisine, communities, and stories. Explore Bharat through
            conversation.
          </p>

          <div className="ai-guide-orb">
            <div className="ai-orb-ring ai-orb-ring-one"></div>
            <div className="ai-orb-ring ai-orb-ring-two"></div>

            <div className="ai-orb-core">
              <span>ॐ</span>
            </div>
          </div>
        </section>

        <section className="ai-guide-panel">
          <div className="ai-guide-panel-heading">
            <div>
              <span className="ai-panel-label">ASK BHARAT</span>
              <h2>What would you like to discover?</h2>
            </div>

            <span className="ai-status">
              <i></i>
              {loading ? "THINKING..." : "READY FOR YOUR QUESTION"}
            </span>
          </div>

          <div className="ai-input-wrap">
            <textarea
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  askGuide();
                }
              }}
              placeholder="Ask something about India's culture..."
              rows="4"
              maxLength={1000}
              aria-label="Ask a question about Indian cultural heritage"
              disabled={loading}
            />

            <button
              className="ai-ask-button"
              type="button"
              onClick={askGuide}
              disabled={loading}
            >
              {loading ? "Thinking..." : "Ask Guide"}
              <span>{loading ? "…" : "→"}</span>
            </button>
          </div>

          {error && (
            <div className="ai-error-message">
              {error}
            </div>
          )}

          {answer && (
            <div className="ai-answer">
              <div className="ai-answer-heading">
                <span>✦</span>
                <div>
                  <span className="ai-panel-label">BHARAT AI</span>
                  <h3>Your cultural guide says</h3>
                </div>
              </div>

              <div className="ai-answer-text">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            </div>
          )}

          {answer && matchedEntries.length > 0 && (
            <section className="ai-source-panel" aria-label="Collection entries used">
              <span className="ai-panel-label">COLLECTION CONTEXT</span>
              <p>The guide found these entries in the current curated collection. Match quality and completeness can vary.</p>
              <ul>
                {matchedEntries.map((entry) => (
                  <li key={entry.state + "-" + entry.category + "-" + entry.name}>
                    <strong>{entry.name}</strong>
                    <span>{entry.category} · {entry.state}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {answer && sources.length > 0 && (
            <section className="ai-source-panel" aria-label="Regional reference links">
              <span className="ai-panel-label">REGIONAL REFERENCE LINKS</span>
              <p>These are regional research starting points, not guaranteed item-level citations for every sentence in the answer.</p>
              <ul>
                {sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a>
                    <span>{source.state}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="ai-suggestions">
            <span>TRY ASKING</span>

            <div className="ai-suggestion-list">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestion(suggestion)}
                  disabled={loading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="ai-guide-discover">
          <div>
            <span className="ai-panel-label">EXPLORE WHILE YOU WAIT</span>
            <h2>Begin with India's cultural dimensions.</h2>
          </div>

          <div className="ai-discover-grid">
            <Link to="/explore" className="ai-discover-card">
              <span>🏛️</span>
              <strong>Heritage</strong>
              <small>Monuments, sites & stories</small>
            </Link>

            <Link to="/explore" className="ai-discover-card">
              <span>🎉</span>
              <strong>Festivals</strong>
              <small>Celebrations across Bharat</small>
            </Link>

            <Link to="/explore" className="ai-discover-card">
              <span>🎨</span>
              <strong>Arts & Crafts</strong>
              <small>Living creative traditions</small>
            </Link>

            <Link to="/explore" className="ai-discover-card">
              <span>🍛</span>
              <strong>Cuisine</strong>
              <small>Flavours rooted in culture</small>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default AIGuide;