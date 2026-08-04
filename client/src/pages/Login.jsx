import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, Eye, EyeOff, Lock, Mail, CheckCircle2 } from "lucide-react";
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
      {/* Left Hero Banner */}
      <div className="login-left-banner" style={styles.leftBanner}>
        <div style={styles.heroContent}>
          <div style={styles.heroLogo}>
            <Boxes size={32} color="#ffffff" />
            <span style={styles.heroLogoText}>WarehouseOS</span>
          </div>

          <h1 style={styles.heroHeading}>
            Smart Inventory & Warehouse Management System
          </h1>
          <p style={styles.heroSub}>
            Streamline product stock, automated order processing, multi-warehouse tracking, and enterprise inventory reporting in one clean workspace.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <CheckCircle2 size={20} color="#60a5fa" />
              <span>Real-time stock level monitoring & low stock alerts</span>
            </div>
            <div style={styles.featureItem}>
              <CheckCircle2 size={20} color="#60a5fa" />
              <span>Automated Stock-In, Stock-Out, and Purchase calculations</span>
            </div>
            <div style={styles.featureItem}>
              <CheckCircle2 size={20} color="#60a5fa" />
              <span>Multi-location warehouse directory and category tagging</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="login-right-area" style={styles.rightFormArea}>
        <div className="login-form-card" style={styles.formCard}>

          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Admin Sign In 👋</h2>
            <p style={styles.formSub}>
              Enter your credentials to access your administrative dashboard
            </p>
          </div>

          {error && <div style={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
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

            <div className="form-group">
              <label className="form-label">Password</label>
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
              {loading ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>

          <div style={styles.cardFooter}>
            <p style={styles.demoTip}>
              <strong>Demo Admin Credentials:</strong><br />
              Email: <code>admin@gmail.com</code> | Password: <code>123456</code>
            </p>
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
  },
  leftBanner: {
    flex: "1.1",
    background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)",
    padding: "4rem 3rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    color: "#ffffff",
    position: "relative",
  },
  heroContent: {
    maxWidth: "520px",
    margin: "0 auto",
  },
  heroLogo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "2.5rem",
  },
  heroLogoText: {
    fontSize: "1.75rem",
    fontWeight: "800",
    letterSpacing: "-0.03em",
  },
  heroHeading: {
    fontSize: "2.25rem",
    fontWeight: "800",
    lineHeight: 1.25,
    marginBottom: "1.25rem",
    color: "#ffffff",
  },
  heroSub: {
    fontSize: "1.05rem",
    color: "#93c5fd",
    lineHeight: 1.6,
    marginBottom: "2.5rem",
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.85rem",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#e0f2fe",
  },
  rightFormArea: {
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  },
  formCard: {
    width: "100%",
    maxWidth: "440px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "2.5rem",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  },
  formHeader: {
    marginBottom: "2rem",
  },
  formTitle: {
    fontSize: "1.65rem",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "0.4rem",
  },
  formSub: {
    fontSize: "0.875rem",
    color: "#64748b",
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
    left: "14px",
    zIndex: 1,
  },
  paddedInput: {
    width: "100%",
    paddingLeft: "2.6rem",
    paddingRight: "2.6rem",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
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
    margin: "1.25rem 0",
  },
  rememberLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.85rem",
    color: "#475569",
    cursor: "pointer",
  },
  checkbox: {
    borderRadius: "4px",
    accentColor: "#2563eb",
    cursor: "pointer",
  },
  submitBtn: {
    width: "100%",
    padding: "0.85rem",
    fontSize: "0.95rem",
    marginTop: "0.5rem",
  },
  cardFooter: {
    marginTop: "1.75rem",
    paddingTop: "1.25rem",
    borderTop: "1px solid #f1f5f9",
  },
  demoTip: {
    fontSize: "0.8rem",
    color: "#64748b",
    lineHeight: 1.5,
    textAlign: "center",
    backgroundColor: "#f8fafc",
    padding: "0.6rem",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
};

export default Login;
