import React, { useState } from "react";
import { updateTenantApi } from "../services/api";

// ✅ Added currentUserId to props list matching layout profile
const ModifyTenant = ({ tenant, onBack, currentUserId }) => {
  const [formData, setFormData] = useState({ 
    identityType: "AADHAR",
    identityNumber: "",
    guardianIdentityType: "AADHAR",
    guardianIdentityNumber: "",
    ...tenant 
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // ✅ Extract and process context tracing markers safely
    const parsedModifiedBy = currentUserId ? parseInt(currentUserId, 10) : null;

    const payload = {
      ...formData,
      // ✅ Injected modifiedBy parameter directly into outbound DTO request schema
      modifiedBy: isNaN(parsedModifiedBy) ? null : parsedModifiedBy,
      
      // Secondary logic sync if conditional maps require specific property extraction
      guardianAadhar: formData.guardianIdentityType === "AADHAR" ? formData.guardianIdentityNumber : null
    };

    try {
      const response = await updateTenantApi(tenant.tenantId, payload);
      if (response) {
        alert("Tenant record updated successfully.");
        onBack();
      } else {
        alert("Failed to update ledger records. Please try again.");
      }
    } catch (err) {
      console.error("Operational update execution failed:", err);
      alert("Network exception occurred during request handling.");
    }
  };

  return (
    <div style={{ padding: "20px", background: "#fff", borderRadius: "8px" }}>
      <h3>Edit Details: {tenant.fullName}</h3>
      <p style={{color: "#666", fontSize: "14px"}}>
        {tenant.hostelName} | Room {tenant.roomNumber} | Bed {tenant.bedNumber}
      </p>

      <form onSubmit={handleUpdate}>
        {/* SECTION 1: CONTACT INFORMATION */}
        <div style={formGrid}>
          <label>Phone: <input style={input} value={formData.phoneNumber || ""} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} /></label>
          <label>Email: <input style={input} value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} /></label>
        </div>

        {/* SECTION 2: IDENTITY VERIFICATION */}
        <h4 style={{marginTop: "20px"}}>Identity Details</h4>
        <div style={formGrid}>
          <label>Identity Type:
            <select style={input} value={formData.identityType} onChange={e => setFormData({...formData, identityType: e.target.value})}>
              <option value="AADHAR">Aadhaar</option>
              <option value="PAN">PAN</option>
            </select>
          </label>
          <label>Identity Document Number: 
            <input style={input} value={formData.identityNumber || ""} onChange={e => setFormData({...formData, identityNumber: e.target.value})} />
          </label>
        </div>

        <div style={{marginTop: "10px"}}>
          <label>Address:</label>
          <textarea style={textArea} value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} />
        </div>

        {/* SECTION 3: GUARDIAN UPDATE */}
        <h4 style={{marginTop: "20px"}}>Guardian Update</h4>
        <div style={formGrid}>
          <label>Name: <input style={input} value={formData.guardianName || ""} onChange={e => setFormData({...formData, guardianName: e.target.value})} /></label>
          <label>Phone: <input style={input} value={formData.guardianPhone || ""} onChange={e => setFormData({...formData, guardianPhone: e.target.value})} /></label>
        </div>

        <div style={formGrid}>
          <label>Guardian ID Type:
            <select style={input} value={formData.guardianIdentityType} onChange={e => setFormData({...formData, guardianIdentityType: e.target.value})}>
              <option value="AADHAR">Aadhaar</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <label>Guardian ID Number: 
            <input style={input} value={formData.guardianIdentityNumber || ""} onChange={e => setFormData({...formData, guardianIdentityNumber: e.target.value})} />
          </label>
        </div>

        {/* SECTION 4: STATUS UPDATE */}
        <h4 style={{marginTop: "20px"}}>Operational Status</h4>
        <div style={formGrid}>
          <label>Status:
            <select style={input} value={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.value === "true"})}>
              <option value="true">Active</option>
              <option value="false">Exited</option>
            </select>
          </label>
          <label>Checkout Date: <input type="date" style={input} value={formData.checkOutDate || ""} onChange={e => setFormData({...formData, checkOutDate: e.target.value})} /></label>
        </div>

        <div style={{marginTop: "20px", display: "flex", gap: "10px"}}>
          <button type="submit" style={btnSubmit}>Update Record</button>
          <button type="button" onClick={onBack} style={btnCancel}>Go Back</button>
        </div>
      </form>
    </div>
  );
};

const formGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "10px" };
const input = { width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px", marginTop: "5px", boxSizing: "border-box" };
const textArea = { width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px", minHeight: "60px", marginTop: "5px", boxSizing: "border-box" };
const btnSubmit = { flex: 1, padding: "12px", background: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const btnCancel = { flex: 1, padding: "12px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };

export default ModifyTenant;