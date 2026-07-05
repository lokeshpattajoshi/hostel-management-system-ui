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
  
  const [detailedViewType, setDetailedViewType] = useState(null); 
  const [detailedRecords, setDetailedRecords] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [subTab, setSubTab] = useState("ledger");

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
    setLoading(true);
    setSummary(null);
    setDetailedViewType(null);
    setDetailedRecords([]);

    try {
      if (!selectedHostel) {
        let aggregatedSummary = {
          totalIncome: 0,
          totalExpense: 0,
          netProfit: 0,
          pendingAmount: 0,
          advanceAmount: 0,
          activeTenants: 0,
          isGlobal: true
        };

        for (const h of hostels) {
          const res = await fetchDashboardSummaryApi({
            hostelId: parseInt(h.hostelId),
            fromDate,
            toDate
          });
          if (res) {
            aggregatedSummary.totalIncome += res.totalIncome || 0;
            aggregatedSummary.totalExpense += res.totalExpense || 0;
            aggregatedSummary.pendingAmount += res.pendingAmount || 0;
            aggregatedSummary.advanceAmount += res.advanceAmount || 0;
            aggregatedSummary.activeTenants += res.activeTenants || 0;
          }
        }
        aggregatedSummary.netProfit = aggregatedSummary.totalIncome - aggregatedSummary.totalExpense;
        setSummary(aggregatedSummary);
      } else {
        const res = await fetchDashboardSummaryApi({
          hostelId: parseInt(selectedHostel),
          fromDate,
          toDate
        });
        if (res) setSummary({ ...res, isGlobal: false });
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
    setSubTab("ledger"); 
    
    try {
      let combinedRecords = [];
      const targets = selectedHostel ? [{ hostelId: selectedHostel }] : hostels;

      for (const h of targets) {
        let data = [];
        if (type === "INCOME") {
          data = await fetchIncomeReportDetailsApi(h.hostelId, fromDate, toDate);
        } else if (type === "EXPENSE") {
          data = await fetchExpenseReportDetailsApi(h.hostelId, fromDate, toDate);
        }
        
        if (data && data.length > 0) {
          const trackingName = hostels.find(x => String(x.hostelId) === String(h.hostelId))?.hostelName || `Hostel #${h.hostelId}`;
          const normalized = data.map(item => ({ ...item, originHostelName: trackingName }));
          combinedRecords = [...combinedRecords, ...normalized];
        }
      }
      setDetailedRecords(combinedRecords);
    } catch (error) {
      console.error(`Error loading details:`, error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const userWiseMetrics = detailedRecords.reduce((acc, curr) => {
    let user = "Not Specified (Null)";
    
    if (detailedViewType === "EXPENSE") {
      user = curr.paidByUserName || "Not Specified (Null)";
    } else if (detailedViewType === "INCOME") {
      if (curr.receivedByUserName) {
        user = curr.receivedByUserName;
      }
    }

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
      <h3 style={headerStyle}>Cross-Hostel Analytical Hub</h3>

      {/* FILTER CONTROL PANEL */}
      <form onSubmit={handleFetchReport} style={filterPanel}>
        <div style={inputGroup}>
          <label style={labelStyle}>Select Scope</label>
          <select 
            value={selectedHostel} 
            onChange={(e) => setSelectedHostel(e.target.value)} 
            style={filterInput}
          >
            <option value="">🌍 -- View All Hostels Combined --</option>
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
          {loading ? "Aggregating Data..." : "Generate Dashboard"}
        </button>
      </form>

      {/* OVERVIEW STATS CARDS GRID */}
      {summary && (
        <div style={statsGrid}>
          <div style={{ ...cardStyle, borderLeft: "5px solid #28a745", backgroundColor: !selectedHostel ? "#f4fbf6" : "#fff" }}>
            <span style={cardLabel}>{summary.isGlobal ? "Combined Gross Income" : "Income"}</span>
            <span style={{ ...cardValue, color: "#28a745" }}>₹{summary.totalIncome.toFixed(2)}</span>
            <button type="button" onClick={() => loadDetailedBreakdown("INCOME")} style={drillDownBtn}>
              Analyze Collection Summaries &rarr;
            </button>
          </div>

          <div style={{ ...cardStyle, borderLeft: "5px solid #dc3545", backgroundColor: !selectedHostel ? "#fdf5f5" : "#fff" }}>
            <span style={cardLabel}>{summary.isGlobal ? "Total Shared Expenses" : "Expenses"}</span>
            <span style={{ ...cardValue, color: "#dc3545" }}>₹{summary.totalExpense.toFixed(2)}</span>
            <button type="button" onClick={() => loadDetailedBreakdown("EXPENSE")} style={drillDownBtn}>
              Analyze Expense Breaks &rarr;
            </button>
          </div>

          <div style={{ ...cardStyle, borderLeft: "5px solid #007bff" }}>
            <span style={cardLabel}>Net Profit</span>
            <span style={{ ...cardValue, color: summary.netProfit >= 0 ? "#007bff" : "#dc3545" }}>
              ₹{summary.netProfit.toFixed(2)}
            </span>
            <span style={cardSubtext}>Revenue margins across selected target</span>
          </div>

          <div style={{ ...cardStyle, borderLeft: "5px solid #6c757d" }}>
            <span style={cardLabel}>Room Occupancy</span>
            <span style={{ ...cardValue, color: "#343a40" }}>{summary.activeTenants} Active</span>
            <span style={cardSubtext}>{summary.isGlobal ? "Live across all facilities" : "Living in this hostel"}</span>
          </div>
        </div>
      )}

      {/* DYNAMIC DETAILS TABLES */}
      {detailedViewType && (
        <div style={detailContainer}>
          <div style={detailHeader}>
            <div>
              {/* 💡 Swapped from "Ledger" to "Statement" */}
              <h4 style={{ margin: 0, color: "#2c3e50", fontSize: "16px", fontWeight: "700" }}>
                {detailedViewType === "INCOME" ? "💰 Income Statement" : "🛑 Expense Statement"}
              </h4>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#718096" }}>
                Scope: {selectedHostel ? "Single Hostel Selective Filter" : "Global Cumulative View (All Properties)"}
              </p>
            </div>
            <button onClick={() => setDetailedViewType(null)} style={closeBtn}>Close Drill-Down View</button>
          </div>

          {!loadingDetails && detailedRecords.length > 0 && (
            <div style={subTabWrapper}>
              <button 
                type="button" 
                onClick={() => setSubTab("ledger")}
                style={{ ...subTabItem, backgroundColor: subTab === "ledger" ? "#4a5568" : "#e2e8f0", color: subTab === "ledger" ? "#fff" : "#4a5568" }}
              >
                📋 Transaction Logs
              </button>
              <button 
                type="button" 
                onClick={() => setSubTab("userWise")}
                style={{ ...subTabItem, backgroundColor: subTab === "userWise" ? "#007bff" : "#e2e8f0", color: subTab === "userWise" ? "#fff" : "#4a5568" }}
              >
                👤 Staff Collection Summary
              </button>
            </div>
          )}

          {loadingDetails ? (
            <p style={{ textAlign: "center", color: "#6c757d", padding: "15px" }}>Recompiling relational indexes...</p>
          ) : detailedRecords.length === 0 ? (
            <p style={{ textAlign: "center", color: "#dc3545", padding: "15px", background: "#fff", borderRadius: "4px", margin: 0 }}>
              No operational records detected matching target dates parameters.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              
              {/* SUB-VIEW OPTION 1: TRANSACTION LOGS MODE */}
              {subTab === "ledger" && (
                <table style={tableStyle}>
                  <thead>
                    <tr style={thRowStyle}>
                      <th style={thStyle}>Hostel Branch</th>
                      <th style={thStyle}>Ref / Txn ID</th>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>{detailedViewType === "INCOME" ? "Tenant Source" : "Expense Type"}</th>
                      <th style={thStyle}>{detailedViewType === "INCOME" ? "Collected By" : "Paid By"}</th>
                      <th style={thStyle}>Payment Mode</th>
                      <th style={thStyle}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedRecords.map((item, idx) => (
                      <tr key={idx} style={trStyle}>
                        <td style={{ ...tdStyle, fontWeight: "600", color: "#4a5568" }}>🏢 {item.originHostelName || item.hostelName}</td>
                        <td style={{ ...tdStyle, fontWeight: "bold" }}>{item.transactionId || "—"}</td>
                        <td style={tdStyle}>{item.incomeDate || item.expenseDate}</td>
                        <td style={tdStyle}>
                          {detailedViewType === "INCOME" ? (
                            <span>{item.tenantName} <small style={{ color: "#7f8c8d" }}>(#{item.tenantId})</small></span>
                          ) : (
                            <span style={badgeStyle}>{item.expenseType}</span>
                          )}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: "600", color: "#2c3e50" }}>
                          {detailedViewType === "INCOME" ? (
                            item.receivedByUserName || <em style={{ color: "#a0aec0" }}>Not Specified (Null)</em>
                          ) : (
                            item.paidByUserName || <em style={{ color: "#a0aec0" }}>Not Specified (Null)</em>
                          )}
                        </td>
                        <td style={tdStyle}>{item.paymentMode || "Direct Account Transfer"}</td>
                        <td style={{ ...tdStyle, fontWeight: "bold", color: detailedViewType === "INCOME" ? "#28a745" : "#dc3545" }}>
                          ₹{item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* SUB-VIEW OPTION 2: STAFF COLLECTION BREAKDOWNS */}
              {subTab === "userWise" && (
                <table style={tableStyle}>
                  <thead>
                    <tr style={{ backgroundColor: "#2d3748" }}>
                      <th style={{ ...thStyle, color: "#fff" }}>System Staff / Name</th>
                      <th style={{ ...thStyle, color: "#fff" }}>Action Items Quantified</th>
                      <th style={{ ...thStyle, color: "#fff" }}>
                        {detailedViewType === "INCOME" ? "Total Revenue Collections Secured" : "Total Corporate Expenses Handled"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(userWiseMetrics).map(([user, metrics], idx) => (
                      <tr key={user} style={idx % 2 === 0 ? { backgroundColor: "#f7fafc" } : {}}>
                        <td style={{ ...tdStyle, fontWeight: "700", color: "#2d3748", fontSize: "14px" }}>
                          👤 {user}
                        </td>
                        <td style={tdStyle}>
                          <span style={{ background: "#edf2f7", padding: "5px 12px", borderRadius: "15px", fontSize: "12px", fontWeight: "600" }}>
                            {metrics.transactionCount} transactions managed
                          </span>
                        </td>
                        <td style={{ 
                          ...tdStyle, 
                          fontWeight: "700", 
                          fontSize: "15px", 
                          color: detailedViewType === "INCOME" ? "#28a745" : "#dc3545" 
                        }}>
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

const containerStyle = { background: "#fff", padding: "20px", borderRadius: "8px" };
const headerStyle = { borderBottom: "2px solid #f1f3f5", paddingBottom: "10px", margin: "0 0 20px 0", color: "#2c3e50" };
const filterPanel = { display: "flex", flexWrap: "wrap", gap: "15px", padding: "20px", background: "#f8f9fa", borderRadius: "6px", marginBottom: "25px", alignItems: "flex-end" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "5px" };
const labelStyle = { fontSize: "12px", fontWeight: "600", color: "#495057" };
const filterInput = { padding: "10px", borderRadius: "4px", border: "1px solid #ced4da", fontSize: "14px", minWidth: "240px", background: "#fff" };
const searchBtn = { padding: "11px 22px", background: "#007bff", color: "#fff", border: "none", borderRadius: "4px", fontSize: "14px", fontWeight: "500", cursor: "pointer" };

const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" };
const cardStyle = { background: "#fff", padding: "20px", borderRadius: "6px", boxShadow: "0 2px 5px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "8px" };
const cardLabel = { fontSize: "11px", textTransform: "uppercase", fontWeight: "700", color: "#718096", letterSpacing: "0.5px" };
const cardValue = { fontSize: "24px", fontWeight: "bold" };
const cardSubtext = { fontSize: "12px", color: "#a0aec0", marginTop: "2px" };

const drillDownBtn = { background: "none", border: "none", color: "#007bff", padding: 0, textDecoration: "underline", fontSize: "13px", textAlign: "left", cursor: "pointer", fontWeight: "500", marginTop: "5px" };

const detailContainer = { marginTop: "30px", padding: "20px", background: "#f1f3f5", borderRadius: "8px", border: "1px solid #e2e8f0" };
const detailHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: "1px solid #ced4da", paddingBottom: "8px" };
const closeBtn = { padding: "6px 12px", background: "#e2e8f0", color: "#4a5568", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "600" };

const tableStyle = { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "4px", overflow: "hidden" };
const thRowStyle = { background: "#edf2f7", textAlign: "left" };
const thStyle = { padding: "12px", fontSize: "13px", color: "#2d3748", fontWeight: "600" };
const trStyle = { borderBottom: "1px solid #edf2f7" };
const tdStyle = { padding: "12px", fontSize: "13px", color: "#4a5568" };
const badgeStyle = { background: "#feebcb", padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600", color: "#c05621" };

const subTabWrapper = { display: "flex", gap: "10px", marginBottom: "15px" };
const subTabItem = { border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.15s ease-in-out" };

export default ReportManagement;