import React, { useState, useEffect } from "react";
import { fetchHostelsApi } from "../services/api";

const CreateRoom = ({ onSave, onCancel }) => {
  const [hostels, setHostels] = useState([]);
  const [formData, setFormData] = useState({
    hostelId: "",
    roomNumber: "",
    roomType: "NON_AC",
    capacity: 3
  });

  useEffect(() => {
    fetchHostelsApi().then(setHostels).catch(() => alert("Error loading hostels"));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div style={{ padding: "20px", background: "#fff", border: "1px solid #28a745", borderRadius: "8px" }}>
      <h3>Create New Room</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <label>Assign to Hostel</label>
          <select name="hostelId" value={formData.hostelId} onChange={handleChange} style={inputStyle}>
            <option value="">-- Select Hostel --</option>
            {hostels.map(h => <option key={h.hostelId} value={h.hostelId}>{h.hostelName}</option>)}
          </select>
        </div>
        <div>
          <label>Room Number</label>
          <input name="roomNumber" placeholder="e.g. 101" onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label>Room Type</label>
          <select name="roomType" value={formData.roomType} onChange={handleChange} style={inputStyle}>
            <option value="AC">AC</option>
            <option value="NON_AC">NON_AC</option>
          </select>
        </div>
        <div>
          <label>Capacity (No. of Beds)</label>
          <input name="capacity" type="number" value={formData.capacity} onChange={handleChange} style={inputStyle} />
        </div>
      </div>
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => onSave(formData)} style={{ background: "#28a745", color: "white", padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer" }}>Save Room</button>
        <button onClick={onCancel} style={{ marginLeft: "10px", padding: "10px 20px", cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
};

const inputStyle = { width: "100%", padding: "10px", marginTop: "5px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" };
export default CreateRoom;