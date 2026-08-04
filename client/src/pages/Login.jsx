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
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleDemoFill = () => {
    setEmail("admin@gmail.com");
    setPassword("123456");
    setError("");
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
      {/* Left Hero Banner (Desktop) */}
      <div className="login-left-banner" style={styles.leftBanner}>
        <div style={styles.bannerGlow} />
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
            Streamline product stock, automated order processing, multi-warehouse tracking, and AI-powered inventory reporting.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <div style={styles.checkWrap}>
                <CheckCircle2 size={16} color="#38bdf8" />
              </div>
              <span>Real-time stock monitoring & low stock alerts</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.checkWrap}>
                <CheckCircle2 size={16} color="#38bdf8" />
              </div>
              <span>Automated Stock-In, Stock-Out & Purchase orders</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.checkWrap}>
                <CheckCircle2 size={16} color="#38bdf8" />
              </div>
              <span>Live AI assistant with database context</span>
            </div>
          </div>

          <div style={styles.trustBadge}>
            <ShieldCheck size={16} color="#38bdf8" />
            <span>256-bit Encrypted Session · Role Based Access</span>
          </div>
        </div>
      </div>

      {/* Right Form Card (Desktop & Mobile) */}
      <div className="login-right-area" style={styles.rightFormArea}>
        <div className="login-form-card" style={styles.formCard}>
          {/* Top Brand Logo inside Card */}
          <div style={styles.cardBrandHeader}>
            <div style={styles.cardLogoBox}>
              <Boxes size={22} color="#ffffff" />
            </div>
            <div style={styles.cardBrandTextGroup}>
              <span style={styles.cardBrandTitle}>WarehouseOS</span>
              <span style={styles.cardBrandSub}>Inventory System</span>
            </div>
          </div>

          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Admin Sign In 👋</h2>
            <p style={styles.formSub}>
              Enter your credentials to access the management portal
            </p>
          </div>

          {error && <div style={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: "18px" }}>
              <label className="form-label" style={styles.label}>
                Email Address
              </label>
              <div style={styles.inputWrapper}>
                <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@inventory.com"
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
                <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
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
                    <EyeOff size={18} color="#94a3b8" />
                  ) : (
                    <Eye size={18} color="#94a3b8" />
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
                <span>Remember me for 7 days</span>
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
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Fill Card */}
          <div style={styles.demoCard}>
            <div style={styles.demoHeader}>
              <div style={styles.demoTitle}>
                <Zap size={14} color="#2563eb" />
                <span>Demo Admin Account</span>
              </div>
              <button type="button" onClick={handleDemoFill} style={styles.fillBtn}>
                Auto-fill
              </button>
            </div>
            <div style={styles.demoDetails}>
              <span>Email: <strong>admin@gmail.com</strong></span>
              <span>Password: <strong>123456</strong></span>
            </div>
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
    backgroundColor: "#f8fafc",
    fontFamily: "inherit",
  },
  leftBanner: {
    flex: "1.1",
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #1e40af 100%)",
    padding: "4rem 3.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    color: "#ffffff",
    position: "relative",
    overflow: "hidden",
  },
  bannerGlow: {
    position: "absolute",
    top: "-100px",
    left: "-100px",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "rgba(56, 189, 248, 0.12)",
    filter: "blur(60px)",
    pointerEvents: "none",
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
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 20px rgba(37, 99, 235, 0.35)",
  },
  heroLogoText: {
    fontSize: "1.8rem",
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
    fontSize: "2.35rem",
    fontWeight: "800",
    lineHeight: 1.22,
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
    backgroundColor: "#f8fafc",
  },
  formCard: {
    width: "100%",
    maxWidth: "440px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    padding: "2.5rem",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.06)",
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
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
  },
  cardBrandTextGroup: {
    display: "flex",
    flexDirection: "column",
  },
  cardBrandTitle: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 1.1,
  },
  cardBrandSub: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
  },
  formHeader: {
    marginBottom: "1.75rem",
  },
  formTitle: {
    fontSize: "1.6rem",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "0.35rem",
  },
  formSub: {
    fontSize: "0.875rem",
    color: "#64748b",
    lineHeight: 1.45,
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
  },
  demoCard: {
    marginTop: "1.75rem",
    padding: "1rem 1.1rem",
    backgroundColor: "#f8fafc",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
  },
  demoHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  demoTitle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#1e293b",
  },
  fillBtn: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #dbeafe",
    borderRadius: "8px",
    padding: "4px 10px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },
  demoDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    fontSize: "12px",
    color: "#64748b",
  },
};

export default Login;
