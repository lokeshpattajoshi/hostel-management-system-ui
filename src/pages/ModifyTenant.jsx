import React, { useState } from "react";
import { updateTenantApi } from "../services/api";

const ModifyTenant = ({ tenant = {}, onBack, currentUserId }) => {
  const [formData, setFormData] = useState({ 
    identityType: "AADHAR",
    identityNumber: "",
    guardianIdentityType: "AADHAR",
    guardianIdentityNumber: "",
    ...tenant 
  });

  const handleUpdate = async (e) => {
    e.preventDefault();

    // 1. Resolve Target Tenant Primary Key safely
    const targetTenantId = tenant?.tenantId || tenant?.id;
    if (!targetTenantId) {
      alert("Error: Invalid Tenant ID. Unable to execute update.");
      return;
    }

    // 2. Resolve User ID for audit tracking (prop fallback to localStorage)
    const effectiveUserId = currentUserId || localStorage.getItem("userId");
    const parsedModifiedBy = effectiveUserId ? parseInt(effectiveUserId, 10) : null;

    // 3. Assemble DTO Payload
    const payload = {
      ...formData,
      age: formData.age ? parseInt(formData.age, 10) : null,
      modifiedBy: isNaN(parsedModifiedBy) ? null : parsedModifiedBy,
      
      // Secondary logic sync if conditional maps require specific property extraction
      guardianAadhar: formData.guardianIdentityType === "AADHAR" ? formData.guardianIdentityNumber : null
    };

    try {
      const response = await updateTenantApi(targetTenantId, payload);
      
      if (response && !response.error) {
        alert("Tenant record updated successfully.");
        onBack();
      } else {
        alert(response?.message || "Failed to update record. Please check parameters and try again.");
      }
    } catch (err) {
      console.error("Operational update execution failed:", err);
      alert("Network exception occurred during request handling.");
    }
  };

  return (
    <div style={{ padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
      <h3>Edit Details: {tenant.fullName || "Tenant"}</h3>
      <p style={{ color: "#666", fontSize: "14px" }}>
        {tenant.hostelName ? `${tenant.hostelName} | ` : ""}
        Room {tenant.roomNumber || "N/A"} | Bed {tenant.bedNumber || "N/A"}
      </p>

      <form onSubmit={handleUpdate}>
        
        {/* SECTION 1: PERSONAL PROFILE */}
        <h4 style={{ marginTop: "20px" }}>Personal Profile</h4>
        <div style={formGrid}>
          <label>Full Name: 
            <input 
              style={input} 
              value={formData.fullName || ""} 
              onChange={e => setFormData({ ...formData, fullName: e.target.value })} 
              required
            />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <label>Age: 
              <input 
                type="number" 
                style={input} 
                value={formData.age ?? ""} 
                onChange={e => setFormData({ ...formData, age: e.target.value })} 
              />
            </label>
            <label>Gender: 
              <select 
                style={input} 
                value={formData.gender || "MALE"} 
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
          </div>
        </div>

        {/* SECTION 2: CONTACT INFORMATION */}
        <h4 style={{ marginTop: "20px" }}>Contact Details</h4>
        <div style={formGrid}>
          <label>Phone: 
            <input 
              style={input} 
              value={formData.phoneNumber || ""} 
              onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} 
              required
            />
          </label>
          <label>Email: 
            <input 
              type="email"
              style={input} 
              value={formData.email || ""} 
              onChange={e => setFormData({ ...formData, email: e.target.value })} 
            />
          </label>
        </div>

        {/* SECTION 3: IDENTITY VERIFICATION */}
        <h4 style={{ marginTop: "20px" }}>Identity Details</h4>
        <div style={formGrid}>
          <label>Identity Type:
            <select style={input} value={formData.identityType || "AADHAR"} onChange={e => setFormData({ ...formData, identityType: e.target.value })}>
              <option value="AADHAR">Aadhaar</option>
              <option value="PAN">PAN</option>
              <option value="PASSPORT">Passport</option>
              <option value="VOTER_ID">Voter ID</option>
              <option value="DRIVING_LICENSE">Driving License</option>
            </select>
          </label>
          <label>Identity Document Number: 
            <input 
              style={input} 
              value={formData.identityNumber || ""} 
              onChange={e => setFormData({ ...formData, identityNumber: e.target.value })} 
            />
          </label>
        </div>

        <div style={{ marginTop: "10px" }}>
          <label>Address:</label>
          <textarea 
            style={textArea} 
            value={formData.address || ""} 
            onChange={e => setFormData({ ...formData, address: e.target.value })} 
          />
        </div>

        {/* SECTION 4: GUARDIAN UPDATE */}
        <h4 style={{ marginTop: "20px" }}>Guardian Details</h4>
        <div style={formGrid}>
          <label>Name: 
            <input 
              style={input} 
              value={formData.guardianName || ""} 
              onChange={e => setFormData({ ...formData, guardianName: e.target.value })} 
            />
          </label>
          <label>Phone: 
            <input 
              style={input} 
              value={formData.guardianPhone || ""} 
              onChange={e => setFormData({ ...formData, guardianPhone: e.target.value })} 
            />
          </label>
        </div>

        <div style={formGrid}>
          <label>Guardian ID Type:
            <select style={input} value={formData.guardianIdentityType || "AADHAR"} onChange={e => setFormData({ ...formData, guardianIdentityType: e.target.value })}>
              <option value="AADHAR">Aadhaar</option>
              <option value="PAN">PAN</option>
              <option value="PASSPORT">Passport</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <label>Guardian ID Number: 
            <input 
              style={input} 
              value={formData.guardianIdentityNumber || ""} 
              onChange={e => setFormData({ ...formData, guardianIdentityNumber: e.target.value })} 
            />
          </label>
        </div>

        {/* SECTION 5: OPERATIONAL STATUS & REMARKS */}
        <h4 style={{ marginTop: "20px" }}>Operational Status & Chronology</h4>
        <div style={formGrid}>
          <label>Check-In Date: 
            <input 
              type="date" 
              style={input} 
              value={formData.checkInDate || ""} 
              onChange={e => setFormData({ ...formData, checkInDate: e.target.value })} 
            />
          </label>
          <label>Checkout Date: 
            <input 
              type="date" 
              style={input} 
              value={formData.checkOutDate || ""} 
              onChange={e => setFormData({ ...formData, checkOutDate: e.target.value })} 
            />
          </label>
        </div>

        <div style={formGrid}>
          <label>Active Tenant Status:
            <select 
              style={input} 
              value={String(formData.isActive ?? true)} 
              onChange={e => setFormData({ ...formData, isActive: e.target.value === "true" })}
            >
              <option value="true">Active</option>
              <option value="false">Exited</option>
            </select>
          </label>
          <label>Remarks: 
            <input 
              type="text" 
              style={input} 
              placeholder="Internal tracking notes..." 
              value={formData.remarks || ""} 
              onChange={e => setFormData({ ...formData, remarks: e.target.value })} 
            />
          </label>
        </div>

        <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
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