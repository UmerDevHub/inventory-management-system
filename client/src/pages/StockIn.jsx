import React, { useState, useEffect } from "react";
import {
  Plus,
  ArrowDownLeft,
  Trash2,
  Calendar,
  Package,
  AlertCircle,
  Boxes,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import API from "../api/axios";
import Table from "../components/Table";
import Modal from "../components/Modal";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loader";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { compactNumber } from "../utils/formatNumber";

const StockIn = () => {
  const [records, setRecords] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    product: "",
    quantity: "",
    notes: "",
    receivedDate: new Date().toISOString().split("T")[0],
  });

  // Delete Confirm Modal State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsRes, productsRes] = await Promise.all([
        API.get("/stock-in"),
        API.get("/products"),
      ]);
      setRecords(recordsRes.data);
      setProducts(productsRes.data);
      if (productsRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, product: productsRes.data[0]._id }));
      }
    } catch (err) {
      console.error("Failed to fetch stock in data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      product: products[0]?._id || "",
      quantity: "",
      notes: "",
      receivedDate: new Date().toISOString().split("T")[0],
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.product || !formData.quantity) {
      setFormError("Product and quantity are required.");
      return;
    }

    if (Number(formData.quantity) <= 0) {
      setFormError("Quantity must be greater than zero.");
      return;
    }

    try {
      setSubmitting(true);
      await API.post("/stock-in", formData);
      showToast(`${formData.quantity} units added to stock!`);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Failed to record stock in entry."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const promptDelete = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await API.delete(`/stock-in/${deleteId}`);
      setIsDeleteOpen(false);
      showToast("Stock In record deleted and inventory rolled back.");
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete record", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const rows = [["Received Date", "Product Name", "SKU", "Quantity Received", "Notes"]];

    filteredRecords.forEach((r) => {
      rows.push([
        new Date(r.receivedDate || r.createdAt).toLocaleDateString(),
        `"${r.product?.name || "N/A"}"`,
        r.product?.sku?.toUpperCase() || "N/A",
        r.quantity,
        `"${r.notes || ""}"`,
      ]);
    });

    csvContent += rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stock_in_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Logic
  const filteredRecords = records.filter((rec) => {
    const productName = rec.product?.name || "";
    const productSku = rec.product?.sku || "";
    const notes = rec.notes || "";
    return (
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notes.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate Summary Metrics
  const totalStockInLogs = records.length;
  const totalUnitsReceived = records.reduce((sum, r) => sum + (r.quantity || 0), 0);
  const recentReceipts = records.filter(
    (r) => new Date() - new Date(r.receivedDate || r.createdAt) < 30 * 24 * 60 * 60 * 1000
  ).length;

  // Pagination Logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDisplayedRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);

  const columns = [
    {
      header: "Received Date",
      render: (row) => (
        <span style={{ color: "#475569", fontSize: "14px", fontWeight: "500" }}>
          {new Date(row.receivedDate || row.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Product Item",
      render: (row) => {
        const imageUrl = row.product?.image
          ? row.product.image.startsWith("http")
            ? row.product.image
            : `http://localhost:5000/${row.product.image}`
          : null;

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "4px 0" }}>
            <div style={styles.imageThumbLarge}>
              {imageUrl ? (
                <img src={imageUrl} alt={row.product?.name} style={styles.img} />
              ) : (
                <Package size={24} color="#059669" />
              )}
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a" }}>
                {row.product?.name || "Product Deleted"}
              </div>
              <span style={styles.skuBadge}>SKU: {row.product?.sku?.toUpperCase() || "N/A"}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Quantity Added",
      render: (row) => (
        <span className="badge badge-success" style={{ fontSize: "13px", padding: "6px 12px" }}>
          +{row.quantity} units
        </span>
      ),
    },
    {
      header: "Notes",
      render: (row) => (
        <span style={{ color: "#64748b", fontSize: "14px" }}>
          {row.notes || "Incoming stock receipt"}
        </span>
      ),
    },
    {
      header: "Actions",
      style: { width: "80px", textAlign: "right" },
      render: (row) => (
        <button
          onClick={() => promptDelete(row._id)}
          style={styles.deleteBtn}
          title="Delete Stock In Record"
        >
          <Trash2 size={16} color="#ef4444" />
        </button>
      ),
    },
  ];

  return (
    <div className="fade-in">
      {/* Toast Notification */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      {/* Header & Quick Actions */}
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="page-title">Stock In Records</h1>
          <p className="page-subtitle">
            Log inbound inventory receipts to automatically update product quantities.
          </p>
        </div>

        <div className="page-actions-row">
          <button onClick={() => window.print()} className="btn btn-secondary" style={styles.quickActionBtn}>
            <Printer size={16} />
            <span>Print</span>
          </button>

          <button onClick={handleExportCSV} className="btn btn-secondary" style={styles.quickActionBtn}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          <button onClick={handleOpenAddModal} className="btn btn-primary" style={styles.addStockInBtn}>
            <Plus size={18} />
            <span>Add Stock In</span>
          </button>
        </div>
      </div>

      {/* Top 3 Summary KPI Cards */}
      <div style={styles.statsCardsGrid}>
        <div className="card" style={styles.statCard}>
          <div style={styles.statCardLeft}>
            <span style={styles.statCardLabel}>STOCK IN LOGS</span>
            <span style={styles.statCardValue}>{compactNumber(totalStockInLogs)}</span>
            <span style={styles.trendPill}>Inventory replenished</span>
          </div>
          <div style={{ ...styles.iconCircle56, backgroundColor: "#eafbf3" }}>
            <ArrowDownLeft size={24} color="#10b981" />
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statCardLeft}>
            <span style={styles.statCardLabel}>UNITS RECEIVED</span>
            <span style={{ ...styles.statCardValue, color: "#10b981" }}>
              +{compactNumber(totalUnitsReceived)}
            </span>
            <span style={{ ...styles.trendPill, color: "#10b981", fontWeight: "600" }}>
              Incoming stock
            </span>
          </div>
          <div style={{ ...styles.iconCircle56, backgroundColor: "#ecfdf5" }}>
            <Boxes size={24} color="#10b981" />
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statCardLeft}>
            <span style={styles.statCardLabel}>RECENT RECEIPTS</span>
            <span style={{ ...styles.statCardValue, color: "#2563eb" }}>{recentReceipts}</span>
            <span style={styles.trendPill}>Received this month</span>
          </div>
          <div style={{ ...styles.iconCircle56, backgroundColor: "#eff6ff" }}>
            <CheckCircle2 size={24} color="#2563eb" />
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div style={styles.toolbar}>
        <div style={{ width: "520px", maxWidth: "100%" }}>
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Search by product name, SKU, or notes..."
          />
        </div>
      </div>

      {/* Main Table View */}
      {loading ? (
        <Loader message="Loading stock in history..." />
      ) : filteredRecords.length === 0 ? (
        <div style={styles.emptyCard} className="card">
          <div style={styles.emptyIconCircle}>
            <ArrowDownLeft size={32} color="#10b981" />
          </div>
          <h3 style={styles.emptyTitle}>No stock in records found</h3>
          <p style={styles.emptySub}>
            Record inbound stock receipts to increase product inventory.
          </p>
          <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ marginTop: "16px" }}>
            <Plus size={18} />
            <span>Add Stock In</span>
          </button>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={currentDisplayedRecords}
            emptyMessage="No stock in records found."
          />

          {/* Pagination Footer */}
          {filteredRecords.length > 0 && (
            <div style={styles.paginationFooter}>
              <span style={styles.paginationText}>
                Showing <strong>{indexOfFirstItem + 1}</strong>–
                <strong>{Math.min(indexOfLastItem, filteredRecords.length)}</strong> of{" "}
                <strong>{filteredRecords.length}</strong> records
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

      {/* Add Stock In Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Inbound Stock (Stock In)"
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div style={styles.errorBox}>
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Select Product *</label>
            <select
              className="form-select"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              required
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (SKU: {p.sku?.toUpperCase()}) - Available Stock: {p.quantity}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.gridTwo}>
            <div className="form-group">
              <label className="form-label">Quantity Received *</label>
              <input
                type="number"
                min="1"
                className="form-input"
                placeholder="e.g. 50"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Received Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.receivedDate}
                onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes / Remarks</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="e.g. Batch #104 received from supplier"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            ></textarea>
          </div>

          <div style={styles.modalFooter}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Add Stock In"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Stock In Record"
        message="Are you sure you want to delete this Stock In record? Product inventory will be rolled back."
        loading={deleting}
      />
    </div>
  );
};

const styles = {
  addStockInBtn: {
    height: "48px",
    borderRadius: "14px",
    padding: "0 24px",
    fontSize: "14px",
  },
  quickActionBtn: {
    height: "48px",
    borderRadius: "14px",
    padding: "0 18px",
  },
  statsCardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
    marginBottom: "28px",
  },
  statCard: {
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
  statCardLeft: {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 0%",
    minWidth: 0,
  },
  statCardLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: "0.05em",
  },
  statCardValue: {
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
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    gap: "16px",
    flexWrap: "wrap",
  },
  imageThumbLarge: {
    width: "56px",
    height: "56px",
    borderRadius: "12px",
    backgroundColor: "#ecfdf5",
    border: "1px solid #a7f3d0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  skuBadge: {
    fontSize: "12px",
    color: "#64748b",
    fontFamily: "monospace",
    marginTop: "2px",
    display: "block",
  },
  deleteBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
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
    backgroundColor: "#ecfdf5",
    border: "1px solid #a7f3d0",
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
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#ef4444",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    marginBottom: "20px",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
  },
};

export default StockIn;
