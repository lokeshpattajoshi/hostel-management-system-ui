import React, { useState, useEffect } from "react";
import { 
  fetchHostelsApi, 
  fetchDashboardSummaryApi, 
  fetchIncomeReportDetailsApi, 
  fetchExpenseReportDetailsApi 
} from "../services/api";

const DashboardSummary = () => {
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState("");
  
  // Set default dates to the current month in 2026
  const [fromDate, setFromDate] = useState("2026-05-01");
  const [toDate, setToDate] = useState("2026-05-31");

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  
  // Breakdown tables metrics tracking lists
  const [detailedViewType, setDetailedViewType] = useState(null); // 'INCOME' | 'EXPENSE' | null
  const [detailedRecords, setDetailedRecords] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const loadHostels = async () => {
      const data = await fetchHostelsApi();
      setHostels(data || []);
    };
    loadHostels();
  }, []);

  const handleFetchReport = async (e) => {
    e.preventDefault();
    if (!selectedHostel) {
      alert("Please select a target hostel property first.");
      return;
    }

    setLoading(false);
    setSummary(null);
    setDetailedViewType(null);
    setDetailedRecords([]);

    try {
      setLoading(true);
      const payload = {
        hostelId: parseInt(selectedHostel),
        fromDate: fromDate,
        toDate: toDate
      };
      const res = await fetchDashboardSummaryApi(payload);
      if (res) {
        setSummary(res);
      }
    } catch (err) {
      console.error("Failed gathering summary records:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDetailedBreakdown = async (type) => {
    setLoadingDetails(true);
    setDetailedViewType(type);
    setDetailedRecords([]);
    
    try {
      if (type === "INCOME") {
        const data = await fetchIncomeReportDetailsApi(selectedHostel, fromDate, toDate);
        setDetailedRecords(data || []);
      } else if (type === "EXPENSE") {
        const data = await fetchExpenseReportDetailsApi(selectedHostel, fromDate, toDate);
        setDetailedRecords(data || []);
      }
    } catch (error) {
      console.error(`Error loading secondary analytics map:`, error);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h3 style={headerStyle}>System Reports & Ledger Statements</h3>

      {/* FILTER CONTROL PANEL */}
      <form onSubmit={handleFetchReport} style={filterPanel}>
        <div style={inputGroup}>
          <label style={labelStyle}>Select Hostel</label>
          <select 
            value={selectedHostel} 
            onChange={(e) => setSelectedHostel(e.target.value)} 
            required 
            style={filterInput}
          >
            <option value="">-- Choose Property --</option>
            {hostels.map(h => (
              <option key={h.hostelId} value={h.hostelId}>{h.hostelName}</option>
            ))}
          </select>
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>From Date</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required style={filterInput} />
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>To Date</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required style={filterInput} />
        </div>

        <button type="submit" disabled={loading} style={searchBtn}>
          {loading ? "Compiling..." : "Generate Report"}
        </button>
      </form>

      {/* OVERVIEW STATS CARDS GRID */}
      {summary && (
        <div style={statsGrid}>
          
          {/* Total Income Card with Drill-Down Link */}
          <div style={{ ...cardStyle, borderLeft: "5px solid #28a745" }}>
            <span style={cardLabel}>Gross Realized Income</span>
            <span style={{ ...cardValue, color: "#28a745" }}>₹{summary.totalIncome.toFixed(2)}</span>
            <button type="button" onClick={() => loadDetailedBreakdown("INCOME")} style={drillDownBtn}>
              View Itemized Income Receipts &rarr;
            </button>
          </div>

          {/* Total Expenses Card with Drill-Down Link */}
          <div style={{ ...cardStyle, borderLeft: "5px solid #dc3545" }}>
            <span style={cardLabel}>Operating Expenditures</span>
            <span style={{ ...cardValue, color: "#dc3545" }}>₹{summary.totalExpense.toFixed(2)}</span>
            <button type="button" onClick={() => loadDetailedBreakdown("EXPENSE")} style={drillDownBtn}>
              View Itemized Expense Receipts &rarr;
            </button>
          </div>

          <div style={{ ...cardStyle, borderLeft: "5px solid #007bff" }}>
            <span style={cardLabel}>Net Running Margin</span>
            <span style={{ ...cardValue, color: summary.netProfit >= 0 ? "#007bff" : "#dc3545" }}>
              ₹{summary.netProfit.toFixed(2)}
            </span>
            <span style={cardSubtext}>Revenue minus Operational Expenses</span>
          </div>

          <div style={{ ...cardStyle, borderLeft: "5px solid #ffc107" }}>
            <span style={cardLabel}>Unpaid Outstanding Balance</span>
            <span style={{ ...cardValue, color: "#e0a800" }}>₹{summary.pendingAmount.toFixed(2)}</span>
            <span style={cardSubtext}>Outstanding standard tenant invoices</span>
          </div>

          <div style={{ ...cardStyle, borderLeft: "5px solid #17a2b8" }}>
            <span style={cardLabel}>Advance Holdings</span>
            <span style={{ ...cardValue, color: "#17a2b8" }}>₹{summary.advanceAmount.toFixed(2)}</span>
            <span style={cardSubtext}>Onboarding escrow/security deposits</span>
          </div>

          <div style={{ ...cardStyle, borderLeft: "5px solid #6c757d" }}>
            <span style={cardLabel}>Active Headcount Census</span>
            <span style={{ ...cardValue, color: "#343a40" }}>{summary.activeTenants} Occupants</span>
            <span style={cardSubtext}>Currently registered inside beds</span>
          </div>

        </div>
      )}

      {/* DYNAMIC BREAKDOWN TRANSACTION TABLES */}
      {detailedViewType && (
        <div style={detailContainer}>
          <div style={detailHeader}>
            <h4>Detailed Line Items: {detailedViewType === "INCOME" ? "Revenue Records" : "Expenditures Summary"}</h4>
            <button onClick={() => setDetailedViewType(null)} style={closeBtn}>Close Section</button>
          </div>

          {loadingDetails ? (
            <p style={{ textAlign: "center", color: "#6c757d", padding: "15px" }}>Fetching detailed transactional history logs...</p>
          ) : detailedRecords.length === 0 ? (
            <p style={{ textAlign: "center", color: "#dc3545", padding: "15px", background: "#fff", borderRadius: "4px" }}>
              No statement item entries matched this time window.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={thRowStyle}>
                    <th style={thStyle}>Transaction ID</th>
                    <th style={thStyle}>Posting Date</th>
                    {detailedViewType === "INCOME" ? <th style={thStyle}>Tenant Details</th> : <th style={thStyle}>Category Type</th>}
                    <th style={thStyle}>Description</th>
                    <th style={thStyle}>Payment Mode</th>
                    <th style={thStyle}>Settled Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedRecords.map((item, idx) => (
                    <tr key={idx} style={trStyle}>
                      <td style={{ ...tdStyle, fontWeight: "bold", color: "#495057" }}>
                        {item.transactionId || "—"}
                      </td>
                      <td style={tdStyle}>{item.incomeDate || item.expenseDate}</td>
                      <td style={tdStyle}>
                        {detailedViewType === "INCOME" ? (
                          <span>{item.tenantName} <small style={{ color: "#7f8c8d" }}>(ID: #{item.tenantId})</small></span>
                        ) : (
                          <span style={badgeStyle}>{item.expenseType}</span>
                        )}
                      </td>
                      <td style={tdStyle}>{item.description || "—"}</td>
                      <td style={tdStyle}>{item.paymentMode || "SYSTEM DIRECT"}</td>
                      <td style={{ ...tdStyle, fontWeight: "bold", color: detailedViewType === "INCOME" ? "#28a745" : "#dc3545" }}>
                        ₹{item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// CSS-in-JS style configurations
const containerStyle = { background: "#fff", padding: "25px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" };
const headerStyle = { borderBottom: "2px solid #f1f3f5", paddingBottom: "10px", margin: "0 0 20px 0", color: "#2c3e50" };
const filterPanel = { display: "flex", flexWrap: "wrap", gap: "15px", padding: "20px", background: "#f8f9fa", borderRadius: "6px", marginBottom: "25px", alignItems: "flex-end" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "5px" };
const labelStyle = { fontSize: "12px", fontWeight: "600", color: "#495057" };
const filterInput = { padding: "10px", borderRadius: "4px", border: "1px solid #ced4da", fontSize: "14px", minWidth: "200px", background: "#fff" };
const searchBtn = { padding: "11px 22px", background: "#007bff", color: "#fff", border: "none", borderRadius: "4px", fontSize: "14px", fontWeight: "500", cursor: "pointer" };

const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" };
const cardStyle = { background: "#fff", padding: "20px", borderRadius: "6px", boxShadow: "0 2px 5px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "8px" };
const cardLabel = { fontSize: "11px", textTransform: "uppercase", fontWeight: "600", color: "#718096", letterSpacing: "0.5px" };
const cardValue = { fontSize: "24px", fontWeight: "bold" };
const cardSubtext = { fontSize: "12px", color: "#a0aec0", marginTop: "2px" };

const drillDownBtn = { background: "none", border: "none", color: "#007bff", padding: 0, textDecoration: "underline", fontSize: "13px", textAlign: "left", cursor: "pointer", fontWeight: "500", marginTop: "5px" };

const detailContainer = { marginTop: "30px", padding: "20px", background: "#f1f3f5", borderRadius: "8px", border: "1px solid #e2e8f0" };
const detailHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: "1px solid #ced4da", paddingBottom: "8px" };
const closeBtn = { padding: "5px 10px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" };

const tableStyle = { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "4px", overflow: "hidden" };
const thRowStyle = { background: "#e2e8f0", textAlign: "left" };
const thStyle = { padding: "12px", fontSize: "13px", color: "#2d3748", fontWeight: "600" };
const trStyle = { borderBottom: "1px solid #edf2f7" };
const tdStyle = { padding: "12px", fontSize: "13px", color: "#4a5568" };
const badgeStyle = { background: "#edf2f7", padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600", color: "#4a5568" };

export default DashboardSummary;