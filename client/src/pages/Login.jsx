import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Boxes,
  Eye,
  EyeOff,
  Lock,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Package,
  Bot,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [demoApplied, setDemoApplied] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleDemoFill = () => {
    setEmail("admin@gmail.com");
    setPassword("123456");
    setError("");
    setDemoApplied(true);
    setTimeout(() => setDemoApplied(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/login", { email, password });

      const userData = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
      };

      login(userData, res.data.token);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={styles.container}>
      {/* ── Left Hero Banner (Compact Modern Dark Canvas) ── */}
      <div className="login-left-banner" style={styles.leftBanner}>
        <div style={styles.heroGlow1} />
        <div style={styles.heroGlow2} />

        <div style={styles.heroContent}>
          {/* Logo Brand Header */}
          <div style={styles.brandRow}>
            <div style={styles.logoBadge}>
              <Boxes size={22} color="#ffffff" />
            </div>
            <div>
              <span style={styles.brandName}>WarehouseOS</span>
              <span style={styles.brandTag}>Smart Inventory System</span>
            </div>
          </div>

          {/* Hero Heading */}
          <h1 style={styles.heroHeading}>
            Intelligent inventory built for modern teams.
          </h1>
          <p style={styles.heroSub}>
            Track stock levels in real time, automate orders, manage multi-warehouse operations, and query your inventory with live AI intelligence.
          </p>

          {/* Compact Live Activity Card */}
          <div style={styles.floatingPreviewCard}>
            <div style={styles.previewHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <TrendingUp size={15} color="#10b981" />
                <span style={styles.previewTitle}>Live Warehouse Activity</span>
              </div>
              <span style={styles.liveBadge}>LIVE</span>
            </div>

            <div style={styles.previewItem}>
              <div style={styles.previewIconBox}>
                <Package size={15} color="#3b82f6" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={styles.previewItemName}>Wireless Ergonomic Mouse</span>
                <span style={styles.previewItemSub}>Main Warehouse • Rack 4B</span>
              </div>
              <span style={styles.stockPillSuccess}>142 In Stock</span>
            </div>

            <div style={{ ...styles.previewItem, borderBottom: "none" }}>
              <div style={{ ...styles.previewIconBox, backgroundColor: "rgba(168, 85, 247, 0.15)" }}>
                <Bot size={15} color="#a855f7" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={styles.previewItemName}>AI Assistant Insight</span>
                <span style={styles.previewItemSub}>Reorder 12 items below threshold</span>
              </div>
              <span style={styles.stockPillInfo}>Automated</span>
            </div>
          </div>

          {/* Trust Footnote */}
          <div style={styles.trustRow}>
            <ShieldCheck size={15} color="#38bdf8" />
            <span>256-bit Encrypted Session • Multi-Warehouse Ready</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Area (Compact & Balanced Card) ── */}
      <div className="login-right-area" style={styles.rightArea}>
        <div style={styles.rightGlow1} />
        <div style={styles.rightGlow2} />

        <div className="login-form-card" style={styles.formCard}>
          {/* Card Title Header */}
          <div style={styles.cardHeader}>
            <div style={styles.welcomePill}>
              <span>Welcome back</span>
              <span>👋</span>
            </div>
            <h2 style={styles.cardTitle}>Sign In to Dashboard</h2>
            <p style={styles.cardSub}>
              Enter your credentials to access your inventory portal
            </p>
          </div>

          {/* ⚡ Instant Demo Fill Banner (Compact & Sleek) */}
          <div
            onClick={handleDemoFill}
            style={{
              ...styles.demoBanner,
              borderColor: demoApplied ? "#10b981" : "#bfdbfe",
              background: demoApplied
                ? "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
                : "linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)",
            }}
          >
            <div style={styles.demoBannerContent}>
              <div
                style={{
                  ...styles.demoIconSquare,
                  background: demoApplied
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                }}
              >
                {demoApplied ? (
                  <CheckCircle2 size={15} color="#ffffff" />
                ) : (
                  <Zap size={15} color="#ffffff" />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span
                    style={{
                      ...styles.demoHeadline,
                      color: demoApplied ? "#065f46" : "#1e293b",
                    }}
                  >
                    {demoApplied ? "Demo Credentials Loaded!" : "Instant Demo Credentials"}
                  </span>
                  <Sparkles size={13} color={demoApplied ? "#10b981" : "#2563eb"} />
                </div>

                <div style={styles.demoPillsWrapper}>
                  <span style={styles.demoMonoPill}>admin@gmail.com</span>
                  <span style={styles.demoDot}>•</span>
                  <span style={styles.demoMonoPill}>123456</span>
                </div>
              </div>

              <span
                style={{
                  ...styles.fillBtnBadge,
                  backgroundColor: demoApplied ? "#10b981" : "#2563eb",
                }}
              >
                {demoApplied ? "Filled ✓" : "1-Tap Fill"}
              </span>
            </div>
          </div>

          {/* Error Alert */}
          {error && <div style={styles.errorAlert}>{error}</div>}

          {/* Form Fields */}
          <form onSubmit={handleSubmit}>
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Email Address</label>
              <div style={styles.inputWrap}>
                <Mail size={16} color="#64748b" style={styles.fieldIcon} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.fieldInput}
                  required
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Password</label>
              <div style={styles.inputWrap}>
                <Lock size={16} color="#64748b" style={styles.fieldIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.fieldInput}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={16} color="#64748b" />
                  ) : (
                    <Eye size={16} color="#64748b" />
                  )}
                </button>
              </div>
            </div>

            <div style={styles.rememberRow}>
              <label style={styles.rememberCheckboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkboxInput}
                />
                <span>Remember this device for 7 days</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Security Note Footer */}
          <div style={styles.securityFooter}>
            <ShieldCheck size={13} color="#94a3b8" />
            <span>Protected by Role-Based Access Control & SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────── Proportional Compact Styles ────────────────────────── */
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    maxHeight: "100vh",
    overflow: "hidden",
    backgroundColor: "#f8fafc",
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
  },

  /* Left Hero */
  leftBanner: {
    flex: "1.1",
    background: "linear-gradient(145deg, #090d16 0%, #0f172a 40%, #1e1b4b 100%)",
    padding: "3rem 3.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    color: "#ffffff",
    position: "relative",
    overflow: "hidden",
  },
  heroGlow1: {
    position: "absolute",
    top: "-100px",
    left: "-100px",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(0,0,0,0) 70%)",
    pointerEvents: "none",
  },
  heroGlow2: {
    position: "absolute",
    bottom: "-100px",
    right: "-100px",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(168, 85, 247, 0.16) 0%, rgba(0,0,0,0) 70%)",
    pointerEvents: "none",
  },
  heroContent: {
    maxWidth: "460px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "1.75rem",
  },
  logoBadge: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 20px rgba(37, 99, 235, 0.4)",
  },
  brandName: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
    display: "block",
  },
  brandTag: {
    fontSize: "11px",
    color: "#93c5fd",
    fontWeight: "600",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  heroHeading: {
    fontSize: "2.0rem",
    fontWeight: "800",
    lineHeight: 1.25,
    marginBottom: "1rem",
    color: "#ffffff",
    letterSpacing: "-0.03em",
  },
  heroSub: {
    fontSize: "0.95rem",
    color: "#cbd5e1",
    lineHeight: 1.6,
    marginBottom: "1.75rem",
  },

  /* Floating Preview Card */
  floatingPreviewCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "1.75rem",
  },
  previewHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "10px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    marginBottom: "10px",
  },
  previewTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#f8fafc",
  },
  liveBadge: {
    fontSize: "9px",
    fontWeight: "800",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    color: "#34d399",
    padding: "2px 6px",
    borderRadius: "999px",
    letterSpacing: "0.08em",
  },
  previewItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
  },
  previewIconBox: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  previewItemName: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#ffffff",
    display: "block",
    lineHeight: 1.2,
  },
  previewItemSub: {
    fontSize: "10px",
    color: "#94a3b8",
    display: "block",
    marginTop: "2px",
  },
  stockPillSuccess: {
    fontSize: "10px",
    fontWeight: "700",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    color: "#34d399",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  stockPillInfo: {
    fontSize: "10px",
    fontWeight: "700",
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    color: "#c084fc",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  trustRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "500",
  },

  /* Right Area */
  rightArea: {
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    position: "relative",
    backgroundColor: "#f8fafc",
  },
  rightGlow1: {
    position: "absolute",
    top: "10%",
    right: "10%",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(0,0,0,0) 70%)",
    pointerEvents: "none",
  },
  rightGlow2: {
    position: "absolute",
    bottom: "10%",
    left: "10%",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, rgba(0,0,0,0) 70%)",
    pointerEvents: "none",
  },

  /* Form Card */
  formCard: {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    padding: "1.75rem 2rem",
    boxShadow: "0 20px 45px -10px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8)",
    position: "relative",
    zIndex: 3,
  },
  cardHeader: {
    marginBottom: "1.25rem",
  },
  welcomePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    backgroundColor: "#f1f5f9",
    padding: "3px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#475569",
    marginBottom: "8px",
  },
  cardTitle: {
    fontSize: "1.45rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 4px",
    letterSpacing: "-0.03em",
  },
  cardSub: {
    fontSize: "0.825rem",
    color: "#64748b",
    lineHeight: 1.4,
    margin: 0,
  },

  /* ⚡ Instant Demo Credentials Banner */
  demoBanner: {
    padding: "10px 14px",
    borderRadius: "14px",
    border: "1px solid #bfdbfe",
    cursor: "pointer",
    marginBottom: "1.25rem",
    transition: "all 0.2s ease",
  },
  demoBannerContent: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  demoIconSquare: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  demoHeadline: {
    fontSize: "12.5px",
    fontWeight: "800",
    lineHeight: 1.2,
  },
  demoPillsWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginTop: "2px",
  },
  demoMonoPill: {
    fontSize: "10px",
    fontWeight: "700",
    fontFamily: "monospace",
    color: "#1e293b",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    padding: "1px 5px",
    borderRadius: "4px",
  },
  demoDot: {
    fontSize: "9px",
    color: "#94a3b8",
  },
  fillBtnBadge: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#ffffff",
    padding: "5px 11px",
    borderRadius: "999px",
    flexShrink: 0,
  },

  /* Controls */
  errorAlert: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#ef4444",
    padding: "0.65rem 0.85rem",
    borderRadius: "12px",
    fontSize: "0.825rem",
    fontWeight: "600",
    marginBottom: "1.25rem",
  },
  fieldGroup: {
    marginBottom: "1rem",
  },
  fieldLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: "700",
    color: "#334155",
    marginBottom: "6px",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  fieldIcon: {
    position: "absolute",
    left: "14px",
    zIndex: 1,
  },
  fieldInput: {
    width: "100%",
    height: "44px",
    paddingLeft: "2.6rem",
    paddingRight: "2.6rem",
    borderRadius: "12px",
    fontSize: "13.5px",
    fontWeight: "500",
    border: "1.5px solid #cbd5e1",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    outline: "none",
  },
  eyeButton: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "3px",
    display: "flex",
    alignItems: "center",
  },
  rememberRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "1rem 0 1.25rem",
  },
  rememberCheckboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    cursor: "pointer",
  },
  checkboxInput: {
    width: "15px",
    height: "15px",
    borderRadius: "4px",
    accentColor: "#2563eb",
    cursor: "pointer",
  },
  submitBtn: {
    width: "100%",
    height: "46px",
    fontSize: "0.925rem",
    fontWeight: "800",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    boxShadow: "0 6px 18px rgba(37, 99, 235, 0.3)",
    cursor: "pointer",
    border: "none",
    color: "#ffffff",
  },
  securityFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    marginTop: "1.5rem",
    paddingTop: "1rem",
    borderTop: "1px solid #f1f5f9",
    fontSize: "10.5px",
    color: "#94a3b8",
    fontWeight: "600",
    textAlign: "center",
  },
};

export default Login;
