import React from "react";

const Loader = ({ message = "Loading..." }) => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.text}>{message}</p>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
    width: "100%",
  },
  spinner: {
    width: "42px",
    height: "42px",
    border: "4px solid rgba(99, 102, 241, 0.2)",
    borderTop: "4px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  text: {
    marginTop: "1rem",
    color: "#94a3b8",
    fontSize: "0.95rem",
    fontWeight: "500",
  },
};

const styleTag = document.createElement("style");
styleTag.innerHTML = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(styleTag);

export default Loader;
