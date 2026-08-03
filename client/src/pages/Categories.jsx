import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Tags, AlertCircle } from "lucide-react";
import API from "../api/axios";
import Table from "../components/Table";
import Modal from "../components/Modal";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loader";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete Confirm Modal State
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState({ message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 3500);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description || "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Category name is required.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        await API.put(`/categories/${editingCategory._id}`, formData);
        showToast(`Category "${formData.name}" updated successfully!`);
      } else {
        await API.post("/categories", formData);
        showToast(`Category "${formData.name}" created successfully!`);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Failed to save category. Please try again."
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
      await API.delete(`/categories/${deleteId}`);
      setIsDeleteOpen(false);
      showToast(`Category "${deleteName}" deleted successfully.`);
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete category", "error");
    } finally {
      setDeleting(false);
    }
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description &&
        cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    {
      header: "Category Name",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={styles.iconBadge}>
            <Tags size={16} color="#2563eb" />
          </div>
          <span style={{ fontWeight: "700", color: "#0f172a" }}>{row.name}</span>
        </div>
      ),
    },
    {
      header: "Description",
      render: (row) => (
        <span style={{ color: "#64748b" }}>
          {row.description || "No description provided"}
        </span>
      ),
    },
    {
      header: "Created Date",
      render: (row) => (
        <span style={{ color: "#94a3b8", fontSize: "13px" }}>
          {new Date(row.createdAt).toLocaleDateString()}
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
            title="Edit Category"
          >
            <Edit3 size={16} color="#2563eb" />
          </button>
          <button
            onClick={() => promptDelete(row._id, row.name)}
            style={{ ...styles.actionBtn, backgroundColor: "#fef2f2" }}
            title="Delete Category"
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

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">
            Organize products into structured inventory categories
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search categories by name or description..."
        />
        <div style={styles.countBadge}>
          Total: <strong>{filteredCategories.length}</strong> categories
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loader message="Loading categories..." />
      ) : (
        <Table
          columns={columns}
          data={filteredCategories}
          emptyMessage="No categories found matching your search."
        />
      )}

      {/* Add / Edit Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Add New Category"}
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div style={styles.errorBox}>
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Electronics, Raw Materials"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Enter detailed category description..."
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
                : editingCategory
                ? "Update Category"
                : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteName}"? Products in this category may be affected.`}
        loading={deleting}
      />
    </div>
  );
};

const styles = {
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    gap: "16px",
    flexWrap: "wrap",
  },
  countBadge: {
    fontSize: "14px",
    color: "#64748b",
    backgroundColor: "#ffffff",
    padding: "8px 16px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
  },
  iconBadge: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform 0.15s ease",
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

export default Categories;
