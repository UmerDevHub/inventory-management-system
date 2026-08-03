import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Package,
  ShoppingCart,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  Download,
  Printer,
  DollarSign,
  Boxes,
} from "lucide-react";
import API from "../api/axios";
import Table from "../components/Table";
import Loader from "../components/Loader";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("stock");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  const fetchReport = async (tabKey) => {
    try {
      setLoading(true);
      let endpoint = "/reports/current-stock";
      if (tabKey === "purchases") endpoint = "/reports/purchases";
      if (tabKey === "stock-in") endpoint = "/reports/stock-in";
      if (tabKey === "stock-out") endpoint = "/reports/stock-out";
      if (tabKey === "low-stock") endpoint = "/reports/low-stock";

      const res = await API.get(endpoint);
      setReportData(res.data);
    } catch (err) {
      console.error("Failed to fetch report data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab]);

  const handleExportCSV = () => {
    if (!reportData) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    let rows = [];

    if (activeTab === "stock") {
      rows.push(["Product Name", "SKU", "Category", "Warehouse", "Price", "Quantity", "Total Value"]);
      reportData.products?.forEach((p) => {
        rows.push([
          `"${p.name}"`,
          p.sku,
          `"${p.category?.name || "N/A"}"`,
          `"${p.warehouse?.name || "N/A"}"`,
          p.price,
          p.quantity,
          (p.quantity * p.price).toFixed(2),
        ]);
      });
    } else if (activeTab === "purchases") {
      rows.push(["Purchase Date", "Product", "Supplier", "Unit Price", "Quantity", "Total Spent"]);
      reportData.purchases?.forEach((p) => {
        rows.push([
          new Date(p.purchaseDate || p.createdAt).toLocaleDateString(),
          `"${p.product?.name || "N/A"}"`,
          `"${p.supplier?.name || "N/A"}"`,
          p.price,
          p.quantity,
          p.totalAmount,
        ]);
      });
    } else if (activeTab === "stock-in") {
      rows.push(["Received Date", "Product", "SKU", "Quantity Received", "Notes"]);
      reportData.stockInRecords?.forEach((s) => {
        rows.push([
          new Date(s.receivedDate || s.createdAt).toLocaleDateString(),
          `"${s.product?.name || "N/A"}"`,
          s.product?.sku || "N/A",
          s.quantity,
          `"${s.notes || ""}"`,
        ]);
      });
    } else if (activeTab === "stock-out") {
      rows.push(["Issued Date", "Product", "SKU", "Quantity Issued", "Notes"]);
      reportData.stockOutRecords?.forEach((s) => {
        rows.push([
          new Date(s.issuedDate || s.createdAt).toLocaleDateString(),
          `"${s.product?.name || "N/A"}"`,
          s.product?.sku || "N/A",
          s.quantity,
          `"${s.notes || ""}"`,
        ]);
      });
    } else if (activeTab === "low-stock") {
      rows.push(["Product Name", "SKU", "Category", "Current Stock", "Reorder Level"]);
      reportData.lowStockProducts?.forEach((p) => {
        rows.push([
          `"${p.name}"`,
          p.sku,
          `"${p.category?.name || "N/A"}"`,
          p.quantity,
          p.reorderLevel,
        ]);
      });
    }

    csvContent += rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab}_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { key: "stock", label: "Current Stock", icon: Package },
    { key: "purchases", label: "Purchases Report", icon: ShoppingCart },
    { key: "stock-in", label: "Stock In Report", icon: ArrowDownLeft },
    { key: "stock-out", label: "Stock Out Report", icon: ArrowUpRight },
    { key: "low-stock", label: "Low Stock Alerts", icon: AlertTriangle },
  ];

  const renderTable = () => {
    if (!reportData) return null;

    if (activeTab === "stock") {
      const columns = [
        { header: "Product Item", render: (r) => <span style={{ fontWeight: "700" }}>{r.name}</span> },
        { header: "SKU", render: (r) => <span style={{ fontFamily: "monospace", color: "#64748b" }}>{r.sku}</span> },
        { header: "Category", render: (r) => <span className="badge badge-primary">{r.category?.name || "N/A"}</span> },
        { header: "Warehouse", render: (r) => <span>{r.warehouse?.name || "N/A"}</span> },
        { header: "Price", render: (r) => <span>${Number(r.price).toFixed(2)}</span> },
        { header: "Stock Quantity", render: (r) => <span style={{ fontWeight: "700" }}>{r.quantity} units</span> },
        {
          header: "Inventory Value",
          render: (r) => (
            <span style={{ fontWeight: "800", color: "#0f172a" }}>
              ${(r.quantity * r.price).toFixed(2)}
            </span>
          ),
        },
      ];
      return <Table columns={columns} data={reportData.products || []} />;
    }

    if (activeTab === "purchases") {
      const columns = [
        { header: "Date", render: (r) => new Date(r.purchaseDate || r.createdAt).toLocaleDateString() },
        { header: "Product Item", render: (r) => <span style={{ fontWeight: "700" }}>{r.product?.name || "Deleted"}</span> },
        { header: "Supplier", render: (r) => <span>{r.supplier?.name || "N/A"}</span> },
        { header: "Unit Price", render: (r) => <span>${Number(r.price).toFixed(2)}</span> },
        { header: "Quantity", render: (r) => <span className="badge badge-primary">+{r.quantity}</span> },
        { header: "Total Spent", render: (r) => <span style={{ fontWeight: "800" }}>${Number(r.totalAmount).toFixed(2)}</span> },
      ];
      return <Table columns={columns} data={reportData.purchases || []} />;
    }

    if (activeTab === "stock-in") {
      const columns = [
        { header: "Received Date", render: (r) => new Date(r.receivedDate || r.createdAt).toLocaleDateString() },
        { header: "Product Item", render: (r) => <span style={{ fontWeight: "700" }}>{r.product?.name || "Deleted"}</span> },
        { header: "SKU", render: (r) => <span style={{ fontFamily: "monospace" }}>{r.product?.sku || "N/A"}</span> },
        { header: "Quantity Added", render: (r) => <span className="badge badge-success">+{r.quantity} units</span> },
        { header: "Notes", render: (r) => <span style={{ color: "#64748b" }}>{r.notes || "No notes"}</span> },
      ];
      return <Table columns={columns} data={reportData.stockInRecords || []} />;
    }

    if (activeTab === "stock-out") {
      const columns = [
        { header: "Issued Date", render: (r) => new Date(r.issuedDate || r.createdAt).toLocaleDateString() },
        { header: "Product Item", render: (r) => <span style={{ fontWeight: "700" }}>{r.product?.name || "Deleted"}</span> },
        { header: "SKU", render: (r) => <span style={{ fontFamily: "monospace" }}>{r.product?.sku || "N/A"}</span> },
        { header: "Quantity Issued", render: (r) => <span className="badge badge-danger">-{r.quantity} units</span> },
        { header: "Notes", render: (r) => <span style={{ color: "#64748b" }}>{r.notes || "No notes"}</span> },
      ];
      return <Table columns={columns} data={reportData.stockOutRecords || []} />;
    }

    if (activeTab === "low-stock") {
      const columns = [
        { header: "Product Item", render: (r) => <span style={{ fontWeight: "700" }}>{r.name}</span> },
        { header: "SKU", render: (r) => <span style={{ fontFamily: "monospace" }}>{r.sku}</span> },
        { header: "Category", render: (r) => <span className="badge badge-primary">{r.category?.name || "N/A"}</span> },
        { header: "Current Stock", render: (r) => <span style={{ fontWeight: "800", color: "#ef4444" }}>{r.quantity}</span> },
        { header: "Reorder Threshold", render: (r) => <span>{r.reorderLevel}</span> },
        { header: "Status", render: () => <span className="badge badge-danger">CRITICAL LOW</span> },
      ];
      return <Table columns={columns} data={reportData.lowStockProducts || []} />;
    }

    return null;
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Reports</h1>
          <p className="page-subtitle">
            Exportable financial, stock level, movement, and procurement audit reports
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={() => window.print()} className="btn btn-secondary">
            <Printer size={16} />
            <span>Print Report</span>
          </button>
          <button onClick={handleExportCSV} className="btn btn-primary">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                ...styles.tabBtn,
                ...(isActive ? styles.activeTabBtn : {}),
              }}
            >
              <Icon size={16} color={isActive ? "#ffffff" : "#64748b"} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Top Metrics Cards for Active Tab */}
      {reportData && !loading && (
        <div style={styles.metricsGrid}>
          {activeTab === "stock" && (
            <>
              <div className="card" style={styles.metricCard}>
                <span style={styles.metricLabel}>Total Products Listed</span>
                <span style={styles.metricValue}>{reportData.totalProducts || 0}</span>
              </div>
              <div className="card" style={styles.metricCard}>
                <span style={styles.metricLabel}>Total Inventory Stock Units</span>
                <span style={styles.metricValue}>{reportData.totalStockQuantity || 0}</span>
              </div>
              <div className="card" style={styles.metricCard}>
                <span style={styles.metricLabel}>Total Stock Valuation ($)</span>
                <span style={{ ...styles.metricValue, color: "#2563eb" }}>
                  ${Number(reportData.totalStockValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </>
          )}

          {activeTab === "purchases" && (
            <>
              <div className="card" style={styles.metricCard}>
                <span style={styles.metricLabel}>Total Purchase Orders</span>
                <span style={styles.metricValue}>{reportData.totalPurchasesCount || 0}</span>
              </div>
              <div className="card" style={styles.metricCard}>
                <span style={styles.metricLabel}>Total Procurement Spent ($)</span>
                <span style={{ ...styles.metricValue, color: "#2563eb" }}>
                  ${Number(reportData.totalAmountSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </>
          )}

          {activeTab === "stock-in" && (
            <>
              <div className="card" style={styles.metricCard}>
                <span style={styles.metricLabel}>Total Stock In Logs</span>
                <span style={styles.metricValue}>{reportData.totalStockInCount || 0}</span>
              </div>
              <div className="card" style={styles.metricCard}>
                <span style={styles.metricLabel}>Total Units Received</span>
                <span style={{ ...styles.metricValue, color: "#10b981" }}>
                  +{reportData.totalQuantityReceived || 0} units
                </span>
              </div>
            </>
          )}

          {activeTab === "stock-out" && (
            <>
              <div className="card" style={styles.metricCard}>
                <span style={styles.metricLabel}>Total Stock Out Logs</span>
                <span style={styles.metricValue}>{reportData.totalStockOutCount || 0}</span>
              </div>
              <div className="card" style={styles.metricCard}>
                <span style={styles.metricLabel}>Total Units Issued</span>
                <span style={{ ...styles.metricValue, color: "#ef4444" }}>
                  -{reportData.totalQuantityIssued || 0} units
                </span>
              </div>
            </>
          )}

          {activeTab === "low-stock" && (
            <div className="card" style={styles.metricCard}>
              <span style={styles.metricLabel}>Low Stock Alert Count</span>
              <span style={{ ...styles.metricValue, color: "#ef4444" }}>
                {reportData.totalLowStockProducts || 0} products
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Table */}
      {loading ? (
        <Loader message="Generating report data..." />
      ) : (
        renderTable()
      )}
    </div>
  );
};

const styles = {
  tabsContainer: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
    overflowX: "auto",
    paddingBottom: "0.25rem",
  },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.65rem 1.15rem",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#64748b",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s ease",
  },
  activeTabBtn: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderColor: "#2563eb",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.25rem",
    marginBottom: "1.5rem",
  },
  metricCard: {
    padding: "1.25rem 1.5rem",
  },
  metricLabel: {
    fontSize: "0.825rem",
    color: "#64748b",
    fontWeight: "600",
  },
  metricValue: {
    fontSize: "1.65rem",
    fontWeight: "800",
    color: "#0f172a",
    display: "block",
    marginTop: "0.25rem",
  },
};

export default Reports;
