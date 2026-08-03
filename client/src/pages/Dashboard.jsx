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
      type: "Stock In",
      quantity: `${item.quantity} Units`,
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
      type: "Stock Out",
      quantity: `${item.quantity} Units`,
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
      type: "Purchase",
      quantity: `${item.quantity} Units ($${item.totalAmount})`,
      date: new Date(item.purchaseDate || item.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      badgeClass: "badge-primary",
    })) || []),
  ].slice(0, 6);

  return (
    <div className="fade-in">
      {/* 1. Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Dashboard</h1>
          <p className="page-subtitle">
            Monitor inventory, stock movement, suppliers, and warehouse activity.
          </p>
        </div>
      </div>

      {/* 2. Row 1: Primary Summary Cards (105px Height, 34px Numbers, 24px Padding) */}
      <div style={styles.primaryCardsGrid}>
        <div className="card" style={styles.summaryCard}>
          <div>
            <span style={styles.cardLabel}>Total Products</span>
            <div style={styles.cardValue}>
              {data.totalProducts?.toLocaleString() || 0}
            </div>
          </div>
          <div style={styles.iconCircle}>
            <Package size={22} color="#2563eb" />
          </div>
        </div>

        <div className="card" style={styles.summaryCard}>
          <div>
            <span style={styles.cardLabel}>Total Categories</span>
            <div style={styles.cardValue}>
              {data.totalCategories?.toLocaleString() || 0}
            </div>
          </div>
          <div style={styles.iconCircle}>
            <Tags size={22} color="#2563eb" />
          </div>
        </div>

        <div className="card" style={styles.summaryCard}>
          <div>
            <span style={styles.cardLabel}>Total Suppliers</span>
            <div style={styles.cardValue}>
              {data.totalSuppliers?.toLocaleString() || 0}
            </div>
          </div>
          <div style={styles.iconCircle}>
            <Truck size={22} color="#2563eb" />
          </div>
        </div>

        <div className="card" style={styles.summaryCard}>
          <div>
            <span style={styles.cardLabel}>Total Warehouses</span>
            <div style={styles.cardValue}>
              {data.totalWarehouses?.toLocaleString() || 0}
            </div>
          </div>
          <div style={styles.iconCircle}>
            <Warehouse size={22} color="#2563eb" />
          </div>
        </div>
      </div>

      {/* 3. Row 2: Operation Metric Cards */}
      <div style={styles.secondaryCardsGrid}>
        <div className="card" style={styles.summaryCard}>
          <div>
            <span style={styles.cardLabel}>Stock In Logs</span>
            <div style={styles.cardValue}>
              {data.totalStockIn?.toLocaleString() || 0}
            </div>
          </div>
          <div style={{ ...styles.iconCircle, backgroundColor: "#ecfdf5" }}>
            <ArrowDownLeft size={22} color="#10b981" />
          </div>
        </div>

        <div className="card" style={styles.summaryCard}>
          <div>
            <span style={styles.cardLabel}>Stock Out Logs</span>
            <div style={styles.cardValue}>
              {data.totalStockOut?.toLocaleString() || 0}
            </div>
          </div>
          <div style={{ ...styles.iconCircle, backgroundColor: "#fef2f2" }}>
            <ArrowUpRight size={22} color="#ef4444" />
          </div>
        </div>

        <div className="card" style={styles.summaryCard}>
          <div>
            <span style={styles.cardLabel}>Purchases Logged</span>
            <div style={styles.cardValue}>
              {data.totalPurchases?.toLocaleString() || 0}
            </div>
          </div>
          <div style={styles.iconCircle}>
            <ShoppingCart size={22} color="#2563eb" />
          </div>
        </div>

        <div className="card" style={styles.summaryCard}>
          <div>
            <span style={styles.cardLabel}>Low Stock Alerts</span>
            <div
              style={{
                ...styles.cardValue,
                color: data.lowStockProducts?.length > 0 ? "#ef4444" : "#0f172a",
              }}
            >
              {data.lowStockProducts?.length || 0}
            </div>
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

      {/* 4. Row 3: Charts */}
      <div style={styles.chartsGrid}>
        {/* Left Bar Chart */}
        <div className="card">
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Inventory Overview</h3>
            <TrendingUp size={18} color="#64748b" />
          </div>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Pie Chart */}
        <div className="card">
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Inventory Distribution</h3>
            <Boxes size={18} color="#64748b" />
          </div>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
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

      {/* 5. Row 4: Recent Activity & Low Stock */}
      <div style={styles.bottomGrid}>
        {/* Recent Activity Card */}
        <div className="card">
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Recent Activity</h3>
            <Clock size={18} color="#64748b" />
          </div>

          {recentList.length === 0 ? (
            <p style={styles.emptyText}>No recent activity logged yet.</p>
          ) : (
            <div style={styles.activityList}>
              {recentList.map((item) => (
                <div key={item.id} style={styles.activityItem}>
                  <div style={styles.activityMain}>
                    <span style={styles.productBold}>{item.productName}</span>
                    <div style={styles.activityMeta}>
                      <span className={`badge ${item.badgeClass}`}>{item.type}</span>
                      <span style={styles.qtyText}>{item.quantity}</span>
                    </div>
                  </div>
                  <span style={styles.dateText}>{item.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "24px 24px 16px 24px", ...styles.sectionHeader }}>
            <h3 style={styles.sectionTitle}>Low Stock</h3>
            <AlertTriangle size={18} color="#ef4444" />
          </div>

          {!data.lowStockProducts || data.lowStockProducts.length === 0 ? (
            <div style={{ padding: "24px", color: "#64748b", fontSize: "14px" }}>
              No low stock items found.
            </div>
          ) : (
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
  primaryCardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
    marginBottom: "24px",
  },
  secondaryCardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  },
  summaryCard: {
    height: "105px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
  },
  cardLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  cardValue: {
    fontSize: "34px",
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 1.1,
    marginTop: "4px",
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
    marginBottom: "32px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  chartWrapper: {
    width: "100%",
    height: "260px",
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
    padding: "12px 16px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #f1f5f9",
  },
  activityMain: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  productBold: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f172a",
  },
  activityMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  qtyText: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "500",
  },
  dateText: {
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: "500",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: "14px",
    fontStyle: "italic",
    padding: "16px 0",
  },
};

export default Dashboard;
