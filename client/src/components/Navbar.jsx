import React, { useContext, useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Search, Bell, ChevronRight, AlertTriangle, ArrowDownLeft, ShoppingCart, Check, X } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const displayName = user?.name || "System Admin";

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get("/dashboard/summary");
        const lowStock = res.data.lowStockProducts || [];
        const stockIn = res.data.recentActivities?.recentStockIn || [];
        const purchases = res.data.recentActivities?.recentPurchases || [];

        const notifs = [
          ...lowStock.map((prod) => ({
            id: `low-${prod._id}`,
            title: `Low Stock Alert: ${prod.name}`,
            message: `Current stock (${prod.quantity}) is below reorder level (${prod.reorderLevel})`,
            time: "Action required",
            type: "danger",
            icon: AlertTriangle,
            unread: true,
          })),
          ...stockIn.slice(0, 2).map((item) => ({
            id: `in-${item._id}`,
            title: `Stock Received: ${item.product?.name || "Product"}`,
            message: `Added ${item.quantity} units to warehouse inventory`,
            time: new Date(item.receivedDate || item.createdAt).toLocaleDateString(),
            type: "success",
            icon: ArrowDownLeft,
            unread: false,
          })),
          ...purchases.slice(0, 2).map((item) => ({
            id: `pur-${item._id}`,
            title: `Purchase Order Placed`,
            message: `Procured ${item.quantity} units for $${item.totalAmount}`,
            time: new Date(item.purchaseDate || item.createdAt).toLocaleDateString(),
            type: "info",
            icon: ShoppingCart,
            unread: false,
          })),
        ];

        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => n.unread).length);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    fetchNotifications();
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

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
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={styles.iconBtn}
            title="Notifications"
          >
            <Bell size={20} color="#64748b" />
            {unreadCount > 0 && <span style={styles.notificationDot}></span>}
          </button>

          {/* Interactive Notifications Popup */}
          {showNotifications && (
            <div style={styles.notifDropdown} className="fade-in">
              <div style={styles.notifHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h4 style={styles.notifTitle}>Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="badge badge-danger">{unreadCount} new</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} style={styles.markReadBtn}>
                    <Check size={12} />
                    <span>Mark read</span>
                  </button>
                )}
              </div>

              <div style={styles.notifList}>
                {notifications.length === 0 ? (
                  <p style={styles.emptyNotif}>No notifications at this time.</p>
                ) : (
                  notifications.map((item) => {
                    const IconComp = item.icon;
                    const iconColor =
                      item.type === "danger"
                        ? "#ef4444"
                        : item.type === "success"
                        ? "#10b981"
                        : "#2563eb";
                    const bgColor =
                      item.type === "danger"
                        ? "#fef2f2"
                        : item.type === "success"
                        ? "#ecfdf5"
                        : "#eff6ff";

                    return (
                      <div
                        key={item.id}
                        style={{
                          ...styles.notifItem,
                          backgroundColor: item.unread ? "#f8fafc" : "#ffffff",
                        }}
                      >
                        <div style={{ ...styles.notifIcon, backgroundColor: bgColor }}>
                          <IconComp size={16} color={iconColor} />
                        </div>
                        <div style={styles.notifContent}>
                          <span style={styles.itemTitle}>{item.title}</span>
                          <span style={styles.itemMsg}>{item.message}</span>
                          <span style={styles.itemTime}>{item.time}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div style={styles.divider}></div>

        <Link to="/profile" style={styles.userProfile}>
          <div style={styles.avatarInitials}>
            <span>{getInitials(displayName)}</span>
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{displayName}</span>
            <span style={styles.userRole}>Administrator</span>
          </div>
        </Link>
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
  notifDropdown: {
    position: "absolute",
    top: "52px",
    right: 0,
    width: "360px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
    zIndex: 1000,
    overflow: "hidden",
  },
  notifHeader: {
    padding: "14px 18px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
  },
  notifTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  markReadBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "none",
    border: "none",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  notifList: {
    maxHeight: "360px",
    overflowY: "auto",
  },
  emptyNotif: {
    padding: "24px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "13px",
    margin: 0,
  },
  notifItem: {
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  notifIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifContent: {
    display: "flex",
    flexDirection: "column",
  },
  itemTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f172a",
  },
  itemMsg: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "2px",
  },
  itemTime: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "4px",
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
    textDecoration: "none",
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
