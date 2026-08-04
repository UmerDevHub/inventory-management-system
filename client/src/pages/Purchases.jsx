import React, { useState, useEffect } from "react";
import {
  Plus,
  ShoppingCart,
  Trash2,
  Calendar,
  Package,
  Truck,
  DollarSign,
  AlertCircle,
  Eye,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Boxes,
  CheckCircle2,
  Clock,
} from "lucide-react";
import API from "../api/axios";
import Table from "../components/Table";
import Modal from "../components/Modal";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loader";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { compactNumber, compactCurrency } from "../utils/formatNumber";

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    supplier: "",
    product: "",
    quantity: "",
    price: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // View Detail Modal State
  const [viewPurchase, setViewPurchase] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

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
      const [purRes, supRes, prodRes] = await Promise.all([
        API.get("/purchases"),
        API.get("/suppliers"),
        API.get("/products"),
      ]);
      setPurchases(purRes.data);
      setSuppliers(supRes.data);
      setProducts(prodRes.data);

      if (supRes.data.length > 0 && prodRes.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          supplier: supRes.data[0]._id,
          product: prodRes.data[0]._id,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch purchase data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      supplier: suppliers[0]?._id || "",
      product: products[0]?._id || "",
      quantity: "",
      price: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (pur) => {
    setViewPurchase(pur);
    setIsViewOpen(true);
  };

  const calculatedTotal =
    Number(formData.quantity || 0) * Number(formData.price || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.supplier || !formData.product || !formData.quantity || formData.price === "") {
      setFormError("All required fields must be filled.");
      return;
    }

    if (Number(formData.quantity) <= 0 || Number(formData.price) < 0) {
      setFormError("Quantity and price must be valid positive numbers.");
      return;
    }

    try {
      setSubmitting(true);
      await API.post("/purchases", {
        ...formData,
        totalAmount: calculatedTotal,
      });
      showToast("Purchase order created successfully!");
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Failed to record purchase order."
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
      await API.delete(`/purchases/${deleteId}`);
      setIsDeleteOpen(false);
      showToast("Purchase record deleted and stock adjusted.");
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete purchase record", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const rows = [["Purchase Date", "Product Name", "SKU", "Supplier", "Unit Price", "Quantity", "Total Spent"]];

    filteredPurchases.forEach((p) => {
      rows.push([
        new Date(p.purchaseDate || p.createdAt).toLocaleDateString(),
        `"${p.product?.name || "N/A"}"`,
        p.product?.sku || "N/A",
        `"${p.supplier?.name || "N/A"}"`,
        p.price,
        p.quantity,
        p.totalAmount,
      ]);
    });

    csvContent += rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `purchases_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort Logic
  const filteredPurchases = purchases
    .filter((pur) => {
      const prodName = pur.product?.name || "";
      const prodSku = pur.product?.sku || "";
      const supName = pur.supplier?.name || "";

      const matchesSearch =
        prodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prodSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSupplier =
        !selectedSupplier || (pur.supplier?._id || pur.supplier) === selectedSupplier;

      return matchesSearch && matchesSupplier;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.purchaseDate || b.createdAt) - new Date(a.purchaseDate || a.createdAt);
      if (sortBy === "oldest") return new Date(a.purchaseDate || a.createdAt) - new Date(b.purchaseDate || b.createdAt);
      if (sortBy === "highest") return b.totalAmount - a.totalAmount;
      if (sortBy === "lowest") return a.totalAmount - b.totalAmount;
      return 0;
    });

  // Calculate Statistics
  const totalPurchasesCount = purchases.length;
  const totalItemsPurchased = purchases.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalExpenditure = purchases.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const thisMonthSpent = purchases
    .filter((p) => new Date(p.purchaseDate || p.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, item) => sum + (item.totalAmount || 0), 0);

  // Pagination Logic
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDisplayedPurchases = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);

  const columns = [
    {
      header: "Date",
      render: (row) => (
        <span style={{ color: "#475569", fontSize: "14px", fontWeight: "500" }}>
          {new Date(row.purchaseDate || row.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Product",
      render: (row) => {
        const imageUrl = row.product?.image
          ? row.product.image.startsWith("http")
            ? row.product.image
            : `/${row.product.image.replace(/^\//, '')}`
          : null;

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "4px 0" }}>
            <div style={styles.imageThumbLarge}>
              {imageUrl ? (
                <img src={imageUrl} alt={row.product?.name} style={styles.img} />
              ) : (
                <Package size={24} color="#2563eb" />
              )}
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a" }}>
                {row.product?.name || "Product Deleted"}
              </div>
              <span style={styles.skuBadge}>SKU: {row.product?.sku || "N/A"}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Supplier",
      render: (row) => (
        <div>
          <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>
            {row.supplier?.name || "N/A"}
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            {row.supplier?.email || "Verified Supplier"}
          </span>
        </div>
      ),
    },
    {
      header: "Unit Price",
      render: (row) => (
        <span style={{ color: "#475569", fontWeight: "600", fontSize: "14px" }}>
          ${Number(row.price).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Quantity",
      style: { width: "110px", minWidth: "110px", textAlign: "center" },
      render: (row) => (
        <span style={styles.softBlueBadge}>
          +{row.quantity} units
        </span>
      ),
    },
    {
      header: "Total",
      render: (row) => (
        <span style={{ fontWeight: "800", fontSize: "18px", color: "#0f172a" }}>
          ${Number(row.totalAmount).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Status",
      render: () => <span className="badge badge-success">Completed</span>,
    },
    {
      header: "Actions",
      style: { width: "120px", textAlign: "right" },
      render: (row) => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button
            onClick={() => handleOpenViewModal(row)}
            style={styles.actionBtn}
            title="View Purchase Order Details"
          >
            <Eye size={16} color="#2563eb" />
          </button>
          <button
            onClick={() => promptDelete(row._id)}
            style={{ ...styles.actionBtn, backgroundColor: "#fef2f2" }}
            title="Delete Purchase Record"
          >
            <Trash2 size={16} color="#ef4444" />
          </button>
        </div>
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
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-subtitle">
            Track inventory procurement, supplier orders, and purchasing expenditure.
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

          <button onClick={handleOpenAddModal} className="btn btn-primary" style={styles.addPurchaseBtn}>
            <Plus size={18} />
            <span>Add Purchase</span>
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards Section */}
      <div style={styles.statsCardsGrid}>
        <div className="card" style={styles.statCard}>
          <div style={styles.statCardLeft}>
            <span style={styles.statCardLabel}>TOTAL PURCHASES</span>
            <span style={styles.statCardValue}>{compactNumber(totalPurchasesCount)}</span>
          </div>
          <div style={{ ...styles.statIconBox, backgroundColor: "#eff6ff" }}>
            <ShoppingCart size={22} color="#2563eb" />
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statCardLeft}>
            <span style={styles.statCardLabel}>THIS MONTH</span>
            <span style={{ ...styles.statCardValue, color: "#10b981" }}>
              {compactCurrency(thisMonthSpent)}
            </span>
          </div>
          <div style={{ ...styles.statIconBox, backgroundColor: "#ecfdf5" }}>
            <DollarSign size={22} color="#10b981" />
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statCardLeft}>
            <span style={styles.statCardLabel}>ITEMS PURCHASED</span>
            <span style={{ ...styles.statCardValue, color: "#2563eb" }}>{compactNumber(totalItemsPurchased)}</span>
          </div>
          <div style={{ ...styles.statIconBox, backgroundColor: "#eff6ff" }}>
            <Package size={22} color="#2563eb" />
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statCardLeft}>
            <span style={styles.statCardLabel}>TOTAL EXPENDITURE</span>
            <span style={{ ...styles.statCardValue, color: "#0f172a" }}>
              {compactCurrency(totalExpenditure)}
            </span>
          </div>
          <div style={{ ...styles.statIconBox, backgroundColor: "#f8fafc" }}>
            <Boxes size={22} color="#475569" />
          </div>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div style={styles.toolbar}>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          placeholder="Search by product name, SKU, or supplier..."
        />

        <div style={styles.filterGroup}>
          <select
            className="form-select"
            value={selectedSupplier}
            onChange={(e) => {
              setSelectedSupplier(e.target.value);
              setCurrentPage(1);
            }}
            style={styles.filterSelect}
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="highest">Sort: Highest Amount</option>
            <option value="lowest">Sort: Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Main Table View */}
      {loading ? (
        <Loader message="Loading purchase history..." />
      ) : filteredPurchases.length === 0 ? (
        <div style={styles.emptyCard} className="card">
          <div style={styles.emptyIconCircle}>
            <ShoppingCart size={32} color="#94a3b8" />
          </div>
          <h3 style={styles.emptyTitle}>No purchase records found</h3>
          <p style={styles.emptySub}>
            Create your first purchase order to start tracking inventory procurement.
          </p>
          <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ marginTop: "16px" }}>
            <Plus size={18} />
            <span>Add Purchase</span>
          </button>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={currentDisplayedPurchases}
            emptyMessage="No purchase orders found."
          />

          {/* Pagination Footer */}
          {filteredPurchases.length > 0 && (
            <div style={styles.paginationFooter}>
              <span style={styles.paginationText}>
                Showing <strong>{indexOfFirstItem + 1}</strong>–
                <strong>{Math.min(indexOfLastItem, filteredPurchases.length)}</strong> of{" "}
                <strong>{filteredPurchases.length}</strong> purchases
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

      {/* Add Purchase Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Purchase Order"
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div style={styles.errorBox}>
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          <div style={styles.gridTwo}>
            <div className="form-group">
              <label className="form-label">Supplier *</label>
              <select
                className="form-select"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Product Item *</label>
              <select
                className="form-select"
                value={formData.product}
                onChange={(e) =>
                  setFormData({ ...formData, product: e.target.value })
                }
                required
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (SKU: {p.sku})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.gridThree}>
            <div className="form-group">
              <label className="form-label">Quantity Purchased *</label>
              <input
                type="number"
                min="1"
                className="form-input"
                placeholder="100"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="15.50"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Purchase Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.purchaseDate}
                onChange={(e) =>
                  setFormData({ ...formData, purchaseDate: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Real-time Total Calculation Box */}
          <div style={styles.calcBox}>
            <span>Total Expenditure:</span>
            <strong style={{ fontSize: "20px", color: "#2563eb" }}>
              ${calculatedTotal.toFixed(2)}
            </strong>
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
              {submitting ? "Processing..." : "Create Purchase Order"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      {viewPurchase && (
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title="Purchase Order Details"
        >
          <div style={styles.detailBox}>
            <div style={styles.detailRow}>
              <span>Purchase Date:</span>
              <strong>
                {new Date(viewPurchase.purchaseDate || viewPurchase.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </strong>
            </div>

            <div style={styles.detailRow}>
              <span>Product Name:</span>
              <strong>{viewPurchase.product?.name || "Product Deleted"}</strong>
            </div>

            <div style={styles.detailRow}>
              <span>Product SKU:</span>
              <code>{viewPurchase.product?.sku || "N/A"}</code>
            </div>

            <div style={styles.detailRow}>
              <span>Supplier Name:</span>
              <strong>{viewPurchase.supplier?.name || "N/A"}</strong>
            </div>

            <div style={styles.detailRow}>
              <span>Unit Price:</span>
              <strong>${Number(viewPurchase.price).toFixed(2)}</strong>
            </div>

            <div style={styles.detailRow}>
              <span>Quantity Purchased:</span>
              <span className="badge badge-primary">+{viewPurchase.quantity} units</span>
            </div>

            <div style={styles.detailRow}>
              <span>Total Spent:</span>
              <strong style={{ fontSize: "20px", color: "#2563eb" }}>
                ${Number(viewPurchase.totalAmount).toFixed(2)}
              </strong>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
            <button onClick={() => setIsViewOpen(false)} className="btn btn-secondary">
              Close Details
            </button>
          </div>
        </Modal>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Purchase Order"
        message="Are you sure you want to delete this purchase order? Inventory stock for this product will be reverted."
        loading={deleting}
      />
    </div>
  );
};

const styles = {
  addPurchaseBtn: {
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
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "24px",
    marginBottom: "28px",
  },
  statCard: {
    minHeight: "100px",
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
    marginTop: "2px",
  },
  statIconBox: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
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
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  filterSelect: {
    padding: "10px 16px",
    fontSize: "14px",
    minWidth: "175px",
    borderRadius: "12px",
  },
  imageThumbLarge: {
    width: "56px",
    height: "56px",
    borderRadius: "12px",
    backgroundColor: "#eff6ff",
    border: "1px solid #dbeafe",
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
  softBlueBadge: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    whiteSpace: "nowrap",
    display: "inline-block",
  },
  actionBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s ease",
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
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  gridThree: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "16px",
  },
  calcBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
    marginTop: "12px",
  },
  detailBox: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "10px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "14px",
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

export default Purchases;
