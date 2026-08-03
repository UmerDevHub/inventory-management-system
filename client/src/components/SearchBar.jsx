import React, { useState } from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ searchTerm, setSearchTerm, placeholder = "Search products, SKU, category..." }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      style={{
        ...styles.wrapper,
        ...(isFocused ? styles.wrapperFocused : {}),
      }}
    >
      <Search
        size={20}
        color={isFocused ? "#2563eb" : "#64748b"}
        style={styles.searchIcon}
      />

      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.input}
      />

      {searchTerm ? (
        <button
          style={styles.clearBtn}
          onClick={() => setSearchTerm("")}
          title="Clear search"
        >
          <X size={16} color="#64748b" />
        </button>
      ) : (
        <div style={styles.shortcutBadge}>⌘ K</div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "440px",
    maxWidth: "100%",
    height: "56px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "0 16px 0 46px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
    transition: "all 0.2s ease-in-out",
  },
  wrapperFocused: {
    borderColor: "#2563eb",
    boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.12)",
  },
  searchIcon: {
    position: "absolute",
    left: "16px",
    transition: "color 0.2s ease",
    flexShrink: 0,
  },
  input: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    border: "none",
    color: "#0f172a",
    fontSize: "15px",
    fontWeight: "500",
    outline: "none",
  },
  shortcutBadge: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "4px 9px",
    letterSpacing: "0.05em",
    flexShrink: 0,
    userSelect: "none",
  },
  clearBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#f1f5f9",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "all 0.15s ease",
  },
};

export default SearchBar;
