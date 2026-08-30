import React, { useState, useEffect } from "react";
import { fetchHostelsApi, fetchTenantsApi, searchIncomeApi, deleteIncomeApi } from "../services/api";

const ViewIncome = ({ onModifyTrigger, onCreateTrigger, userRole }) => {
  const [hostels, setHostels] = useState([]);
  const [allTenants, setAllTenants] = useState([]); // Master bucket for selected hostel
  const [filteredTenants, setFilteredTenants] = useState([]); // Room-specific filtered view bucket
  const [incomes, setIncomes] = useState([]);

  // Cascading optional search tracking states
  const [selectedHostel, setSelectedHostel] = useState("");
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedTenant, setSelectedTenant] = useState("");

  // Computed admin check matching authorization logic
  const isAdmin = userRole?.toUpperCase() === "ADMIN";

  useEffect(() => {
    const loadHostelDropdowns = async () => {
      try {
        const data = await fetchHostelsApi();
        setHostels(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load hostels:", error);
        setHostels([]);
      }
    };

    loadHostelDropdowns();
    loadAllInitialIncomes();
  }, []);

  const loadAllInitialIncomes = async () => {
    try {
      const data = await searchIncomeApi({});
      if (Array.isArray(data)) {
        setIncomes(data);
      } else if (data && Array.isArray(data.content)) {
        setIncomes(data.content);
      } else {
        setIncomes([]);
      }
    } catch (error) {
      console.error("Failed to load initial income entries:", error);
      setIncomes([]);
    }
  };

  // Step 1: Change Hostel -> Fetch all occupants & extract valid unique rooms
  const handleHostelChange = async (e) => {
    const hostelId = e.target.value;
    setSelectedHostel(hostelId);

    // Clear out lower-level child dropdown selections
    setSelectedRoom("");
    setSelectedTenant("");
    setRooms([]);
    setAllTenants([]);
    setFilteredTenants([]);

    if (hostelId) {
      try {
        const tenantData = await fetchTenantsApi("", "", hostelId);
        
        // Normalize paginated Spring Boot response or standard array
        const safeTenants = Array.isArray(tenantData?.content) 
          ? tenantData.content 
          : Array.isArray(tenantData) 
          ? tenantData 
          : [];

        setAllTenants(safeTenants);
        setFilteredTenants(safeTenants); // Default to all if room is skipped

        // Extract sorted list of unique room configurations
        const uniqueRooms = [
          ...new Set(safeTenants.map((t) => t.roomNumber || t.roomNo).filter(Boolean))
        ];
        
        setRooms(
          uniqueRooms.sort((a, b) =>
            String(a).localeCompare(String(b), undefined, { numeric: true })
          )
        );
      } catch (error) {
        console.error("Failed to fetch hostel tenants:", error);
        setAllTenants([]);
        setFilteredTenants([]);
        setRooms([]);
      }
    }
  };

  // Step 2: Change Room (Optional) -> Isolate tenants living in this exact room layout
  const handleRoomChange = (e) => {
    const roomNum = e.target.value;
    setSelectedRoom(roomNum);
    setSelectedTenant(""); // Clear selected occupant context safely

    if (roomNum) {
      const matchingOccupants = (Array.isArray(allTenants) ? allTenants : []).filter((t) => {
        const tenantRoom = t.roomNumber || t.roomNo;
        return tenantRoom && tenantRoom.toString().trim() === roomNum.toString().trim();
      });
      setFilteredTenants(matchingOccupants);
    } else {
      // Fallback: if room is cleared, display all hostel occupants again
      setFilteredTenants(allTenants);
    }
  };

  // Step 3: Invoke flexible search options
  const handleSearchFilter = async (e) => {
    e.preventDefault();

    const searchParams = {};
    if (selectedHostel) searchParams.hostelId = selectedHostel;
    if (selectedTenant) searchParams.tenantId = selectedTenant;

    try {
      let response = await searchIncomeApi(searchParams);
      let filteredData = Array.isArray(response?.content)
        ? response.content
        : Array.isArray(response)
        ? response
        : [];

      // Client-side mapping fallback if room filter is active without specific tenant
      if (selectedHostel && selectedRoom && !selectedTenant) {
        const targetTenantIdsInRoom = (Array.isArray(filteredTenants) ? filteredTenants : []).map(
          (t) => t.tenantId || t.id
        );
        const crossMatch = filteredData.filter((inc) =>
          targetTenantIdsInRoom.includes(inc.tenantId)
        );
        setIncomes(crossMatch);
      } else {
        setIncomes(filteredData);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setIncomes([]);
    }
  };

  const handleReset = () => {
    setSelectedHostel("");
    setSelectedRoom("");
    setSelectedTenant("");
    setRooms([]);
    setAllTenants([]);
    setFilteredTenants([]);
    loadAllInitialIncomes();
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      alert("Unauthorized operational request denied.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this ledger entry?")) {
      try {
        const success = await deleteIncomeApi(id);
        if (success !== null) {
          alert("Entry deleted successfully.");
          handleReset();
        }
      } catch (error) {
        console.error("Failed to delete entry:", error);
        alert("Failed to delete entry.");
      }
    }
  };

  const safeIncomes = Array.isArray(incomes) ? incomes : [];
  const safeHostels = Array.isArray(hostels) ? hostels : [];
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const safeFilteredTenants = Array.isArray(filteredTenants) ? filteredTenants : [];

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h3 style={{ margin: 0 }}>Income Registers</h3>
        <button onClick={onCreateTrigger} style={submitBtn}>+ Record Entry</button>
      </div>

      {/* CASCADING LOGISTICS PANEL SEARCH FILTERS */}
      <form onSubmit={handleSearchFilter} style={filterPanel}>
        {/* Dropdown 1: Hostel Selection */}
        <select value={selectedHostel} onChange={handleHostelChange} style={filterInput}>
          <option value="">All Hostels</option>
          {safeHostels.map((h) => (
            <option key={h.hostelId || h.id} value={h.hostelId || h.id}>
              {h.hostelName || h.name}
            </option>
          ))}
        </select>

        {/* Dropdown 2: Room Selection */}
        <select
          value={selectedRoom}
          onChange={handleRoomChange}
          disabled={!selectedHostel}
          style={filterInput}
        >
          <option value="">All Rooms (Optional)</option>
          {safeRooms.map((room) => (
            <option key={room} value={room}>Room {room}</option>
          ))}
        </select>

        {/* Dropdown 3: Select Tenant */}
        <select
          value={selectedTenant}
          onChange={(e) => setSelectedTenant(e.target.value)}
          disabled={!selectedHostel}
          style={filterInput}
        >
          <option value="">Select Tenant</option>
          {safeFilteredTenants.map((t) => (
            <option key={t.tenantId || t.id} value={t.tenantId || t.id}>
              {t.fullName} {t.bedNumber ? `(${t.bedNumber})` : ""}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: "5px" }}>
          <button type="submit" style={{ ...submitBtn, padding: "6px 15px", background: "#28a745" }}>
            Search Logs
          </button>
          <button type="button" onClick={handleReset} style={{ ...cancelBtn, padding: "6px 15px" }}>
            Clear Filter
          </button>
        </div>
      </form>

      {/* DATA LOGGING VIEW GRID */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr style={{ background: "#f8f9fa", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Tenant ID</th>
            <th style={thStyle}>Amount</th>
            <th style={thStyle}>Mode</th>
            <th style={thStyle}>Transaction ID</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {safeIncomes.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ ...tdStyle, textAlign: "center", color: "#6c757d" }}>
                No matching income entries found.
              </td>
            </tr>
          ) : (
            safeIncomes.map((inc) => {
              const incomeId = inc.incomeId || inc.id;
              const numericAmount = typeof inc.amount === "number" ? inc.amount : parseFloat(inc.amount) || 0;

              return (
                <tr key={incomeId} style={{ borderBottom: "1px solid #dee2e6" }}>
                  <td style={tdStyle}>{incomeId}</td>
                  <td style={tdStyle}>{inc.incomeDate || "—"}</td>
                  <td style={tdStyle}>{inc.tenantId || "—"}</td>
                  <td style={tdStyle}>₹{numericAmount.toFixed(2)}</td>
                  <td style={tdStyle}>{inc.paymentMode || "—"}</td>
                  <td style={tdStyle}>{inc.transactionId || "—"}</td>
                  <td style={tdStyle}>
                    <button onClick={() => onModifyTrigger && onModifyTrigger(inc)} style={editBtnStyle}>
                      Edit
                    </button>
                    {isAdmin && (
                      <button onClick={() => handleDelete(incomeId)} style={deleteBtnStyle}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

const containerStyle = { background: "#fff", padding: "25px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
const submitBtn = { padding: "10px 20px", background: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", fontWeight: "500" };
const cancelBtn = { padding: "10px 20px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px" };
const thStyle = { padding: "12px 8px", fontSize: "13px", color: "#495057" };
const tdStyle = { padding: "12px 8px", fontSize: "13px" };
const filterPanel = { display: "flex", flexWrap: "wrap", gap: "10px", padding: "15px", background: "#f1f3f5", borderRadius: "6px", marginBottom: "15px", alignItems: "center" };
const filterInput = { padding: "8px 12px", border: "1px solid #ced4da", borderRadius: "4px", fontSize: "13px", minWidth: "180px" };
const editBtnStyle = { background: "#ffc107", border: "none", color: "#000", padding: "4px 8px", marginRight: "5px", borderRadius: "3px", cursor: "pointer" };
const deleteBtnStyle = { background: "#dc3545", border: "none", color: "#fff", padding: "4px 8px", borderRadius: "3px", cursor: "pointer" };

export default ViewIncome;