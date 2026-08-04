import React, { useEffect, useState } from "react";
import {
  Package,
  Tags,
  Truck,
  Warehouse,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingCart,
  AlertTriangle,
  Clock,
  TrendingUp,
  Boxes,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import API from "../api/axios";
import Loader from "../components/Loader";
import { compactNumber } from "../utils/formatNumber";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async (isRetry = false) => {
    try {
      setError("");
      setLoading(true);
      const res = await API.get("/dashboard/summary");
      setData(res.data);
    } catch (err) {
      // On first 401/network error, wait 800ms and auto-retry once
      if (!isRetry && (err.response?.status === 401 || !err.response)) {
        setTimeout(() => fetchDashboardData(true), 800);
        return;
      }
      const msg =
        err.response?.status === 401
          ? "Session expired. Please refresh the page or log in again."
          : err.response?.data?.message || "Failed to load dashboard. Check your server connection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader message="Loading inventory dashboard..." />;
  }

  if (error) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "60vh", gap: "16px", padding: "24px",
      }}>
        <div style={{
          backgroundColor: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: "20px", padding: "32px 40px", textAlign: "center",
          maxWidth: "420px", width: "100%",
        }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            backgroundColor: "#fee2e2", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 16px",
          }}>
            <AlertTriangle size={28} color="#ef4444" />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px" }}>
            Dashboard Failed to Load
          </h3>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 20px", lineHeight: 1.5 }}>
            {error}
          </p>
          <button
            onClick={() => fetchDashboardData()}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Purchases", count: data.totalPurchases || 0 },
    { name: "Stock In", count: data.totalStockIn || 0 },
    { name: "Stock Out", count: data.totalStockOut || 0 },
  ];

  const pieData = [
    { name: "Products", value: data.totalProducts || 1 },
    { name: "Categories", value: data.totalCategories || 1 },
    { name: "Suppliers", value: data.totalSuppliers || 1 },
    { name: "Warehouses", value: data.totalWarehouses || 1 },
  ];

  const PIE_COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

  const recentList = [
    ...(data.recentActivities?.recentStockIn?.map((item) => ({
      id: item._id,
      productName: item.product?.name || "Inventory Product",
      actionText: `${item.quantity} units received`,
      type: "Stock In",
      date: new Date(item.receivedDate || item.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      badgeClass: "badge-success",
    })) || []),
    ...(data.recentActivities?.recentStockOut?.map((item) => ({
      id: item._id,
      productName: item.product?.name || "Inventory Product",
      actionText: `${item.quantity} units dispatched`,
      type: "Stock Out",
      date: new Date(item.issuedDate || item.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      badgeClass: "badge-danger",
    })) || []),
    ...(data.recentActivities?.recentPurchases?.map((item) => ({
      id: item._id,
      productName: item.product?.name || "Procured Item",
      actionText: `${item.quantity} units purchased ($${item.totalAmount})`,
      type: "Purchase",
      date: new Date(item.purchaseDate || item.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      badgeClass: "badge-primary",
    })) || []),
  ].slice(0, 15);

  return (
    <div className="fade-in" style={{ paddingTop: "8px" }}>
      {/* 1. Header */}
      <div className="page-header" style={{ marginBottom: "32px" }}>
        <div>
          <h1 className="page-title">Inventory Dashboard</h1>
          <p className="page-subtitle">
            Monitor inventory, stock movement, suppliers, and warehouse activity.
          </p>
        </div>
      </div>

      {/* Group 1: Inventory Overview Section */}
      <div style={{ marginBottom: "32px" }}>
        <div style={styles.sectionDividerRow}>
          <span style={styles.groupHeading}>INVENTORY OVERVIEW</span>
          <div style={styles.sectionDividerLine}></div>
        </div>

        <div style={styles.cardsGrid}>
          <div className="card" style={styles.summaryCard}>
            <div style={styles.cardMain}>
              <span style={styles.cardLabel}>TOTAL PRODUCTS</span>
              <div style={styles.cardValue}>
                {compactNumber(data.totalProducts || 0)}
              </div>
              <span style={styles.trendPill}>Updated today</span>
            </div>
            <div style={styles.iconCircle56}>
              <Package size={24} color="#2563eb" />
            </div>
          </div>

          <div className="card" style={styles.summaryCard}>
            <div style={styles.cardMain}>
              <span style={styles.cardLabel}>CATEGORIES</span>
              <div style={styles.cardValue}>
                {compactNumber(data.totalCategories || 0)}
              </div>
              <span style={styles.trendPill}>Active tags</span>
            </div>
            <div style={styles.iconCircle56}>
              <Tags size={24} color="#2563eb" />
            </div>
          </div>

          <div className="card" style={styles.summaryCard}>
            <div style={styles.cardMain}>
              <span style={styles.cardLabel}>SUPPLIERS</span>
              <div style={styles.cardValue}>
                {compactNumber(data.totalSuppliers || 0)}
              </div>
              <span style={styles.trendPill}>Verified vendors</span>
            </div>
            <div style={styles.iconCircle56}>
              <Truck size={24} color="#2563eb" />
            </div>
          </div>

          <div className="card" style={styles.summaryCard}>
            <div style={styles.cardMain}>
              <span style={styles.cardLabel}>WAREHOUSES</span>
              <div style={styles.cardValue}>
                {compactNumber(data.totalWarehouses || 0)}
              </div>
              <span style={styles.trendPill}>Active depots</span>
            </div>
            <div style={styles.iconCircle56}>
              <Warehouse size={24} color="#2563eb" />
            </div>
          </div>
        </div>
      </div>

      {/* Group 2: Operations & Alerts Section (Premium Stock In & Stock Out KPI Cards) */}
      <div style={{ marginBottom: "36px" }}>
        <div style={styles.sectionDividerRow}>
          <span style={styles.groupHeading}>OPERATIONS & ALERTS</span>
          <div style={styles.sectionDividerLine}></div>
        </div>

        <div style={styles.cardsGrid}>
          {/* Stock In KPI Card */}
          <div className="card" style={styles.summaryCard}>
            <div style={styles.cardMain}>
              <span style={styles.cardLabel}>STOCK IN LOGS</span>
              <div style={styles.cardValue}>
                {compactNumber(data.totalStockIn || 0)}
              </div>
              <span style={{ ...styles.trendPill, color: "#10b981", fontWeight: "600" }}>
                145 units received
              </span>
            </div>
            <div style={{ ...styles.iconCircle56, backgroundColor: "#eafbf3" }}>
              <ArrowDownLeft size={24} color="#10b981" />
            </div>
          </div>

          {/* Stock Out KPI Card */}
          <div className="card" style={styles.summaryCard}>
            <div style={styles.cardMain}>
              <span style={styles.cardLabel}>STOCK OUT LOGS</span>
              <div style={styles.cardValue}>
                {compactNumber(data.totalStockOut || 0)}
              </div>
              <span style={{ ...styles.trendPill, color: "#64748b" }}>
                121 units dispatched
              </span>
            </div>
            <div style={{ ...styles.iconCircle56, backgroundColor: "#fdeeee" }}>
              <ArrowUpRight size={24} color="#ef4444" />
            </div>
          </div>

          {/* Purchases KPI Card */}
          <div className="card" style={styles.summaryCard}>
            <div style={styles.cardMain}>
              <span style={styles.cardLabel}>PURCHASES LOGGED</span>
              <div style={styles.cardValue}>
                {compactNumber(data.totalPurchases || 0)}
              </div>
              <span style={styles.trendPill}>Orders fulfilled</span>
            </div>
            <div style={styles.iconCircle56}>
              <ShoppingCart size={24} color="#2563eb" />
            </div>
          </div>

          {/* Low Stock KPI Card */}
          <div className="card" style={styles.summaryCard}>
            <div style={styles.cardMain}>
              <span style={styles.cardLabel}>LOW STOCK ALERTS</span>
              <div
                style={{
                  ...styles.cardValue,
                  color: data.lowStockProducts?.length > 0 ? "#ef4444" : "#0f172a",
                }}
              >
                {data.lowStockProducts?.length || 0}
              </div>
              <span
                style={{
                  ...styles.trendPill,
                  color: data.lowStockProducts?.length > 0 ? "#ef4444" : "#64748b",
                }}
              >
                {data.lowStockProducts?.length > 0 ? "Action required" : "Healthy levels"}
              </span>
            </div>
            <div
              style={{
                ...styles.iconCircle56,
                backgroundColor: data.lowStockProducts?.length > 0 ? "#fdeeee" : "#eff6ff",
              }}
            >
              <AlertTriangle
                size={24}
                color={data.lowStockProducts?.length > 0 ? "#ef4444" : "#2563eb"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Row 3: Taller Charts (320px Height) with Subtitles */}
      <div style={styles.chartsGrid}>
        {/* Left Bar Chart */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={styles.chartHeader}>
            <div>
              <h3 style={styles.chartTitle}>Inventory Overview</h3>
              <p style={styles.chartSub}>Stock movement during the current period</p>
            </div>
            <TrendingUp size={18} color="#64748b" />
          </div>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={13} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={13} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Pie Chart */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={styles.chartHeader}>
            <div>
              <h3 style={styles.chartTitle}>Inventory Distribution</h3>
              <p style={styles.chartSub}>Products by category</p>
            </div>
            <Boxes size={18} color="#64748b" />
          </div>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Row 4: Recent Activity & Low Stock */}
      <div style={styles.bottomGrid}>
        {/* Recent Activity Card */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={styles.chartHeader}>
            <div>
              <h3 style={styles.chartTitle}>Recent Activity</h3>
              <p style={styles.chartSub}>Latest transaction events across stock & purchases</p>
            </div>
            <Clock size={18} color="#64748b" />
          </div>

          {recentList.length === 0 ? (
            <p style={styles.emptyText}>No recent activity logged yet.</p>
          ) : (
            <div style={styles.activityList}>
              {recentList.map((item) => (
                <div key={item.id} style={styles.activityItem}>
                  <div>
                    <span style={styles.productBold}>{item.productName}</span>
                    <span style={styles.actionText}>{item.actionText}</span>
                  </div>
                  <div style={styles.activityRight}>
                    <span className={`badge ${item.badgeClass}`}>{item.type}</span>
                    <span style={styles.dateText}>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Table */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={styles.chartHeader}>
            <div>
              <h3 style={styles.chartTitle}>Low Stock</h3>
              <p style={styles.chartSub}>Products requiring inventory replenishment</p>
            </div>
            <AlertTriangle size={18} color="#ef4444" />
          </div>

          {!data.lowStockProducts || data.lowStockProducts.length === 0 ? (
            <div style={styles.emptyStockBox}>
              <div style={styles.checkCircleBox}>
                <CheckCircle2 size={26} color="#059669" />
              </div>
              <h4 style={styles.emptyStockTitle}>No low stock items</h4>
              <p style={styles.emptyStockSub}>
                All products are above their reorder levels.
              </p>
            </div>
          ) : (
            <div style={{ width: "100%", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <th style={styles.thLeft}>PRODUCT</th>
                    <th style={styles.thRight}>CURRENT</th>
                    <th style={styles.thRight}>REORDER</th>
                    <th style={styles.thRight}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockProducts.slice(0, 5).map((prod) => (
                    <tr key={prod._id} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "14px 0", fontWeight: "700", color: "#0f172a" }}>
                        {prod.name}
                      </td>
                      <td style={{ padding: "14px 0", textAlign: "right", fontWeight: "800", color: "#ef4444" }}>
                        {prod.quantity}
                      </td>
                      <td style={{ padding: "14px 0", textAlign: "right", color: "#64748b" }}>
                        {prod.reorderLevel}
                      </td>
                      <td style={{ padding: "14px 0", textAlign: "right" }}>
                        <span className="badge badge-danger">Low</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#ef4444",
    padding: "16px",
    borderRadius: "16px",
    marginBottom: "24px",
  },
  sectionDividerRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
  },
  groupHeading: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    whiteSpace: "nowrap",
  },
  sectionDividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#e5e7eb",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
  },
  summaryCard: {
    minHeight: "115px",
    height: "auto",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "nowrap",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
  },
  cardMain: {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 0%",
    minWidth: 0,
  },
  cardLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: "0.05em",
  },
  cardValue: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 1.1,
    marginTop: "4px",
    marginBottom: "4px",
  },
  trendPill: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "500",
  },
  iconCircle56: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginLeft: "auto",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: "32px",
    marginBottom: "36px",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  chartTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  chartSub: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "2px",
  },
  chartWrapper: {
    width: "100%",
    height: "320px",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
    gap: "32px",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "360px",
    overflowY: "auto",
    paddingRight: "6px",
  },
  thLeft: {
    padding: "10px 0",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: "0.04em",
  },
  thRight: {
    padding: "10px 0",
    textAlign: "right",
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: "0.04em",
  },
  activityItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #f1f5f9",
  },
  productBold: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f172a",
    display: "block",
  },
  actionText: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "2px",
    display: "block",
  },
  activityRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
  },
  dateText: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: "14px",
    fontStyle: "italic",
    padding: "16px 0",
  },
  emptyStockBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    textAlign: "center",
    flex: 1,
  },
  checkCircleBox: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    backgroundColor: "#ecfdf5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
  },
  emptyStockTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  emptyStockSub: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "4px",
  },
};

export default Dashboard;
