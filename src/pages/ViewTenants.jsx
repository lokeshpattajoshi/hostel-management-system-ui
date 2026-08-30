import React, { useState, useEffect, useCallback } from "react";
import { fetchTenantsApi, fetchHostelsApi, deleteTenantApi } from "../services/api";

const ViewTenants = ({ onEdit, userRole = "staff" }) => {
  const [tenants, setTenants] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [search, setSearch] = useState({ name: "", phone: "", hostelId: "", status: "ALL" });

  // Server-side pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const isAdmin = userRole?.toLowerCase() === "admin";

  // Fetch pageable data from /api/tenant-charges/search
  const loadTenants = useCallback(async () => {
    const pageIndex = currentPage - 1; // Spring Boot uses 0-based page numbers

    const response = await fetchTenantsApi(
      search.name,
      search.phone,
      search.hostelId,
      pageIndex,
      pageSize
    );

    if (response && response.content) {
      setTenants(response.content);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } else {
      setTenants([]);
      setTotalPages(1);
      setTotalElements(0);
    }
  }, [search.name, search.phone, search.hostelId, currentPage, pageSize]);

  useEffect(() => {
    fetchHostelsApi().then((data) => setHostels(data || []));
  }, []);

  // Debounce API calls on search parameter adjustments
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      loadTenants();
    }, 400);

    return () => clearTimeout(handler);
  }, [search.name, search.phone, search.hostelId]);

  // Fetch data on page navigation change
  useEffect(() => {
    loadTenants();
  }, [currentPage, loadTenants]);

  // Status filtering applied locally on the returned slice
  const filteredTenants = tenants.filter((t) => {
    if (search.status === "ACTIVE") return t.isActive === true;
    if (search.status === "EXITED") return t.isActive === false;
    return true;
  });

  const handlePageChange = (targetPage) => {
    if (targetPage >= 1 && targetPage <= totalPages) {
      setCurrentPage(targetPage);
    }
  };

  const startIndex = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalElements);

  return (
    <div style={{ padding: "15px" }}>
      {/* Search Bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input 
          style={inputStyle} 
          placeholder="Search by Name..." 
          value={search.name}
          onChange={(e) => setSearch({ ...search, name: e.target.value })}
        />
        <input 
          style={inputStyle} 
          placeholder="Search by Phone..." 
          value={search.phone}
          onChange={(e) => setSearch({ ...search, phone: e.target.value })}
        />
        <select 
          style={inputStyle} 
          value={search.hostelId}
          onChange={(e) => setSearch({ ...search, hostelId: e.target.value })}
        >
          <option value="">All Hostels</option>
          {hostels.map((h) => (
            <option key={h.hostelId} value={h.hostelId}>{h.hostelName}</option>
          ))}
        </select>
        <select 
          style={inputStyle} 
          value={search.status}
          onChange={(e) => setSearch({ ...search, status: e.target.value })}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="EXITED">Exited</option>
        </select>
      </div>

      {/* Data Table */}
      <div style={tableCardStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fa", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>
              <th style={cellStyle}>Resident</th>
              <th style={cellStyle}>Room & Bed</th>
              <th style={cellStyle}>Guardian</th>
              <th style={cellStyle}>Charge & Payment Details</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                  No matching tenant records found.
                </td>
              </tr>
            ) : (
              filteredTenants.map((t) => {
                const isExited = !t.isActive;
                return (
                  <tr key={t.tenantId} style={{ borderBottom: "1px solid #eee", background: isExited ? "#fff8f8" : "#fff" }}>
                    <td style={cellStyle}>
                      <strong>{t.fullName}</strong> ({t.gender})<br />
                      <small>{t.phoneNumber}</small><br />
                      <small style={{ color: "#777" }}>
                        ID: {t.identityType ? `${t.identityType} [Redacted]` : "N/A"}
                      </small>
                    </td>

                    <td style={cellStyle}>
                      {t.hostelName}<br />
                      <small>Room: {t.roomNumber} ({t.roomType}) | Bed: {t.bedNumber}</small><br />
                      <small style={{ color: "#666" }}>Check-In: {t.checkInDate}</small>
                    </td>

                    <td style={cellStyle}>
                      {t.guardianName || "N/A"}<br />
                      <small>Ph: {t.guardianPhone || "N/A"}</small>
                    </td>

                    <td style={cellStyle}>
                      <strong>{t.chargeType}</strong> ({t.billingCycle})<br />
                      Total: ₹{t.totalAmount} | Paid: <span style={{ color: "green" }}>₹{t.paidAmount}</span> | Bal: <span style={{ color: "red" }}>₹{t.balanceAmount}</span><br />
                      <small style={{ color: "#666" }}>Due: {t.dueDate} [{t.chargeStatus}]</small>
                    </td>

                    <td style={cellStyle}>
                      <span style={t.isActive ? activeBadge : inactiveBadge}>
                        {t.isActive ? "Active" : "Exited"}
                      </span>
                    </td>

                    <td style={cellStyle}>
                      <button onClick={() => onEdit(t)} style={editBtnStyle}>Edit</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div style={paginationBarStyle}>
          <div>
            Showing <strong>{startIndex}</strong> to <strong>{endIndex}</strong> of <strong>{totalElements}</strong> records
          </div>

          <div style={{ display: "flex", gap: "5px" }}>
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              style={navBtnStyle}
            >
              Previous
            </button>
            <span style={{ padding: "5px 10px", alignSelf: "center" }}>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
              style={navBtnStyle}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle = { flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" };
const tableCardStyle = { background: "#fff", borderRadius: "6px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" };
const cellStyle = { padding: "10px 12px", verticalAlign: "top", fontSize: "14px" };
const editBtnStyle = { padding: "4px 8px", background: "#ffc107", border: "none", borderRadius: "4px", cursor: "pointer" };

const activeBadge = { background: "#e6f4ea", color: "#1a7f37", padding: "2px 8px", borderRadius: "10px", fontSize: "12px", fontWeight: "bold" };
const inactiveBadge = { background: "#ffebe9", color: "#cf222e", padding: "2px 8px", borderRadius: "10px", fontSize: "12px", fontWeight: "bold" };

const paginationBarStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 15px", background: "#f8f9fa", borderTop: "1px solid #dee2e6" };
const navBtnStyle = { padding: "5px 10px", border: "1px solid #ccc", background: "#fff", borderRadius: "4px", cursor: "pointer" };

export default ViewTenants;