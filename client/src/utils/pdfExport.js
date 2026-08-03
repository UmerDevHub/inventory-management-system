import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Reusable Enterprise PDF Export Utility
 * Generates landscape/portrait PDF reports with corporate headers, KPI summaries,
 * alternating row colors, table borders, page numbering, and automated footers.
 */
export const exportToPDF = ({
  title,
  subtitle = "Inventory Management System Report",
  summaryItems = [],
  headers = [],
  rows = [],
  filename = "Inventory-Report",
  orientation = "landscape",
}) => {
  if (!rows || rows.length === 0) {
    alert("No data available to export to PDF.");
    return;
  }

  const doc = new jsPDF({
    orientation: orientation,
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.width;

  // 1. Corporate Header
  doc.setFillColor(37, 99, 235); // #2563EB Primary Blue
  doc.rect(0, 0, pageWidth, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("WarehouseOS Inventory Platform", 14, 15);

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${currentDate} at ${currentTime} | By System Admin`, pageWidth - 14, 15, { align: "right" });

  // 2. Report Title & Subtitle
  let yPos = 34;
  doc.setTextColor(15, 23, 42); // #0F172A
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, yPos);

  yPos += 6;
  doc.setTextColor(100, 116, 139); // #64748B
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(subtitle, 14, yPos);

  // 3. KPI Summary Cards Box (if provided)
  if (summaryItems && summaryItems.length > 0) {
    yPos += 8;
    const cardWidth = (pageWidth - 28 - (summaryItems.length - 1) * 6) / summaryItems.length;

    summaryItems.forEach((item, index) => {
      const xPos = 14 + index * (cardWidth + 6);
      doc.setFillColor(248, 250, 252); // #F8FAFC
      doc.setDrawColor(229, 231, 235); // #E5E7EB
      doc.roundedRect(xPos, yPos, cardWidth, 16, 3, 3, "FD");

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text(item.label.toUpperCase(), xPos + 6, yPos + 6);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(String(item.value), xPos + 6, yPos + 12);
    });

    yPos += 22;
  } else {
    yPos += 10;
  }

  // 4. AutoTable Enterprise Styling
  autoTable(doc, {
    startY: yPos,
    head: [headers],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
      halign: "left",
      cellPadding: 3,
    },
    bodyStyles: {
      textColor: [15, 23, 42],
      fontSize: 8.5,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14, top: 28, bottom: 20 },
    didDrawPage: (data) => {
      // 5. Automated Footer with Page Numbers
      const totalPages = doc.internal.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.height;

      doc.setDrawColor(229, 231, 235);
      doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // #94A3B8
      doc.text("WarehouseOS © Enterprise Inventory Management System", 14, pageHeight - 8);
      doc.text(`Page ${data.pageNumber} of ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: "right" });
    },
  });

  const dateStr = new Date().toISOString().split("T")[0];
  const safeFilename = `${filename.replace(/\s+/g, "-")}-${dateStr}.pdf`;
  doc.save(safeFilename);
};
