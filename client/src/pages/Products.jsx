import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Package,
  Filter,
  AlertTriangle,
  Upload,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Boxes,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import API from "../api/axios";
import Table from "../components/Table";
import Modal from "../components/Modal";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loader";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Add / Edit Modal State
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
        showToast(`Product "${formData.name}" updated successfully!`);
      } else {
        await API.post("/products", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast(`Product "${formData.name}" added to inventory!`);
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

  const promptDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await API.delete(`/products/${deleteId}`);
      setIsDeleteOpen(false);
      showToast(`Product "${deleteName}" removed from inventory.`);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete product", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const rows = [["Product Name", "SKU", "Category", "Price", "Stock Quantity", "Reorder Level", "Supplier", "Warehouse"]];

    filteredProducts.forEach((p) => {
      rows.push([
        `"${p.name}"`,
        p.sku,
        `"${p.category?.name || "N/A"}"`,
        p.price,
        p.quantity,
        p.reorderLevel,
        `"${p.supplier?.name || "N/A"}"`,
        `"${p.warehouse?.name || "N/A"}"`,
      ]);
    });

    csvContent += rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `products_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Logic
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

    let matchesStatus = true;
    if (statusFilter === "in-stock") {
      matchesStatus = prod.quantity > prod.reorderLevel;
    } else if (statusFilter === "low-stock") {
      matchesStatus = prod.quantity > 0 && prod.quantity <= prod.reorderLevel;
    } else if (statusFilter === "out-stock") {
      matchesStatus = prod.quantity === 0;
    }

    return (
      matchesSearch && matchesCategory && matchesWarehouse && matchesStatus
    );
  });

  // Calculate Statistics
  const totalProductsCount = products.length;
  const inStockCount = products.filter((p) => p.quantity > p.reorderLevel).length;
  const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity <= p.reorderLevel).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDisplayedProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

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
          <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "4px 0" }}>
            <div style={styles.imageThumbLarge}>
              {imageUrl ? (
                <img src={imageUrl} alt={row.name} style={styles.img} />
              ) : (
                <Package size={26} color="#2563eb" />
              )}
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a" }}>
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
        <span style={styles.softCategoryBadge}>
          {row.category?.name || "Unassigned"}
        </span>
      ),
    },
    {
      header: "Price",
      render: (row) => (
        <span style={{ fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>
          ${Number(row.price).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Stock",
      render: (row) => {
        const isOut = row.quantity === 0;
        const isLow = row.quantity > 0 && row.quantity <= row.reorderLevel;

        const badgeClass = isOut
          ? "badge badge-danger"
          : isLow
          ? "badge badge-warning"
          : "badge badge-success";

        const dotColor = isOut ? "#ef4444" : isLow ? "#f59e0b" : "#22c55e";
        const label = isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock";
        const tooltip = isOut
          ? "No units available. Restocking required."
          : isLow
          ? "Inventory has reached the reorder threshold."
          : "Quantity is above the reorder level.";

        // Progress ratio
        const maxRatio = Math.min(Math.max((row.quantity / (row.reorderLevel * 3 || 15)) * 100, 4), 100);
        const progressColor = isOut ? "#ef4444" : isLow ? "#f59e0b" : "#22c55e";

        return (
          <div title={tooltip} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
              <span style={{ fontWeight: "800", fontSize: "24px", color: "#0f172a", lineHeight: 1 }}>
                {row.quantity}
              </span>
              <span style={{ fontSize: "14px", fontWeight: "500", color: "#64748b" }}>Units</span>
            </div>

            {/* Subtle Progress Bar */}
            <div style={{ width: "90px", height: "4px", backgroundColor: "#f1f5f9", borderRadius: "999px", overflow: "hidden", margin: "2px 0 4px 0" }}>
              <div style={{ width: `${maxRatio}%`, height: "100%", backgroundColor: progressColor, borderRadius: "999px" }}></div>
            </div>

            <div>
              <span className={badgeClass}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: dotColor, display: "inline-block" }}></span>
                {label}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Supplier",
      render: (row) => (
        <span style={{ color: "#475569", fontWeight: "500" }}>
          {row.supplier?.name || "N/A"}
        </span>
      ),
    },
    {
      header: "Warehouse",
      render: (row) => (
        <span style={{ color: "#475569", fontWeight: "500" }}>
          {row.warehouse?.name || "N/A"}
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
            title="Edit Product"
          >
            <Edit3 size={16} color="#2563eb" />
          </button>
          <button
            onClick={() => promptDelete(row._id, row.name)}
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
      {/* Toast Notification */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      {/* Header & Quick Actions */}
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="page-title">Products Inventory</h1>
          <p className="page-subtitle">
            Manage inventory items, pricing, stock levels and warehouse allocation.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => window.print()} className="btn btn-secondary" style={styles.quickActionBtn}>
            <Printer size={16} />
            <span>Print</span>
          </button>

          <button onClick={handleExportCSV} className="btn btn-secondary" style={styles.quickActionBtn}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          <button onClick={handleOpenAddModal} className="btn btn-primary" style={styles.addProductBtn}>
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Top Statistics Cards Row */}
      <div style={styles.statsCardsGrid}>
        <div className="card" style={styles.statCard}>
          <div style={styles.statCardLeft}>
            <span style={styles.statCardLabel}>TOTAL PRODUCTS</span>
            <span style={styles.statCardValue}>{totalProductsCount}</span>
          </div>
          <div style={{ ...styles.statIconBox, backgroundColor: "#eff6ff" }}>
            <Boxes size={22} color="#2563eb" />
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statCardLeft}>
            <span style={styles.statCardLabel}>IN STOCK</span>
            <span style={{ ...styles.statCardValue, color: "#10b981" }}>{inStockCount}</span>
          </div>
          <div style={{ ...styles.statIconBox, backgroundColor: "#ecfdf5" }}>
            <CheckCircle2 size={22} color="#10b981" />
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statCardLeft}>
            <span style={styles.statCardLabel}>LOW STOCK</span>
            <span style={{ ...styles.statCardValue, color: "#f59e0b" }}>{lowStockCount}</span>
          </div>
          <div style={{ ...styles.statIconBox, backgroundColor: "#fef3c7" }}>
            <AlertTriangle size={22} color="#d97706" />
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statCardLeft}>
            <span style={styles.statCardLabel}>OUT OF STOCK</span>
            <span style={{ ...styles.statCardValue, color: "#ef4444" }}>{outOfStockCount}</span>
          </div>
          <div style={{ ...styles.statIconBox, backgroundColor: "#fef2f2" }}>
            <XCircle size={22} color="#ef4444" />
          </div>
        </div>
      </div>

      {/* Search & Filters Bar (Single Row Alignment) */}
      <div style={styles.toolbar}>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          placeholder="Search products by name or SKU..."
        />

        <div style={styles.filterGroup}>
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
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
            onChange={(e) => {
              setSelectedWarehouse(e.target.value);
              setCurrentPage(1);
            }}
            style={styles.filterSelect}
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={styles.filterSelect}
          >
            <option value="all">Status: All</option>
            <option value="in-stock">Status: In Stock</option>
            <option value="low-stock">Status: Low Stock</option>
            <option value="out-stock">Status: Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <Loader message="Loading products inventory..." />
      ) : (
        <>
          <Table
            columns={columns}
            data={currentDisplayedProducts}
            emptyMessage="No products found matching your search and filter criteria."
          />

          {/* Pagination Footer */}
          {filteredProducts.length > 0 && (
            <div style={styles.paginationFooter}>
              <span style={styles.paginationText}>
                Showing <strong>{indexOfFirstItem + 1}</strong>–
                <strong>{Math.min(indexOfLastItem, filteredProducts.length)}</strong> of{" "}
                <strong>{filteredProducts.length}</strong> products
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

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        subtitle={
          editingProduct
            ? "Update pricing, quantity, or warehouse allocation for this item."
            : "Create a new inventory item and allocate it to a warehouse."
        }
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div style={styles.errorBox}>
              <AlertTriangle size={18} />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Product Information */}
          <div style={styles.sectionHeader}>Product Information</div>

          <div style={styles.gridTwo}>
            <div className="form-group">
              <label className="form-label">
                Product Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
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
              <label className="form-label">
                SKU Code <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. PRD-102"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div style={styles.sectionHeader}>Pricing & Stock Levels</div>

          <div style={styles.gridThree}>
            <div className="form-group">
              <label className="form-label">
                Unit Price ($) <span style={{ color: "#ef4444" }}>*</span>
              </label>
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
              <label className="form-label">
                Stock Quantity <span style={{ color: "#ef4444" }}>*</span>
              </label>
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
              <label className="form-label">
                Reorder Level <span style={{ color: "#ef4444" }}>*</span>
              </label>
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
              <label className="form-label">
                Category <span style={{ color: "#ef4444" }}>*</span>
              </label>
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
              <label className="form-label">
                Supplier <span style={{ color: "#ef4444" }}>*</span>
              </label>
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
              <label className="form-label">
                Warehouse <span style={{ color: "#ef4444" }}>*</span>
              </label>
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

          {/* Section 3: Product Image Upload */}
          <div style={styles.sectionHeader}>Product Media</div>

          <div className="form-group">
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
                  <Upload size={28} color="#2563eb" />
                  <span style={{ fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>
                    Drag & Drop Image or Click to Browse
                  </span>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>
                    Supports PNG, JPG, JPEG (Max 5MB)
                  </span>
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
              style={styles.footerCancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={styles.footerSubmitBtn}
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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to remove product "${deleteName}" from inventory?`}
        loading={deleting}
      />
    </div>
  );
};

