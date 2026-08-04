import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Package,
  TrendingDown,
  BarChart3,
  ShoppingCart,
  Zap,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import API from "../api/axios";

/* ─── Quick suggestion chips ─────────────────────────────────── */
const SUGGESTIONS = [
  { icon: Package,      label: "Stock summary",    msg: "Give me a full summary of current stock levels." },
  { icon: TrendingDown, label: "Low stock alerts", msg: "Which products are running low or out of stock?" },
  { icon: BarChart3,    label: "Inventory value",  msg: "What is the total value of my inventory?" },
  { icon: ShoppingCart, label: "Recent purchases", msg: "Show me the most recent purchases." },
];

/* ─── Rich Markdown & List Renderer ───────────────────────────── */
const RenderFormattedText = ({ content, isTyping = false }) => {
  if (!content) return null;

  const lines = content.split("\n");
  
  return (
    <div style={s.formattedContainer}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} style={{ height: "6px" }} />;
        }

        // Bullet points (* or - or •)
        const isBullet = /^[*\-•]\s+/.test(trimmed);
        // Numbered list (1. 2.)
        const isNumbered = /^\d+\.\s+/.test(trimmed);

        let cleanText = trimmed;
        if (isBullet) {
          cleanText = trimmed.replace(/^[*\-•]\s+/, "");
        } else if (isNumbered) {
          cleanText = trimmed.replace(/^\d+\.\s+/, "");
        }

        // Parse inline formatting: **bold**, prices $XX, numbers
        const parts = cleanText.split(/(\*\*.*?\*\*)/g);

        const renderedLine = parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={pIdx} style={s.boldText}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={lineIdx} style={s.bulletRow}>
              <span style={s.bulletDot}>•</span>
              <div style={s.bulletText}>{renderedLine}</div>
            </div>
          );
        }

        if (isNumbered) {
          const numMatch = trimmed.match(/^(\d+)\./);
          const num = numMatch ? numMatch[1] : "1";
          return (
            <div key={lineIdx} style={s.bulletRow}>
              <span style={s.numBadge}>{num}</span>
              <div style={s.bulletText}>{renderedLine}</div>
            </div>
          );
        }

        return (
          <p key={lineIdx} style={s.paragraph}>
            {renderedLine}
          </p>
        );
      })}
      {isTyping && <span style={s.blinkingCursor}>|</span>}
    </div>
  );
};

/* ─── Typing Indicator ───────────────────────────────────────── */
const TypingDots = () => (
  <div style={s.typingRow}>
    <div style={s.aiAvatarSmall}>
      <Sparkles size={12} color="#6366f1" />
    </div>
    <div style={s.dotsBubble}>
      <span style={{ ...s.dot, animationDelay: "0ms" }} />
      <span style={{ ...s.dot, animationDelay: "180ms" }} />
      <span style={{ ...s.dot, animationDelay: "360ms" }} />
    </div>
  </div>
);

