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
} from "lucide-react";
import API from "../api/axios";

/* ─── Quick suggestion chips ─────────────────────────────────── */
const SUGGESTIONS = [
  { icon: Package,      label: "Stock summary",    msg: "Give me a full summary of current stock levels." },
  { icon: TrendingDown, label: "Low stock alerts", msg: "Which products are running low or out of stock?" },
  { icon: BarChart3,    label: "Inventory value",  msg: "What is the total value of my inventory?" },
  { icon: ShoppingCart, label: "Recent purchases", msg: "Show me the most recent purchases." },
];

/* ─── Format AI message text ─────────────────────────────────── */
const formatMessage = (text) => {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <br key={i} />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} style={{ margin: "3px 0", lineHeight: 1.6 }}>
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
      </p>
    );
  });
};

/* ─── Typing dots ────────────────────────────────────────────── */
const TypingDots = () => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
    <div style={s.aiAvatar}><Bot size={13} color="#6366f1" /></div>
    <div style={s.dotsBubble}>
      {[0, 160, 320].map((d) => (
        <span key={d} style={{ ...s.dot, animationDelay: `${d}ms` }} />
      ))}
    </div>
  </div>
);

/* ─────────────────────── Main Component ───────────────────────── */
const AIAssistant = () => {
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [showSugg, setShowSugg] = useState(true);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300); }, [open]);

  const send = async (text) => {
    const txt = (text || input).trim();
    if (!txt || loading) return;
    setInput("");
    setShowSugg(false);
    const next = [...messages, { role: "user", content: txt }];
    setMessages(next);
    setLoading(true);
    try {
      const { data } = await API.post("/ai/chat", {
        messages: next.map(({ role, content }) => ({ role, content })),
      });
      setMessages((p) => [...p, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "⚠️ Couldn't reach AI service. Please check your API key in server/.env." }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setMessages([]); setShowSugg(true); setInput(""); };

  return (
    <>
      {/* ── Floating Button ─────────────────────────────────────── */}
      <button
        style={{ ...s.fab, ...(open ? s.fabActive : {}) }}
        onClick={() => setOpen(v => !v)}
        aria-label="AI assistant"
      >
        <div style={s.fabInner}>
          {open
            ? <X size={20} color="#fff" />
            : <Bot size={22} color="#fff" />
          }
        </div>
        {!open && <span style={s.fabPing} />}
        {!open && <span style={s.fabRing} />}
      </button>

      {/* ── Chat Panel ──────────────────────────────────────────── */}
      <div style={{ ...s.panel, ...(open ? s.panelOpen : s.panelHide) }}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.headerGlow} />
          <div style={s.headerContent}>
            <div style={s.headerLeft}>
              <div style={s.botAvatar}>
                <Sparkles size={15} color="#fff" />
              </div>
              <div>
                <div style={s.headerTitle}>WarehouseOS AI</div>
                <div style={s.headerStatus}>
                  <span style={s.greenDot} />
                  <span>Live inventory context</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {messages.length > 0 && (
                <button style={s.hBtn} onClick={reset} title="Clear">
                  <RotateCcw size={14} color="rgba(255,255,255,0.75)" />
                </button>
              )}
              <button style={s.hBtn} onClick={() => setOpen(false)} title="Close">
                <X size={14} color="rgba(255,255,255,0.75)" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={s.body}>

          {/* Welcome */}
          {messages.length === 0 && (
            <div style={s.welcome}>
              <div style={s.welcomeIconWrap}>
                <Bot size={26} color="#6366f1" />
              </div>
              <p style={s.welcomeH}>Hello! I'm your AI assistant 👋</p>
              <p style={s.welcomeP}>
                I have live access to all your products, stock levels, suppliers, purchases, and more.
              </p>
            </div>
          )}

          {/* Suggestion chips */}
          {showSugg && (
            <div style={s.chipGrid}>
              {SUGGESTIONS.map(({ icon: Icon, label, msg }) => (
                <button key={label} style={s.chip} onClick={() => send(msg)}>
                  <Icon size={12} color="#6366f1" style={{ flexShrink: 0 }} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column",
              alignItems: m.role === "user" ? "flex-end" : "flex-start", gap: 4 }}>
              {m.role === "assistant" && (
                <div style={s.aiLabel}>
                  <div style={s.aiAvatar}><Bot size={11} color="#6366f1" /></div>
                  <span style={s.aiLabelTxt}>AI</span>
                </div>
              )}
              <div style={m.role === "user" ? s.userBubble : s.aiBubble}>
                {m.role === "assistant" ? formatMessage(m.content) : m.content}
              </div>
            </div>
          ))}

          {loading && <TypingDots />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={s.inputRow}>
          <div style={s.inputWrap}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask anything about your inventory…"
              style={s.textarea}
              rows={1}
              disabled={loading}
            />
            <button
              style={{ ...s.sendBtn, opacity: (!input.trim() || loading) ? 0.4 : 1 }}
              onClick={() => send()}
              disabled={!input.trim() || loading}
            >
              <Send size={15} color="#fff" />
            </button>
          </div>
          <p style={s.hint}>
            <Zap size={10} color="#a5b4fc" style={{ display: "inline", marginRight: 3 }} />
            Powered by GPT · reads live data
          </p>
        </div>
      </div>

      <style>{`
        @keyframes ai-ping  { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.5);opacity:0} }
        @keyframes ai-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes ai-bounce{ 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-5px);opacity:1} }
        @keyframes ai-in    { from{opacity:0;transform:scale(.94) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>
    </>
  );
};

/* ──────────────────────────── Styles ────────────────────────── */
const s = {
  /* FAB */
  fab: {
    position: "fixed", bottom: 26, right: 26,
    width: 56, height: 56, borderRadius: "50%",
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999,
    boxShadow: "0 6px 24px rgba(99,102,241,0.45), 0 2px 6px rgba(0,0,0,0.12)",
    transition: "all .2s cubic-bezier(.4,0,.2,1)",
  },
  fabActive: {
    background: "linear-gradient(135deg,#475569,#334155)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  fabInner: { position: "relative", zIndex: 1 },
  fabPing: {
    position: "absolute", inset: -3, borderRadius: "50%",
    backgroundColor: "rgba(99,102,241,.35)",
    animation: "ai-ping 2.4s cubic-bezier(0,0,.2,1) infinite",
  },
  fabRing: {
    position: "absolute", inset: -1, borderRadius: "50%",
    border: "2px solid rgba(99,102,241,.4)",
    animation: "ai-pulse 2s ease-in-out infinite",
  },

  /* Panel */
  panel: {
    position: "fixed", bottom: 96, right: 26,
    width: 355, borderRadius: 20,
    backgroundColor: "#fff",
    boxShadow: "0 20px 60px rgba(15,23,42,.16), 0 0 0 1px rgba(0,0,0,.05)",
    display: "flex", flexDirection: "column",
    zIndex: 9998, overflow: "hidden",
    transformOrigin: "bottom right",
    transition: "all .22s cubic-bezier(.4,0,.2,1)",
    maxHeight: 520,
  },
  panelOpen:  { opacity: 1, transform: "scale(1) translateY(0)", pointerEvents: "all", animation: "ai-in .22s ease" },
  panelHide:  { opacity: 0, transform: "scale(.93) translateY(18px)", pointerEvents: "none" },

  /* Header */
  header: {
    position: "relative", overflow: "hidden",
    background: "linear-gradient(135deg,#4f46e5 0%,#6366f1 50%,#818cf8 100%)",
    flexShrink: 0,
  },
  headerGlow: {
    position: "absolute", top: -30, right: -30,
    width: 100, height: 100, borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.08)",
    pointerEvents: "none",
  },
  headerContent: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "13px 14px", position: "relative", zIndex: 1,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  botAvatar: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.25)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.2 },
  headerStatus: {
    display: "flex", alignItems: "center", gap: 5,
    fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 1,
  },
  greenDot: {
    display: "inline-block", width: 6, height: 6, borderRadius: "50%",
    backgroundColor: "#4ade80",
    boxShadow: "0 0 6px rgba(74,222,128,0.8)",
  },
  hBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.15)",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background .15s",
  },

  /* Body */
  body: {
    flex: 1, overflowY: "auto", padding: "14px 14px 8px",
    display: "flex", flexDirection: "column", gap: 10,
    background: "#fafafa",
  },

  /* Welcome */
  welcome: {
    display: "flex", flexDirection: "column", alignItems: "center",
    textAlign: "center", padding: "10px 4px 4px", gap: 8,
  },
  welcomeIconWrap: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: "#eef2ff", border: "1px solid #c7d2fe",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  welcomeH: { fontSize: 14, fontWeight: 800, color: "#1e1b4b", margin: 0 },
  welcomeP: { fontSize: 12.5, color: "#64748b", margin: 0, lineHeight: 1.55 },

  /* Chips */
  chipGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 },
  chip: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "7px 10px", borderRadius: 10,
    backgroundColor: "#fff", border: "1px solid #e0e7ff",
    color: "#3730a3", fontSize: 12, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
    transition: "all .15s", textAlign: "left",
    boxShadow: "0 1px 3px rgba(99,102,241,.08)",
  },

  /* Messages */
  aiLabel: { display: "flex", alignItems: "center", gap: 4, marginLeft: 2 },
  aiAvatar: {
    width: 20, height: 20, borderRadius: 6,
    backgroundColor: "#eef2ff", border: "1px solid #c7d2fe",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  aiLabelTxt: { fontSize: 10, fontWeight: 700, color: "#6366f1", letterSpacing: "0.05em" },
  aiBubble: {
    maxWidth: "90%", backgroundColor: "#fff",
    border: "1px solid #e0e7ff", borderRadius: "14px 14px 14px 4px",
    padding: "9px 12px", fontSize: 13, color: "#1e293b", lineHeight: 1.55,
    boxShadow: "0 1px 4px rgba(99,102,241,.06)",
  },
  userBubble: {
    maxWidth: "80%", alignSelf: "flex-end",
    background: "linear-gradient(135deg,#4f46e5,#6366f1)",
    borderRadius: "14px 14px 4px 14px",
    padding: "9px 12px", fontSize: 13, color: "#fff",
    fontWeight: 500, lineHeight: 1.55,
    boxShadow: "0 3px 10px rgba(99,102,241,.3)",
  },

  /* Typing */
  dotsBubble: {
    display: "flex", gap: 4, alignItems: "center",
    backgroundColor: "#fff", border: "1px solid #e0e7ff",
    borderRadius: "14px 14px 14px 4px", padding: "10px 13px",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
  },
  dot: {
    display: "inline-block", width: 7, height: 7, borderRadius: "50%",
    backgroundColor: "#a5b4fc",
    animation: "ai-bounce 1.2s ease-in-out infinite",
  },

  /* Input */
  inputRow: {
    padding: "10px 12px 10px", borderTop: "1px solid #f1f5f9",
    backgroundColor: "#fff", flexShrink: 0,
  },
  inputWrap: {
    display: "flex", alignItems: "flex-end", gap: 8,
    backgroundColor: "#f8fafc", borderRadius: 13,
    border: "1px solid #e0e7ff", padding: "6px 6px 6px 12px",
  },
  textarea: {
    flex: 1, border: "none", background: "transparent", outline: "none",
    fontSize: 13, fontFamily: "inherit", color: "#0f172a",
    resize: "none", lineHeight: 1.5, maxHeight: 80, overflowY: "auto",
    paddingTop: 2,
  },
  sendBtn: {
    width: 32, height: 32, borderRadius: 9,
    background: "linear-gradient(135deg,#4f46e5,#6366f1)",
    border: "none", cursor: "pointer", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(99,102,241,.4)",
    transition: "opacity .15s",
  },
  hint: {
    fontSize: 10.5, color: "#a5b4fc", textAlign: "center",
    margin: "6px 0 0", fontWeight: 500,
  },
};

export default AIAssistant;
