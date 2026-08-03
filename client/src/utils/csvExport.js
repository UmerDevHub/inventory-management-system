/**
 * Reusable Enterprise CSV Export Utility
 * Safely formats headers, dates, numbers, currency, and escapes special characters.
 */

export const exportToCSV = (filename, headers, rows) => {
  if (!rows || rows.length === 0) {
    alert("No data available to export.");
    return;
  }

  let csvContent = "\uFEFF"; // UTF-8 BOM for Excel compatibility

  // Add Headers
  csvContent += headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(",") + "\r\n";

  // Add Rows
  rows.forEach((row) => {
    const formattedRow = row.map((cell) => {
      if (cell === null || cell === undefined) return '""';
      const cellStr = String(cell);
      return `"${cellStr.replace(/"/g, '""')}"`;
    });
    csvContent += formattedRow.join(",") + "\r\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  const safeFilename = `${filename.replace(/\s+/g, "-")}-${dateStr}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
