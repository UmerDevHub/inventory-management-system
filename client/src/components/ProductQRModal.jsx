import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X, Download, Printer, Package, Tag, Barcode } from "lucide-react";

/**
 * ProductQRModal
 * Renders a premium modal with a QR code for the given product.
 * The QR payload encodes a JSON string with SKU, name, and ID
 * so any warehouse scanner can quickly identify the item.
 *
 * Props:
 *  product  – product object (required)
 *  onClose  – function called when modal is dismissed
 */
const ProductQRModal = ({ product, onClose }) => {
  const canvasRef = useRef(null);

  if (!product) return null;

  const qrPayload = JSON.stringify({
    id:  product._id,
    sku: product.sku?.toUpperCase() || "N/A",
    name: product.name,
  });

  const imageUrl = product.image
    ? product.image.startsWith("http")
      ? product.image
      : `http://localhost:5000/${product.image}`
    : null;

  // ── Download ──────────────────────────────────────────────
  const handleDownload = () => {
    const canvas = document.getElementById("product-qr-canvas");
    if (!canvas) return;

    // Build a composite canvas: QR code + white padding + label
    const padding  = 24;
    const labelH   = 64;
    const size     = canvas.width;
    const totalW   = size + padding * 2;
    const totalH   = size + padding * 2 + labelH;

    const out = document.createElement("canvas");
    out.width  = totalW;
    out.height = totalH;
    const ctx  = out.getContext("2d");

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, totalW, totalH);

    // QR code
    ctx.drawImage(canvas, padding, padding, size, size);

    // SKU label
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 16px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(product.name, totalW / 2, size + padding * 2 + 20);

    ctx.fillStyle = "#64748b";
    ctx.font = "13px monospace";
    ctx.fillText(`SKU: ${product.sku?.toUpperCase() || "N/A"}`, totalW / 2, size + padding * 2 + 44);

    const link = document.createElement("a");
    link.download = `QR_${product.sku?.toUpperCase() || product._id}.png`;
    link.href = out.toDataURL("image/png");
    link.click();
  };

  // ── Print ──────────────────────────────────────────────────
  const handlePrint = () => {
    const canvas = document.getElementById("product-qr-canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");

    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code – ${product.name}</title>
          <style>
            body { margin: 0; display: flex; flex-direction: column;
                   align-items: center; justify-content: center;
                   min-height: 100vh; font-family: system-ui, sans-serif; }
            img  { width: 240px; height: 240px; display: block; margin-bottom: 12px; }
            h2   { font-size: 18px; font-weight: 700; margin: 0 0 4px; color: #0f172a; }
            p    { font-size: 13px; color: #64748b; margin: 0; font-family: monospace; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" />
          <h2>${product.name}</h2>
          <p>SKU: ${product.sku?.toUpperCase() || "N/A"}</p>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIconWrap}>
              <Barcode size={20} color="#2563eb" />
            </div>
            <div>
              <h2 style={styles.headerTitle}>Product QR Code</h2>
              <p style={styles.headerSub}>Scan to identify this item in your warehouse</p>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose} title="Close">
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* ── Product Info Strip ── */}
        <div style={styles.productStrip}>
          <div style={styles.productThumb}>
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} style={styles.productImg} />
            ) : (
              <Package size={28} color="#2563eb" />
            )}
          </div>
          <div style={styles.productMeta}>
            <span style={styles.productName}>{product.name}</span>
            <div style={styles.productBadges}>
              <span style={styles.skuBadge}>
                <Tag size={11} style={{ marginRight: 4 }} />
                {product.sku?.toUpperCase() || "N/A"}
              </span>
              {product.category?.name && (
                <span style={styles.catBadge}>{product.category.name}</span>
              )}
            </div>
          </div>
          <div style={styles.stockInfo}>
            <span style={styles.stockQty}>{product.quantity ?? "–"}</span>
            <span style={styles.stockLabel}>In Stock</span>
          </div>
        </div>

        {/* ── QR Code ── */}
        <div style={styles.qrWrapper}>
          {/* Subtle grid background */}
          <div style={styles.qrBg}>
            <div style={styles.qrCornerTL} />
            <div style={styles.qrCornerTR} />
            <div style={styles.qrCornerBL} />
            <div style={styles.qrCornerBR} />

            <QRCodeCanvas
              id="product-qr-canvas"
              value={qrPayload}
              size={200}
              level="H"
              includeMargin={false}
              imageSettings={{
                src: "/vite.svg",
                height: 0,
                width: 0,
                excavate: false,
              }}
              style={{ display: "block" }}
            />
          </div>

          <div style={styles.qrMeta}>
            <span style={styles.qrSkuLine}>{product.sku?.toUpperCase() || "N/A"}</span>
            <span style={styles.qrIdLine}>ID: {product._id?.slice(-8).toUpperCase()}</span>
          </div>
        </div>

        {/* ── Info note ── */}
        <p style={styles.note}>
          Scan with any QR reader to instantly pull up product details.
          Compatible with all warehouse management systems.
        </p>

        {/* ── Actions ── */}
        <div style={styles.actions}>
          <button style={styles.btnSecondary} onClick={handlePrint}>
            <Printer size={16} />
            Print Label
          </button>
          <button style={styles.btnPrimary} onClick={handleDownload}>
            <Download size={16} />
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── Styles ─────────────────────────── */
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)",
    overflow: "hidden",
    animation: "fadeScaleIn 0.22s ease",
  },

  /* Header */
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  headerIconWrap: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
    lineHeight: 1.2,
  },
  headerSub: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: "2px 0 0",
  },
  closeBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
  },

  /* Product info strip */
  productStrip: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 24px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #f1f5f9",
  },
  productThumb: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
    border: "1px solid #dbeafe",
  },
  productImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  productMeta: {
    flex: 1,
    minWidth: 0,
  },
  productName: {
    display: "block",
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  productBadges: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "4px",
  },
  skuBadge: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "6px",
    fontFamily: "monospace",
  },
  catBadge: {
    display: "inline-block",
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "6px",
  },
  stockInfo: {
    textAlign: "right",
    flexShrink: 0,
  },
  stockQty: {
    display: "block",
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 1,
  },
  stockLabel: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "500",
  },

  /* QR Code section */
  qrWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "28px 24px 16px",
  },
  qrBg: {
    position: "relative",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "2px solid #e2e8f0",
    boxShadow: "0 4px 20px rgba(37, 99, 235, 0.08)",
  },
  /* Corner accent marks */
  qrCornerTL: {
    position: "absolute", top: 8,  left: 8,
    width: 20, height: 20,
    borderTop: "3px solid #2563eb",
    borderLeft: "3px solid #2563eb",
    borderRadius: "4px 0 0 0",
  },
  qrCornerTR: {
    position: "absolute", top: 8,  right: 8,
    width: 20, height: 20,
    borderTop: "3px solid #2563eb",
    borderRight: "3px solid #2563eb",
    borderRadius: "0 4px 0 0",
  },
  qrCornerBL: {
    position: "absolute", bottom: 8, left: 8,
    width: 20, height: 20,
    borderBottom: "3px solid #2563eb",
    borderLeft: "3px solid #2563eb",
    borderRadius: "0 0 0 4px",
  },
  qrCornerBR: {
    position: "absolute", bottom: 8, right: 8,
    width: 20, height: 20,
    borderBottom: "3px solid #2563eb",
    borderRight: "3px solid #2563eb",
    borderRadius: "0 0 4px 0",
  },
  qrMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
    marginTop: "14px",
  },
  qrSkuLine: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#0f172a",
    fontFamily: "monospace",
    letterSpacing: "0.08em",
  },
  qrIdLine: {
    fontSize: "11px",
    color: "#94a3b8",
    fontFamily: "monospace",
  },

  /* Note */
  note: {
    fontSize: "12px",
    color: "#94a3b8",
    textAlign: "center",
    margin: "0 24px 20px",
    lineHeight: 1.5,
  },

  /* Action buttons */
  actions: {
    display: "flex",
    gap: "10px",
    padding: "16px 24px 20px",
    borderTop: "1px solid #f1f5f9",
  },
  btnSecondary: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 0",
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  btnPrimary: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 0",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    border: "none",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
    transition: "all 0.15s ease",
  },
};

export default ProductQRModal;