const styles = {
  addProductBtn: {
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
    height: "100px",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontSize: "34px",
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
    flexWrap: "wrap",
  },
  filterSelect: {
    padding: "10px 16px",
    fontSize: "14px",
    minWidth: "165px",
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
  softCategoryBadge: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
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
  sectionHeader: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginTop: "16px",
    marginBottom: "16px",
    paddingBottom: "8px",
    borderBottom: "1px solid #f1f5f9",
  },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  gridThree: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "20px",
  },
  uploadArea: {
    border: "2px dashed #cbd5e1",
    borderRadius: "16px",
    padding: "24px",
    textAlign: "center",
    backgroundColor: "#f8fafc",
    transition: "border-color 0.15s ease",
  },
  uploadLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  previewBox: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
  },
  previewImg: {
    width: "72px",
    height: "72px",
    borderRadius: "12px",
    objectFit: "cover",
  },
  removeImgBtn: {
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fecaca",
    padding: "8px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
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
    marginTop: "32px",
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9",
  },
  footerCancelBtn: {
    height: "54px",
    borderRadius: "14px",
    padding: "0 28px",
    fontSize: "15px",
    fontWeight: "600",
  },
  footerSubmitBtn: {
    height: "54px",
    borderRadius: "14px",
    padding: "0 28px",
    fontSize: "15px",
    fontWeight: "600",
  },
};

export default Products;
