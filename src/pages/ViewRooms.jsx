import React, { useEffect, useState } from "react";
import { fetchHostelsApi, fetchWithAuth } from "../services/api";

const ViewRooms = ({ rooms, setRooms, selectedHostelId, setSelectedHostelId, onDelete, onEdit }) => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all hostels on component load to populate the dropdown selection list
  useEffect(() => {
    const loadHostels = async () => {
      try {
        const data = await fetchHostelsApi();
        if (data && Array.isArray(data)) {
          setHostels(data);
        }
      } catch (error) {
        console.error("Error loading hostels list for dropdown:", error);
      }
    };
    loadHostels();
  }, []);

  // Fetch rooms dynamically when a specific hostel selection is made
  const handleHostelChange = async (e) => {
    const hostelId = e.target.value;
    setSelectedHostelId(hostelId);

    if (!hostelId) {
      setRooms([]); // Clear the table view if no hostel is selected
      return;
    }

    setLoading(true);
    try {
      // FIXED: Invokes the exact correct endpoint path required by your controller
      const data = await fetchWithAuth(`/rooms/hostel/${hostelId}`);
      
      if (data && Array.isArray(data)) {
        setRooms(data);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error("Error loading filtered rooms:", error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Dropdown Selection Filter Area */}
      <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontWeight: "bold", color: "#495057" }}>Filter by Hostel:</label>
        <select
          value={selectedHostelId}
          onChange={handleHostelChange}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ced4da",
            background: "#fff",
            fontSize: "14px"
          }}
        >
          <option value="">-- Select a Hostel to View Rooms --</option>
          {hostels.map((h) => (
            <option key={h.hostelId} value={h.hostelId}>
              {h.hostelName} ({h.address || "No Address Given"})
            </option>
          ))}
        </select>
      </div>

      {/* Rooms Table Display Grid */}
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
        <thead>
          <tr style={{ background: "#eee", textAlign: "left" }}>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Room No</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Hostel Name</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Address</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Type</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Capacity</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#007bff", fontWeight: "bold" }}>
                Loading rooms data...
              </td>
            </tr>
          ) : rooms.length > 0 ? (
            rooms.map((r) => (
              <tr key={r.roomId}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{r.roomNumber}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{r.hostelName}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{r.hostelAddress || "N/A"}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <span style={{ padding: "2px 6px", borderRadius: "4px", background: r.roomType === 'AC' ? '#e3f2fd' : '#f5f5f5' }}>
                    {r.roomType}
                  </span>
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{r.capacity} Beds</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <button onClick={() => onEdit(r)} style={editBtnStyle}>Edit</button>
                  <button onClick={() => onDelete(r.roomId)} style={deleteBtnStyle}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#6c757d" }}>
                {selectedHostelId ? "No rooms configured for this hostel yet." : "Please select a hostel from the dropdown above to display rooms."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const editBtnStyle = { marginRight: "5px", background: "#ffc107", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" };
const deleteBtnStyle = { background: "#dc3545", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" };

export default ViewRooms;