/* ─────────────────────── Main Component ───────────────────────── */
const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSugg, setShowSugg] = useState(true);

  // Typewriter streaming state
  const [streamIndex, setStreamIndex] = useState(null); // index of message being typed
  const [streamedText, setStreamedText] = useState(""); // revealed text so far

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const streamTimerRef = useRef(null);

  // Scroll to bottom smoothly when messages or streamed text updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedText, loading, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // Cleanup typewriter interval on unmount
  useEffect(() => {
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, []);

  // Typewriter effect function
  const startTypewriter = (fullText, msgIdx) => {
    if (streamTimerRef.current) clearInterval(streamTimerRef.current);

    setStreamIndex(msgIdx);
    setStreamedText("");

    let currentLength = 0;
    const totalLength = fullText.length;
    // Speed: reveal 2 to 4 characters per tick (every 18ms) for a smooth Gemini-like response
    const chunkSize = Math.max(2, Math.floor(totalLength / 80));

    streamTimerRef.current = setInterval(() => {
      currentLength += chunkSize;
      if (currentLength >= totalLength) {
        setStreamedText(fullText);
        setStreamIndex(null);
        clearInterval(streamTimerRef.current);
      } else {
        setStreamedText(fullText.slice(0, currentLength));
      }
    }, 18);
  };

  const send = async (text) => {
    const txt = (text || input).trim();
    if (!txt || loading) return;

    // Stop current typewriter if running
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      setStreamIndex(null);
    }

    setInput("");
    setShowSugg(false);

    const userMsg = { role: "user", content: txt };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const { data } = await API.post("/ai/chat", {
        messages: newMessages.map(({ role, content }) => ({ role, content })),
      });

      const replyContent = data.reply || "No response received.";
      const assistantMsg = { role: "assistant", content: replyContent };
      
      setMessages((prev) => {
        const updated = [...prev, assistantMsg];
        const newMsgIdx = updated.length - 1;
        // Trigger word-by-word streaming effect
        setTimeout(() => startTypewriter(replyContent, newMsgIdx), 50);
        return updated;
      });

    } catch (err) {
      const errorMsg =
        err.response?.data?.reply ||
        "⚠️ Couldn't connect to AI service. Please check your API key in server/.env.";
      setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    setStreamIndex(null);
    setStreamedText("");
    setMessages([]);
    setShowSugg(true);
    setInput("");
  };

  return (
    <>
      {/* ── Floating Action Button ──────────────────────────────── */}
      <button
        className="ai-assistant-fab"
        style={{ ...s.fab, ...(open ? s.fabActive : {}) }}
        onClick={() => setOpen((v) => !v)}
        title="WarehouseOS AI Assistant"
        aria-label="Toggle AI Assistant"
      >
        <div style={s.fabIconWrapper}>
          {open ? (
            <X size={22} color="#ffffff" />
          ) : (
            <Sparkles size={24} color="#ffffff" />
          )}
        </div>
        {!open && <span style={s.fabPulseRing} />}
      </button>

      {/* ── Floating Chat Panel ─────────────────────────────────── */}
      <div className={`ai-assistant-panel${open ? " panel-open" : ""}`} style={{ ...s.panel, ...(open ? s.panelOpen : s.panelHide) }}>

        
        {/* ── Panel Header ────────────────────────────────────── */}
        <div style={s.header}>
          <div style={s.headerGlowBg} />
          <div style={s.headerRow}>
            <div style={s.headerBrand}>
              <div style={s.brandBadge}>
                <Sparkles size={16} color="#ffffff" />
              </div>
              <div style={s.brandInfo}>
                <div style={s.brandTitle}>
                  WarehouseOS AI
                  <span style={s.modelBadge}>Groq · Llama 3.3</span>
                </div>
                <div style={s.liveStatus}>
                  <span style={s.statusDot} />
                  <span>Real-time database context</span>
                </div>
              </div>
            </div>

            <div style={s.headerActions}>
              {messages.length > 0 && (
                <button style={s.headBtn} onClick={reset} title="Clear Chat">
                  <RotateCcw size={14} color="#ffffff" />
                </button>
              )}
              <button style={s.headBtn} onClick={() => setOpen(false)} title="Close">
                <X size={15} color="#ffffff" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Chat Messages Body ──────────────────────────────── */}
        <div style={s.chatBody}>
          {/* Welcome Screen */}
          {messages.length === 0 && (
            <div style={s.welcomeCard}>
              <div style={s.welcomeAvatar}>
                <Bot size={28} color="#6366f1" />
              </div>
              <h4 style={s.welcomeHeading}>Hello! How can I help you today?</h4>
              <p style={s.welcomeSubtext}>
                I have live context of all your <strong>Products, Stock Levels, Suppliers, Warehouses, and Purchases</strong>.
              </p>
            </div>
          )}

          {/* Quick Suggestion Chips */}
          {showSugg && (
            <div style={s.suggestionsGrid}>
              {SUGGESTIONS.map(({ icon: Icon, label, msg }) => (
                <button key={label} style={s.chipBtn} onClick={() => send(msg)}>
                  <div style={s.chipIconWrap}>
                    <Icon size={13} color="#6366f1" />
                  </div>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Rendered Messages */}
          {messages.map((m, idx) => {
            const isAI = m.role === "assistant";
            const isCurrentlyStreaming = streamIndex === idx;
            const textToRender = isCurrentlyStreaming ? streamedText : m.content;

            return (
              <div
                key={idx}
                style={{
                  ...s.messageRow,
                  justifyContent: isAI ? "flex-start" : "flex-end",
                }}
              >
                {isAI && (
                  <div style={s.aiAvatarMeta}>
                    <div style={s.aiAvatarCircle}>
                      <Bot size={13} color="#6366f1" />
                    </div>
                    <span style={s.aiMetaName}>AI Assistant</span>
                  </div>
                )}

                <div style={isAI ? s.aiBubbleCard : s.userBubbleCard}>
                  {isAI ? (
                    <RenderFormattedText
                      content={textToRender}
                      isTyping={isCurrentlyStreaming}
                    />
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator while waiting for server response */}
          {loading && streamIndex === null && <TypingDots />}

          <div ref={bottomRef} style={{ float: "left", clear: "both" }} />
        </div>

        {/* ── Input Box Footer ────────────────────────────────── */}
        <div style={s.inputFooter}>
          <div style={s.inputBoxContainer}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask anything about products, low stock, orders..."
              style={s.textInput}
              rows={1}
              disabled={loading}
            />
            <button
              style={{
                ...s.sendButton,
                opacity: !input.trim() || loading ? 0.45 : 1,
                cursor: !input.trim() || loading ? "not-allowed" : "pointer",
              }}
              onClick={() => send()}
              disabled={!input.trim() || loading}
              title="Send Message"
            >
              <Send size={15} color="#ffffff" />
            </button>
          </div>

          <div style={s.footerMeta}>
            <Zap size={11} color="#6366f1" />
            <span>Groq Llama 3.3 70B · Connected to Live DB</span>
          </div>
        </div>
      </div>

      {/* Global CSS keyframes for animations */}
      <style>{`
        @keyframes aiPulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes aiDotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes aiBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes aiPanelEntrance {
          from { opacity: 0; transform: scale(0.94) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
};

/* ───────────────────────────── Styles ───────────────────────────── */
const s = {
  /* FAB floating button */
  fab: {
    position: "fixed",
    bottom: "28px",
    right: "28px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #8b5cf6 100%)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    boxShadow: "0 10px 32px rgba(99, 102, 241, 0.45), 0 3px 10px rgba(0, 0, 0, 0.15)",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  fabActive: {
    background: "linear-gradient(135deg, #334155, #0f172a)",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.3)",
  },
  fabIconWrapper: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  fabPulseRing: {
    position: "absolute",
    inset: "-4px",
    borderRadius: "50%",
    border: "2px solid rgba(99, 102, 241, 0.5)",
    animation: "aiPulseRing 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
    pointerEvents: "none",
  },

  /* Floating Chat Panel Container */
  panel: {
    position: "fixed",
    bottom: "100px",
    right: "28px",
    width: "390px",
    height: "600px",
    maxHeight: "calc(100vh - 120px)",
    borderRadius: "24px",
    backgroundColor: "#ffffff",
    boxShadow: "0 24px 72px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(226, 232, 240, 0.8)",
    display: "flex",
    flexDirection: "column",
    zIndex: 9998,
    overflow: "hidden",
    transformOrigin: "bottom right",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  panelOpen: {
    opacity: 1,
    transform: "scale(1) translateY(0)",
    pointerEvents: "all",
    animation: "aiPanelEntrance 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  panelHide: {
    opacity: 0,
    transform: "scale(0.92) translateY(24px)",
    pointerEvents: "none",
  },

  /* Header */
  header: {
    position: "relative",
    background: "linear-gradient(135deg, #4338ca 0%, #4f46e5 60%, #7c3aed 100%)",
    padding: "16px 18px",
    flexShrink: 0,
    overflow: "hidden",
  },
  headerGlowBg: {
    position: "absolute",
    top: "-30px",
    right: "-30px",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.12)",
    pointerEvents: "none",
  },
  headerRow: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBrand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  brandBadge: {
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandInfo: {
    display: "flex",
    flexDirection: "column",
  },
  brandTitle: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 1.2,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  modelBadge: {
    fontSize: "10px",
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.9)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: "2px 6px",
    borderRadius: "6px",
    letterSpacing: "0.02em",
  },
  liveStatus: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    color: "rgba(255, 255, 255, 0.82)",
    marginTop: "2px",
    fontWeight: "500",
  },
  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#4ade80",
    boxShadow: "0 0 8px rgba(74, 222, 128, 0.9)",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  headBtn: {
    width: "30px",
    height: "30px",
    borderRadius: "9px",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s ease",
  },

  /* Body Scroll Container */
  chatBody: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    backgroundColor: "#f8fafc",
  },

  /* Welcome Screen */
  welcomeCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "16px 12px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
  },
  welcomeAvatar: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    backgroundColor: "#eef2ff",
    border: "1px solid #c7d2fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "10px",
  },
  welcomeHeading: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 6px 0",
  },
  welcomeSubtext: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
    lineHeight: 1.5,
  },

  /* Suggestions Grid */
  suggestionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  chipBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 12px",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#1e293b",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "left",
    transition: "all 0.15s ease",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
  },
  chipIconWrap: {
    width: "24px",
    height: "24px",
    borderRadius: "8px",
    backgroundColor: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  /* Messages */
  messageRow: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  aiAvatarMeta: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "2px",
    paddingLeft: "2px",
  },
  aiAvatarCircle: {
    width: "20px",
    height: "20px",
    borderRadius: "6px",
    backgroundColor: "#eef2ff",
    border: "1px solid #c7d2fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  aiMetaName: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#6366f1",
    letterSpacing: "0.03em",
  },
  aiBubbleCard: {
    maxWidth: "92%",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px 16px 16px 4px",
    padding: "12px 14px",
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
    color: "#0f172a",
    fontSize: "13.5px",
    lineHeight: 1.6,
  },
  userBubbleCard: {
    maxWidth: "84%",
    alignSelf: "flex-end",
    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
    borderRadius: "16px 16px 4px 16px",
    padding: "11px 15px",
    color: "#ffffff",
    fontSize: "13.5px",
    fontWeight: "500",
    lineHeight: 1.55,
    boxShadow: "0 3px 12px rgba(99, 102, 241, 0.3)",
  },

  /* Formatted Text Inside AI Messages */
  formattedContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  paragraph: {
    margin: "2px 0",
    lineHeight: 1.6,
  },
  boldText: {
    fontWeight: "700",
    color: "#0f172a",
  },
  bulletRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    margin: "3px 0",
  },
  bulletDot: {
    color: "#6366f1",
    fontWeight: "800",
    fontSize: "14px",
    lineHeight: 1.4,
  },
  numBadge: {
    minWidth: "18px",
    height: "18px",
    borderRadius: "50%",
    backgroundColor: "#eef2ff",
    color: "#4f46e5",
    fontSize: "11px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "2px",
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    lineHeight: 1.55,
  },
  blinkingCursor: {
    display: "inline-block",
    fontWeight: "800",
    color: "#6366f1",
    marginLeft: "2px",
    animation: "aiBlink 0.8s infinite",
  },

  /* Typing Dots */
  typingRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  aiAvatarSmall: {
    width: "22px",
    height: "22px",
    borderRadius: "7px",
    backgroundColor: "#eef2ff",
    border: "1px solid #c7d2fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dotsBubble: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "10px 14px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px 14px 14px 4px",
    boxShadow: "0 1px 4px rgba(15, 23, 42, 0.04)",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#6366f1",
    animation: "aiDotBounce 1.4s infinite ease-in-out both",
  },

  /* Input Footer Area */
  inputFooter: {
    padding: "12px 14px",
    borderTop: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    flexShrink: 0,
  },
  inputBoxContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#f8fafc",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    padding: "6px 6px 6px 12px",
    transition: "border-color 0.15s ease",
  },
  textInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "13px",
    fontFamily: "inherit",
    color: "#0f172a",
    resize: "none",
    lineHeight: 1.5,
    maxHeight: "80px",
    overflowY: "auto",
  },
  sendButton: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(99, 102, 241, 0.35)",
    transition: "opacity 0.15s ease",
  },
  footerMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#64748b",
    marginTop: "8px",
  },
};

export default AIAssistant;
