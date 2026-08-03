import React from "react";
import { Trash2, X } from "lucide-react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose} title="Close modal">
          <X size={20} color="#64748b" />
        </button>

        <div style={styles.content}>
          <div style={styles.iconCircle}>
            <Trash2 size={26} color="#ef4444" />
          </div>

          <h2 style={styles.title}>{title || "Delete Item"}</h2>
          <p style={styles.warningTag}>This action cannot be undone.</p>
          <p style={styles.message}>
            {message || "Are you sure you want to proceed? The selected record will be permanently removed from inventory."}
          </p>

          <div style={styles.actions}>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="btn btn-danger"
              disabled={loading}
              style={styles.deleteBtn}
            >
              {loading ? "Deleting..." : "Delete Item"}
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
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1100,
    padding: "20px",
  },
  modal: {
    backgroundColor: "#ffffff",
    border: "1px solid #e8ecf3",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "520px",
    padding: "36px",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
    position: "relative",
    animation: "fadeIn 0.2s ease forwards",
  },
  closeBtn: {
    position: "absolute",
    top: "24px",
    right: "24px",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  iconCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.01em",
  },
  warningTag: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#ef4444",
    backgroundColor: "#fef2f2",
    padding: "4px 12px",
    borderRadius: "999px",
    margin: "8px 0 12px 0",
  },
  message: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "28px",
    lineHeight: 1.5,
  },
  actions: {
    display: "flex",
    gap: "12px",
    width: "100%",
  },
  cancelBtn: {
    height: "54px",
    borderRadius: "14px",
    flex: 1,
    fontSize: "15px",
    fontWeight: "600",
  },
  deleteBtn: {
    height: "54px",
    borderRadius: "14px",
    flex: 1,
    fontSize: "15px",
    fontWeight: "600",
    backgroundColor: "#ef4444",
  },
};

export default ConfirmModal;
