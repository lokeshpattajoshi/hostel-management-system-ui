import React, { useState, useEffect } from "react";

const ModifyRoom = ({ room, onUpdate, onCancel }) => {
  // Initialize with fallback to prevent crashes if 'room' is briefly null
  const [formData, setFormData] = useState({ ...room });

  // FIXED: Syncs internal state instantly when a user selects a different room to edit
  useEffect(() => {
    if (room) {
      setFormData({ ...room });
    }
  }, [room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Safe check to avoid rendering exceptions on title layouts if room data is missing
  if (!room) return null;

  return (
    <div style={{ padding: "20px", background: "#fff", border: "2px solid #ffc107", borderRadius: "8px" }}>
      <h3>Modify Room: {room.roomNumber} ({room.hostelName || "Unassigned Hostel"})</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <label>Room Number</label>
          <input 
            name="roomNumber" 
            value={formData.roomNumber || ""} 
            onChange={handleChange} 
            style={inputStyle} 
          />
        </div>
        <div>
          <label>Room Type</label>
          <select 
            name="roomType" 
            value={formData.roomType || "NON_AC"} 
            onChange={handleChange} 
            style={inputStyle}
          >
            <option value="AC">AC</option>
            <option value="NON_AC">NON_AC</option>
          </select>
        </div>
        <div>
          <label>Capacity</label>
          <input 
            name="capacity" 
            type="number" 
            value={formData.capacity || 0} 
            onChange={handleChange} 
            style={inputStyle} 
          />
        </div>
        <div>
          <label>Hostel (Reference)</label>
          <input 
            value={formData.hostelName || "N/A"} 
            disabled 
            style={{ ...inputStyle, background: "#f0f0f0", color: "#6c757d" }} 
          />
        </div>
      </div>
      <div style={{ marginTop: "20px" }}>
        <button 
          onClick={() => onUpdate(formData)} 
          style={{ background: "#ffc107", padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
        >
          Update Room
        </button>
        <button 
          onClick={onCancel} 
          style={{ marginLeft: "10px", padding: "10px 20px", cursor: "pointer", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const inputStyle = { width: "100%", padding: "10px", marginTop: "5px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" };

export default ModifyRoom;