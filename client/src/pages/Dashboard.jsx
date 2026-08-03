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
  Legend,
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
    return <Loader message="Loading dashboard metrics..." />;
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

  const PIE_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6"];

  const recentList = [
    ...(data.recentActivities?.recentStockIn?.map((item) => ({
      id: item._id,
      type: "Stock In",
      title: `Received ${item.quantity} units of ${item.product?.name || "Product"}`,
      date: new Date(item.receivedDate || item.createdAt).toLocaleDateString(),
      icon: ArrowDownLeft,
      color: "#10b981",
      bgColor: "#d1fae5",
    })) || []),
    ...(data.recentActivities?.recentStockOut?.map((item) => ({
      id: item._id,
      type: "Stock Out",
      title: `Issued ${item.quantity} units of ${item.product?.name || "Product"}`,
      date: new Date(item.issuedDate || item.createdAt).toLocaleDateString(),
      icon: ArrowUpRight,
      color: "#ef4444",
      bgColor: "#fee2e2",
    })) || []),
    ...(data.recentActivities?.recentPurchases?.map((item) => ({
      id: item._id,
      type: "Purchase",
      title: `Purchased ${item.quantity} units for $${item.totalAmount}`,
      date: new Date(item.purchaseDate || item.createdAt).toLocaleDateString(),
      icon: ShoppingCart,
      color: "#2563eb",
      bgColor: "#dbeafe",
    })) || []),
  ].slice(0, 6);

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, Admin 👋</h1>
          <p className="page-subtitle">
            Here is what's happening with your inventory and warehouses today.
          </p>
        </div>
      </div>

      {/* Row 1: Primary Summary Cards */}
      <div style={styles.statsGrid}>
        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.iconBox, backgroundColor: "#eff6ff" }}>
            <Package size={24} color="#2563eb" />
          </div>
          <div>
            <span style={styles.statLabel}>Total Products</span>
            <div style={styles.statValue}>{data.totalProducts || 0}</div>
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.iconBox, backgroundColor: "#d1fae5" }}>
            <Tags size={24} color="#059669" />
          </div>
          <div>
            <span style={styles.statLabel}>Total Categories</span>
            <div style={styles.statValue}>{data.totalCategories || 0}</div>
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.iconBox, backgroundColor: "#fef3c7" }}>
            <Truck size={24} color="#d97706" />
          </div>
          <div>
            <span style={styles.statLabel}>Total Suppliers</span>
            <div style={styles.statValue}>{data.totalSuppliers || 0}</div>
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.iconBox, backgroundColor: "#f3e8ff" }}>
            <Warehouse size={24} color="#7e22ce" />
          </div>
          <div>
            <span style={styles.statLabel}>Total Warehouses</span>
            <div style={styles.statValue}>{data.totalWarehouses || 0}</div>
          </div>
        </div>
      </div>

      {/* Row 2: Operation Stats */}
      <div style={styles.secondaryStatsGrid}>
        <div style={styles.miniStatCard}>
          <div style={styles.miniHeader}>
            <span style={styles.statLabel}>Stock In Records</span>
            <ArrowDownLeft size={18} color="#10b981" />
          </div>
          <span style={styles.miniValue}>{data.totalStockIn || 0}</span>
        </div>

        <div style={styles.miniStatCard}>
          <div style={styles.miniHeader}>
            <span style={styles.statLabel}>Stock Out Records</span>
            <ArrowUpRight size={18} color="#ef4444" />
          </div>
          <span style={styles.miniValue}>{data.totalStockOut || 0}</span>
        </div>

        <div style={styles.miniStatCard}>
          <div style={styles.miniHeader}>
            <span style={styles.statLabel}>Total Purchases</span>
            <ShoppingCart size={18} color="#2563eb" />
          </div>
          <span style={styles.miniValue}>{data.totalPurchases || 0}</span>
        </div>

        <div style={styles.miniStatCard}>
          <div style={styles.miniHeader}>
            <span style={styles.statLabel}>Low Stock Items</span>
            <AlertTriangle
              size={18}
              color={data.lowStockProducts?.length > 0 ? "#ef4444" : "#10b981"}
            />
          </div>
          <span
            style={{
              ...styles.miniValue,
              color: data.lowStockProducts?.length > 0 ? "#ef4444" : "#0f172a",
            }}
          >
            {data.lowStockProducts?.length || 0}
          </span>
        </div>
      </div>

      {/* Row 3: Recharts Charts */}
      <div style={styles.chartsGrid}>
        {/* Left Bar Chart */}
        <div className="card" style={styles.chartCard}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Inventory Operations Overview</h3>
              <p style={styles.cardSubtitle}>
                Comparison of purchases vs stock movement
              </p>
            </div>
            <TrendingUp size={20} color="#2563eb" />
          </div>
          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Pie Chart */}
        <div className="card" style={styles.chartCard}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>System Entity Share</h3>
              <p style={styles.cardSubtitle}>
                Distribution across products, suppliers & warehouses
              </p>
            </div>
            <Boxes size={20} color="#10b981" />
          </div>
          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Activity & Low Stock Items */}
      <div style={styles.tablesGrid}>
        {/* Recent Activity Column */}
        <div className="card">
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Recent Activity Log</h3>
              <p style={styles.cardSubtitle}>Latest transactions across stock & purchases</p>
            </div>
            <Clock size={20} color="#64748b" />
          </div>

          {recentList.length === 0 ? (
            <p style={styles.emptyText}>No recent activity logged yet.</p>
          ) : (
            <div style={styles.timeline}>
              {recentList.map((act) => {
                const IconComponent = act.icon;
                return (
                  <div key={act.id} style={styles.timelineItem}>
                    <div style={{ ...styles.actIcon, backgroundColor: act.bgColor }}>
                      <IconComponent size={16} color={act.color} />
                    </div>
                    <div style={styles.actDetails}>
                      <span style={styles.actTitle}>{act.title}</span>
                      <span style={styles.actDate}>{act.date}</span>
                    </div>
                    <span className="badge badge-primary">{act.type}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Low Stock Items Column */}
        <div className="card">
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Low Stock Items</h3>
              <p style={styles.cardSubtitle}>
                Products at or below reorder threshold
              </p>
            </div>
            <AlertTriangle size={20} color="#ef4444" />
          </div>

          {!data.lowStockProducts || data.lowStockProducts.length === 0 ? (
            <div style={styles.healthyBox}>
              <span style={{ fontSize: "1.5rem" }}>🎉</span>
              <p style={{ margin: 0, fontWeight: "600", color: "#065f46" }}>
                All product stock levels are healthy!
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Qty</th>
                    <th>Reorder</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockProducts.map((prod) => (
                    <tr key={prod._id}>
                      <td style={{ fontWeight: "600" }}>{prod.name}</td>
                      <td style={{ color: "#64748b" }}>{prod.sku}</td>
                      <td style={{ fontWeight: "700", color: "#ef4444" }}>
                        {prod.quantity}
                      </td>
                      <td>{prod.reorderLevel}</td>
                      <td>
                        <span className="badge badge-danger">LOW STOCK</span>
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
    gap: "1rem",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#ef4444",
    padding: "1rem",
    borderRadius: "12px",
    marginBottom: "1.5rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1.25rem",
    marginBottom: "1.25rem",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
    padding: "1.25rem 1.5rem",
  },
  iconBox: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: "0.825rem",
    color: "#64748b",
    fontWeight: "600",
  },
  statValue: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 1.1,
    marginTop: "0.2rem",
  },
  secondaryStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  miniStatCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "1rem 1.25rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  miniHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  miniValue: {
    fontSize: "1.35rem",
    fontWeight: "800",
    color: "#0f172a",
    marginTop: "0.4rem",
    display: "block",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  },
  chartCard: {
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.25rem",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  cardSubtitle: {
    fontSize: "0.825rem",
    color: "#64748b",
    marginTop: "0.2rem",
  },
  chartContainer: {
    width: "100%",
    height: "260px",
  },
  tablesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
    gap: "1.5rem",
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
    marginTop: "0.5rem",
  },
  timelineItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.85rem",
    padding: "0.65rem 0.85rem",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #f1f5f9",
  },
  actIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  actDetails: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  actTitle: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#0f172a",
  },
  actDate: {
    fontSize: "0.75rem",
    color: "#94a3b8",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    fontStyle: "italic",
    padding: "1rem 0",
  },
  healthyBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    backgroundColor: "#ecfdf5",
    border: "1px solid #a7f3d0",
    padding: "1.25rem",
    borderRadius: "12px",
    marginTop: "0.5rem",
  },
};

export default Dashboard;
