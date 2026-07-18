import React, { useState, useEffect } from "react";
import { 
  fetchPendingApprovalsApi, // Fixed: Updated to match the actual API export name
  approveRequestApi, 
  rejectRequestApi 
} from "../services/api";

function ApprovalQueue() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionRemarks, setActionRemarks] = useState({});
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Divide your 11 records cleanly across pages

  const adminId = localStorage.getItem("userId") || "1"; 

  useEffect(() => {
    loadApprovalQueue();
  }, [currentPage]);

  const loadApprovalQueue = async () => {

    setLoading(true);
    setError(null);

    const data = await fetchPendingApprovalsApi(
        currentPage - 1,
        itemsPerPage
    );

    if (data) {

        setApprovals(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalItems(data.totalElements || 0);

    } else {

        setApprovals([]);
        setError("Failed to retrieve the pending approvals ledger.");
    }

    setLoading(false);
};


  const handleAction = async (approvalId, actionType) => {
    const customRemarks = actionRemarks[approvalId] || "Processed via Management Console";
    let response;

    if (actionType === "APPROVE") {
      response = await approveRequestApi(approvalId, adminId, customRemarks);
    } else {
      response = await rejectRequestApi(approvalId, adminId, customRemarks);
    }

    if (response) {
      setActionRemarks(prev => {
        const updated = { ...prev };
        delete updated[approvalId];
        return updated;
      });

      // Recalculate pagination bounds safely before reloading data
      const remainingCount = approvals.length - 1;
      const maxPages = Math.ceil(remainingCount / itemsPerPage);
      if (currentPage > maxPages && maxPages > 0) {
        setCurrentPage(maxPages);
      }

      await loadApprovalQueue();
    } else {
      alert(`Failed to complete the requested ${actionType.toLowerCase()} action.`);
    }
  };

  const handleRemarksChange = (approvalId, value) => {
    setActionRemarks(prev => ({
      ...prev,
      [approvalId]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) return <div style={msgStyle}>Loading pending queue entries...</div>;
  if (error) return <div style={{ ...msgStyle, color: "#e53e3e" }}>{error}</div>;

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>Pending Authorization Items ({totalItems})</h3>
      
      {totalItems === 0 ? (
        <div style={emptyStateStyle}>
          ✅ Clear skies! There are no pending approvals requiring attention right now.
        </div>
      ) : (
        <>
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={thRowStyle}>
                  <th style={thStyle}>Request ID</th>
                  <th style={thStyle}>Occupant Name</th>
                  <th style={thStyle}>Paid To (Collected By)</th>
                  <th style={thStyle}>Entity Type</th>
                  <th style={thStyle}>Payment Type</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Requested By</th>
                  <th style={thStyle}>Request Date</th>
                  <th style={thStyle}>System Remarks</th>
                  <th style={thStyle}>Action Remarks</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((item) => (
                  <tr key={item.approvalId} style={trStyle}>
                    <td style={tdStyle}><strong>#{item.approvalId}</strong></td>
                    <td style={tdStyle}><strong>{item.tenantName || "N/A"}</strong></td>
                    <td style={tdStyle}>{item.approvalUserName || "Unassigned"}</td>
                    <td style={tdStyle}>
                      <span style={badgeStyle}>{item.entityType || "UNKNOWN"}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={paymentTypeBadgeStyle}>{item.paymentType || "N/A"}</span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: "600", color: "#2d3748" }}>
                      {item.amount !== undefined && item.amount !== null ? `₹${parseFloat(item.amount).toFixed(2)}` : "₹0.00"}
                    </td>
                    <td style={tdStyle}>{item.requestedByName || "System Event"}</td>
                    <td style={tdStyle}>{formatDate(item.requestedDate)}</td>
                    <td style={{ ...tdStyle, color: "#718096", fontStyle: "italic" }}>
                      {item.remarks || "No entry notes"}
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="text"
                        placeholder="Add processing remarks..."
                        value={actionRemarks[item.approvalId] || ""}
                        onChange={(e) => handleRemarksChange(item.approvalId, e.target.value)}
                        style={inputStyle}
                      />
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => handleAction(item.approvalId, "APPROVE")}
                        style={approveBtnStyle}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(item.approvalId, "REJECT")}
                        style={rejectBtnStyle}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls - Only visible if there is more than 1 page */}
          {totalPages > 1 && (
            <div style={paginationContainer}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  ...paginationBtn,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer"
                }}
              >
                Previous
              </button>
              <span style={paginationText}>
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  ...paginationBtn,
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer"
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const containerStyle = { background: "#fff", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: "20px", marginTop: "10px" };
const titleStyle = { margin: "0 0 15px 0", fontSize: "18px", color: "#2d3748", borderBottom: "2px solid #edf2f7", paddingBottom: "10px" };
const msgStyle = { padding: "20px", textAlign: "center", fontWeight: "500", color: "#4a5568" };
const emptyStateStyle = { padding: "30px", textAlign: "center", color: "#2f855a", background: "#f0fff4", borderRadius: "6px", border: "1px dashed #c6f6d5", fontWeight: "500" };
const tableWrapperStyle = { overflowX: "auto" };
const tableStyle = { width: "100%", borderCollapse: "collapse", textAlign: "left" };
const thRowStyle = { background: "#f7fafc", borderBottom: "2px solid #edf2f7" };
const thStyle = { padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: "#718096", textTransform: "uppercase" };
const trStyle = { borderBottom: "1px solid #edf2f7" };
const tdStyle = { padding: "14px 16px", fontSize: "14px", color: "#4a5568", verticalAlign: "middle" };
const badgeStyle = { background: "#e2e8f0", color: "#4a5568", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600" };
const paymentTypeBadgeStyle = { background: "#ebf8ff", color: "#2b6cb0", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600" };
const inputStyle = { width: "90%", padding: "6px 10px", border: "1px solid #cbd5e0", borderRadius: "4px", fontSize: "13px" };
const approveBtnStyle = { background: "#38a169", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontWeight: "600", cursor: "pointer", marginRight: "8px", fontSize: "13px" };
const rejectBtnStyle = { background: "#e53e3e", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontWeight: "600", cursor: "pointer", fontSize: "13px" };

// Pagination Styles
const paginationContainer = { display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #edf2f7" };
const paginationBtn = { background: "#edf2f7", color: "#4a5568", border: "1px solid #cbd5e0", padding: "6px 12px", borderRadius: "4px", fontSize: "13px", fontWeight: "600", outline: "none" };
const paginationText = { fontSize: "13px", color: "#4a5568" };

export default ApprovalQueue;