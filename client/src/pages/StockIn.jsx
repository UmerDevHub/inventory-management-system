import React, { useState, useEffect } from "react";
import { Plus, ArrowDownLeft, Trash2, Calendar, Package, AlertCircle } from "lucide-react";
import API from "../api/axios";
import Table from "../components/Table";
import Modal from "../components/Modal";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loader";

const StockIn = () => {
  const [records, setRecords] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    product: "",
    quantity: "",
    notes: "",
    receivedDate: new Date().toISOString().split("T")[0],
  });

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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Stock In record? Product stock will be reverted.")) {
      try {
        await API.delete(`/stock-in/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete record");
      }
    }
  };

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

  const columns = [
    {
      header: "Received Date",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#475569" }}>
          <Calendar size={14} color="#64748b" />
          <span>{new Date(row.receivedDate || row.createdAt).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      header: "Product Item",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={styles.iconBadge}>
            <Package size={16} color="#059669" />
          </div>
          <div>
            <div style={{ fontWeight: "700", color: "#0f172a" }}>
              {row.product?.name || "Product Deleted"}
            </div>
            <span style={styles.skuBadge}>SKU: {row.product?.sku || "N/A"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Quantity Added",
      render: (row) => (
        <span className="badge badge-success" style={{ fontSize: "0.85rem", padding: "0.35rem 0.75rem" }}>
          +{row.quantity} units
        </span>
      ),
    },
    {
      header: "Notes",
      render: (row) => (
        <span style={{ color: "#64748b" }}>
          {row.notes || "No notes"}
        </span>
      ),
    },
    {
      header: "Actions",
      style: { width: "80px", textAlign: "right" },
      render: (row) => (
        <button
          onClick={() => handleDelete(row._id)}
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
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock In Records</h1>
          <p className="page-subtitle">
            Log inbound inventory receipts to automatically update product quantities
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Stock In</span>
        </button>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search by product name, SKU, or notes..."
        />
        <div style={styles.countBadge}>
          Total: <strong>{filteredRecords.length}</strong> records
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loader message="Loading stock in history..." />
      ) : (
        <Table
          columns={columns}
          data={filteredRecords}
          emptyMessage="No stock in records found."
        />
      )}

      {/* Add Modal */}
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
                  {p.name} (SKU: {p.sku}) - Current Stock: {p.quantity}
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
    backgroundColor: "#d1fae5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  skuBadge: {
    fontSize: "0.75rem",
    color: "#64748b",
    fontFamily: "monospace",
  },
  deleteBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  gridTwo: {
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

export default StockIn;
