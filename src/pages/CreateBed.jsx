import React, { useState, useEffect } from "react";
import { fetchHostelsApi, fetchRoomsByHostelApi, createBedApi } from "../services/api";

const CreateBed = ({ onCancel }) => {
  const [hostels, setHostels] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedHostelId, setSelectedHostelId] = useState("");
  
  const [formData, setFormData] = useState({ roomId: "", bedNumber: "" });
  const [status, setStatus] = useState({ type: "", message: "" }); // For success/error

  useEffect(() => {
    const loadData = async () => {
      const hData = await fetchHostelsApi();
      const rData = await fetchRoomsByHostelApi();
      setHostels(hData || []);
      setAllRooms(rData || []);
    };
    loadData();
  }, []);

  useEffect(() => {
    const filtered = allRooms.filter(r => String(r.hostelId) === String(selectedHostelId));
    setFilteredRooms(filtered);
  }, [selectedHostelId, allRooms]);

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!formData.roomId || !formData.bedNumber) {
      setStatus({ type: "error", message: "Please select a room and enter a bed number." });
      return;
    }

    try {
      const result = await createBedApi(formData);
      if (result) {
        setStatus({ type: "success", message: `Successfully added Bed ${formData.bedNumber}!` });
        setFormData({ roomId: "", bedNumber: "" }); // Clear form for next entry
      } else {
        setStatus({ type: "error", message: "Failed to add bed. Please check your connection." });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Error: " + err.message });
    }
  };

  return (
    <div style={formCardStyle}>
      <h3>Add New Bed</h3>
      
      {/* STATUS MESSAGE */}
      {status.message && (
        <div style={{
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "4px",
          textAlign: "center",
          background: status.type === "success" ? "#d4edda" : "#f8d7da",
          color: status.type === "success" ? "#155724" : "#721c24",
          border: `1px solid ${status.type === "success" ? "#c3e6cb" : "#f5c6cb"}`
        }}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={groupStyle}>
          <label>1. Select Hostel</label>
          <select value={selectedHostelId} onChange={(e) => setSelectedHostelId(e.target.value)} style={inputStyle}>
            <option value="">-- Choose Hostel --</option>
            {hostels.map(h => <option key={h.hostelId} value={h.hostelId}>{h.hostelName}</option>)}
          </select>
        </div>

        <div style={groupStyle}>
          <label>2. Select Room</label>
          <select 
            value={formData.roomId} 
            disabled={!selectedHostelId}
            onChange={(e) => setFormData({...formData, roomId: e.target.value})}
            style={inputStyle}
          >
            <option value="">-- Choose Room --</option>
            {filteredRooms.map(r => (
              <option key={r.roomId} value={r.roomId}>Room {r.roomNumber} ({r.roomType})</option>
            ))}
          </select>
        </div>

        <div style={groupStyle}>
          <label>3. Bed Name/Number</label>
          <input 
            type="text"
            value={formData.bedNumber}
            onChange={(e) => setFormData({...formData, bedNumber: e.target.value})}
            placeholder="e.g. B1"
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button type="submit" style={saveBtn}>Add Bed</button>
          <button type="button" onClick={onCancel} style={cancelBtn}>Close</button>
        </div>
      </form>
    </div>
  );
};

const formCardStyle = { maxWidth: "400px", margin: "0 auto", padding: "25px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" };
const groupStyle = { marginBottom: "15px" };
const inputStyle = { width: "100%", padding: "10px", marginTop: "5px", borderRadius: "6px", border: "1px solid #ddd" };
const saveBtn = { flex: 1, padding: "12px", background: "#007bff", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const cancelBtn = { flex: 1, padding: "12px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" };

export default CreateBed;