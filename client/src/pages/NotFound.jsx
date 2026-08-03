import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.code}>404</h1>
      <h2 style={styles.title}>Page Not Found</h2>
      <p style={styles.subtitle}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
        Back to Dashboard
      </Link>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    textAlign: "center",
  },
  code: {
    fontSize: "5rem",
    fontWeight: "800",
    color: "#2563eb",
    lineHeight: 1,
  },
  title: {
    fontSize: "1.5rem",
    marginTop: "0.5rem",
  },
  subtitle: {
    color: "#64748b",
    maxWidth: "400px",
    marginTop: "0.5rem",
  },
};

export default NotFound;
