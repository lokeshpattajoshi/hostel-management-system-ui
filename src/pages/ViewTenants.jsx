import React, { useState, useEffect } from "react";
import { fetchTenantsApi, fetchHostelsApi } from "../services/api";

const ViewTenants = ({ onEdit }) => {
  const [tenants, setTenants] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [search, setSearch] = useState({ name: "", phone: "", hostelId: "" });

  useEffect(() => {
    fetchHostelsApi().then(setHostels);
    loadTenants();
  }, []);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => loadTenants(), 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const loadTenants = async () => {
    const data = await fetchTenantsApi(search.name, search.phone, search.hostelId);
    setTenants(data || []);
  };

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
            {tenants.map(t => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

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

export default ViewTenants;