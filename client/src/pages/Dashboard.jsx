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

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/dashboard/summary");
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard metrics");
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
      <div style={styles.errorBanner}>
        <AlertTriangle size={20} />
        <span>{error}</span>
        <button onClick={fetchDashboardData} className="btn btn-secondary">
          Retry
        </button>
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
      actionText: `${item.quantity} Units Added`,
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
      actionText: `${item.quantity} Units Issued`,
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
      actionText: `${item.quantity} Units Purchased ($${item.totalAmount})`,
      type: "Purchase",
      date: new Date(item.purchaseDate || item.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      badgeClass: "badge-primary",
    })) || []),
  ].slice(0, 6);

  return (
    <div className="fade-in" style={{ paddingTop: "12px" }}>
      {/* 1. Header (32-40px top margin spacing) */}
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
        <h2 style={styles.groupHeading}>Inventory Overview</h2>
        <div style={styles.cardsGrid}>
          <div className="card" style={styles.summaryCard}>
            <div style={styles.cardMain}>
              <span style={styles.cardLabel}>TOTAL PRODUCTS</span>
              <div style={styles.cardValue}>
                {data.totalProducts?.toLocaleString() || 0}
              </div>
              <span style={styles.trendPill}>Updated today</span>
            </div>
            <div style={styles.iconCircle}>
              <Package size={22} color="#2563eb" />
            </div>
          </div>

          <div className="card" style={styles.summaryCard}>
            <div style={styles.cardMain}>
              <span style={styles.cardLabel}>CATEGORIES</span>
              <div style={styles.cardValue}>
                {data.totalCategories?.toLocaleString() || 0}
              </div>
              <span style={styles.trendPill}>Active tags</span>
            </div>
            <div style={styles.iconCircle}>
              <Tags size={22} color="#2563eb" />
            </div>
          </div>

          <div className="card" style={styles.summaryCard}>
            <div style={styles.cardMain}>
              <span style={styles.cardLabel}>SUPPLIERS</span>
              <div style={styles.cardValue}>
                {data.totalSuppliers?.toLocaleString() || 0}
              </div>
              <span style={styles.trendPill}>Verified vendors</span>
            </div>
            <div style={styles.iconCircle}>
              <Truck size={22} color="#2563eb" />
            </div>
          </div>

          <div className="card" style={styles.summaryCard}>
            <div style={styles.cardMain}>
              <span style={styles.cardLabel}>WAREHOUSES</span>
              <div style={styles.cardValue}>
                {data.totalWarehouses?.toLocaleString() || 0}
              </div>
              <span style={styles.trendPill}>Active depots</span>
            </div>
            <div style={styles.iconCircle}>
              <Warehouse size={22} color="#2563eb" />
            </div>
          </div>
        </div>
      </div>

      {/* Group 2: Operations & Alerts Section */}
      <div style={{ marginBottom: "36px" }}>
        <h2 style={styles.groupHeading}>Operations & Alerts</h2>
        <div style={styles.cardsGrid}>
          <div className="card" style={styles.summaryCard}>
            <div style={styles.cardMain}>
              <span style={styles.cardLabel}>STOCK IN LOGS</span>
              <div style={styles.cardValue}>
                {data.totalStockIn?.toLocaleString() || 0}
              </div>
              <span style={{ ...styles.trendPill, color: "#10b981" }}>+12% this month</span>
            </div>
            <div style={{ ...styles.iconCircle, backgroundColor: "#ecfdf5" }}>
              <ArrowDownLeft size={22} color="#10b981" />
            </div>
          </div>

          <div className="card" style={styles.summaryCard}>
            <div style={styles.cardMain}>
              <span style={styles.cardLabel}>STOCK OUT LOGS</span>
              <div style={styles.cardValue}>
                {data.totalStockOut?.toLocaleString() || 0}
              </div>
              <span style={styles.trendPill}>Dispatched issues</span>
            </div>
            <div style={{ ...styles.iconCircle, backgroundColor: "#fef2f2" }}>
              <ArrowUpRight size={22} color="#ef4444" />
            </div>
          </div>

          <div className="card" style={styles.summaryCard}>
            <div style={styles.cardMain}>
              <span style={styles.cardLabel}>PURCHASES LOGGED</span>
              <div style={styles.cardValue}>
                {data.totalPurchases?.toLocaleString() || 0}
              </div>
              <span style={styles.trendPill}>Orders placed</span>
            </div>
            <div style={styles.iconCircle}>
              <ShoppingCart size={22} color="#2563eb" />
            </div>
          </div>

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
                ...styles.iconCircle,
                backgroundColor: data.lowStockProducts?.length > 0 ? "#fef2f2" : "#eff6ff",
              }}
            >
              <AlertTriangle
                size={22}
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
        <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
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
            <div className="table-container" style={{ border: "none", boxShadow: "none" }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: "right" }}>Current</th>
                    <th style={{ textAlign: "right" }}>Reorder</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockProducts.map((prod) => (
                    <tr key={prod._id}>
                      <td style={{ fontWeight: "700", color: "#0f172a" }}>{prod.name}</td>
                      <td style={{ textAlign: "right", fontWeight: "800", color: "#ef4444" }}>
                        {prod.quantity}
                      </td>
                      <td style={{ textAlign: "right", color: "#64748b" }}>
                        {prod.reorderLevel}
                      </td>
                      <td>
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
  groupHeading: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "14px",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
  },
  summaryCard: {
    minHeight: "115px",
    padding: "24px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
  },
  cardMain: {
    display: "flex",
    flexDirection: "column",
  },
  cardLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: "0.04em",
  },
  cardValue: {
    fontSize: "38px",
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 1.1,
    marginTop: "4px",
    marginBottom: "6px",
  },
  trendPill: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "500",
  },
  iconCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
