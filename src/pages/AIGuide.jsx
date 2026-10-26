import { useEffect, useState } from "react";
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
  const [apiStatus, setApiStatus] = useState("checking");
  const [healthCheckAttempt, setHealthCheckAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    // Hosted free-tier services may take several seconds to wake from sleep.
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);
    let active = true;

    fetch(`${API_BASE_URL}/api/health`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.success) {
          throw new Error("AI health check failed");
        }
        if (active) {
          setApiStatus(payload.aiConfigured ? "ready" : "unconfigured");
        }
      })
      .catch(() => {
        if (active) setApiStatus("unavailable");
      })
      .finally(() => window.clearTimeout(timeoutId));

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [healthCheckAttempt]);

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

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ask-guide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: trimmedQuestion
        }),
        signal: controller.signal
      });

      const contentType = response.headers.get("content-type") || "";
      const parsed = contentType.includes("application/json")
        ? await response.json()
        : null;
      const data = parsed && typeof parsed === "object" ? parsed : {};

      if (!response.ok || !data.success) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : `The AI service returned HTTP ${response.status}. Please try again later.`
        );
      }

      if (typeof data.answer !== "string" || !data.answer.trim()) {
        throw new Error("The AI Guide returned an empty answer. Please try again.");
      }

      setAnswer(data.answer);
      setSources(Array.isArray(data.sources) ? data.sources : []);
      setMatchedEntries(Array.isArray(data.matchedEntries) ? data.matchedEntries : []);
    } catch (err) {
      console.error("AI Guide request failed:", err);

      if (err?.name === "AbortError") {
        setError("The AI Guide took too long to respond. Please try again.");
      } else if (err instanceof Error && err.message && err.message !== "Failed to fetch") {
        setError(err.message);
      } else {
        setError("The AI Guide is currently unreachable. Please check the API deployment and try again.");
      }
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="ai-guide-page">
      <Navbar />

      <main className="ai-guide-main">
        <section className="ai-guide-hero">
          <span className="ai-guide-kicker">✦ INDIA'S CULTURAL COMPANION</span>

          <h1>
            Meet
            <span> Bharat AI.</span>
          </h1>

          <p>
            Ask about India's heritage, traditions, festivals, arts,
            cuisine, communities, and stories. Explore Bharat through
            conversation.
          </p>

          <div className="ai-guide-orb ai-bharat-orbit" role="img" aria-label="Map of India surrounded by Indian language names">
            <div className="ai-orb-ring ai-orb-ring-one" aria-hidden="true"></div>
            <div className="ai-orb-ring ai-orb-ring-two" aria-hidden="true"></div>
            <div className="ai-language-orbit" aria-hidden="true">
              {[
                "हिंदी", "বাংলা", "தமிழ்", "తెలుగు", "मराठी", "ગુજરાતી",
                "ಕನ್ನಡ", "മലയാളം", "ਪੰਜਾਬੀ", "ଓଡ଼ିଆ", "অসমীয়া", "اردو"
              ].map((language, index, all) => {
                const angle = (360 / all.length) * index - 90;
                return (
                  <span
                    className="ai-language-pill"
                    key={language}
                    style={{
                      "--orbit-angle": angle + "deg",
                      "--orbit-counter-angle": (-angle) + "deg",
                      "--orbit-radius": "145px",
                      "--orbit-delay": (-index * 2.6) + "s"
                    }}
                  >
                    <span className="ai-language-text">{language}</span>
                  </span>
                );
              })}
            </div>
            <svg className="ai-india-map" viewBox="0 0 300 330" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="ai-india-fill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f0bd66" />
                  <stop offset="48%" stopColor="#d9772b" />
                  <stop offset="100%" stopColor="#7a2318" />
                </linearGradient>
                <clipPath id="ai-india-clip">
                  <path d="M69 24 91 16 113 25 133 20 153 29 174 25 192 37 209 42 220 53 237 52 253 61 266 74 254 84 238 81 228 91 214 96 208 110 194 122 189 143 180 161 173 183 164 205 157 228 145 253 135 275 124 302 115 285 106 262 96 242 84 222 72 207 61 190 51 174 45 155 49 138 44 126 53 111 60 96 56 82 64 71 59 60 66 48 60 36Z" />
                </clipPath>
              </defs>
              <path
                className="ai-india-map-shadow"
                d="M69 24 91 16 113 25 133 20 153 29 174 25 192 37 209 42 220 53 237 52 253 61 266 74 254 84 238 81 228 91 214 96 208 110 194 122 189 143 180 161 173 183 164 205 157 228 145 253 135 275 124 302 115 285 106 262 96 242 84 222 72 207 61 190 51 174 45 155 49 138 44 126 53 111 60 96 56 82 64 71 59 60 66 48 60 36Z"
                transform="translate(0 3)"
              />
              <path
                className="ai-india-map-shape"
                d="M69 24 91 16 113 25 133 20 153 29 174 25 192 37 209 42 220 53 237 52 253 61 266 74 254 84 238 81 228 91 214 96 208 110 194 122 189 143 180 161 173 183 164 205 157 228 145 253 135 275 124 302 115 285 106 262 96 242 84 222 72 207 61 190 51 174 45 155 49 138 44 126 53 111 60 96 56 82 64 71 59 60 66 48 60 36Z"
              />
              <g className="ai-india-map-detail" clipPath="url(#ai-india-clip)">
                <path d="M74 69 106 79 135 72 160 83 187 72 216 79" />
                <path d="M54 125 90 135 124 121 149 137 185 125 211 133" />
                <path d="M67 174 101 164 129 181 163 168 188 180" />
                <path d="M91 216 116 205 145 220 168 207" />
                <path d="M116 261 136 249 153 254" />
              </g>
              <circle className="ai-india-island" cx="82" cy="311" r="3" />
              <circle className="ai-india-island" cx="88" cy="318" r="1.8" />
            </svg>
            <span className="ai-map-caption" aria-hidden="true">ONE LAND · MANY VOICES</span>
          </div>
        </section>

        <section className="ai-guide-panel">
          <div className="ai-guide-panel-heading">
            <div>
              <span className="ai-panel-label">ASK BHARAT</span>
              <h2>What would you like to discover?</h2>
            </div>

            <span className={`ai-status ai-status-${apiStatus}`} role="status" aria-live="polite">
              <i></i>
              {loading
                ? "THINKING..."
                : apiStatus === "ready"
                  ? "BHARAT AI READY"
                  : apiStatus === "unconfigured"
                    ? "SETUP NEEDED"
                    : apiStatus === "unavailable"
                      ? "BHARAT AI OFFLINE"
                      : "CHECKING BHARAT AI..."}
            </span>
          </div>

          {apiStatus === "unconfigured" && (
            <p className="ai-connection-message" role="status">
              The AI service is reachable, but its API key is not configured. You can still explore the cultural collection below.
            </p>
          )}

          {apiStatus === "unavailable" && (
            <div className="ai-connection-message" role="status">
              <p>We couldn't reach the AI service. The cultural collection remains available while the connection is checked by the project team.</p>
              <button
                type="button"
                className="ai-connection-retry"
                onClick={() => setHealthCheckAttempt((attempt) => attempt + 1)}
                disabled={loading}
              >
                Check connection again
              </button>
            </div>
          )}

          <div className="ai-input-wrap">
            <textarea
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  askGuide();
                }
              }}
              placeholder="Ask Bharat AI about Indian culture..."
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
              {loading ? "Thinking..." : "Ask Bharat AI"}
              <span>{loading ? "…" : "→"}</span>
            </button>
          </div>

          {error && (
            <div className="ai-error-message" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          {answer && (
            <div className="ai-answer" aria-live="polite">
              <div className="ai-answer-heading">
                <span>✦</span>
                <div>
                  <span className="ai-panel-label">BHARAT AI</span>
                  <h3>Bharat AI says</h3>
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