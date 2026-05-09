import React, { useState } from "react";

const ModifyRoom = ({ room, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({ ...room });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div style={{ padding: "20px", background: "#fff", border: "2px solid #ffc107", borderRadius: "8px" }}>
      <h3>Modify Room: {room.roomNumber} ({room.hostelName})</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <label>Room Number</label>
          <input name="roomNumber" value={formData.roomNumber} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label>Room Type</label>
          <select name="roomType" value={formData.roomType} onChange={handleChange} style={inputStyle}>
            <option value="AC">AC</option>
            <option value="NON_AC">NON_AC</option>
          </select>
        </div>
        <div>
          <label>Capacity</label>
          <input name="capacity" type="number" value={formData.capacity} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label>Hostel (Reference)</label>
          <input value={formData.hostelName} disabled style={{ ...inputStyle, background: "#f0f0f0" }} />
        </div>
      </div>
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => onUpdate(formData)} style={{ background: "#ffc107", padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer" }}>Update Room</button>
        <button onClick={onCancel} style={{ marginLeft: "10px", padding: "10px 20px", cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
};

const inputStyle = { width: "100%", padding: "10px", marginTop: "5px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" };
export default ModifyRoom;