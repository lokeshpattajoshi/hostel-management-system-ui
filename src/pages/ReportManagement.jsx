import React, { useState, useEffect } from "react";
import { 
  fetchHostelsApi, 
  fetchDashboardSummaryApi, 
  fetchIncomeReportDetailsApi, 
  fetchExpenseReportDetailsApi 
} from "../services/api";

const ReportManagement = () => {
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState("");
  
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  
  const [detailedViewType, setDetailedViewType] = useState(null); // 'INCOME' | 'EXPENSE' | null
  const [detailedRecords, setDetailedRecords] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // NEW: Tab selection tracker for the Expense breakdown section ('ledger' or 'userWise')
  const [expenseSubTab, setExpenseSubTab] = useState("ledger");

  useEffect(() => {
    const initializePageData = async () => {
      const today = new Date();
      const pastMonth = new Date();
      pastMonth.setMonth(today.getMonth() - 1);

      const formattedToDate = today.toISOString().split("T")[0];
      const formattedFromDate = pastMonth.toISOString().split("T")[0];

      setFromDate(formattedFromDate);
      setToDate(formattedToDate);

      try {
        const data = await fetchHostelsApi();
        setHostels(data || []);
      } catch (err) {
        console.error("Failed loading master hostels data:", err);
      }
    };

    initializePageData();
  }, []);

  const handleFetchReport = async (e) => {
    e.preventDefault();
    if (!selectedHostel) {
      alert("Please select a hostel first.");
      return;
    }

    setLoading(true);
    setSummary(null);
    setDetailedViewType(null);
    setDetailedRecords([]);

    try {
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
    // Reset sub tab view default whenever a new drill-down triggers
    setExpenseSubTab("ledger"); 
    
    try {
      if (type === "INCOME") {
        const data = await fetchIncomeReportDetailsApi(selectedHostel, fromDate, toDate);
        setDetailedRecords(data || []);
      } else if (type === "EXPENSE") {
        const data = await fetchExpenseReportDetailsApi(selectedHostel, fromDate, toDate);
        setDetailedRecords(data || []);
      }
    } catch (error) {
      console.error(`Error loading details:`, error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // NEW: Computes dynamic transactional metrics aggregate counts grouped by unique paidByUserName
  const userWiseExpenseMetrics = detailedRecords.reduce((acc, curr) => {
    if (detailedViewType !== "EXPENSE") return acc;
    
    const user = curr.paidByUserName || "Unknown User";
    const amt = parseFloat(curr.amount || 0);

    if (!acc[user]) {
      acc[user] = { totalAmount: 0, transactionCount: 0 };
    }
    acc[user].totalAmount += amt;
    acc[user].transactionCount += 1;
    
    return acc;
  }, {});

  return (
    <div style={containerStyle}>
      <h3 style={headerStyle}>View Report</h3>

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
            <option value="">-- Choose Hostel --</option>
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
          {loading ? "Loading..." : "Generate Report"}
        </button>
      </form>

      {/* OVERVIEW STATS CARDS GRID */}
      {summary && (
        <div style={statsGrid}>
          
          {/* Total Income Card */}
          <div style={{ ...cardStyle, borderLeft: "5px solid #28a745" }}>
            <span style={cardLabel}>Income</span>
            <span style={{ ...cardValue, color: "#28a745" }}>₹{summary.totalIncome.toFixed(2)}</span>
            <button type="button" onClick={() => loadDetailedBreakdown("INCOME")} style={drillDownBtn}>
              View Income Details &rarr;
            </button>
          </div>

          {/* Total Expenses Card */}
          <div style={{ ...cardStyle, borderLeft: "5px solid #dc3545" }}>
            <span style={cardLabel}>Expenses</span>
            <span style={{ ...cardValue, color: "#dc3545" }}>₹{summary.totalExpense.toFixed(2)}</span>
            <button type="button" onClick={() => loadDetailedBreakdown("EXPENSE")} style={drillDownBtn}>
              View Expense Details &rarr;
            </button>
          </div>

          {/* Profit Card */}
          <div style={{ ...cardStyle, borderLeft: "5px solid #007bff" }}>
            <span style={cardLabel}>Profit</span>
            <span style={{ ...cardValue, color: summary.netProfit >= 0 ? "#007bff" : "#dc3545" }}>
              ₹{summary.netProfit.toFixed(2)}
            </span>
            <span style={cardSubtext}>Income minus Expenses</span>
          </div>

          {/* Pending Amount Card */}
          <div style={{ ...cardStyle, borderLeft: "5px solid #ffc107" }}>
            <span style={cardLabel}>Pending Amount</span>
            <span style={{ ...cardValue, color: "#e0a800" }}>₹{summary.pendingAmount.toFixed(2)}</span>
            <span style={cardSubtext}>Total unpaid balance due from tenants</span>
          </div>

          {/* Advance Amount Card */}
          <div style={{ ...cardStyle, borderLeft: "5px solid #17a2b8" }}>
            <span style={cardLabel}>Advance Amount</span>
            <span style={{ ...cardValue, color: "#17a2b8" }}>₹{summary.advanceAmount.toFixed(2)}</span>
            <span style={cardSubtext}>Security deposits received</span>
          </div>

          {/* Active Tenants Card */}
          <div style={{ ...cardStyle, borderLeft: "5px solid #6c757d" }}>
            <span style={cardLabel}>Active Tenants</span>
            <span style={{ ...cardValue, color: "#343a40" }}>{summary.activeTenants} Tenants</span>
            <span style={cardSubtext}>Currently living in the hostel</span>
          </div>

        </div>
      )}

      {/* DYNAMIC DETAILS TABLES */}
      {detailedViewType && (
        <div style={detailContainer}>
          <div style={detailHeader}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h4 style={{ margin: 0, color: "#2c3e50", fontSize: "16px" }}>
                {detailedViewType === "INCOME" ? "Income History" : "Expense Operations Hub"}
              </h4>
            </div>
            <button onClick={() => setDetailedViewType(null)} style={closeBtn}>Close List</button>
          </div>

          {/* NEW: DUAL SUB-VIEW NAVIGATION TAB PILL SECTION BAR (ONLY TARGETS EXPENSES) */}
          {detailedViewType === "EXPENSE" && !loadingDetails && detailedRecords.length > 0 && (
            <div style={subTabWrapper}>
              <button 
                type="button" 
                onClick={() => setExpenseSubTab("ledger")}
                style={{ ...subTabItem, backgroundColor: expenseSubTab === "ledger" ? "#dc3545" : "#e2e8f0", color: expenseSubTab === "ledger" ? "#fff" : "#4a5568" }}
              >
                📋 View Expense Details
              </button>
              <button 
                type="button" 
                onClick={() => setExpenseSubTab("userWise")}
                style={{ ...subTabItem, backgroundColor: expenseSubTab === "userWise" ? "#2b6cb0" : "#e2e8f0", color: expenseSubTab === "userWise" ? "#fff" : "#4a5568" }}
              >
                👤 View Expense By User
              </button>
            </div>
          )}

          {loadingDetails ? (
            <p style={{ textAlign: "center", color: "#6c757d", padding: "15px" }}>Loading details...</p>
          ) : detailedRecords.length === 0 ? (
            <p style={{ textAlign: "center", color: "#dc3545", padding: "15px", background: "#fff", borderRadius: "4px", margin: 0 }}>
              No transactions found for this date range.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              {/* DISPLAY VARIANT 1: SYSTEM INCOME HISTORY GRID */}
              {detailedViewType === "INCOME" && (
                <table style={tableStyle}>
                  <thead>
                    <tr style={thRowStyle}>
                      <th style={thStyle}>Transaction ID</th>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Tenant Name</th>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Payment Mode</th>
                      <th style={thStyle}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedRecords.map((item, idx) => (
                      <tr key={idx} style={trStyle}>
                        <td style={{ ...tdStyle, fontWeight: "bold", color: "#495057" }}>{item.transactionId || "—"}</td>
                        <td style={tdStyle}>{item.incomeDate}</td>
                        <td style={tdStyle}>
                          {item.tenantName} <small style={{ color: "#7f8c8d" }}>(ID: #{item.tenantId})</small>
                        </td>
                        <td style={tdStyle}>{item.description || "—"}</td>
                        <td style={tdStyle}>{item.paymentMode || "Direct"}</td>
                        <td style={{ ...tdStyle, fontWeight: "bold", color: "#28a745" }}>₹{item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* DISPLAY VARIANT 2: STANDARD DETAILED EXPENSE HISTORY GRID */}
              {detailedViewType === "EXPENSE" && expenseSubTab === "ledger" && (
                <table style={tableStyle}>
                  <thead>
                    <tr style={{ ...thRowStyle, background: "#f8d7da" }}>
                      <th style={thStyle}>Transaction ID</th>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Expense Type</th>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Paid By User</th> {/* ADDED USER COLUMN */}
                      <th style={thStyle}>Payment Mode</th>
                      <th style={thStyle}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedRecords.map((item, idx) => (
                      <tr key={idx} style={trStyle}>
                        <td style={{ ...tdStyle, fontWeight: "bold", color: "#495057" }}>{item.transactionId || "—"}</td>
                        <td style={tdStyle}>{item.expenseDate}</td>
                        <td style={tdStyle}><span style={badgeStyle}>{item.expenseType}</span></td>
                        <td style={tdStyle}>{item.description || "—"}</td>
                        
                        {/* FIXED: Directly outputting the user name string right from the mapped dataset */}
                        <td style={{ ...tdStyle, fontWeight: "600", color: "#2b6cb0" }}>
                          {item.paidByUserName || "Admin User"}
                        </td>
                        
                        <td style={tdStyle}>{item.paymentMode || "Direct"}</td>
                        <td style={{ ...tdStyle, fontWeight: "bold", color: "#dc3545" }}>₹{item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* NEW DISPLAY VARIANT 3: VIEW EXPENSE BY USER & DISPLAY TOTAL COUNT */}
              {detailedViewType === "EXPENSE" && expenseSubTab === "userWise" && (
                <table style={tableStyle}>
                  <thead>
                    <tr style={{ backgroundColor: "#2b6cb0", color: "#fff" }}>
                      <th style={{ ...thStyle, color: "#fff" }}>User Name</th>
                      <th style={{ ...thStyle, color: "#fff" }}>Total Count Paid (No. of Transactions)</th>
                      <th style={{ ...thStyle, color: "#fff" }}>Total Amount Settled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(userWiseExpenseMetrics).map(([user, metrics], idx) => (
                      <tr key={user} style={idx % 2 === 0 ? { backgroundColor: "#f7fafc" } : {}}>
                        <td style={{ ...tdStyle, fontWeight: "700", color: "#2d3748", fontSize: "14px" }}>
                          👤 {user}
                        </td>
                        <td style={tdStyle}>
                          <span style={{ background: "#edf2f7", padding: "4px 12px", borderRadius: "15px", fontSize: "12px", fontWeight: "600", color: "#4a5568" }}>
                            {metrics.transactionCount} payments processed
                          </span>
                        </td>
                        <td style={{ ...tdStyle, fontWeight: "700", color: "#2b6cb0", fontSize: "15px" }}>
                          ₹{metrics.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
};

// CSS-in-JS UI configurations
const containerStyle = { background: "#fff", padding: "20px", borderRadius: "8px" };
const headerStyle = { borderBottom: "2px solid #f1f3f5", paddingBottom: "10px", margin: "0 0 20px 0", color: "#2c3e50" };
const filterPanel = { display: "flex", flexWrap: "wrap", gap: "15px", padding: "20px", background: "#f8f9fa", borderRadius: "6px", marginBottom: "25px", alignItems: "flex-end" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "5px" };
const labelStyle = { fontSize: "12px", fontWeight: "600", color: "#495057" };
const filterInput = { padding: "10px", borderRadius: "4px", border: "1px solid #ced4da", fontSize: "14px", minWidth: "200px", background: "#fff" };
const searchBtn = { padding: "11px 22px", background: "#007bff", color: "#fff", border: "none", borderRadius: "4px", fontSize: "14px", fontWeight: "500", cursor: "pointer" };

const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" };
const cardStyle = { background: "#fff", padding: "20px", borderRadius: "6px", boxShadow: "0 2px 5px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "8px" };
const cardLabel = { fontSize: "12px", textTransform: "uppercase", fontWeight: "600", color: "#718096", letterSpacing: "0.5px" };
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

// NEW: Style extensions for the sub-tabs workspace matrix layout
const subTabWrapper = { display: "flex", gap: "10px", marginBottom: "15px" };
const subTabItem = { border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.15s ease-in-out" };

export default ReportManagement;