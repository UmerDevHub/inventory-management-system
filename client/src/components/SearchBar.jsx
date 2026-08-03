import React from "react";

const SearchBar = ({ searchTerm, setSearchTerm, placeholder = "Search..." }) => {
  return (
    <div style={styles.wrapper}>
      <svg
        style={styles.icon}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.input}
      />
      {searchTerm && (
        <button style={styles.clearBtn} onClick={() => setSearchTerm("")}>
          ✕
        </button>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    maxWidth: "350px",
    width: "100%",
  },
  icon: {
    position: "absolute",
    left: "12px",
    width: "18px",
    height: "18px",
    color: "#94a3b8",
  },
  input: {
    width: "100%",
    padding: "0.65rem 2.25rem 0.65rem 2.4rem",
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "10px",
    color: "#f8fafc",
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  clearBtn: {
    position: "absolute",
    right: "10px",
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
};

export default SearchBar;
