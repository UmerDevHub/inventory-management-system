import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingCart,
  Truck,
  Warehouse,
  BarChart3,
  User,
  LogOut,
  Boxes,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navGroups = [
    {
      group: "MAIN",
      items: [
        { name: "Dashboard", path: "/", icon: LayoutDashboard },
      ],
    },
    {
      group: "INVENTORY",
      items: [
        { name: "Products", path: "/products", icon: Package },
        { name: "Categories", path: "/categories", icon: Tags },
      ],
    },
    {
      group: "STOCK MANAGEMENT",
      items: [
        { name: "Stock In", path: "/stock-in", icon: ArrowDownLeft },
        { name: "Stock Out", path: "/stock-out", icon: ArrowUpRight },
      ],
    },
    {
      group: "OPERATIONS",
      items: [
        { name: "Purchases", path: "/purchases", icon: ShoppingCart },
        { name: "Suppliers", path: "/suppliers", icon: Truck },
        { name: "Warehouses", path: "/warehouses", icon: Warehouse },
      ],
    },
    {
      group: "ANALYTICS",
      items: [
        { name: "Reports", path: "/reports", icon: BarChart3 },
      ],
    },
    {
      group: "ACCOUNT",
      items: [
        { name: "Profile", path: "/profile", icon: User },
      ],
    },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>
          <Boxes size={24} color="#ffffff" />
        </div>
        <div style={styles.logoTextWrapper}>
          <h2 style={styles.logoTitle}>StockFlow</h2>
          <span style={styles.logoSub}>Inventory SaaS</span>
        </div>
      </div>

      <div style={styles.navContent}>
        {navGroups.map((group, idx) => (
          <div key={idx} style={styles.groupWrapper}>
            <span style={styles.groupTitle}>{group.group}</span>
            <div style={styles.groupItems}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    style={({ isActive }) => ({
                      ...styles.navItem,
                      ...(isActive ? styles.navItemActive : {}),
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={18}
                          color={isActive ? "#ffffff" : "#64748b"}
                        />
                        <span>{item.name}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: "var(--sidebar-width)",
    height: "100vh",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e2e8f0",
    position: "fixed",
    top: 0,
    left: 0,
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
  },
  logoContainer: {
    height: "var(--navbar-height)",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0 1.5rem",
    borderBottom: "1px solid #f1f5f9",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    backgroundColor: "#2563eb",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.25)",
  },
  logoTextWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  logoTitle: {
    fontSize: "1.15rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: "0.725rem",
    color: "#64748b",
    fontWeight: "500",
  },
  navContent: {
    flex: 1,
    padding: "1.25rem 1rem",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  groupWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  groupTitle: {
    fontSize: "0.7rem",
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: "0.06em",
    paddingLeft: "0.75rem",
    marginBottom: "0.2rem",
  },
  groupItems: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.65rem 0.85rem",
    borderRadius: "12px",
    color: "#475569",
    fontWeight: "600",
    fontSize: "0.875rem",
    transition: "all 0.15s ease",
    textDecoration: "none",
  },
  navItemActive: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
  },
  footer: {
    padding: "1rem",
    borderTop: "1px solid #f1f5f9",
  },
  logoutBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.65rem 0.85rem",
    borderRadius: "12px",
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    border: "none",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "background-color 0.15s ease",
  },
};

export default Sidebar;
