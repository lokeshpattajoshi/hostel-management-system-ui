import React, { useState } from "react";
import { updateTenantApi } from "../services/api";

const ModifyTenant = ({ tenant, onBack }) => {
  const [formData, setFormData] = useState({ ...tenant });

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateTenantApi(tenant.tenantId, formData);
    onBack();
  };

  return (
    <div style={{ padding: "20px", background: "#fff", borderRadius: "8px" }}>
      <h3>Edit Details: {tenant.fullName}</h3>
      <p style={{color: "#666", fontSize: "14px"}}>
        {tenant.hostelName} | Room {tenant.roomNumber} | Bed {tenant.bedNumber}
      </p>

      <form onSubmit={handleUpdate}>
        <div style={formGrid}>
          <label>Phone: <input style={input} value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} /></label>
          <label>Email: <input style={input} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></label>
        </div>

        <div style={{marginTop: "10px"}}>
          <label>Address:</label>
          <textarea style={textArea} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
        </div>

        <h4 style={{marginTop: "20px"}}>Guardian Update</h4>
        <div style={formGrid}>
          <label>Name: <input style={input} value={formData.guardianName} onChange={e => setFormData({...formData, guardianName: e.target.value})} /></label>
          <label>Phone: <input style={input} value={formData.guardianPhone} onChange={e => setFormData({...formData, guardianPhone: e.target.value})} /></label>
        </div>

        <div style={formGrid}>
          <label>Status:
            <select style={input} value={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.value === "true"})}>
              <option value="true">Active</option>
              <option value="false">Exited</option>
            </select>
          </label>
          <label>Checkout Date: <input type="date" style={input} value={formData.checkOutDate} onChange={e => setFormData({...formData, checkOutDate: e.target.value})} /></label>
        </div>

        <div style={{marginTop: "20px", display: "flex", gap: "10px"}}>
          <button type="submit" style={btnSubmit}>Update Record</button>
          <button type="button" onClick={onBack} style={btnCancel}>Go Back</button>
        </div>
      </form>
    </div>
  );
};

// Re-using styles from CreateTenant
const formGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "10px" };
const input = { width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px", marginTop: "5px" };
const textArea = { width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px", minHeight: "60px", marginTop: "5px" };
const btnSubmit = { flex: 1, padding: "12px", background: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };
const btnCancel = { flex: 1, padding: "12px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };

export default ModifyTenant;