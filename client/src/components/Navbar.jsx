import React, { useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import { Search, Bell, ChevronRight } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const displayName = user?.name || "System Admin";

  const getInitials = (name) => {
    if (!name) return "SA";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getBreadcrumb = (path) => {
    switch (path) {
      case "/":
        return [{ label: "Dashboard", path: "/" }];
      case "/products":
        return [
          { label: "Dashboard", path: "/" },
          { label: "Products", path: "/products" },
        ];
      case "/categories":
        return [
          { label: "Dashboard", path: "/" },
          { label: "Categories", path: "/categories" },
        ];
      case "/suppliers":
        return [
          { label: "Dashboard", path: "/" },
          { label: "Suppliers", path: "/suppliers" },
        ];
      case "/warehouses":
        return [
          { label: "Dashboard", path: "/" },
          { label: "Warehouses", path: "/warehouses" },
        ];
      case "/stock-in":
        return [
          { label: "Dashboard", path: "/" },
          { label: "Stock In", path: "/stock-in" },
        ];
      case "/stock-out":
        return [
          { label: "Dashboard", path: "/" },
          { label: "Stock Out", path: "/stock-out" },
        ];
      case "/purchases":
        return [
          { label: "Dashboard", path: "/" },
          { label: "Purchases", path: "/purchases" },
        ];
      case "/reports":
        return [
          { label: "Dashboard", path: "/" },
          { label: "Reports", path: "/reports" },
        ];
      case "/profile":
        return [
          { label: "Dashboard", path: "/" },
          { label: "Profile Settings", path: "/profile" },
        ];
      default:
        return [{ label: "Dashboard", path: "/" }];
    }
  };

  const crumbs = getBreadcrumb(location.pathname);

  return (
    <header style={styles.navbar}>
      {/* Breadcrumb & Global Search */}
      <div style={styles.leftNavSection}>
        <div style={styles.breadcrumbWrapper}>
          {crumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.path}>
              {idx > 0 && <ChevronRight size={14} color="#94a3b8" />}
              <Link
                to={crumb.path}
                style={{
                  ...styles.crumbLink,
                  color: idx === crumbs.length - 1 ? "#0f172a" : "#64748b",
                  fontWeight: idx === crumbs.length - 1 ? "700" : "500",
                }}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </div>

        <div style={styles.searchWrapper}>
          <Search size={18} color="#94a3b8" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search products, suppliers, orders, warehouses..."
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Right Section */}
      <div style={styles.rightSection}>
        <button style={styles.iconBtn} title="Notifications">
          <Bell size={20} color="#64748b" />
          <span style={styles.notificationDot}></span>
        </button>

        <div style={styles.divider}></div>

        <div style={styles.userProfile}>
          <div style={styles.avatarInitials}>
            <span>{getInitials(displayName)}</span>
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
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    position: "sticky",
    top: 0,
    zIndex: 90,
  },
  leftNavSection: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
  },
  breadcrumbWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
  },
  crumbLink: {
    textDecoration: "none",
    transition: "color 0.15s ease",
  },
  searchWrapper: {
    position: "relative",
    width: "440px",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
  },
  searchInput: {
    width: "100%",
    padding: "10px 16px 10px 42px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    color: "#0f172a",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  iconBtn: {
    position: "relative",
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
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
    backgroundColor: "#e5e7eb",
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  avatarInitials: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#eff6ff",
    border: "1.5px solid #dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563eb",
    fontWeight: "800",
    fontSize: "14px",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 1.2,
  },
  userRole: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "500",
  },
};

export default Navbar;
