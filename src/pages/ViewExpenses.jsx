import React, { useState, useEffect } from "react";
import { 
  fetchHostelsApi, 
  fetchExpenseReportDetailsApi, 
  fetchAllExpensesApi,
  downloadExpensesApi // Pass filter params to trigger the export download
} from "../services/api";

const ViewExpenses = ({ onEdit }) => {
  const [hostels, setHostels] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorStatus, setErrorStatus] = useState("");

  const [filterCriteria, setFilterCriteria] = useState({
    hostelId: "ALL",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    paidBy: "",
    expenseType: "",
    description: "",
  });

  useEffect(() => {
    const loadHostels = async () => {
      try {
        const data = await fetchHostelsApi();
        setHostels(data || []);
      } catch (err) {
        console.error("Error loading master hostels list:", err);
        setErrorStatus("Failed to load hostels list.");
      }
    };
    loadHostels();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilterCriteria((prev) => ({ ...prev, [name]: value }));
  };

  const executeFetchQueryData = async () => {
    setErrorStatus("");
    const { hostelId, startDate, endDate, paidBy, expenseType, description } = filterCriteria;

    setLoading(true);
    try {
      let results = [];

      if (hostelId === "ALL") {
        results = await fetchAllExpensesApi(paidBy, expenseType, description);
      } else {
        if (!hostelId || !startDate || !endDate) {
          setErrorStatus("Please select a valid hostel and date range.");
          setLoading(false);
          return;
        }
        results = await fetchExpenseReportDetailsApi(hostelId, startDate, endDate);
      }

      setExpenses(results || []);
    } catch (err) {
      console.error("Error fetching expense data:", err);
      setErrorStatus("Error loading expenses for the selected criteria.");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchExpensesSubmit = (e) => {
    e.preventDefault();
    executeFetchQueryData();
  };

  // Handles dynamic backend download URL based on selected hostel
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadExpensesApi(filterCriteria);
    } catch (err) {
      console.error("Download error:", err);
      setErrorStatus("Failed to download expense report.");
    } finally {
      setIsDownloading(false);
    }
  };

  const isViewAllMode = filterCriteria.hostelId === "ALL";

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: "20px", color: "#333", borderBottom: "2px solid #dc3545", paddingBottom: "10px" }}>
        📊 View Expenses
      </h2>

      {errorStatus && (
        <div style={{ padding: "12px", marginBottom: "20px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "6px", border: "1px solid #f5c6cb" }}>
          ⚠️ {errorStatus}
        </div>
      )}

      <form onSubmit={handleFetchExpensesSubmit} style={filterBarGrid}>
        <div>
          <label style={labelStyle}>Select Hostel Property</label>
          <select 
            name="hostelId" 
            value={filterCriteria.hostelId} 
            onChange={handleInputChange} 
            style={inputStyle}
          >
            <option value="ALL">-- View All Hostels --</option>
            {hostels.map((h) => (
              <option key={h.hostelId} value={h.hostelId}>{h.hostelName}</option>
            ))}
          </select>
        </div>

        {!isViewAllMode ? (
          <>
            <div>
              <label style={labelStyle}>From Date</label>
              <input type="date" name="startDate" value={filterCriteria.startDate} onChange={handleInputChange} style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>To Date</label>
              <input type="date" name="endDate" value={filterCriteria.endDate} onChange={handleInputChange} style={inputStyle} required />
            </div>
          </>
        ) : (
          <>
            <div>
              <label style={labelStyle}>Paid By (Optional)</label>
              <input
                type="text"
                name="paidBy"
                placeholder="Payer name..."
                value={filterCriteria.paidBy}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Expense Type (Optional)</label>
              <input
                type="text"
                name="expenseType"
                placeholder="e.g. Utility, Food..."
                value={filterCriteria.expenseType}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Description (Optional)</label>
              <input
                type="text"
                name="description"
                placeholder="Search description..."
                value={filterCriteria.description}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>
          </>
        )}

        {/* Search & Download Action Buttons */}
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
          <button type="submit" disabled={loading} style={fetchBtnStyle}>
            {loading ? "Fetching..." : "🔍 Search"}
          </button>
          
          <button 
            type="button" 
            onClick={handleDownload} 
            disabled={isDownloading} 
            style={downloadBtnStyle}
          >
            {isDownloading ? "Downloading..." : "📥 Download"}
          </button>
        </div>
      </form>

      <div style={{ marginTop: "30px" }}>
        {loading ? (
          <div style={statusMessageStyle}>Querying backend tables, please wait...</div>
        ) : expenses.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ backgroundColor: "#dc3545", color: "#fff" }}>
                  <th style={thTdStyle}>Transaction ID</th>
                  <th style={thTdStyle}>Date</th>
                  <th style={thTdStyle}>Expense Type</th>
                  <th style={thTdStyle}>Paid By</th>
                  <th style={thTdStyle}>Description</th>
                  <th style={thTdStyle}>Payment Mode</th>
                  <th style={thTdStyle}>Amount</th>
                  <th style={thTdStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, index) => (
                  <tr key={exp.expenseId || index} style={index % 2 === 0 ? { backgroundColor: "#f9f9f9" } : {}}>
                    <td style={thTdStyle}>{exp.transactionId || "—"}</td>
                    <td style={thTdStyle}>{exp.expenseDate || "—"}</td>
                    <td style={thTdStyle}>
                      <span style={expenseTypeBadge}>{exp.expenseType || "General"}</span>
                    </td>
                    <td style={thTdStyle}>{exp.paidBy || "—"}</td>
                    <td style={thTdStyle}>{exp.description || "—"}</td>
                    <td style={thTdStyle}>{exp.paymentMode || "CASH"}</td>
                    <td style={{ ...thTdStyle, fontWeight: "bold", color: "#dc3545" }}>
                      ₹{parseFloat(exp.amount || 0).toFixed(2)}
                    </td>
                    <td style={thTdStyle}>
                      <button 
                        type="button" 
                        onClick={() => onEdit && onEdit(exp)}
                        style={{ padding: "5px 10px", background: "#ffc107", border: "none", color: "#000", fontWeight: "600", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={emptyStateStyle}>
            No transactional data logs matched for this selection timeline criteria range. Choose variables above and hit search.
          </div>
        )}
      </div>
    </div>
  );
};

// Layout Styles
const containerStyle = { background: "#fff", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", minHeight: "450px" };
const filterBarGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", background: "#f8f9fa", padding: "15px", borderRadius: "8px", border: "1px solid #e9ecef" };
const labelStyle = { fontSize: "12px", fontWeight: "600", color: "#495057", display: "block", marginBottom: "5px" };
const inputStyle = { width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ced4da", boxSizing: "border-box", fontSize: "14px" };
const fetchBtnStyle = { flex: 1, padding: "11px", background: "#dc3545", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", whiteSpace: "nowrap" };
const downloadBtnStyle = { flex: 1, padding: "11px", background: "#198754", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", whiteSpace: "nowrap" };
const emptyStateStyle = { textAlign: "center", padding: "50px 20px", border: "2px dashed #dee2e6", borderRadius: "8px", color: "#6c757d", fontStyle: "italic" };
const statusMessageStyle = { textAlign: "center", padding: "30px", color: "#007bff", fontWeight: "500" };
const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "10px", textAlign: "left", fontSize: "14px" };
const thTdStyle = { padding: "12px 15px", borderBottom: "1px solid #dee2e6", verticalAlign: "middle" };
const expenseTypeBadge = { background: "#e9ecef", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "500", color: "#495057" };

export default ViewExpenses;