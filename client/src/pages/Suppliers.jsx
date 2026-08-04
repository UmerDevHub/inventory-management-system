import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Truck,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Building2,
  CheckCircle2,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import API from "../api/axios";
import Table from "../components/Table";
import Modal from "../components/Modal";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loader";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete Confirm Modal State
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 3500);
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/suppliers");
      setSuppliers(res.data);
    } catch (err) {
      console.error("Failed to fetch suppliers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const getInitials = (name) => {
    if (!name) return "VS";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setFormData({ name: "", email: "", phone: "", address: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      email: sup.email,
      phone: sup.phone,
      address: sup.address,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      setFormError("All fields are required.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingSupplier) {
        await API.put(`/suppliers/${editingSupplier._id}`, formData);
        showToast(`Supplier "${formData.name}" updated successfully!`);
      } else {
        await API.post("/suppliers", formData);
        showToast(`Supplier "${formData.name}" created successfully!`);
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Failed to save supplier. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const promptDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await API.delete(`/suppliers/${deleteId}`);
      setIsDeleteOpen(false);
      showToast(`Supplier "${deleteName}" deleted successfully.`);
      fetchSuppliers();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete supplier", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const rows = [["Supplier Name", "Email", "Phone", "Address", "Created Date"]];

    filteredSuppliers.forEach((s) => {
      rows.push([
        `"${s.name}"`,
        s.email,
        `"${s.phone}"`,
        `"${s.address}"`,
        new Date(s.createdAt).toLocaleDateString(),
      ]);
    });

    csvContent += rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `suppliers_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort Logic
  const filteredSuppliers = suppliers
    .filter(
      (sup) =>
        sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sup.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sup.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sup.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "a-z") return a.name.localeCompare(b.name);
      if (sortBy === "z-a") return b.name.localeCompare(a.name);
      return 0;
    });

  // Calculate Statistics
  const totalSuppliersCount = suppliers.length;
  const activeVendorsCount = suppliers.length;
  const recentSuppliersCount = suppliers.filter(
    (s) => new Date() - new Date(s.createdAt) < 30 * 24 * 60 * 60 * 1000
  ).length;

  // Pagination Logic
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDisplayedSuppliers = filteredSuppliers.slice(indexOfFirstItem, indexOfLastItem);

  const columns = [
    {
      header: "Supplier",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "6px 0" }}>
          <div style={styles.initialsAvatar}>
            <span>{getInitials(row.name)}</span>
          </div>
          <div>
            <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a" }}>
              {row.name}
            </div>
            <span style={styles.supplierIdTag}>SUP-{row._id.substring(row._id.length - 4).toUpperCase()}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Email",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#0f172a", fontSize: "14px" }}>
          <Mail size={15} color="#64748b" />
          <span>{row.email}</span>
        </div>
      ),
    },
    {
      header: "Phone",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#475569", fontSize: "14px" }}>
          <Phone size={15} color="#64748b" />
          <span>{row.phone}</span>
        </div>
      ),
    },
    {
      header: "Address",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "14px" }}>
          <MapPin size={15} color="#64748b" style={{ flexShrink: 0 }} />
          <span>{row.address}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: () => (
        <span className="badge badge-success" style={{ gap: "4px" }}>
          <ShieldCheck size={12} />
          Active
        </span>
      ),
    },
    {
      header: "Actions",
      style: { width: "120px", textAlign: "right" },
      render: (row) => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button
            onClick={() => handleOpenEditModal(row)}
            style={styles.actionBtn}
            title="Edit Supplier Profile"
          >
            <Edit3 size={16} color="#2563eb" />
          </button>
          <button
            onClick={() => promptDelete(row._id, row.name)}
            style={{ ...styles.actionBtn, backgroundColor: "#fef2f2" }}
            title="Delete Supplier Record"
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
          <h1 className="page-title">Suppliers Directory</h1>
          <p className="page-subtitle">
            Maintain supplier information, contact details, and business records.
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

          <button onClick={handleOpenAddModal} className="btn btn-primary" style={styles.addSupplierBtn}>
            <Plus size={18} />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Top 3 Statistics Cards Section */}
      <div style={styles.statsCardsGrid}>
        <div className="card" style={styles.statCard}>
          <div style={styles.statCardLeft}>
            <span style={styles.statCardLabel}>TOTAL SUPPLIERS</span>
            <span style={styles.statCardValue}>{totalSuppliersCount}</span>
          </div>
          <div style={{ ...styles.statIconBox, backgroundColor: "#eff6ff" }}>
            <Building2 size={22} color="#2563eb" />
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statCardLeft}>
            <span style={styles.statCardLabel}>REGISTERED VENDORS</span>
            <span style={{ ...styles.statCardValue, color: "#10b981" }}>{activeVendorsCount}</span>
          </div>
          <div style={{ ...styles.statIconBox, backgroundColor: "#ecfdf5" }}>
            <CheckCircle2 size={22} color="#10b981" />
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statCardLeft}>
            <span style={styles.statCardLabel}>RECENTLY ADDED</span>
            <span style={{ ...styles.statCardValue, color: "#2563eb" }}>{recentSuppliersCount}</span>
          </div>
          <div style={{ ...styles.statIconBox, backgroundColor: "#eff6ff" }}>
            <Truck size={22} color="#2563eb" />
          </div>
        </div>
      </div>

      {/* Search & Sort Toolbar */}
      <div style={styles.toolbar}>
        <div style={{ width: "520px", maxWidth: "100%" }}>
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Search suppliers by name, email, phone, or address..."
          />
        </div>

        <div style={styles.filterGroup}>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="a-z">Sort: A to Z</option>
            <option value="z-a">Sort: Z to A</option>
          </select>
        </div>
      </div>

      {/* Main Table View */}
      {loading ? (
        <Loader message="Loading suppliers directory..." />
      ) : filteredSuppliers.length === 0 ? (
        <div style={styles.emptyCard} className="card">
          <div style={styles.emptyIconCircle}>
            <Truck size={32} color="#94a3b8" />
          </div>
          <h3 style={styles.emptyTitle}>No suppliers found</h3>
          <p style={styles.emptySub}>
            Start by adding your first supplier to maintain vendor business records.
          </p>
          <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ marginTop: "16px" }}>
            <Plus size={18} />
            <span>Add Supplier</span>
          </button>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={currentDisplayedSuppliers}
            emptyMessage="No suppliers found."
          />

          {/* Pagination Footer */}
          {filteredSuppliers.length > 0 && (
            <div style={styles.paginationFooter}>
              <span style={styles.paginationText}>
                Showing <strong>{indexOfFirstItem + 1}</strong>–
                <strong>{Math.min(indexOfLastItem, filteredSuppliers.length)}</strong> of{" "}
                <strong>{filteredSuppliers.length}</strong> suppliers
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? "Edit Supplier Profile" : "Add New Supplier"}
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div style={styles.errorBox}>
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Supplier Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Acme Corp, GlobalTech Logistics"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={styles.gridTwo}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="supplier@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                className="form-input"
                placeholder="+92 306 5082951"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Physical Address / HQ *</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="e.g. Office #14, Blue Area, Islamabad"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
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
              {submitting
                ? "Saving..."
                : editingSupplier
                ? "Update Supplier"
                : "Create Supplier"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Supplier Record"
        message={`Are you sure you want to delete supplier "${deleteName}"? Business records associated with this supplier will remain.`}
        loading={deleting}
      />
    </div>
  );
};

const styles = {
  addSupplierBtn: {
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
  initialsAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "#eff6ff",
    border: "1px solid #dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563eb",
    fontWeight: "800",
    fontSize: "16px",
    flexShrink: 0,
  },
  supplierIdTag: {
    fontSize: "12px",
    color: "#64748b",
    fontFamily: "monospace",
    marginTop: "2px",
    display: "block",
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

export default Suppliers;
