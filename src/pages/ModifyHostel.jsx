import React, { useState } from "react";

const ModifyHostel = ({ hostel, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({ ...hostel });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  return (
    <div style={{ padding: "20px", background: "#fff", border: "2px solid #ffc107", borderRadius: "8px" }}>
      <h3>Update Hostel: {hostel.hostelName}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <input name="hostelName" value={formData.hostelName} onChange={handleChange} style={inputStyle} />
        <input name="ownerName" value={formData.ownerName} onChange={handleChange} style={inputStyle} />
        <input name="address" value={formData.address} onChange={handleChange} style={inputStyle} />
        <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} style={inputStyle} />
        <input name="contractStartDate" type="date" value={formData.contractStartDate} onChange={handleChange} style={inputStyle} />
        <input name="contractEndDate" type="date" value={formData.contractEndDate} onChange={handleChange} style={inputStyle} />
      </div>
      <label style={{ display: "block", marginTop: "15px" }}>
        <input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} /> Is Active
      </label>
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => onUpdate(formData)} style={{ background: "#ffc107", padding: "10px 20px", border: "none", cursor: "pointer" }}>Update Hostel</button>
        <button onClick={onCancel} style={{ marginLeft: "10px", padding: "10px 20px" }}>Cancel</button>
      </div>
    </div>
  );
};

const inputStyle = { width: "100%", padding: "10px", marginTop: "5px", boxSizing: "border-box" };
export default ModifyHostel;