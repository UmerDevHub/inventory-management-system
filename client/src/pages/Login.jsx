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
      {/* ── Left Hero Banner (Warm Modern Dark Canvas) ── */}
      <div className="login-left-banner" style={styles.leftBanner}>
        <div style={styles.heroGlow1} />
        <div style={styles.heroGlow2} />

        <div style={styles.heroContent}>
          {/* Logo Badge */}
          <div style={styles.brandRow}>
            <div style={styles.logoBadge}>
              <Boxes size={24} color="#ffffff" />
            </div>
            <div>
              <span style={styles.brandName}>WarehouseOS</span>
              <span style={styles.brandTag}>Smart Inventory Platform</span>
            </div>
          </div>

          {/* Hero Heading */}
          <h1 style={styles.heroHeading}>
            Intelligent inventory built for modern teams.
          </h1>
          <p style={styles.heroSub}>
            Track stock levels in real time, automate purchase orders, manage warehouses, and query your inventory with live AI intelligence.
          </p>

          {/* Floating Live Stock Preview Card */}
          <div style={styles.floatingPreviewCard}>
            <div style={styles.previewHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <TrendingUp size={16} color="#10b981" />
                <span style={styles.previewTitle}>Live Warehouse Activity</span>
              </div>
              <span style={styles.liveBadge}>LIVE</span>
            </div>

            <div style={styles.previewItem}>
              <div style={styles.previewIconBox}>
                <Package size={16} color="#3b82f6" />
              </div>
              <div style={{ flex: 1 }}>
                <span style={styles.previewItemName}>Wireless Ergonomic Mouse</span>
                <span style={styles.previewItemSub}>Main Warehouse • Rack 4B</span>
              </div>
              <span style={styles.stockPillSuccess}>142 In Stock</span>
            </div>

            <div style={{ ...styles.previewItem, borderBottom: "none" }}>
              <div style={{ ...styles.previewIconBox, backgroundColor: "rgba(168, 85, 247, 0.15)" }}>
                <Bot size={16} color="#a855f7" />
              </div>
              <div style={{ flex: 1 }}>
                <span style={styles.previewItemName}>AI Assistant Insight</span>
                <span style={styles.previewItemSub}>Reorder 12 items below threshold</span>
              </div>
              <span style={styles.stockPillInfo}>Automated</span>
            </div>
          </div>

          {/* Trust Footer */}
          <div style={styles.trustRow}>
            <ShieldCheck size={16} color="#38bdf8" />
            <span>Encrypted 256-bit Session • Multi-Warehouse Ready</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Area (Modern Clean Card) ── */}
      <div className="login-right-area" style={styles.rightArea}>
        <div style={styles.rightGlow1} />
        <div style={styles.rightGlow2} />

        <div className="login-form-card" style={styles.formCard}>
          {/* Card Header Branding */}
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderTop}>
              <div style={styles.cardLogoBox}>
                <Boxes size={22} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={styles.cardBrandName}>WarehouseOS</span>
                  <span style={styles.adminTag}>ADMIN</span>
                </div>
                <span style={styles.cardBrandSub}>Enterprise Portal</span>
              </div>
            </div>

            <div style={styles.welcomePill}>
              <span>Welcome back</span>
              <span>👋</span>
            </div>
            <h2 style={styles.cardTitle}>Sign In to Dashboard</h2>
            <p style={styles.cardSub}>
              Enter your admin credentials to access inventory
            </p>
          </div>

          {/* ⚡ World-Class Instant Demo Auto-Fill Banner */}
          <div
            onClick={handleDemoFill}
            style={{
              ...styles.demoBanner,
              borderColor: demoApplied ? "#10b981" : "#bfdbfe",
              background: demoApplied
                ? "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
                : "linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)",
              boxShadow: demoApplied
                ? "0 6px 18px rgba(16, 185, 129, 0.15)"
                : "0 4px 16px rgba(37, 99, 235, 0.08)",
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
                  <CheckCircle2 size={16} color="#ffffff" />
                ) : (
                  <Zap size={16} color="#ffffff" />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      ...styles.demoHeadline,
                      color: demoApplied ? "#065f46" : "#1e293b",
                    }}
                  >
                    {demoApplied ? "Demo Credentials Loaded!" : "Instant Demo Credentials"}
                  </span>
                  <Sparkles size={14} color={demoApplied ? "#10b981" : "#2563eb"} />
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

          {/* Error Message */}
          {error && <div style={styles.errorAlert}>{error}</div>}

          {/* Form Controls */}
          <form onSubmit={handleSubmit}>
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Email Address</label>
              <div style={styles.inputWrap}>
                <Mail size={18} color="#64748b" style={styles.fieldIcon} />
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
                <Lock size={18} color="#64748b" style={styles.fieldIcon} />
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
                    <EyeOff size={18} color="#64748b" />
                  ) : (
                    <Eye size={18} color="#64748b" />
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
                "Authenticating..."
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Security Note Footer */}
          <div style={styles.securityFooter}>
            <ShieldCheck size={14} color="#94a3b8" />
            <span>Protected by Role-Based Access Control & SSL Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────── Styles ────────────────────────── */
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
  },

  /* Left Hero */
  leftBanner: {
    flex: "1.1",
    background: "linear-gradient(145deg, #090d16 0%, #0f172a 40%, #1e1b4b 100%)",
    padding: "4rem 4rem",
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
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(0, 0, 0, 0) 70%)",
    pointerEvents: "none",
  },
  heroGlow2: {
    position: "absolute",
    bottom: "-100px",
    right: "-100px",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, rgba(0, 0, 0, 0) 70%)",
    pointerEvents: "none",
  },
  heroContent: {
    maxWidth: "500px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "2.5rem",
  },
  logoBadge: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(37, 99, 235, 0.4)",
  },
  brandName: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
    display: "block",
  },
  brandTag: {
    fontSize: "12px",
    color: "#93c5fd",
    fontWeight: "600",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  heroHeading: {
    fontSize: "2.5rem",
    fontWeight: "800",
    lineHeight: 1.2,
    marginBottom: "1.25rem",
    color: "#ffffff",
    letterSpacing: "-0.03em",
  },
  heroSub: {
    fontSize: "1.05rem",
    color: "#cbd5e1",
    lineHeight: 1.65,
    marginBottom: "2.5rem",
  },

  /* Floating Preview Card */
  floatingPreviewCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "2.5rem",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
  },
  previewHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "14px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    marginBottom: "14px",
  },
  previewTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#f8fafc",
  },
  liveBadge: {
    fontSize: "10px",
    fontWeight: "800",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    color: "#34d399",
    padding: "2px 8px",
    borderRadius: "999px",
    letterSpacing: "0.08em",
  },
  previewItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
  },
  previewIconBox: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  previewItemName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#ffffff",
    display: "block",
    lineHeight: 1.2,
  },
  previewItemSub: {
    fontSize: "11px",
    color: "#94a3b8",
    display: "block",
    marginTop: "2px",
  },
  stockPillSuccess: {
    fontSize: "11px",
    fontWeight: "700",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    color: "#34d399",
    padding: "4px 10px",
    borderRadius: "8px",
  },
  stockPillInfo: {
    fontSize: "11px",
    fontWeight: "700",
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    color: "#c084fc",
    padding: "4px 10px",
    borderRadius: "8px",
  },
  trustRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: "500",
  },

  /* Right Area */
  rightArea: {
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2.5rem",
    position: "relative",
    backgroundColor: "#f8fafc",
  },
  rightGlow1: {
    position: "absolute",
    top: "10%",
    right: "10%",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(0,0,0,0) 70%)",
    pointerEvents: "none",
  },
  rightGlow2: {
    position: "absolute",
    bottom: "10%",
    left: "10%",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, rgba(0,0,0,0) 70%)",
    pointerEvents: "none",
  },

  /* Form Card */
  formCard: {
    width: "100%",
    maxWidth: "460px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "28px",
    padding: "2.5rem",
    boxShadow: "0 25px 60px -15px rgba(15, 23, 42, 0.10), 0 0 0 1px rgba(226, 232, 240, 0.8)",
    position: "relative",
    zIndex: 3,
  },
  cardHeader: {
    marginBottom: "1.5rem",
  },
  cardHeaderTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "1.5rem",
    paddingBottom: "1.25rem",
    borderBottom: "1px solid #f1f5f9",
  },
  cardLogoBox: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 18px rgba(37, 99, 235, 0.3)",
  },
  cardBrandName: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },
  adminTag: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    border: "1px solid #dbeafe",
    padding: "2px 6px",
    borderRadius: "6px",
    letterSpacing: "0.05em",
  },
  cardBrandSub: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "500",
  },
  welcomePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#f1f5f9",
    padding: "4px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#475569",
    marginBottom: "10px",
  },
  cardTitle: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 6px",
    letterSpacing: "-0.03em",
  },
  cardSub: {
    fontSize: "0.9rem",
    color: "#64748b",
    lineHeight: 1.45,
    margin: 0,
  },

  /* ⚡ Instant Demo Credentials Banner */
  demoBanner: {
    padding: "14px 16px",
    borderRadius: "18px",
    border: "1.5px solid #bfdbfe",
    cursor: "pointer",
    marginBottom: "1.75rem",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  demoBannerContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  demoIconSquare: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
  },
  demoHeadline: {
    fontSize: "13.5px",
    fontWeight: "800",
    lineHeight: 1.2,
  },
  demoPillsWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "4px",
    flexWrap: "wrap",
  },
  demoMonoPill: {
    fontSize: "11px",
    fontWeight: "700",
    fontFamily: "monospace",
    color: "#1e293b",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    padding: "2px 7px",
    borderRadius: "6px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
  },
  demoDot: {
    fontSize: "10px",
    color: "#94a3b8",
  },
  fillBtnBadge: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#ffffff",
    padding: "6px 14px",
    borderRadius: "999px",
    letterSpacing: "0.02em",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
  },

  /* Controls */
  errorAlert: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#ef4444",
    padding: "0.85rem 1rem",
    borderRadius: "14px",
    fontSize: "0.875rem",
    fontWeight: "600",
    marginBottom: "1.5rem",
  },
  fieldGroup: {
    marginBottom: "1.25rem",
  },
  fieldLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: "700",
    color: "#334155",
    marginBottom: "8px",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  fieldIcon: {
    position: "absolute",
    left: "16px",
    zIndex: 1,
  },
  fieldInput: {
    width: "100%",
    height: "52px",
    paddingLeft: "2.85rem",
    paddingRight: "2.85rem",
    borderRadius: "14px",
    fontSize: "14px",
    fontWeight: "500",
    border: "1.5px solid #cbd5e1",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  eyeButton: {
    position: "absolute",
    right: "14px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
  },
  rememberRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "1.25rem 0 1.75rem",
  },
  rememberCheckboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    cursor: "pointer",
  },
  checkboxInput: {
    width: "16px",
    height: "16px",
    borderRadius: "4px",
    accentColor: "#2563eb",
    cursor: "pointer",
  },
  submitBtn: {
    width: "100%",
    height: "52px",
    fontSize: "1rem",
    fontWeight: "800",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    boxShadow: "0 8px 25px rgba(37, 99, 235, 0.35)",
    cursor: "pointer",
    border: "none",
    color: "#ffffff",
  },
  securityFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    marginTop: "2rem",
    paddingTop: "1.25rem",
    borderTop: "1px solid #f1f5f9",
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "600",
    textAlign: "center",
  },
};

export default Login;
