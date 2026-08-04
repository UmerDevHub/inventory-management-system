import React, { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import AIAssistant from "./AIAssistant";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar  = useCallback(() => setSidebarOpen(true),  []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="app-container">
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="main-content">
        <Navbar onMenuClick={openSidebar} />
        <main className="page-container">
          <Outlet />
        </main>
      </div>

      {/* AI floating assistant — available on every page */}
      <AIAssistant />
    </div>
  );
};

export default Layout;
