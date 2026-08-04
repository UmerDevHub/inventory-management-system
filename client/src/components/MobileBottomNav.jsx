import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  User,
} from "lucide-react";

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: LayoutDashboard },
    { name: "Products", path: "/products", icon: Package },
    { name: "Stock In", path: "/stock-in", icon: ArrowDownLeft },
    { name: "Stock Out", path: "/stock-out", icon: ArrowUpRight },
    { name: "Reports", path: "/reports", icon: BarChart3 },
  ];

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav__container">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`mobile-bottom-nav__item ${
                isActive ? "mobile-bottom-nav__item--active" : ""
              }`}
            >
              <div className="mobile-bottom-nav__icon-wrap">
                <Icon size={20} />
                {isActive && <span className="mobile-bottom-nav__dot" />}
              </div>
              <span className="mobile-bottom-nav__label">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
