import React, { useContext } from "react";
import { Search, Bell, User as UserIcon } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user } = useContext(AuthContext);

  const displayName = user?.name || "Admin User";
  const displayEmail = user?.email || "admin@stockflow.io";

  return (
    <header style={styles.navbar}>
      <div style={styles.searchWrapper}>
        <Search size={18} color="#94a3b8" style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search products, suppliers, orders..."
          style={styles.searchInput}
        />
      </div>

      <div style={styles.rightSection}>
        <button style={styles.iconBtn} title="Notifications">
          <Bell size={20} color="#64748b" />
          <span style={styles.notificationDot}></span>
        </button>

        <div style={styles.divider}></div>

        <div style={styles.userProfile}>
          <div style={styles.avatar}>
            <UserIcon size={18} color="#2563eb" />
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{displayName}</span>
            <span style={styles.userRole}>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

const styles = {
  navbar: {
    height: "var(--navbar-height)",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 2rem",
    position: "sticky",
    top: 0,
    zIndex: 90,
  },
  searchWrapper: {
    position: "relative",
    width: "320px",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
  },
  searchInput: {
    width: "100%",
    padding: "0.6rem 1rem 0.6rem 2.4rem",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "0.875rem",
    outline: "none",
    color: "#0f172a",
    transition: "border-color 0.15s ease",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
  },
  iconBtn: {
    position: "relative",
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background-color 0.15s ease",
  },
  notificationDot: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "8px",
    height: "8px",
    backgroundColor: "#ef4444",
    borderRadius: "50%",
    border: "2px solid #ffffff",
  },
  divider: {
    width: "1px",
    height: "28px",
    backgroundColor: "#e2e8f0",
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    cursor: "pointer",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "#eff6ff",
    border: "1px solid #dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    fontSize: "0.875rem",
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 1.2,
  },
  userRole: {
    fontSize: "0.725rem",
    color: "#64748b",
    fontWeight: "500",
  },
};

export default Navbar;
