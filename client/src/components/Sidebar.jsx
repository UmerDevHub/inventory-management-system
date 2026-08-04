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
  X,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose?.();
  };

  const navGroups = [
    {
      group: "MAIN",
      items: [{ name: "Dashboard", path: "/", icon: LayoutDashboard }],
    },
    {
      group: "INVENTORY",
      items: [
        { name: "Products",   path: "/products",   icon: Package },
        { name: "Categories", path: "/categories", icon: Tags    },
      ],
    },
    {
      group: "STOCK MANAGEMENT",
      items: [
        { name: "Stock In",  path: "/stock-in",  icon: ArrowDownLeft },
        { name: "Stock Out", path: "/stock-out", icon: ArrowUpRight  },
      ],
    },
    {
      group: "OPERATIONS",
      items: [
        { name: "Purchases",   path: "/purchases",   icon: ShoppingCart },
        { name: "Suppliers",   path: "/suppliers",   icon: Truck        },
        { name: "Warehouses",  path: "/warehouses",  icon: Warehouse    },
      ],
    },
    {
      group: "ANALYTICS",
      items: [{ name: "Reports", path: "/reports", icon: BarChart3 }],
    },
    {
      group: "ACCOUNT",
      items: [{ name: "Profile", path: "/profile", icon: User }],
    },
  ];

  return (
    <aside className={`sidebar${isOpen ? " sidebar--open" : ""}`}>
      {/* Header */}
      <div className="sidebar__header">
        <div className="sidebar__logo-icon">
          <Boxes size={24} color="#ffffff" />
        </div>
        <div className="sidebar__logo-text">
          <span className="sidebar__logo-title">WarehouseOS</span>
          <span className="sidebar__logo-sub">Inventory Management</span>
        </div>
        {/* Mobile close button */}
        <button
          className="sidebar__close-btn"
          onClick={onClose}
          title="Close menu"
          aria-label="Close menu"
        >
          <X size={18} color="#64748b" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navGroups.map((group, idx) => (
          <div key={idx} className="sidebar__group">
            <span className="sidebar__group-label">{group.group}</span>
            <div className="sidebar__group-items">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `sidebar__nav-item${isActive ? " sidebar__nav-item--active" : ""}`
                    }
                    onClick={onClose}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={19}
                          color={isActive ? "#ffffff" : "#64748b"}
                          style={{ flexShrink: 0 }}
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
      </nav>

      {/* Footer / Logout */}
      <div className="sidebar__footer">
        <button className="sidebar__logout-btn" onClick={handleLogout}>
          <LogOut size={19} color="#ef4444" style={{ flexShrink: 0 }} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
