import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import { fetchTenantsApi, fetchHostelsApi } from "../services/api";

const ViewTenants = ({ onEdit }) => {
  const [tenants, setTenants] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [search, setSearch] = useState({ name: "", phone: "", hostelId: "" });

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 1. Wrap loadTenants in useCallback so its reference stays stable
  const loadTenants = useCallback(async () => {
    const data = await fetchTenantsApi(search.name, search.phone, search.hostelId);
    setTenants(data || []);
    setCurrentPage(1); 
  }, [search.name, search.phone, search.hostelId]); // Listens specifically to search fields changing

  // 2. Fetch master hostel options on mount
  useEffect(() => {
    fetchHostelsApi().then(setHostels);
    loadTenants();
  }, [loadTenants]); // Safely added loadTenants as a dependency

  // 3. Handle debounced search triggers safely
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadTenants();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search, loadTenants]); // Safely added loadTenants as a dependency

  // Pagination Logic Calculations
  const totalItems = tenants.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const indexOfLastRecord = currentPage * pageSize;
  const indexOfFirstRecord = indexOfLastRecord - pageSize;
  const currentPagedDataSlice = tenants.slice(indexOfFirstRecord, indexOfLastRecord);

  const handlePageChange = (targetPageNumber) => {
    if (targetPageNumber >= 1 && targetPageNumber <= totalPages) {
      setCurrentPage(targetPageNumber);
    }
  };

  // Generate dynamic array window of page numbers to show (Max 10)
  const maxButtonsToShow = 10;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
  let endPage = startPage + maxButtonsToShow - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxButtonsToShow + 1);
  }

  const pageNumbersArray = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbersArray.push(i);
  }

  return (
    <div style={{ padding: "10px" }}>
      <div style={searchBarStyle}>
        <input 
          style={searchInput} 
          placeholder="Search Name..." 
          value={search.name}
          onChange={(e) => setSearch({ ...search, name: e.target.value })}
        />
        <input 
          style={searchInput} 
          placeholder="Search Phone..." 
          value={search.phone}
          onChange={(e) => setSearch({ ...search, phone: e.target.value })}
        />
        <select 
          style={searchInput} 
          value={search.hostelId}
          onChange={(e) => setSearch({ ...search, hostelId: e.target.value })}
        >
          <option value="">All Hostels</option>
          {hostels.map(h => <option key={h.hostelId} value={h.hostelId}>{h.hostelName}</option>)}
        </select>
      </div>

      <div style={tableContainer}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={headerRow}>
              <th style={th}>Resident Info</th>
              <th style={th}>Stay Details</th>
              <th style={th}>Guardian Info</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPagedDataSlice.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#888", fontStyle: "italic" }}>
                  No tenant configurations match the specific criteria filter metrics.
                </td>
              </tr>
            ) : (
              currentPagedDataSlice.map(t => (
                <tr key={t.tenantId} style={tableRow}>
                  <td style={td}>
                    <strong>{t.fullName}</strong> ({t.gender})<br/>
                    <small>{t.phoneNumber}</small><br/>
                    <div style={addressMini}>{t.address}</div>
                  </td>
                  <td style={td}>
                    {t.hostelName}<br/>
                    <small>Room: {t.roomNumber} | Bed: {t.bedNumber}</small><br/>
                    <small style={{color: "#666"}}>In: {t.checkInDate}</small>
                  </td>
                  <td style={td}>
                    {t.guardianName}<br/>
                    <small>Ph: {t.guardianPhone}</small>
                  </td>
                  <td style={td}>
                    <span style={t.isActive ? statusActive : statusInactive}>
                      {t.isActive ? "Active" : "Exited"}
                    </span>
                  </td>
                  <td style={td}>
                    <button onClick={() => onEdit(t)} style={editBtn}>Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={paginationWrapperStyle}>
          <div style={{ fontSize: "14px", color: "#555" }}>
            Showing <strong>{totalItems === 0 ? 0 : indexOfFirstRecord + 1}</strong> -{" "}
            <strong>{Math.min(indexOfLastRecord, totalItems)}</strong> of{" "}
            <strong>{totalItems}</strong> Entries
          </div>

          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || totalPages <= 1}
              style={{ ...paginationBtnStyle, ...((currentPage === 1 || totalPages <= 1) ? disabledBtnStyle : {}) }}
            >
              &laquo;
            </button>
            
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || totalPages <= 1}
              style={{ ...paginationBtnStyle, ...((currentPage === 1 || totalPages <= 1) ? disabledBtnStyle : {}) }}
            >
              &larr;
            </button>

            {pageNumbersArray.map((num) => (
              <button
                key={num}
                disabled={totalPages <= 1}
                onClick={() => handlePageChange(num)}
                style={{
                  ...paginationBtnStyle,
                  ...(currentPage === num ? activePageBtnStyle : {}),
                  ...(totalPages <= 1 ? disabledBtnStyle : {})
                }}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages <= 1}
              style={{ ...paginationBtnStyle, ...((currentPage === totalPages || totalPages <= 1) ? disabledBtnStyle : {}) }}
            >
              &rarr;
            </button>

            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || totalPages <= 1}
              style={{ ...paginationBtnStyle, ...((currentPage === totalPages || totalPages <= 1) ? disabledBtnStyle : {}) }}
            >
              &raquo;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Existing UI Styling Sheets
const searchBarStyle = { display: "flex", gap: "10px", marginBottom: "20px" };
const searchInput = { flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" };
const tableContainer = { background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", overflow: "hidden" };
const headerRow = { background: "#f8f9fa", borderBottom: "2px solid #dee2e6", textAlign: "left" };
const th = { padding: "12px" };
const td = { padding: "12px", verticalAlign: "top", fontSize: "14px" };
const tableRow = { borderBottom: "1px solid #eee" };
const addressMini = { fontSize: "11px", color: "#888", marginTop: "4px", maxWidth: "180px" };
const editBtn = { padding: "5px 10px", background: "#ffc107", border: "none", borderRadius: "4px", cursor: "pointer" };
const statusActive = { color: "green", fontWeight: "bold" };
const statusInactive = { color: "red", fontWeight: "bold" };

const paginationWrapperStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "15px 20px",
  background: "#f8f9fa",
  borderTop: "1px solid #dee2e6"
};

const paginationBtnStyle = {
  padding: "6px 12px",
  border: "1px solid #ced4da",
  background: "#fff",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
  color: "#007bff",
  transition: "all 0.15s ease-in-out"
};

const activePageBtnStyle = {
  background: "#007bff",
  color: "#fff",
  borderColor: "#007bff",
  cursor: "default"
};

const disabledBtnStyle = {
  background: "#e9ecef",
  color: "#6c757d",
  cursor: "not-allowed",
  border: "1px solid #dee2e6"
};

export default ViewTenants;