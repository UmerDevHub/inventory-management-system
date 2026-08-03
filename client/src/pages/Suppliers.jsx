import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Truck, Mail, Phone, MapPin, AlertCircle } from "lucide-react";
import API from "../api/axios";
import Table from "../components/Table";
import Modal from "../components/Modal";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loader";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
      } else {
        await API.post("/suppliers", formData);
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

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete supplier "${name}"?`)) {
      try {
        await API.delete(`/suppliers/${id}`);
        fetchSuppliers();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete supplier");
      }
    }
  };

  const filteredSuppliers = suppliers.filter(
    (sup) =>
      sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: "Supplier Name",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={styles.iconBadge}>
            <Truck size={16} color="#2563eb" />
          </div>
          <span style={{ fontWeight: "700", color: "#0f172a" }}>{row.name}</span>
        </div>
      ),
    },
    {
      header: "Contact Email",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#475569" }}>
          <Mail size={14} color="#64748b" />
          <a href={`mailto:${row.email}`} style={{ textDecoration: "none", color: "#2563eb" }}>
            {row.email}
          </a>
        </div>
      ),
    },
    {
      header: "Phone Number",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#475569" }}>
          <Phone size={14} color="#64748b" />
          <span>{row.phone}</span>
        </div>
      ),
    },
    {
      header: "Address",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#64748b" }}>
          <MapPin size={14} color="#64748b" />
          <span>{row.address}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      style: { width: "120px", textAlign: "right" },
      render: (row) => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button
            onClick={() => handleOpenEditModal(row)}
            style={styles.actionBtn}
            title="Edit Supplier"
          >
            <Edit3 size={16} color="#2563eb" />
          </button>
          <button
            onClick={() => handleDelete(row._id, row.name)}
            style={{ ...styles.actionBtn, backgroundColor: "#fef2f2" }}
            title="Delete Supplier"
          >
            <Trash2 size={16} color="#ef4444" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">
            Manage vendor directory and supplier contact profiles
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search suppliers by name, email, phone, address..."
        />
        <div style={styles.countBadge}>
          Total: <strong>{filteredSuppliers.length}</strong> suppliers
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loader message="Loading suppliers directory..." />
      ) : (
        <Table
          columns={columns}
          data={filteredSuppliers}
          emptyMessage="No suppliers found matching your search."
        />
      )}

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? "Edit Supplier" : "Add New Supplier"}
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
              placeholder="e.g. Acme Corp, Global Tech Logistics"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={styles.twoCol}>
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
                placeholder="+1 234 567 890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address *</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Enter full physical address or headquarters location..."
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
    </div>
  );
};

const styles = {
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    gap: "1rem",
    flexWrap: "wrap",
  },
  countBadge: {
    fontSize: "0.875rem",
    color: "#64748b",
    backgroundColor: "#ffffff",
    padding: "0.5rem 1rem",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
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
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform 0.15s ease",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#ef4444",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    fontSize: "0.875rem",
    marginBottom: "1.25rem",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: "1.5rem",
  },
};

export default Suppliers;
