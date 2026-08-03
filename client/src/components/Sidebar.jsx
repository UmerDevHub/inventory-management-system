import React, { useContext, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

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
    <aside
      style={{
        ...styles.sidebar,
        width: collapsed ? "80px" : "260px",
      }}
    >
      {/* Rich Logo Header Area */}
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>
          <Boxes size={24} color="#ffffff" />
        </div>
        {!collapsed && (
          <div style={styles.logoTextWrapper}>
            <h2 style={styles.logoTitle}>WarehouseOS</h2>
            <span style={styles.logoSub}>Inventory Management Platform</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={styles.collapseBtn}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div style={styles.navContent}>
        {navGroups.map((group, idx) => (
          <div key={idx} style={styles.groupWrapper}>
            {!collapsed && (
              <span style={styles.groupTitle}>{group.group}</span>
            )}
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
                      justifyContent: collapsed ? "center" : "flex-start",
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={19}
                          color={isActive ? "#ffffff" : "#64748b"}
                          style={{ flexShrink: 0 }}
                        />
                        {!collapsed && <span>{item.name}</span>}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pinned Bottom Logout Section */}
      <div style={styles.footer}>
        <button
          onClick={handleLogout}
          style={{
            ...styles.logoutBtn,
            justifyContent: collapsed ? "center" : "flex-start",
          }}
          title="Logout"
        >
          <LogOut size={19} color="#ef4444" style={{ flexShrink: 0 }} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    height: "100vh",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    position: "fixed",
    top: 0,
    left: 0,
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
    transition: "width 0.2s ease",
  },
  logoContainer: {
    height: "80px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 18px",
    borderBottom: "1px solid #e5e7eb",
    position: "relative",
  },
  logoIcon: {
    width: "44px",
    height: "44px",
    backgroundColor: "#2563eb",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
    flexShrink: 0,
  },
  logoTextWrapper: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflow: "hidden",
  },
  logoTitle: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: "10.5px",
    color: "#64748b",
    fontWeight: "500",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
  collapseBtn: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    cursor: "pointer",
    padding: 0,
    transition: "all 0.15s ease",
  },
  navContent: {
    flex: 1,
    padding: "20px 12px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },
  groupWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  groupTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: "0.06em",
    paddingLeft: "10px",
    marginBottom: "4px",
    textTransform: "uppercase",
  },
  groupItems: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    height: "46px",
    padding: "0 14px",
    borderRadius: "12px",
    color: "#475569",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.15s ease",
    textDecoration: "none",
    border: "none",
    outline: "none",
  },
  navItemActive: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.2)",
    border: "none",
  },
  footer: {
    marginTop: "auto",
    padding: "16px 12px",
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
  },
  logoutBtn: {
    width: "100%",
    height: "46px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 14px",
    borderRadius: "12px",
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    border: "none",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.15s ease",
  },
};

export default Sidebar;
