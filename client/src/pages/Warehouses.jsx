import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Warehouse as WarehouseIcon, MapPin, AlertCircle } from "lucide-react";
import API from "../api/axios";
import Table from "../components/Table";
import Modal from "../components/Modal";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loader";

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

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
      } else {
        await API.post("/warehouses", formData);
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

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete warehouse "${name}"?`)) {
      try {
        await API.delete(`/warehouses/${id}`);
        fetchWarehouses();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete warehouse");
      }
    }
  };

  const filteredWarehouses = warehouses.filter(
    (wh) =>
      wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wh.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (wh.description &&
        wh.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    {
      header: "Warehouse Name",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={styles.iconBadge}>
            <WarehouseIcon size={16} color="#7e22ce" />
          </div>
          <span style={{ fontWeight: "700", color: "#0f172a" }}>{row.name}</span>
        </div>
      ),
    },
    {
      header: "Location",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#475569" }}>
          <MapPin size={14} color="#64748b" />
          <span>{row.location}</span>
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
        <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
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
            title="Edit Warehouse"
          >
            <Edit3 size={16} color="#2563eb" />
          </button>
          <button
            onClick={() => handleDelete(row._id, row.name)}
            style={{ ...styles.actionBtn, backgroundColor: "#fef2f2" }}
            title="Delete Warehouse"
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
          <h1 className="page-title">Warehouses</h1>
          <p className="page-subtitle">
            Manage storage facilities, depots, and fulfillment hub locations
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Warehouse</span>
        </button>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search warehouses by name, location, description..."
        />
        <div style={styles.countBadge}>
          Total: <strong>{filteredWarehouses.length}</strong> warehouses
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loader message="Loading warehouse facilities..." />
      ) : (
        <Table
          columns={columns}
          data={filteredWarehouses}
          emptyMessage="No warehouses found matching your search."
        />
      )}

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWarehouse ? "Edit Warehouse" : "Add New Warehouse"}
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
              placeholder="e.g. Central Depot Hub, North Fulfillment Center"
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
              placeholder="e.g. Brooklyn, NY, USA"
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
              placeholder="Enter facility capacity or operational notes..."
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
    backgroundColor: "#f3e8ff",
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

export default Warehouses;
