import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Package,
  Tag,
  Warehouse,
  Truck,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers,
  RefreshCw,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ProductScan = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/products/public/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? "Product not found."
            : "Failed to load product details."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  /* ─── Stock badge helper ──────────────────────────────────── */
  const getStockBadge = (qty, reorderLevel) => {
    if (qty === 0)            return { label: "Out of Stock",  bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" };
    if (qty <= reorderLevel)  return { label: "Low Stock",     bg: "#fffbeb", color: "#b45309", dot: "#f59e0b" };
    return                           { label: "In Stock",      bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" };
  };

  /* ─── Loading ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadWrap}>
          <div style={styles.spinner} />
          <p style={styles.loadText}>Loading product details…</p>
        </div>
      </div>
    );
  }

  /* ─── Error ───────────────────────────────────────────────── */
  if (error || !product) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.errorIcon}>
            <Package size={40} color="#94a3b8" />
          </div>
          <h2 style={styles.errorTitle}>Product Not Found</h2>
          <p style={styles.errorSub}>{error || "This QR code may be outdated or the product was removed."}</p>
        </div>
      </div>
    );
  }

  const imageUrl = product.image
    ? product.image.startsWith("http")
      ? product.image
      : `/${product.image.replace(/^\//, '')}`
    : null;

  const badge = getStockBadge(product.quantity, product.reorderLevel);
  const totalValue = (Number(product.price) * Number(product.quantity)).toFixed(2);

  return (
    <div style={styles.page}>
      {/* ── Brand bar ── */}
      <div style={styles.brandBar}>
        <div style={styles.brandLogo}>
          <Layers size={18} color="#ffffff" />
        </div>
        <span style={styles.brandName}>StockSense</span>
        <span style={styles.brandTag}>Inventory Management</span>
      </div>

      <div style={styles.card}>
        {/* ── Product Hero ── */}
        <div style={styles.hero}>
          <div style={styles.heroImg}>
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} style={styles.img} />
            ) : (
              <Package size={56} color="#2563eb" />
            )}
          </div>

          {/* Stock status badge */}
          <div
            style={{
              ...styles.stockBadge,
              backgroundColor: badge.bg,
              color: badge.color,
            }}
          >
            <span
              style={{
                ...styles.stockDot,
                backgroundColor: badge.dot,
              }}
            />
            {badge.label}
          </div>
        </div>

        {/* ── Name & SKU ── */}
        <div style={styles.nameBlock}>
          <h1 style={styles.productName}>{product.name}</h1>
          <div style={styles.skuRow}>
            <Tag size={13} color="#64748b" />
            <span style={styles.sku}>{product.sku?.toUpperCase() || "N/A"}</span>
          </div>
        </div>

        {/* ── Key Stats ── */}
        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <span style={styles.statVal}>{product.quantity}</span>
            <span style={styles.statLabel}>Units in Stock</span>
          </div>
          <div style={{ ...styles.statBox, borderLeft: "1px solid #f1f5f9" }}>
            <span style={styles.statVal}>${Number(product.price).toFixed(2)}</span>
            <span style={styles.statLabel}>Unit Price</span>
          </div>
          <div style={{ ...styles.statBox, borderLeft: "1px solid #f1f5f9" }}>
            <span style={styles.statVal}>${totalValue}</span>
            <span style={styles.statLabel}>Stock Value</span>
          </div>
        </div>

        {/* ── Details List ── */}
        <div style={styles.detailsList}>
          <DetailRow
            icon={<CheckCircle2 size={16} color="#10b981" />}
            label="Reorder Level"
            value={`${product.reorderLevel} units`}
            warn={product.quantity <= product.reorderLevel && product.quantity > 0}
          />
          <DetailRow
            icon={<Layers size={16} color="#2563eb" />}
            label="Category"
            value={product.category?.name || "Uncategorised"}
          />
          <DetailRow
            icon={<Truck size={16} color="#8b5cf6" />}
            label="Supplier"
            value={product.supplier?.name || "N/A"}
            sub={product.supplier?.email}
          />
          <DetailRow
            icon={<Warehouse size={16} color="#f59e0b" />}
            label="Warehouse"
            value={product.warehouse?.name || "N/A"}
            sub={product.warehouse?.location}
            last
          />
        </div>

        {/* ── Low stock alert ── */}
        {product.quantity <= product.reorderLevel && product.quantity > 0 && (
          <div style={styles.alertBanner}>
            <AlertTriangle size={16} color="#b45309" />
            <span>Stock is below reorder threshold — replenishment recommended.</span>
          </div>
        )}

        {product.quantity === 0 && (
          <div style={{ ...styles.alertBanner, backgroundColor: "#fef2f2", borderColor: "#fecaca", color: "#dc2626" }}>
            <XCircle size={16} color="#dc2626" />
            <span>This product is currently out of stock.</span>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={styles.footer}>
          <RefreshCw size={12} color="#94a3b8" />
          <span>
            Last updated: {new Date(product.updatedAt || product.createdAt).toLocaleString("en-GB", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ── Reusable detail row ──────────────────────────────────────── */
const DetailRow = ({ icon, label, value, sub, warn, last }) => (
  <div
    style={{
      ...rowStyles.row,
      borderBottom: last ? "none" : "1px solid #f8fafc",
    }}
  >
    <div style={rowStyles.iconWrap}>{icon}</div>
    <div style={rowStyles.content}>
      <span style={rowStyles.label}>{label}</span>
      <span style={{ ...rowStyles.value, color: warn ? "#b45309" : "#0f172a" }}>
        {value}
        {warn && <AlertTriangle size={12} color="#f59e0b" style={{ marginLeft: 6 }} />}
      </span>
      {sub && <span style={rowStyles.sub}>{sub}</span>}
    </div>
  </div>
);

/* ─────────────────────────── Styles ─────────────────────────── */
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 0 40px",
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  },

  /* Brand bar */
  brandBar: {
    width: "100%",
    backgroundColor: "#2563eb",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 20px",
    marginBottom: "28px",
  },
  brandLogo: {
    width: "32px", height: "32px",
    borderRadius: "10px",
    backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  brandName: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: "-0.02em",
  },
  brandTag: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.65)",
    marginLeft: "2px",
  },

  /* Card */
  card: {
    width: "100%",
    maxWidth: "440px",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
    overflow: "hidden",
    margin: "0 16px",
  },

  /* Hero section */
  hero: {
    position: "relative",
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px 32px",
    borderBottom: "1px solid #f1f5f9",
  },
  heroImg: {
    width: "120px", height: "120px",
    borderRadius: "20px",
    backgroundColor: "#eff6ff",
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(37, 99, 235, 0.12)",
    border: "2px solid #dbeafe",
  },
  img: {
    width: "100%", height: "100%", objectFit: "cover",
  },
  stockBadge: {
    position: "absolute",
    top: "16px", right: "16px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    border: "1px solid transparent",
  },
  stockDot: {
    width: "7px", height: "7px", borderRadius: "50%",
  },

  /* Name block */
  nameBlock: {
    padding: "20px 24px 0",
    textAlign: "center",
  },
  productName: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px",
    lineHeight: 1.2,
  },
  skuRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#f1f5f9",
    padding: "4px 12px",
    borderRadius: "8px",
    marginBottom: "4px",
  },
  sku: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#64748b",
    fontFamily: "monospace",
    letterSpacing: "0.06em",
  },

  /* Stats grid */
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    margin: "20px 24px",
    backgroundColor: "#f8fafc",
    borderRadius: "14px",
    overflow: "hidden",
    border: "1px solid #f1f5f9",
  },
  statBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "14px 8px",
    gap: "2px",
  },
  statVal: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "10px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    textAlign: "center",
  },

  /* Details list */
  detailsList: {
    padding: "0 24px",
  },

  /* Alerts */
  alertBanner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "16px 24px 0",
    padding: "12px 14px",
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "12px",
    fontSize: "13px",
    color: "#b45309",
    fontWeight: "500",
  },

  /* Footer */
  footer: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "16px 24px",
    marginTop: "16px",
    borderTop: "1px solid #f8fafc",
    fontSize: "11px",
    color: "#94a3b8",
  },

  /* Load / error */
  loadWrap: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "16px", marginTop: "40vh",
  },
  spinner: {
    width: "40px", height: "40px",
    borderRadius: "50%",
    border: "3px solid #e2e8f0",
    borderTopColor: "#2563eb",
    animation: "spin 0.8s linear infinite",
  },
  loadText: {
    color: "#64748b", fontSize: "14px", fontWeight: "500",
  },
  errorIcon: {
    display: "flex", justifyContent: "center",
    padding: "40px 0 16px",
  },
  errorTitle: {
    fontSize: "20px", fontWeight: "800", color: "#0f172a",
    textAlign: "center", margin: "0 0 8px",
  },
  errorSub: {
    fontSize: "14px", color: "#64748b",
    textAlign: "center", padding: "0 24px 32px",
  },
};

const rowStyles = {
  row: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "14px 0",
  },
  iconWrap: {
    width: "32px", height: "32px",
    borderRadius: "10px",
    backgroundColor: "#f8fafc",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    marginTop: "1px",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  value: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
  },
  sub: {
    fontSize: "12px",
    color: "#94a3b8",
  },
};

export default ProductScan;
