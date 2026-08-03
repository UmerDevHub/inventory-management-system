import React from "react";
import { Inbox } from "lucide-react";

const Table = ({ columns, data, emptyMessage = "No records found" }) => {
  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} style={col.style}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={styles.emptyTd}>
                <div style={styles.emptyContent}>
                  <div style={styles.emptyIconCircle}>
                    <Inbox size={24} color="#94a3b8" />
                  </div>
                  <span>{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row._id || rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} style={col.style}>
                    {col.render
                      ? col.render(row)
                      : col.accessor
                      ? row[col.accessor]
                      : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  emptyTd: {
    textAlign: "center",
    padding: "3rem 1rem",
  },
  emptyContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
    color: "#64748b",
    fontSize: "0.9rem",
  },
  emptyIconCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default Table;
