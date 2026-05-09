import React, { useState } from "react";

const CreateHostel = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    hostelName: "",
    address: "",
    ownerName: "",
    phoneNumber: "",
    contractStartDate: "",
    contractEndDate: "",
    isActive: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  return (
    <div style={{ padding: "20px", background: "#fff", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h3>Add New Hostel</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <input name="hostelName" placeholder="Hostel Name" onChange={handleChange} style={inputStyle} />
        <input name="ownerName" placeholder="Owner Name" onChange={handleChange} style={inputStyle} />
        <input name="address" placeholder="Address" onChange={handleChange} style={inputStyle} />
        <input name="phoneNumber" placeholder="Phone Number" onChange={handleChange} style={inputStyle} />
        <div>
          <label>Contract Start</label>
          <input name="contractStartDate" type="date" onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label>Contract End</label>
          <input name="contractEndDate" type="date" onChange={handleChange} style={inputStyle} />
        </div>
      </div>
      <label style={{ display: "block", marginTop: "15px" }}>
        <input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} /> Is Active
      </label>
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => onSave(formData)} style={{ background: "green", color: "white", padding: "10px 20px", border: "none", cursor: "pointer" }}>Save Hostel</button>
        <button onClick={onCancel} style={{ marginLeft: "10px", padding: "10px 20px" }}>Cancel</button>
      </div>
    </div>
  );
};

const inputStyle = { width: "100%", padding: "10px", marginTop: "5px", boxSizing: "border-box" };
export default CreateHostel;