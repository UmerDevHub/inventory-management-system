import React, { useState, useContext, useEffect } from "react";
import { User, Mail, Lock, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";

const Profile = () => {
  const { user, login } = useContext(AuthContext);

  // Profile Update Form State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");

    if (!name.trim() || !email.trim()) {
      setProfileError("Name and email are required.");
      return;
    }

    try {
      setProfileLoading(true);
      const res = await API.put("/auth/profile", { name, email });
      
      const token = localStorage.getItem("token");
      login(
        {
          _id: res.data._id || user._id,
          name: res.data.name,
          email: res.data.email,
        },
        token
      );

      setProfileSuccess("Profile information updated successfully!");
    } catch (err) {
      setProfileError(
        err.response?.data?.message || "Failed to update profile details."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    try {
      setPasswordLoading(true);
      await API.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Failed to change password. Please check your current password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Account & Profile</h1>
          <p className="page-subtitle">
            Manage your personal profile, credentials, and account security
          </p>
        </div>
      </div>

      {/* User Card Overview */}
      <div className="card" style={styles.userBanner}>
        <div style={styles.avatarLarge}>
          <User size={36} color="#2563eb" />
        </div>
        <div style={styles.userInfoWrapper}>
          <h2 style={styles.userNameHeader}>{user?.name || "Admin User"}</h2>
          <span style={styles.userEmailText}>{user?.email || "admin@inventory.com"}</span>
          <div style={styles.badgeRow}>
            <span className="badge badge-primary">
              <ShieldCheck size={12} style={{ marginRight: "4px" }} />
              Administrator
            </span>
            <span className="badge badge-success">Account Active</span>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      <div style={styles.formsGrid}>
        {/* Form 1: Update Profile Details */}
        <div className="card">
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Personal Information</h3>
              <p style={styles.cardSubtitle}>
                Update your display name and email address
              </p>
            </div>
            <User size={20} color="#2563eb" />
          </div>

          {profileSuccess && (
            <div style={styles.successBox}>
              <CheckCircle2 size={18} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div style={styles.errorBox}>
              <AlertCircle size={18} />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div style={styles.inputWrapper}>
                <User size={18} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@inventory.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={profileLoading}
              style={{ marginTop: "1rem", width: "100%" }}
            >
              {profileLoading ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </form>
        </div>

        {/* Form 2: Change Password */}
        <div className="card">
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Change Password</h3>
              <p style={styles.cardSubtitle}>
                Update your account password to maintain security
              </p>
            </div>
            <Lock size={20} color="#ef4444" />
          </div>

          {passwordSuccess && (
            <div style={styles.successBox}>
              <CheckCircle2 size={18} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div style={styles.errorBox}>
              <AlertCircle size={18} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password *</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-secondary"
              disabled={passwordLoading}
              style={{
                marginTop: "1rem",
                width: "100%",
                backgroundColor: "#fef2f2",
                color: "#ef4444",
                borderColor: "#fee2e2",
              }}
            >
              {passwordLoading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  userBanner: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    marginBottom: "1.5rem",
    padding: "1.75rem",
  },
  avatarLarge: {
    width: "72px",
    height: "72px",
    borderRadius: "18px",
    backgroundColor: "#eff6ff",
    border: "2px solid #dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userInfoWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  userNameHeader: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
  },
  userEmailText: {
    fontSize: "0.9rem",
    color: "#64748b",
    marginTop: "0.15rem",
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginTop: "0.6rem",
  },
  formsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "1.5rem",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  cardSubtitle: {
    fontSize: "0.825rem",
    color: "#64748b",
    marginTop: "0.2rem",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
  },
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#065f46",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    fontSize: "0.875rem",
    marginBottom: "1.25rem",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#ef4444",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    fontSize: "0.875rem",
    marginBottom: "1.25rem",
  },
};

export default Profile;
