import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const Toast = ({ message, type = "success", onClose }) => {
  if (!message) return null;

  const isSuccess = type === "success";
  const isError = type === "error";

  const icon = isSuccess ? (
    <CheckCircle2 size={18} color="#059669" />
  ) : isError ? (
    <AlertCircle size={18} color="#ef4444" />
  ) : (
    <Info size={18} color="#2563eb" />
  );

  const bgColor = isSuccess ? "#ecfdf5" : isError ? "#fef2f2" : "#eff6ff";
  const borderColor = isSuccess ? "#a7f3d0" : isError ? "#fecaca" : "#dbeafe";
  const textColor = isSuccess ? "#065f46" : isError ? "#991b1b" : "#1e40af";

  return (
    <div
      style={{
        ...styles.container,
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: textColor,
      }}
      className="fade-in"
    >
      <div style={styles.content}>
        {icon}
        <span style={styles.text}>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} style={styles.closeBtn}>
          <X size={14} color={textColor} />
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    bottom: "1.5rem",
    right: "1.5rem",
    border: "1px solid",
    borderRadius: "12px",
    padding: "0.85rem 1.25rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
    zIndex: 1200,
    maxWidth: "380px",
  },
  content: {
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
  },
  text: {
    fontSize: "0.875rem",
    fontWeight: "600",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.2rem",
    display: "flex",
    alignItems: "center",
  },
};

export default Toast;
