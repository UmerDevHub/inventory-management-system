import React from "react";
import { AlertTriangle, X } from "lucide-react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>
          <X size={18} />
        </button>

        <div style={styles.content}>
          <div style={styles.iconCircle}>
            <AlertTriangle size={24} color="#ef4444" />
          </div>

          <h3 style={styles.title}>{title || "Confirm Action"}</h3>
          <p style={styles.message}>
            {message || "Are you sure you want to proceed? This action cannot be undone."}
          </p>

          <div style={styles.actions}>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="btn btn-danger"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1100,
    padding: "1rem",
  },
  modal: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "420px",
    padding: "1.75rem",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    position: "relative",
    animation: "fadeIn 0.2s ease forwards",
  },
  closeBtn: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  iconCircle: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    backgroundColor: "#fef2f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  message: {
    fontSize: "0.875rem",
    color: "#64748b",
    marginTop: "0.4rem",
    marginBottom: "1.5rem",
    lineHeight: 1.5,
  },
  actions: {
    display: "flex",
    gap: "0.75rem",
    width: "100%",
  },
};

export default ConfirmModal;
