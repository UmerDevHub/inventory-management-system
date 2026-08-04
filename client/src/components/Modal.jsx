import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={styles.overlay} onClick={onClose}>
      <div
        ref={containerRef}
        className="modal-container"
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={styles.header}>
          <div>
            <h2 style={styles.title}>{title}</h2>
            {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
          </div>
          <button style={styles.closeBtn} onClick={onClose} title="Close modal">
            <X size={20} color="#64748b" />
          </button>
        </div>
        <div className="modal-body" style={styles.body}>{children}</div>
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
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "#ffffff",
    border: "1px solid #e8ecf3",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "760px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
    animation: "fadeIn 0.2s ease forwards",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "32px 32px 20px 32px",
    borderBottom: "1px solid #f1f5f9",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: 0,
    fontSize: "15px",
    color: "#64748b",
    marginTop: "4px",
  },
  closeBtn: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s ease",
    flexShrink: 0,
  },
  body: {
    padding: "32px",
  },
};

export default Modal;
