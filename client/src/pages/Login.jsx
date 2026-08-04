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
      setError("Please fill in both email and password.");
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
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={styles.container}>
      {/* Background Ambient Glows */}
      <div style={styles.bgGlowTopLeft} />
      <div style={styles.bgGlowBottomRight} />

      {/* Left Hero Banner (Desktop) */}
      <div className="login-left-banner" style={styles.leftBanner}>
        <div style={styles.heroContent}>
          <div style={styles.heroLogo}>
            <div style={styles.logoBadge}>
              <Boxes size={28} color="#ffffff" />
            </div>
            <div>
              <span style={styles.heroLogoText}>WarehouseOS</span>
              <span style={styles.heroLogoSub}>Enterprise Platform</span>
            </div>
          </div>

          <h1 style={styles.heroHeading}>
            Smart Inventory & Warehouse Management
          </h1>
          <p style={styles.heroSub}>
            Streamline product stock, automated order processing, multi-warehouse tracking, and live AI inventory intelligence.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <div style={styles.checkWrap}>
                <CheckCircle2 size={16} color="#38bdf8" />
              </div>
              <span>Real-time stock monitoring & automated threshold alerts</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.checkWrap}>
                <CheckCircle2 size={16} color="#38bdf8" />
              </div>
              <span>Stock-In, Stock-Out & Purchase Order workflows</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.checkWrap}>
                <CheckCircle2 size={16} color="#38bdf8" />
              </div>
              <span>Embedded AI Assistant with database contextual intelligence</span>
            </div>
          </div>

          <div style={styles.trustBadge}>
            <ShieldCheck size={16} color="#38bdf8" />
            <span>256-bit Encrypted Session · Multi-tenant Cloud Infrastructure</span>
          </div>
        </div>
      </div>

      {/* Right Form Area (Desktop & Mobile) */}
      <div className="login-right-area" style={styles.rightFormArea}>
        <div className="login-form-card" style={styles.formCard}>
          {/* Card Header Branding */}
          <div style={styles.cardBrandHeader}>
            <div style={styles.cardLogoBox}>
              <Boxes size={24} color="#ffffff" />
            </div>
            <div>
              <div style={styles.cardBrandTitleGroup}>
                <span style={styles.cardBrandTitle}>WarehouseOS</span>
                <span style={styles.proTag}>ADMIN</span>
              </div>
              <span style={styles.cardBrandSub}>Enterprise Management System</span>
            </div>
          </div>

          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Sign In to Dashboard</h2>
            <p style={styles.formSub}>
              Enter your credentials or tap below for 1-click admin access
            </p>
          </div>

          {/* 1-Tap Demo Credentials Bar (Redesigned & Premium) */}
          <button
            type="button"
            onClick={handleDemoFill}
            style={{
              ...styles.demoPillBtn,
              borderColor: demoApplied ? "#10b981" : "#cbd5e1",
              background: demoApplied
                ? "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
                : "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
            }}
          >
            <div style={styles.demoPillLeft}>
              <div
                style={{
                  ...styles.zapBox,
                  background: demoApplied
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                }}
              >
                {demoApplied ? (
                  <CheckCircle2 size={15} color="#ffffff" />
                ) : (
                  <Zap size={15} color="#ffffff" />
                )}
              </div>
              <div style={styles.demoTextGroup}>
                <span
                  style={{
                    ...styles.demoTitleText,
                    color: demoApplied ? "#065f46" : "#1e293b",
                  }}
                >
                  {demoApplied ? "Demo Credentials Filled!" : "⚡ Quick Auto-Fill Demo"}
                </span>
                <div style={styles.demoBadgesRow}>
                  <span style={styles.codeBadge}>admin@gmail.com</span>
                  <span style={styles.dotSep}>•</span>
                  <span style={styles.codeBadge}>123456</span>
                </div>
              </div>
            </div>
            <Sparkles size={16} color={demoApplied ? "#10b981" : "#2563eb"} />
          </button>

          {error && <div style={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: "18px" }}>
              <label className="form-label" style={styles.label}>
                Email Address
              </label>
              <div style={styles.inputWrapper}>
                <Mail size={18} color="#64748b" style={styles.inputIcon} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.paddedInput}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "18px" }}>
              <label className="form-label" style={styles.label}>
                Password
              </label>
              <div style={styles.inputWrapper}>
                <Lock size={18} color="#64748b" style={styles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.paddedInput}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#64748b" />
                  ) : (
                    <Eye size={18} color="#64748b" />
                  )}
                </button>
              </div>
            </div>

            <div style={styles.formOptions}>
              <label style={styles.rememberLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkbox}
                />
                <span>Keep me signed in for 7 days</span>
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

          <div style={styles.cardFooter}>
            <ShieldCheck size={14} color="#94a3b8" />
            <span>Encrypted Session • Role Based Access Control</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    fontFamily: "inherit",
  },
  bgGlowTopLeft: {
    position: "absolute",
    top: "-150px",
    left: "-150px",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(37, 99, 235, 0) 70%)",
    pointerEvents: "none",
  },
  bgGlowBottomRight: {
    position: "absolute",
    bottom: "-150px",
    right: "-150px",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0) 70%)",
    pointerEvents: "none",
  },
  leftBanner: {
    flex: "1.1",
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #1e40af 100%)",
    padding: "4rem 3.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    color: "#ffffff",
    position: "relative",
    overflow: "hidden",
  },
  heroContent: {
    maxWidth: "520px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  heroLogo: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "2.5rem",
  },
  logoBadge: {
    width: "50px",
    height: "50px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(37, 99, 235, 0.4)",
  },
  heroLogoText: {
    fontSize: "1.85rem",
    fontWeight: "800",
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
    display: "block",
  },
  heroLogoSub: {
    fontSize: "12px",
    color: "#93c5fd",
    fontWeight: "600",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  heroHeading: {
    fontSize: "2.4rem",
    fontWeight: "800",
    lineHeight: 1.2,
    marginBottom: "1.25rem",
    color: "#ffffff",
    letterSpacing: "-0.02em",
  },
  heroSub: {
    fontSize: "1.05rem",
    color: "#cbd5e1",
    lineHeight: 1.6,
    marginBottom: "2.5rem",
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem",
    marginBottom: "2.5rem",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#f1f5f9",
  },
  checkWrap: {
    width: "26px",
    height: "26px",
    borderRadius: "8px",
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  trustBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    borderRadius: "999px",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    fontSize: "12px",
    color: "#93c5fd",
    fontWeight: "600",
  },
  rightFormArea: {
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    position: "relative",
    zIndex: 2,
  },
  formCard: {
    width: "100%",
    maxWidth: "450px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    padding: "2.5rem",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
    position: "relative",
  },
  cardBrandHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "1.75rem",
    paddingBottom: "1.25rem",
    borderBottom: "1px solid #f1f5f9",
  },
  cardLogoBox: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 18px rgba(37, 99, 235, 0.3)",
  },
  cardBrandTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  cardBrandTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },
  proTag: {
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
  formHeader: {
    marginBottom: "1.5rem",
  },
  formTitle: {
    fontSize: "1.55rem",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "0.35rem",
    letterSpacing: "-0.02em",
  },
  formSub: {
    fontSize: "0.875rem",
    color: "#64748b",
    lineHeight: 1.45,
  },
  demoPillBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderRadius: "16px",
    border: "1px solid #cbd5e1",
    cursor: "pointer",
    marginBottom: "1.5rem",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    textAlign: "left",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
  },
  demoPillLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },
  zapBox: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.25)",
  },
  demoTextGroup: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  demoTitleText: {
    fontSize: "13px",
    fontWeight: "800",
    lineHeight: 1.2,
  },
  demoBadgesRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "4px",
    flexWrap: "wrap",
  },
  codeBadge: {
    fontSize: "11px",
    fontWeight: "700",
    fontFamily: "monospace",
    color: "#334155",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    padding: "1px 6px",
    borderRadius: "5px",
    letterSpacing: "0.02em",
  },
  dotSep: {
    fontSize: "10px",
    color: "#94a3b8",
  },
  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#334155",
    marginBottom: "6px",
  },
  errorAlert: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#ef4444",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    fontSize: "0.875rem",
    fontWeight: "500",
    marginBottom: "1.25rem",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "16px",
    zIndex: 1,
  },
  paddedInput: {
    width: "100%",
    height: "50px",
    paddingLeft: "2.8rem",
    paddingRight: "2.8rem",
    borderRadius: "14px",
    fontSize: "14px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#f8fafc",
  },
  eyeBtn: {
    position: "absolute",
    right: "14px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.25rem",
    display: "flex",
    alignItems: "center",
  },
  formOptions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "1.25rem 0 1.5rem",
  },
  rememberLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.85rem",
    color: "#475569",
    cursor: "pointer",
    fontWeight: "500",
  },
  checkbox: {
    borderRadius: "4px",
    accentColor: "#2563eb",
    cursor: "pointer",
  },
  submitBtn: {
    width: "100%",
    height: "50px",
    fontSize: "0.95rem",
    fontWeight: "700",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    boxShadow: "0 6px 20px rgba(37, 99, 235, 0.3)",
    cursor: "pointer",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    marginTop: "1.75rem",
    paddingTop: "1rem",
    borderTop: "1px solid #f1f5f9",
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "500",
  },
};

export default Login;
