import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Package,
  Filter,
  Image as ImageIcon,
  AlertTriangle,
  Upload,
} from "lucide-react";
import API from "../api/axios";
import Table from "../components/Table";
import Modal from "../components/Modal";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loader";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    quantity: "0",
    reorderLevel: "10",
    category: "",
    supplier: "",
    warehouse: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchDropdownData = async () => {
    try {
      const [catRes, supRes, whRes] = await Promise.all([
        API.get("/categories"),
        API.get("/suppliers"),
        API.get("/warehouses"),
      ]);
      setCategories(catRes.data);
      setSuppliers(supRes.data);
      setWarehouses(whRes.data);
    } catch (err) {
      console.error("Failed to load select options", err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchDropdownData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      sku: "",
      price: "",
      quantity: "0",
      reorderLevel: "10",
      category: categories[0]?._id || "",
      supplier: suppliers[0]?._id || "",
      warehouse: warehouses[0]?._id || "",
    });
    setImageFile(null);
    setImagePreview(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      price: prod.price,
      quantity: prod.quantity,
      reorderLevel: prod.reorderLevel,
      category: prod.category?._id || prod.category || "",
      supplier: prod.supplier?._id || prod.supplier || "",
      warehouse: prod.warehouse?._id || prod.warehouse || "",
    });
    setImageFile(null);
    setImagePreview(
      prod.image
        ? prod.image.startsWith("http")
          ? prod.image
          : `http://localhost:5000/${prod.image}`
        : null
    );
    setFormError("");
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (
      !formData.name ||
      !formData.sku ||
      formData.price === "" ||
      !formData.category ||
      !formData.supplier ||
      !formData.warehouse
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);

      const data = new FormData();
      data.append("name", formData.name);
      data.append("sku", formData.sku);
      data.append("price", formData.price);
      data.append("quantity", formData.quantity);
      data.append("reorderLevel", formData.reorderLevel);
      data.append("category", formData.category);
      data.append("supplier", formData.supplier);
      data.append("warehouse", formData.warehouse);

      if (imageFile) {
        data.append("image", imageFile);
      }

      if (editingProduct) {
        await API.put(`/products/${editingProduct._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.post("/products", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Failed to save product. Please check inputs."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      try {
        await API.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete product");
      }
    }
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory ||
      (prod.category?._id || prod.category) === selectedCategory;

    const matchesWarehouse =
      !selectedWarehouse ||
      (prod.warehouse?._id || prod.warehouse) === selectedWarehouse;

    const matchesLowStock =
      !showLowStockOnly || prod.quantity <= prod.reorderLevel;

    return (
      matchesSearch && matchesCategory && matchesWarehouse && matchesLowStock
    );
  });

  const columns = [
    {
      header: "Product",
      render: (row) => {
        const imageUrl = row.image
          ? row.image.startsWith("http")
            ? row.image
            : `http://localhost:5000/${row.image}`
          : null;

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div style={styles.imageThumb}>
              {imageUrl ? (
                <img src={imageUrl} alt={row.name} style={styles.img} />
              ) : (
                <Package size={20} color="#2563eb" />
              )}
            </div>
            <div>
              <div style={{ fontWeight: "700", color: "#0f172a" }}>
                {row.name}
              </div>
              <span style={styles.skuBadge}>SKU: {row.sku}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Category",
      render: (row) => (
        <span className="badge badge-primary">
          {row.category?.name || "Unassigned"}
        </span>
      ),
    },
    {
      header: "Price",
      render: (row) => (
        <span style={{ fontWeight: "700", color: "#0f172a" }}>
          ${Number(row.price).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Stock Qty",
      render: (row) => {
        const isLow = row.quantity <= row.reorderLevel;
        return (
          <div>
            <div style={{ fontWeight: "800", fontSize: "0.95rem" }}>
              {row.quantity} units
            </div>
            <span className={isLow ? "badge badge-danger" : "badge badge-success"}>
              {isLow ? "LOW STOCK" : "IN STOCK"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Supplier",
      render: (row) => (
        <span style={{ color: "#475569" }}>
          {row.supplier?.name || "N/A"}
        </span>
      ),
    },
    {
      header: "Warehouse",
      render: (row) => (
        <span style={{ color: "#475569" }}>
          {row.warehouse?.name || "N/A"}
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
            title="Edit Product"
          >
            <Edit3 size={16} color="#2563eb" />
          </button>
          <button
            onClick={() => handleDelete(row._id, row.name)}
            style={{ ...styles.actionBtn, backgroundColor: "#fef2f2" }}
            title="Delete Product"
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
          <h1 className="page-title">Products Inventory</h1>
          <p className="page-subtitle">
            Manage inventory items, SKUs, pricing, stock levels, and warehouse allocations
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div style={styles.toolbar}>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search product name, SKU..."
        />

        <div style={styles.filterGroup}>
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`btn ${showLowStockOnly ? "btn-danger" : "btn-secondary"}`}
            style={styles.lowStockBtn}
          >
            <AlertTriangle size={16} />
            <span>Low Stock</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loader message="Loading products inventory..." />
      ) : (
        <Table
          columns={columns}
          data={filteredProducts}
          emptyMessage="No products found matching your search and filters."
        />
      )}

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div style={styles.errorBox}>
              <AlertTriangle size={18} />
              <span>{formError}</span>
            </div>
          )}

          <div style={styles.gridTwo}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Wireless Ergonomic Mouse"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">SKU Code *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. PROD-1002"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div style={styles.gridThree}>
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="49.99"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Quantity *</label>
              <input
                type="number"
                min="0"
                className="form-input"
                placeholder="50"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reorder Level *</label>
              <input
                type="number"
                min="0"
                className="form-input"
                placeholder="10"
                value={formData.reorderLevel}
                onChange={(e) =>
                  setFormData({ ...formData, reorderLevel: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div style={styles.gridThree}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

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
              <label className="form-label">Warehouse *</label>
              <select
                className="form-select"
                value={formData.warehouse}
                onChange={(e) =>
                  setFormData({ ...formData, warehouse: e.target.value })
                }
                required
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Product Image (Multer Upload)</label>
            <div style={styles.uploadArea}>
              {imagePreview ? (
                <div style={styles.previewBox}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={styles.previewImg}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    style={styles.removeImgBtn}
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <label style={styles.uploadLabel}>
                  <Upload size={24} color="#64748b" />
                  <span>Click to select JPG, JPEG, or PNG (Max 5MB)</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
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
                ? "Saving Product..."
                : editingProduct
                ? "Update Product"
                : "Create Product"}
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
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  filterSelect: {
    padding: "0.55rem 0.85rem",
    fontSize: "0.85rem",
    minWidth: "160px",
  },
  lowStockBtn: {
    padding: "0.55rem 0.85rem",
    fontSize: "0.85rem",
  },
  imageThumb: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    backgroundColor: "#eff6ff",
    border: "1px solid #dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  skuBadge: {
    fontSize: "0.75rem",
    color: "#64748b",
    fontFamily: "monospace",
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
  uploadArea: {
    border: "2px dashed #cbd5e1",
    borderRadius: "12px",
    padding: "1rem",
    textAlign: "center",
    backgroundColor: "#f8fafc",
  },
  uploadLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
    color: "#64748b",
    fontSize: "0.85rem",
  },
  previewBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },
  previewImg: {
    width: "60px",
    height: "60px",
    borderRadius: "8px",
    objectFit: "cover",
  },
  removeImgBtn: {
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fecaca",
    padding: "0.4rem 0.75rem",
    borderRadius: "8px",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
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

export default Products;
