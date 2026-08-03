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
  FileText,
  DollarSign,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import API from "../api/axios";
import Table from "../components/Table";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loader";
import { exportToCSV } from "../utils/csvExport";
import { exportToPDF } from "../utils/pdfExport";
import { compactNumber, compactCurrency } from "../utils/formatNumber";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("stock");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

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
      setCurrentPage(1);
      setSearchTerm("");
    } catch (err) {
      console.error("Failed to fetch report data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab]);

  const filterByDate = (dateString) => {
    if (!dateString || dateFilter === "all") return true;
    const date = new Date(dateString);
    const now = new Date();

    if (dateFilter === "today") {
      return date.toDateString() === now.toDateString();
    }
    if (dateFilter === "7days") {
      return now - date <= 7 * 24 * 60 * 60 * 1000;
    }
    if (dateFilter === "30days") {
      return now - date <= 30 * 24 * 60 * 60 * 1000;
    }
    if (dateFilter === "month") {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // Filtered Dataset Computation
  const getFilteredData = () => {
    if (!reportData) return [];

    if (activeTab === "stock") {
      return (reportData.products || []).filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (activeTab === "purchases") {
      return (reportData.purchases || []).filter((p) => {
        const matchesSearch =
          (p.product?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.supplier?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = filterByDate(p.purchaseDate || p.createdAt);
        return matchesSearch && matchesDate;
      });
    }
    if (activeTab === "stock-in") {
      return (reportData.stockInRecords || []).filter((s) => {
        const matchesSearch =
          (s.product?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.notes || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = filterByDate(s.receivedDate || s.createdAt);
        return matchesSearch && matchesDate;
      });
    }
    if (activeTab === "stock-out") {
      return (reportData.stockOutRecords || []).filter((s) => {
        const matchesSearch =
          (s.product?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.notes || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = filterByDate(s.issuedDate || s.createdAt);
        return matchesSearch && matchesDate;
      });
    }
    if (activeTab === "low-stock") {
      return (reportData.lowStockProducts || []).filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return [];
  };

  const filteredDataset = getFilteredData();

  // CSV Export Trigger
  const handleCSVExport = () => {
    if (activeTab === "stock") {
      const headers = ["Product Name", "SKU", "Category", "Warehouse", "Unit Price", "Stock Quantity", "Total Value"];
      const rows = filteredDataset.map((p) => [
        p.name,
        p.sku?.toUpperCase() || "N/A",
        p.category?.name || "N/A",
        p.warehouse?.name || "Central Warehouse",
        `$${Number(p.price).toFixed(2)}`,
        p.quantity,
        `$${(p.quantity * p.price).toFixed(2)}`,
      ]);
      exportToCSV("Current-Stock-Report", headers, rows);
    } else if (activeTab === "purchases") {
      const headers = ["Purchase Date", "Product Name", "Supplier", "Unit Price", "Quantity", "Total Spent"];
      const rows = filteredDataset.map((p) => [
        new Date(p.purchaseDate || p.createdAt).toLocaleDateString(),
        p.product?.name || "N/A",
        p.supplier?.name || "N/A",
        `$${Number(p.price).toFixed(2)}`,
        p.quantity,
        `$${Number(p.totalAmount).toFixed(2)}`,
      ]);
      exportToCSV("Purchase-Report", headers, rows);
    } else if (activeTab === "stock-in") {
      const headers = ["Received Date", "Product Name", "SKU", "Quantity Received", "Notes"];
      const rows = filteredDataset.map((s) => [
        new Date(s.receivedDate || s.createdAt).toLocaleDateString(),
        s.product?.name || "N/A",
        s.product?.sku?.toUpperCase() || "N/A",
        `+${s.quantity} units`,
        s.notes || "N/A",
      ]);
      exportToCSV("Stock-In-Report", headers, rows);
    } else if (activeTab === "stock-out") {
      const headers = ["Issued Date", "Product Name", "SKU", "Quantity Issued", "Notes"];
      const rows = filteredDataset.map((s) => [
        new Date(s.issuedDate || s.createdAt).toLocaleDateString(),
        s.product?.name || "N/A",
        s.product?.sku?.toUpperCase() || "N/A",
        `-${s.quantity} units`,
        s.notes || "N/A",
      ]);
      exportToCSV("Stock-Out-Report", headers, rows);
    } else if (activeTab === "low-stock") {
      const headers = ["Product Name", "SKU", "Category", "Warehouse", "Current Stock", "Reorder Level"];
      const rows = filteredDataset.map((p) => [
        p.name,
        p.sku?.toUpperCase() || "N/A",
        p.category?.name || "N/A",
        p.warehouse?.name || "Central Warehouse",
        p.quantity,
        p.reorderLevel,
      ]);
      exportToCSV("Low-Stock-Alerts-Report", headers, rows);
    }
  };

  // PDF Export Trigger
  const handlePDFExport = () => {
    if (activeTab === "stock") {
      const totalUnits = filteredDataset.reduce((sum, p) => sum + p.quantity, 0);
      const totalVal = filteredDataset.reduce((sum, p) => sum + p.quantity * p.price, 0);

      exportToPDF({
        title: "Current Inventory Stock Valuation Report",
        subtitle: "Audit report of active product stock quantities and inventory valuation",
        summaryItems: [
          { label: "Products Listed", value: filteredDataset.length },
          { label: "Total Units Available", value: `${totalUnits} Units` },
          { label: "Inventory Valuation", value: `$${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
        ],
        headers: ["Product Name", "SKU", "Category", "Warehouse", "Price", "Stock Qty", "Total Value"],
        rows: filteredDataset.map((p) => [
          p.name,
          p.sku?.toUpperCase() || "N/A",
          p.category?.name || "N/A",
          p.warehouse?.name || "Central Warehouse",
          `$${Number(p.price).toFixed(2)}`,
          `${p.quantity} units`,
          `$${(p.quantity * p.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        ]),
        filename: "Current-Stock-Valuation-Report",
      });
    } else if (activeTab === "purchases") {
      const totalSpent = filteredDataset.reduce((sum, p) => sum + p.totalAmount, 0);

      exportToPDF({
        title: "Purchase Expenditure & Procurement Report",
        subtitle: "Audit report of supplier orders, quantities, and purchasing expenditure",
        summaryItems: [
          { label: "Orders Fulfilled", value: filteredDataset.length },
          { label: "Total Procurement Spend", value: `$${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
        ],
        headers: ["Purchase Date", "Product Name", "Supplier", "Unit Price", "Quantity", "Total Spent"],
        rows: filteredDataset.map((p) => [
          new Date(p.purchaseDate || p.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          p.product?.name || "N/A",
          p.supplier?.name || "N/A",
          `$${Number(p.price).toFixed(2)}`,
          `${p.quantity} units`,
          `$${Number(p.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        ]),
        filename: "Purchase-Procurement-Report",
      });
    } else if (activeTab === "stock-in") {
      const totalReceived = filteredDataset.reduce((sum, s) => sum + s.quantity, 0);

      exportToPDF({
        title: "Inbound Inventory Stock In Report",
        subtitle: "Audit report of received product receipts and stock replenishments",
        summaryItems: [
          { label: "Receipt Logs", value: filteredDataset.length },
          { label: "Units Received", value: `+${totalReceived} Units` },
        ],
        headers: ["Received Date", "Product Name", "SKU", "Quantity Received", "Notes / Remarks"],
        rows: filteredDataset.map((s) => [
          new Date(s.receivedDate || s.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          s.product?.name || "N/A",
          s.product?.sku?.toUpperCase() || "N/A",
          `+${s.quantity} units`,
          s.notes || "Inbound stock entry",
        ]),
        filename: "Stock-In-Receipts-Report",
      });
    } else if (activeTab === "stock-out") {
      const totalIssued = filteredDataset.reduce((sum, s) => sum + s.quantity, 0);

      exportToPDF({
        title: "Outbound Inventory Stock Out Report",
        subtitle: "Audit report of dispatched product shipments and order fulfillment",
        summaryItems: [
          { label: "Dispatch Logs", value: filteredDataset.length },
          { label: "Units Dispatched", value: `-${totalIssued} Units` },
        ],
        headers: ["Issued Date", "Product Name", "SKU", "Quantity Issued", "Notes / Remarks"],
        rows: filteredDataset.map((s) => [
          new Date(s.issuedDate || s.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          s.product?.name || "N/A",
          s.product?.sku?.toUpperCase() || "N/A",
          `-${s.quantity} units`,
          s.notes || "Outbound stock issue",
        ]),
        filename: "Stock-Out-Dispatches-Report",
      });
    } else if (activeTab === "low-stock") {
      exportToPDF({
        title: "Critical Low Stock Alerts Report",
        subtitle: "Audit report of products at or below designated reorder levels",
        summaryItems: [
          { label: "Critical Products", value: filteredDataset.length },
        ],
        headers: ["Product Name", "SKU", "Category", "Warehouse", "Current Stock", "Reorder Threshold"],
        rows: filteredDataset.map((p) => [
          p.name,
          p.sku?.toUpperCase() || "N/A",
          p.category?.name || "N/A",
          p.warehouse?.name || "Central Warehouse",
          `${p.quantity} units`,
          `${p.reorderLevel} units`,
        ]),
        filename: "Low-Stock-Alerts-Report",
      });
    }
  };

  const tabs = [
    { key: "stock", label: "Current Stock", icon: Package },
    { key: "purchases", label: "Purchases Report", icon: ShoppingCart },
    { key: "stock-in", label: "Stock In Report", icon: ArrowDownLeft },
    { key: "stock-out", label: "Stock Out Report", icon: ArrowUpRight },
    { key: "low-stock", label: "Low Stock Alerts", icon: AlertTriangle },
  ];

  // Pagination Logic
  const totalPages = Math.ceil(filteredDataset.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDisplayedDataset = filteredDataset.slice(indexOfFirstItem, indexOfLastItem);

  const renderChart = () => {
    if (!reportData) return null;

    if (activeTab === "stock") {
      const chartData = (filteredDataset || []).slice(0, 5).map((p) => ({
        name: p.name,
        value: p.quantity,
      }));
      return (
        <div className="card" style={{ padding: "24px", marginBottom: "28px" }}>
          <h3 style={styles.chartTitle}>Stock Distribution by Product</h3>
          <p style={styles.chartSub}>Breakdown of available stock units across inventory items</p>
          <div style={{ width: "100%", height: "260px" }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={13} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={13} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (activeTab === "purchases") {
      const chartData = (filteredDataset || []).slice(0, 5).map((p) => ({
        name: p.product?.name || "Order",
        spent: p.totalAmount,
      }));
      return (
        <div className="card" style={{ padding: "24px", marginBottom: "28px" }}>
          <h3 style={styles.chartTitle}>Purchase Expenditure Breakdown</h3>
          <p style={styles.chartSub}>Procurement spend per purchase order transaction</p>
          <div style={{ width: "100%", height: "260px" }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={13} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={13} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="spent" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderTable = () => {
    if (activeTab === "stock") {
      const columns = [
        { header: "Product", render: (r) => <span style={{ fontWeight: "700", color: "#0f172a" }}>{r.name}</span> },
        { header: "SKU", render: (r) => <span style={{ fontFamily: "monospace", color: "#64748b" }}>{r.sku?.toUpperCase()}</span> },
        { header: "Category", render: (r) => <span className="badge badge-primary">{r.category?.name || "N/A"}</span> },
        { header: "Warehouse", render: (r) => <span>{r.warehouse?.name || "Central Warehouse"}</span> },
        { header: "Price", render: (r) => <span>${Number(r.price).toFixed(2)}</span> },
        { header: "Stock Quantity", render: (r) => <span style={{ fontWeight: "700" }}>{r.quantity} units</span> },
        {
          header: "Inventory Value",
          render: (r) => (
            <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "16px" }}>
              ${(r.quantity * r.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          ),
        },
      ];
      return <Table columns={columns} data={currentDisplayedDataset} />;
    }

    if (activeTab === "purchases") {
      const columns = [
        { header: "Date", render: (r) => new Date(r.purchaseDate || r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
        { header: "Product", render: (r) => <span style={{ fontWeight: "700" }}>{r.product?.name || "Deleted"}</span> },
        { header: "Supplier", render: (r) => <span>{r.supplier?.name || "N/A"}</span> },
        { header: "Unit Price", render: (r) => <span>${Number(r.price).toFixed(2)}</span> },
        { header: "Quantity", render: (r) => <span className="badge badge-primary">+{r.quantity}</span> },
        { header: "Total Spent", render: (r) => <span style={{ fontWeight: "800", fontSize: "16px" }}>${Number(r.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> },
      ];
      return <Table columns={columns} data={currentDisplayedDataset} />;
    }

    if (activeTab === "stock-in") {
      const columns = [
        { header: "Received Date", render: (r) => new Date(r.receivedDate || r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
        { header: "Product", render: (r) => <span style={{ fontWeight: "700" }}>{r.product?.name || "Deleted"}</span> },
        { header: "SKU", render: (r) => <span style={{ fontFamily: "monospace" }}>{r.product?.sku?.toUpperCase() || "N/A"}</span> },
        { header: "Quantity Added", render: (r) => <span className="badge badge-success">+{r.quantity} units</span> },
        { header: "Notes", render: (r) => <span style={{ color: "#64748b" }}>{r.notes || "No notes"}</span> },
      ];
      return <Table columns={columns} data={currentDisplayedDataset} />;
    }

    if (activeTab === "stock-out") {
      const columns = [
        { header: "Issued Date", render: (r) => new Date(r.issuedDate || r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
        { header: "Product", render: (r) => <span style={{ fontWeight: "700" }}>{r.product?.name || "Deleted"}</span> },
        { header: "SKU", render: (r) => <span style={{ fontFamily: "monospace" }}>{r.product?.sku?.toUpperCase() || "N/A"}</span> },
        { header: "Quantity Issued", render: (r) => <span className="badge badge-danger">-{r.quantity} units</span> },
        { header: "Notes", render: (r) => <span style={{ color: "#64748b" }}>{r.notes || "No notes"}</span> },
      ];
      return <Table columns={columns} data={currentDisplayedDataset} />;
    }

    if (activeTab === "low-stock") {
      const columns = [
        { header: "Product", render: (r) => <span style={{ fontWeight: "700" }}>{r.name}</span> },
        { header: "SKU", render: (r) => <span style={{ fontFamily: "monospace" }}>{r.sku?.toUpperCase()}</span> },
        { header: "Category", render: (r) => <span className="badge badge-primary">{r.category?.name || "N/A"}</span> },
        { header: "Current Stock", render: (r) => <span style={{ fontWeight: "800", color: "#ef4444" }}>{r.quantity}</span> },
        { header: "Reorder Threshold", render: (r) => <span>{r.reorderLevel}</span> },
        { header: "Status", render: () => <span className="badge badge-danger">● Low Stock</span> },
      ];
      return <Table columns={columns} data={currentDisplayedDataset} />;
    }

    return null;
  };

  return (
    <div className="fade-in">
      {/* Header & Export Action Button Group */}
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="page-title">Inventory Reports</h1>
          <p className="page-subtitle">
            Generate inventory, purchasing, stock movement, and valuation reports.
          </p>
        </div>

        <div style={styles.btnGroup} className="no-print">
          <button onClick={() => window.print()} className="btn btn-secondary" style={styles.actionBtn}>
            <Printer size={16} />
            <span>Print Report</span>
          </button>

          <button onClick={handleCSVExport} className="btn btn-secondary" style={styles.actionBtn}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          <button onClick={handlePDFExport} className="btn btn-primary" style={styles.actionBtn}>
            <FileText size={16} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={styles.tabsContainer} className="no-print">
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

      {/* Top Summary Metrics Cards */}
      {reportData && !loading && (
        <div style={styles.metricsGrid}>
          {activeTab === "stock" && (
            <>
              <div className="card" style={styles.metricCard}>
                <div style={styles.metricCardLeft}>
                  <span style={styles.metricLabel}>PRODUCTS</span>
                  <span style={styles.metricValue}>{filteredDataset.length} Listed</span>
                </div>
                <div style={styles.iconCircle}>
                  <Package size={22} color="#2563eb" />
                </div>
              </div>
              <div className="card" style={styles.metricCard}>
                <div style={styles.metricCardLeft}>
                  <span style={styles.metricLabel}>STOCK UNITS</span>
                  <span style={styles.metricValue}>
                    {filteredDataset.reduce((sum, p) => sum + p.quantity, 0)} Available
                  </span>
                </div>
                <div style={styles.iconCircle}>
                  <Boxes size={22} color="#2563eb" />
                </div>
              </div>
              <div className="card" style={styles.metricCard}>
                <div style={styles.metricCardLeft}>
                  <span style={styles.metricLabel}>INVENTORY VALUE</span>
                  <span style={{ ...styles.metricValue, color: "#2563eb" }}>
                    {compactCurrency(
                      filteredDataset.reduce((sum, p) => sum + p.quantity * p.price, 0)
                    )}
                  </span>
                </div>
                <div style={styles.iconCircle}>
                  <DollarSign size={22} color="#2563eb" />
                </div>
              </div>
            </>
          )}

          {activeTab === "purchases" && (
            <>
              <div className="card" style={styles.metricCard}>
                <div style={styles.metricCardLeft}>
                  <span style={styles.metricLabel}>PURCHASES</span>
                  <span style={styles.metricValue}>{filteredDataset.length} Orders</span>
                </div>
                <div style={styles.iconCircle}>
                  <ShoppingCart size={22} color="#2563eb" />
                </div>
              </div>
              <div className="card" style={styles.metricCard}>
                <div style={styles.metricCardLeft}>
                  <span style={styles.metricLabel}>TOTAL EXPENDITURE</span>
                  <span style={{ ...styles.metricValue, color: "#2563eb" }}>
                    {compactCurrency(
                      filteredDataset.reduce((sum, p) => sum + p.totalAmount, 0)
                    )}
                  </span>
                </div>
                <div style={styles.iconCircle}>
                  <DollarSign size={22} color="#2563eb" />
                </div>
              </div>
            </>
          )}

          {activeTab === "stock-in" && (
            <>
              <div className="card" style={styles.metricCard}>
                <div style={styles.metricCardLeft}>
                  <span style={styles.metricLabel}>STOCK IN LOGS</span>
                  <span style={styles.metricValue}>{filteredDataset.length} Receipts</span>
                </div>
                <div style={{ ...styles.iconCircle, backgroundColor: "#ecfdf5" }}>
                  <ArrowDownLeft size={22} color="#10b981" />
                </div>
              </div>
              <div className="card" style={styles.metricCard}>
                <div style={styles.metricCardLeft}>
                  <span style={styles.metricLabel}>UNITS RECEIVED</span>
                  <span style={{ ...styles.metricValue, color: "#10b981" }}>
                    +{compactNumber(filteredDataset.reduce((sum, s) => sum + s.quantity, 0))} Units
                  </span>
                </div>
                <div style={{ ...styles.iconCircle, backgroundColor: "#ecfdf5" }}>
                  <Boxes size={22} color="#10b981" />
                </div>
              </div>
            </>
          )}

          {activeTab === "stock-out" && (
            <>
              <div className="card" style={styles.metricCard}>
                <div style={styles.metricCardLeft}>
                  <span style={styles.metricLabel}>STOCK OUT LOGS</span>
                  <span style={styles.metricValue}>{filteredDataset.length} Issues</span>
                </div>
                <div style={{ ...styles.iconCircle, backgroundColor: "#fef2f2" }}>
                  <ArrowUpRight size={22} color="#ef4444" />
                </div>
              </div>
              <div className="card" style={styles.metricCard}>
                <div style={styles.metricCardLeft}>
                  <span style={styles.metricLabel}>UNITS ISSUED</span>
                  <span style={{ ...styles.metricValue, color: "#ef4444" }}>
                    -{compactNumber(filteredDataset.reduce((sum, s) => sum + s.quantity, 0))} Units
                  </span>
                </div>
                <div style={{ ...styles.iconCircle, backgroundColor: "#fef2f2" }}>
                  <Boxes size={22} color="#ef4444" />
                </div>
              </div>
            </>
          )}

          {activeTab === "low-stock" && (
            <div className="card" style={styles.metricCard}>
              <div style={styles.metricCardLeft}>
                <span style={styles.metricLabel}>LOW STOCK ALERTS</span>
                <span style={{ ...styles.metricValue, color: "#ef4444" }}>
                  {filteredDataset.length} Items
                </span>
              </div>
              <div style={{ ...styles.iconCircle, backgroundColor: "#fef2f2" }}>
                <AlertTriangle size={22} color="#ef4444" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Chart above Table */}
      {!loading && renderChart()}

      {/* Toolbar Search Bar & Date Filter */}
      <div style={styles.toolbar} className="no-print">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          placeholder="Search report dataset..."
        />

        {(activeTab === "purchases" || activeTab === "stock-in" || activeTab === "stock-out") && (
          <div style={styles.dateFilterBox}>
            <Calendar size={16} color="#64748b" />
            <select
              className="form-select"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={styles.filterSelect}
            >
              <option value="all">Date: All Time</option>
              <option value="today">Date: Today</option>
              <option value="7days">Date: Last 7 Days</option>
              <option value="30days">Date: Last 30 Days</option>
              <option value="month">Date: This Month</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Table View */}
      {loading ? (
        <Loader message="Generating report data..." />
      ) : filteredDataset.length === 0 ? (
        <div style={styles.emptyCard} className="card">
          <div style={styles.emptyIconCircle}>
            <BarChart3 size={32} color="#94a3b8" />
          </div>
          <h3 style={styles.emptyTitle}>No report data available</h3>
          <p style={styles.emptySub}>
            No records matched your search or date filter.
          </p>
        </div>
      ) : (
        <>
          {renderTable()}

          {/* Pagination Footer */}
          {filteredDataset.length > 0 && (
            <div style={styles.paginationFooter} className="no-print">
              <span style={styles.paginationText}>
                Showing <strong>{indexOfFirstItem + 1}</strong>–
                <strong>{Math.min(indexOfLastItem, filteredDataset.length)}</strong> of{" "}
                <strong>{filteredDataset.length}</strong> records
              </span>

              <div style={styles.paginationBtnGroup}>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={styles.pageArrowBtn}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      ...styles.pageNumBtn,
                      ...(currentPage === pageNum ? styles.pageNumActive : {}),
                    }}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={styles.pageArrowBtn}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  btnGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  actionBtn: {
    height: "48px",
    borderRadius: "14px",
    padding: "0 20px",
    fontSize: "14px",
  },
  tabsContainer: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    overflowX: "auto",
    paddingBottom: "4px",
  },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 20px",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    color: "#64748b",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s ease",
  },
  activeTabBtn: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderColor: "#2563eb",
    boxShadow: "0 6px 18px rgba(37, 99, 235, 0.22)",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
    marginBottom: "28px",
  },
  metricCard: {
    height: "100px",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
  },
  metricCardLeft: {
    display: "flex",
    flexDirection: "column",
  },
  metricLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: "0.05em",
  },
  metricValue: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 1.1,
    marginTop: "4px",
  },
  iconCircle: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: "16px",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    gap: "16px",
    flexWrap: "wrap",
  },
  dateFilterBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "0 14px",
  },
  filterSelect: {
    border: "none",
    height: "48px",
    padding: "0 8px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "transparent",
  },
  paginationFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderTop: "none",
    borderBottomLeftRadius: "16px",
    borderBottomRightRadius: "16px",
    flexWrap: "wrap",
    gap: "12px",
  },
  paginationText: {
    fontSize: "13px",
    color: "#64748b",
  },
  paginationBtnGroup: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  pageArrowBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 12px",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    color: "#475569",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  pageNumBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    color: "#475569",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  pageNumActive: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderColor: "#2563eb",
  },
  emptyCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "64px 24px",
    textAlign: "center",
  },
  emptyIconCircle: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  emptySub: {
    fontSize: "14px",
    color: "#64748b",
    marginTop: "4px",
    maxWidth: "400px",
  },
};

export default Reports;
