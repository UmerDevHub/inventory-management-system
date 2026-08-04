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
} from "lucide-react";
import API from "../api/axios";

/* ─── Quick suggestion chips ─────────────────────────────────── */
const SUGGESTIONS = [
  { icon: Package,      label: "Stock summary"        , msg: "Give me a full summary of current stock levels." },
  { icon: TrendingDown, label: "Low stock alerts"     , msg: "Which products are running low or out of stock?" },
  { icon: BarChart3,    label: "Inventory value"      , msg: "What is the total value of my inventory?" },
  { icon: ShoppingCart, label: "Recent purchases"     , msg: "Show me the most recent purchases." },
];

/* ─── Helper: format AI message with basic markdown ─────────── */
const formatMessage = (text) => {
  // Convert **bold**, • bullets, and newlines to HTML-safe JSX
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;
    // Bold
    const parts = trimmed.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
    );
    return (
      <p key={i} style={{ margin: "2px 0", lineHeight: 1.55 }}>
        {rendered}
      </p>
    );
  });
};

/* ─── Typing indicator ───────────────────────────────────────── */
const TypingDots = () => (
  <div style={s.typingWrap}>
    <div style={s.dotsBubble}>
      <span style={{ ...s.dot, animationDelay: "0ms"   }} />
      <span style={{ ...s.dot, animationDelay: "160ms" }} />
      <span style={{ ...s.dot, animationDelay: "320ms" }} />
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────── */
const AIAssistant = () => {
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [showSugg, setShowSugg] = useState(true);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const panelRef   = useRef(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput("");
    setShowSugg(false);
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      const history = [...messages, { role: "user", content: userText }];
      const { data } = await API.post("/ai/chat", {
        messages: history.map(({ role, content }) => ({ role, content })),
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Sorry, I couldn't connect to the AI service. Please check your API key.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setShowSugg(true);
    setInput("");
  };

  return (
    <>
      {/* ── Floating Button ──────────────────────────────────── */}
      <button
        style={{
          ...s.fab,
          ...(open ? s.fabOpen : {}),
        }}
        onClick={() => setOpen((v) => !v)}
        title="AI Inventory Assistant"
        aria-label="Open AI assistant"
      >
        {open ? (
          <X size={22} color="#fff" />
        ) : (
          <>
            <Bot size={24} color="#fff" />
            <span style={s.fabBadge} />
          </>
        )}
        {!open && <span style={s.fabGlow} />}
      </button>

      {/* ── Chat Panel ───────────────────────────────────────── */}
      <div
        ref={panelRef}
        style={{
          ...s.panel,
          ...(open ? s.panelOpen : s.panelClosed),
        }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.headerIcon}>
              <Sparkles size={16} color="#ffffff" />
            </div>
            <div>
              <div style={s.headerTitle}>WarehouseOS AI</div>
              <div style={s.headerSub}>
                <span style={s.activeDot} />
                Live inventory context
              </div>
            </div>
          </div>
          <div style={s.headerRight}>
            {messages.length > 0 && (
              <button style={s.iconBtn} onClick={resetChat} title="Clear chat">
                <RotateCcw size={15} color="#94a3b8" />
              </button>
            )}
            <button style={s.iconBtn} onClick={() => setOpen(false)} title="Close">
              <X size={15} color="#94a3b8" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={s.messages}>
          {/* Welcome message */}
          {messages.length === 0 && (
            <div style={s.welcome}>
              <div style={s.welcomeIcon}>
                <Bot size={28} color="#2563eb" />
              </div>
              <p style={s.welcomeTitle}>Hi! I'm your AI assistant.</p>
              <p style={s.welcomeSub}>
                I have live access to all your products, stock levels, purchases,
                and more. Ask me anything!
              </p>
            </div>
          )}

          {/* Suggestion chips */}
          {showSugg && (
            <div style={s.suggestions}>
              {SUGGESTIONS.map(({ icon: Icon, label, msg }) => (
                <button
                  key={label}
                  style={s.chip}
                  onClick={() => sendMessage(msg)}
                >
                  <Icon size={13} color="#2563eb" />
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                ...s.msgRow,
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {msg.role === "assistant" && (
                <div style={s.aiBubbleIcon}>
                  <Bot size={14} color="#2563eb" />
                </div>
              )}
              <div
                style={{
                  ...(msg.role === "user" ? s.userBubble : s.aiBubble),
                }}
              >
                {msg.role === "assistant"
                  ? formatMessage(msg.content)
                  : msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && <TypingDots />}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={s.inputArea}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about stock, purchases, suppliers…"
            style={s.textarea}
            rows={1}
            disabled={loading}
          />
          <button
            style={{
              ...s.sendBtn,
              opacity: (!input.trim() || loading) ? 0.45 : 1,
              cursor: (!input.trim() || loading) ? "not-allowed" : "pointer",
            }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            title="Send"
          >
            <Send size={16} color="#ffffff" />
          </button>
        </div>

        <p style={s.footer}>Powered by GPT · reads live inventory data</p>
      </div>

      {/* Global keyframe styles */}
      <style>{`
        @keyframes ai-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes ai-panel-in {
          from { opacity: 0; transform: scale(0.95) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes ai-fab-pulse {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
};

/* ─────────────────────────── Styles ─────────────────────────── */
const s = {
  /* Floating action button */
  fab: {
    position:        "fixed",
    bottom:          "28px",
    right:           "28px",
    width:           "58px",
    height:          "58px",
    borderRadius:    "50%",
    background:      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #7c3aed 100%)",
    boxShadow:       "0 8px 28px rgba(37,99,235,0.40), 0 2px 8px rgba(0,0,0,0.15)",
    border:          "none",
    cursor:          "pointer",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    zIndex:          9999,
    transition:      "all 0.22s cubic-bezier(0.4,0,0.2,1)",
    animation:       "ai-fab-pulse 3s ease-in-out infinite",
  },
  fabOpen: {
    background:   "linear-gradient(135deg, #475569, #334155)",
    animation:    "none",
    boxShadow:    "0 4px 16px rgba(0,0,0,0.2)",
  },
  fabBadge: {
    position:        "absolute",
    top:             "10px",
    right:           "10px",
    width:           "10px",
    height:          "10px",
    borderRadius:    "50%",
    backgroundColor: "#22c55e",
    border:          "2px solid #ffffff",
  },
  fabGlow: {
    position:        "absolute",
    inset:           "-4px",
    borderRadius:    "50%",
    background:      "rgba(37,99,235,0.15)",
    animation:       "ai-fab-pulse 3s ease-in-out infinite",
    pointerEvents:   "none",
  },

  /* Chat panel */
  panel: {
    position:        "fixed",
    bottom:          "100px",
    right:           "28px",
    width:           "360px",
    maxHeight:       "540px",
    borderRadius:    "20px",
    backgroundColor: "#ffffff",
    boxShadow:       "0 24px 64px rgba(15,23,42,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
    display:         "flex",
    flexDirection:   "column",
    zIndex:          9998,
    overflow:        "hidden",
    transition:      "all 0.25s cubic-bezier(0.4,0,0.2,1)",
    transformOrigin: "bottom right",
  },
  panelOpen: {
    opacity:         1,
    transform:       "scale(1) translateY(0)",
    pointerEvents:   "all",
    animation:       "ai-panel-in 0.25s ease",
  },
  panelClosed: {
    opacity:         0,
    transform:       "scale(0.92) translateY(20px)",
    pointerEvents:   "none",
  },

  /* Header */
  header: {
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "space-between",
    padding:         "14px 16px",
    background:      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #7c3aed 100%)",
    flexShrink:      0,
  },
  headerLeft: {
    display:     "flex",
    alignItems:  "center",
    gap:         "10px",
  },
  headerIcon: {
    width:           "32px",
    height:          "32px",
    borderRadius:    "10px",
    backgroundColor: "rgba(255,255,255,0.2)",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
  },
  headerTitle: {
    fontSize:    "14px",
    fontWeight:  "800",
    color:       "#ffffff",
    lineHeight:  1.2,
  },
  headerSub: {
    fontSize:    "11px",
    color:       "rgba(255,255,255,0.75)",
    display:     "flex",
    alignItems:  "center",
    gap:         "4px",
    marginTop:   "1px",
  },
  activeDot: {
    display:         "inline-block",
    width:           "6px",
    height:          "6px",
    borderRadius:    "50%",
    backgroundColor: "#4ade80",
  },
  headerRight: {
    display:     "flex",
    alignItems:  "center",
    gap:         "6px",
  },
  iconBtn: {
    width:           "28px",
    height:          "28px",
    borderRadius:    "8px",
    backgroundColor: "rgba(255,255,255,0.15)",
    border:          "none",
    cursor:          "pointer",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
  },

  /* Messages area */
  messages: {
    flex:              1,
    overflowY:         "auto",
    padding:           "16px",
    display:           "flex",
    flexDirection:     "column",
    gap:               "12px",
    backgroundColor:   "#f8fafc",
  },

  /* Welcome */
  welcome: {
    display:     "flex",
    flexDirection:"column",
    alignItems:  "center",
    textAlign:   "center",
    padding:     "12px 8px",
    gap:         "8px",
  },
  welcomeIcon: {
    width:           "52px",
    height:          "52px",
    borderRadius:    "16px",
    backgroundColor: "#eff6ff",
    border:          "1px solid #dbeafe",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    "4px",
  },
  welcomeTitle: {
    fontSize:    "15px",
    fontWeight:  "800",
    color:       "#0f172a",
    margin:      0,
  },
  welcomeSub: {
    fontSize:    "13px",
    color:       "#64748b",
    margin:      0,
    lineHeight:  1.5,
  },

  /* Suggestion chips */
  suggestions: {
    display:    "grid",
    gridTemplateColumns: "1fr 1fr",
    gap:        "6px",
  },
  chip: {
    display:         "flex",
    alignItems:      "center",
    gap:             "6px",
    padding:         "8px 10px",
    borderRadius:    "10px",
    backgroundColor: "#ffffff",
    border:          "1px solid #e2e8f0",
    color:           "#334155",
    fontSize:        "12px",
    fontWeight:      "600",
    cursor:          "pointer",
    transition:      "all 0.15s ease",
    textAlign:       "left",
    fontFamily:      "inherit",
  },

  /* Message rows */
  msgRow: {
    display:     "flex",
    alignItems:  "flex-end",
    gap:         "8px",
  },
  aiBubbleIcon: {
    width:           "24px",
    height:          "24px",
    borderRadius:    "8px",
    backgroundColor: "#eff6ff",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    flexShrink:      0,
    border:          "1px solid #dbeafe",
  },
  aiBubble: {
    maxWidth:        "88%",
    backgroundColor: "#ffffff",
    border:          "1px solid #e2e8f0",
    borderRadius:    "14px 14px 14px 4px",
    padding:         "10px 13px",
    fontSize:        "13px",
    color:           "#334155",
    lineHeight:      1.55,
    boxShadow:       "0 1px 4px rgba(0,0,0,0.05)",
  },
  userBubble: {
    maxWidth:        "80%",
    background:      "linear-gradient(135deg, #2563eb, #1d4ed8)",
    borderRadius:    "14px 14px 4px 14px",
    padding:         "10px 13px",
    fontSize:        "13px",
    color:           "#ffffff",
    lineHeight:      1.55,
    fontWeight:      "500",
  },

  /* Typing */
  typingWrap: {
    display:     "flex",
    alignItems:  "flex-end",
    gap:         "8px",
  },
  dotsBubble: {
    display:         "flex",
    gap:             "4px",
    alignItems:      "center",
    backgroundColor: "#ffffff",
    border:          "1px solid #e2e8f0",
    borderRadius:    "14px 14px 14px 4px",
    padding:         "12px 14px",
    boxShadow:       "0 1px 4px rgba(0,0,0,0.05)",
  },
  dot: {
    display:         "inline-block",
    width:           "7px",
    height:          "7px",
    borderRadius:    "50%",
    backgroundColor: "#94a3b8",
    animation:       "ai-bounce 1.2s ease-in-out infinite",
  },

  /* Input */
  inputArea: {
    display:         "flex",
    alignItems:      "flex-end",
    gap:             "8px",
    padding:         "12px 14px",
    borderTop:       "1px solid #f1f5f9",
    backgroundColor: "#ffffff",
    flexShrink:      0,
  },
  textarea: {
    flex:            1,
    padding:         "9px 12px",
    borderRadius:    "12px",
    border:          "1px solid #e2e8f0",
    fontSize:        "13px",
    fontFamily:      "inherit",
    color:           "#0f172a",
    backgroundColor: "#f8fafc",
    resize:          "none",
    outline:         "none",
    lineHeight:      1.5,
    maxHeight:       "90px",
    overflowY:       "auto",
  },
  sendBtn: {
    width:           "36px",
    height:          "36px",
    borderRadius:    "10px",
    background:      "linear-gradient(135deg, #2563eb, #1d4ed8)",
    border:          "none",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    transition:      "all 0.15s ease",
    flexShrink:      0,
    boxShadow:       "0 2px 8px rgba(37,99,235,0.3)",
  },

  footer: {
    fontSize:    "10px",
    color:       "#94a3b8",
    textAlign:   "center",
    padding:     "6px 0 10px",
    margin:      0,
    backgroundColor: "#ffffff",
    flexShrink:  0,
  },
};

export default AIAssistant;
