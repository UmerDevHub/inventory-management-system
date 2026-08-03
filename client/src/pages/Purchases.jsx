import React, { useState, useEffect } from "react";
import { Plus, ShoppingCart, Trash2, Calendar, Package, Truck, DollarSign, AlertCircle } from "lucide-react";
import API from "../api/axios";
import Table from "../components/Table";
import Modal from "../components/Modal";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loader";

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    supplier: "",
    product: "",
    quantity: "",
    price: "",
    purchaseDate: new Date().toISOString().split("T")[0],
  });

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
    });
    setFormError("");
    setIsModalOpen(true);
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

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this purchase order? Associated product stock will be adjusted."
      )
    ) {
      try {
        await API.delete(`/purchases/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete purchase record");
      }
    }
  };

  const filteredPurchases = purchases.filter((pur) => {
    const prodName = pur.product?.name || "";
    const prodSku = pur.product?.sku || "";
    const supName = pur.supplier?.name || "";
    return (
      prodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prodSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalSpentAll = filteredPurchases.reduce(
    (acc, item) => acc + (item.totalAmount || 0),
    0
  );

  const columns = [
    {
      header: "Purchase Date",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#475569" }}>
          <Calendar size={14} color="#64748b" />
          <span>{new Date(row.purchaseDate || row.createdAt).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      header: "Product Item",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={styles.iconBadge}>
            <Package size={16} color="#2563eb" />
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
      header: "Supplier",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#475569" }}>
          <Truck size={14} color="#64748b" />
          <span>{row.supplier?.name || "N/A"}</span>
        </div>
      ),
    },
    {
      header: "Unit Price",
      render: (row) => (
        <span style={{ color: "#475569" }}>
          ${Number(row.price).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Qty",
      render: (row) => (
        <span className="badge badge-primary" style={{ fontSize: "0.85rem" }}>
          +{row.quantity} units
        </span>
      ),
    },
    {
      header: "Total Spent",
      render: (row) => (
        <span style={{ fontWeight: "800", color: "#0f172a" }}>
          ${Number(row.totalAmount).toFixed(2)}
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
          title="Delete Purchase Record"
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
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-subtitle">
            Track inventory procurement, supplier orders, and purchasing expenditure
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Purchase</span>
        </button>
      </div>

      {/* Toolbar & Expenditure Summary */}
      <div style={styles.toolbar}>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search by product, SKU, or supplier..."
        />

        <div style={styles.expenditureCard}>
          <DollarSign size={18} color="#2563eb" />
          <span>Total Expenditure: </span>
          <strong style={{ color: "#0f172a", fontSize: "1.05rem", marginLeft: "0.25rem" }}>
            ${totalSpentAll.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loader message="Loading purchase history..." />
      ) : (
        <Table
          columns={columns}
          data={filteredPurchases}
          emptyMessage="No purchase orders found matching your search."
        />
      )}

      {/* Add Modal */}
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
              <label className="form-label">Quantity *</label>
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

          {/* Real-time Total Calculation */}
          <div style={styles.calcBox}>
            <span>Total Purchase Amount:</span>
            <strong style={{ fontSize: "1.25rem", color: "#2563eb" }}>
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
  expenditureCard: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    backgroundColor: "#ffffff",
    padding: "0.6rem 1.25rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "0.9rem",
    color: "#64748b",
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
  gridThree: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "1rem",
  },
  calcBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "1rem",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#475569",
    marginTop: "0.5rem",
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

export default Purchases;
