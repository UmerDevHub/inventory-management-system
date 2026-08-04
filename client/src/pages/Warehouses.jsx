import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Warehouse as WarehouseIcon,
  MapPin,
  AlertCircle,
  Building2,
  CheckCircle2,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Boxes,
} from "lucide-react";
import API from "../api/axios";
import Table from "../components/Table";
import Modal from "../components/Modal";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loader";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
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

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/warehouses");
      setWarehouses(res.data);
    } catch (err) {
      console.error("Failed to fetch warehouses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleOpenAddModal = () => {
    setEditingWarehouse(null);
    setFormData({ name: "", location: "", description: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (wh) => {
    setEditingWarehouse(wh);
    setFormData({
      name: wh.name,
      location: wh.location,
      description: wh.description || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim() || !formData.location.trim()) {
      setFormError("Name and location are required.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingWarehouse) {
        await API.put(`/warehouses/${editingWarehouse._id}`, formData);
        showToast(`Warehouse "${formData.name}" updated successfully!`);
      } else {
        await API.post("/warehouses", formData);
        showToast(`Warehouse "${formData.name}" created successfully!`);
      }
      setIsModalOpen(false);
      fetchWarehouses();
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Failed to save warehouse. Please try again."
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
      await API.delete(`/warehouses/${deleteId}`);
      setIsDeleteOpen(false);
      showToast(`Warehouse "${deleteName}" deleted successfully.`);
      fetchWarehouses();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete warehouse", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const rows = [["Warehouse Name", "Location", "Description", "Created Date"]];

    filteredWarehouses.forEach((w) => {
      rows.push([
        `"${w.name}"`,
        `"${w.location}"`,
        `"${w.description || "N/A"}"`,
        new Date(w.createdAt).toLocaleDateString(),
      ]);
    });

    csvContent += rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `warehouses_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort Logic
  const filteredWarehouses = warehouses
    .filter(
      (wh) =>
        wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wh.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (wh.description &&
          wh.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "a-z") return a.name.localeCompare(b.name);
      if (sortBy === "z-a") return b.name.localeCompare(a.name);
      return 0;
    });

  // Calculate Statistics
  const totalWarehousesCount = warehouses.length;
  const activeLocationsCount = warehouses.length;
  const recentWarehousesCount = warehouses.filter(
    (w) => new Date() - new Date(w.createdAt) < 30 * 24 * 60 * 60 * 1000
  ).length;

  // Pagination Logic
  const totalPages = Math.ceil(filteredWarehouses.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDisplayedWarehouses = filteredWarehouses.slice(indexOfFirstItem, indexOfLastItem);

  const columns = [
    {
      header: "Warehouse",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "6px 0" }}>
          <div style={styles.iconBadgeLarge}>
            <WarehouseIcon size={22} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a" }}>
              {row.name}
            </div>
            <span style={styles.facilityIdTag}>WH-{row._id.substring(row._id.length - 4).toUpperCase()}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Location",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#0f172a", fontSize: "14px" }}>
          <MapPin size={15} color="#64748b" />
          <span>{row.location}</span>
        </div>
      ),
    },
    {
      header: "Description",
      render: (row) => (
        <span style={{ color: "#64748b", fontSize: "14px" }}>
          {row.description || "Primary distribution center"}
        </span>
      ),
    },
    {
      header: "Created",
      render: (row) => (
        <span style={{ color: "#475569", fontSize: "14px", fontWeight: "500" }}>
          {new Date(row.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
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
            title="Edit Warehouse Facility"
          >
            <Edit3 size={16} color="#2563eb" />
          </button>
          <button
            onClick={() => promptDelete(row._id, row.name)}
            style={{ ...styles.actionBtn, backgroundColor: "#fef2f2" }}
            title="Delete Warehouse Facility"
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
          <h1 className="page-title">Warehouses</h1>
          <p className="page-subtitle">
            Manage warehouse locations, storage facilities, and distribution centers.
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

          <button onClick={handleOpenAddModal} className="btn btn-primary" style={styles.addWarehouseBtn}>
            <Plus size={18} />
            <span>Add Warehouse</span>
          </button>
        </div>
      </div>

      {/* Top 3 Statistics Cards Section */}
      <div style={styles.statsCardsGrid}>
        <div className="card" style={styles.statCard}>
          <div style={styles.statCardLeft}>
            <span style={styles.statCardLabel}>TOTAL WAREHOUSES</span>
            <span style={styles.statCardValue}>{totalWarehousesCount}</span>
          </div>
          <div style={{ ...styles.statIconBox, backgroundColor: "#eff6ff" }}>
            <WarehouseIcon size={22} color="#2563eb" />
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statCardLeft}>
            <span style={styles.statCardLabel}>ACTIVE STORAGE LOCATIONS</span>
            <span style={{ ...styles.statCardValue, color: "#10b981" }}>{activeLocationsCount}</span>
          </div>
          <div style={{ ...styles.statIconBox, backgroundColor: "#ecfdf5" }}>
            <CheckCircle2 size={22} color="#10b981" />
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statCardLeft}>
            <span style={styles.statCardLabel}>RECENTLY ADDED</span>
            <span style={{ ...styles.statCardValue, color: "#2563eb" }}>{recentWarehousesCount}</span>
          </div>
          <div style={{ ...styles.statIconBox, backgroundColor: "#eff6ff" }}>
            <Building2 size={22} color="#2563eb" />
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
            placeholder="Search warehouses by facility name, location, or description..."
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
        <Loader message="Loading warehouse facilities..." />
      ) : filteredWarehouses.length === 0 ? (
        <div style={styles.emptyCard} className="card">
          <div style={styles.emptyIconCircle}>
            <WarehouseIcon size={32} color="#94a3b8" />
          </div>
          <h3 style={styles.emptyTitle}>No warehouses found</h3>
          <p style={styles.emptySub}>
            Create your first warehouse location to start managing storage facilities.
          </p>
          <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ marginTop: "16px" }}>
            <Plus size={18} />
            <span>Add Warehouse</span>
          </button>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={currentDisplayedWarehouses}
            emptyMessage="No warehouses found."
          />

          {/* Pagination Footer */}
          {filteredWarehouses.length > 0 && (
            <div style={styles.paginationFooter}>
              <span style={styles.paginationText}>
                Showing <strong>{indexOfFirstItem + 1}</strong>–
                <strong>{Math.min(indexOfLastItem, filteredWarehouses.length)}</strong> of{" "}
                <strong>{filteredWarehouses.length}</strong> warehouses
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
        title={editingWarehouse ? "Edit Warehouse Facility" : "Add New Warehouse"}
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div style={styles.errorBox}>
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Warehouse Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Central Warehouse, North Distribution Center"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location / Address *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. New York, USA"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="e.g. Primary distribution center and electronics hub"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                : editingWarehouse
                ? "Update Warehouse"
                : "Create Warehouse"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Warehouse Facility"
        message={`Are you sure you want to delete warehouse "${deleteName}"? Products located in this warehouse will remain in inventory.`}
        loading={deleting}
      />
    </div>
  );
};

const styles = {
  addWarehouseBtn: {
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
  iconBadgeLarge: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "#eff6ff",
    border: "1px solid #dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  facilityIdTag: {
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

export default Warehouses;
