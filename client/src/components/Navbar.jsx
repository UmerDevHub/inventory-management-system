import React, { useContext, useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  ArrowDownLeft,
  ShoppingCart,
  Check,
  User as UserIcon,
  Key,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const displayName = user?.name || "System Admin";
  const userEmail = user?.email || "admin@gmail.com";

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

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate("/login");
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
      {/* Breadcrumb Navigation */}
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
      </div>

      {/* Right Controls Section */}
      <div style={styles.rightSection}>
        {/* Notifications Icon Button */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            style={styles.iconBtn}
            title="Notifications"
          >
            <Bell size={19} color="#64748b" />
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

        {/* Premium Enterprise User Profile Pill & Dropdown */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            style={styles.userProfilePill}
          >
            <div style={styles.avatarWrapper}>
              <div style={styles.avatarInitials}>
                <span>{getInitials(displayName)}</span>
              </div>
              <span style={styles.activeDot}></span>
            </div>

            <div style={styles.userInfo}>
              <span style={styles.userName}>{displayName}</span>
              <span style={styles.userRole}>Administrator</span>
            </div>

            <ChevronDown
              size={15}
              color="#64748b"
              style={{
                transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </div>

          {/* Interactive User Dropdown Menu */}
          {showUserMenu && (
            <div style={styles.userDropdownMenu} className="fade-in">
              <div style={styles.userDropdownHeader}>
                <div style={styles.headerAvatarCircle}>
                  <span>{getInitials(displayName)}</span>
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div style={styles.headerName}>{displayName}</div>
                  <div style={styles.headerEmail}>{userEmail}</div>
                </div>
              </div>

              <div style={styles.menuDivider}></div>

              <Link
                to="/profile"
                onClick={() => setShowUserMenu(false)}
                style={styles.menuItem}
              >
                <UserIcon size={16} color="#64748b" />
                <span>Account Profile</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setShowUserMenu(false)}
                style={styles.menuItem}
              >
                <Key size={16} color="#64748b" />
                <span>Change Password</span>
              </Link>

              <div style={styles.menuDivider}></div>

              <button onClick={handleLogout} style={styles.logoutMenuItem}>
                <LogOut size={16} color="#ef4444" />
                <span>Sign Out Account</span>
              </button>
            </div>
          )}
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
  userProfilePill: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "6px 12px 6px 8px",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "all 0.15s ease",
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.03)",
  },
  avatarWrapper: {
    position: "relative",
    display: "inline-flex",
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
  activeDot: {
    position: "absolute",
    bottom: "1px",
    right: "1px",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
    border: "2px solid #ffffff",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 1.15,
  },
  userRole: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "500",
    marginTop: "1px",
  },
  userDropdownMenu: {
    position: "absolute",
    top: "54px",
    right: 0,
    width: "240px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)",
    zIndex: 1000,
    padding: "8px",
  },
  userDropdownHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 12px 10px 12px",
  },
  headerAvatarCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#eff6ff",
    border: "1px solid #dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563eb",
    fontWeight: "800",
    fontSize: "13px",
    flexShrink: 0,
  },
  headerName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  headerEmail: {
    fontSize: "12px",
    color: "#64748b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  menuDivider: {
    height: "1px",
    backgroundColor: "#f1f5f9",
    margin: "6px 0",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "10px",
    color: "#334155",
    fontSize: "13.5px",
    fontWeight: "600",
    textDecoration: "none",
    transition: "background-color 0.15s ease",
  },
  logoutMenuItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "10px",
    backgroundColor: "transparent",
    border: "none",
    color: "#ef4444",
    fontSize: "13.5px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "left",
    transition: "background-color 0.15s ease",
  },
};

export default Navbar;
