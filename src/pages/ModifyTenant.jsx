import React, { useState, useEffect } from "react";
import { 
  updateTenantApi, 
  fetchHostelsApi, 
  fetchRoomsByHostelApi, 
  fetchAvailableBedsApi, 
  fetchUsersApi 
} from "../services/api";

const ModifyTenant = ({ tenant = {}, onBack, currentUserId }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "MALE",
    address: "",
    identityType: "AADHAR",
    identityNumber: "",
    phoneNumber: "",
    email: "",
    guardianName: "",
    guardianIdentityType: "AADHAR",
    guardianIdentityNumber: "",
    guardianPhone: "",
    bedId: "",
    checkInDate: "",
    checkOutDate: "",
    isActive: true,
    charges: [],
    ...tenant
  });

  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(tenant.hostelId || "");
  const [selectedRoom, setSelectedRoom] = useState(tenant.roomId || "");
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [hData, uData] = await Promise.all([
          fetchHostelsApi(),
          fetchUsersApi()
        ]);
        
        setHostels(Array.isArray(hData) ? hData : []);
        setSystemUsers(Array.isArray(uData) ? uData : []);

        if (tenant.hostelId) {
          const rData = await fetchRoomsByHostelApi(tenant.hostelId);
          setRooms(Array.isArray(rData) ? rData : []);
        }

        if (tenant.roomId) {
          const bData = await fetchAvailableBedsApi(tenant.roomId);
          let bedList = Array.isArray(bData) ? bData : [];
          
          if (tenant.bedId && !bedList.some(b => b.bedId === tenant.bedId)) {
            bedList = [{ bedId: tenant.bedId, bedNumber: tenant.bedNumber || tenant.bedId }, ...bedList];
          }
          setBeds(bedList);
        }
      } catch (err) {
        console.error("Error loading master options:", err);
      }
    };

    loadInitialData();
  }, [tenant]);

  const handleHostelChange = async (e) => {
    const hId = e.target.value;
    setSelectedHostel(hId);
    setSelectedRoom("");
    setRooms([]);
    setBeds([]);
    setFormData(prev => ({ ...prev, bedId: "" }));

    if (hId) {
      const rData = await fetchRoomsByHostelApi(hId);
      setRooms(Array.isArray(rData) ? rData : []);
    }
  };

  const handleRoomChange = async (e) => {
    const rId = e.target.value;
    setSelectedRoom(rId);
    setBeds([]);
    setFormData(prev => ({ ...prev, bedId: "" }));

    if (rId) {
      const bData = await fetchAvailableBedsApi(rId);
      let bedList = Array.isArray(bData) ? bData : [];
      
      if (tenant.bedId && rId === tenant.roomId && !bedList.some(b => b.bedId === tenant.bedId)) {
        bedList = [{ bedId: tenant.bedId, bedNumber: tenant.bedNumber || tenant.bedId }, ...bedList];
      }
      setBeds(bedList);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChargeChange = (index, field, value) => {
    const updatedCharges = [...formData.charges];
    updatedCharges[index] = {
      ...updatedCharges[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, charges: updatedCharges }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const targetTenantId = tenant?.tenantId || tenant?.id;
    if (!targetTenantId) {
      setErrorModal({ isOpen: true, message: "Invalid Tenant ID. Unable to execute update." });
      return;
    }

    const effectiveUserId = currentUserId || localStorage.getItem("userId");
    const parsedModifiedBy = effectiveUserId ? parseInt(effectiveUserId, 10) : null;

    const payload = {
      fullName: formData.fullName,
      age: formData.age ? parseInt(formData.age, 10) : null,
      gender: formData.gender,
      address: formData.address,
      identityType: formData.identityType,
      identityNumber: formData.identityNumber,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      guardianName: formData.guardianName,
      guardianIdentityType: formData.guardianIdentityType,
      guardianIdentityNumber: formData.guardianIdentityNumber,
      guardianPhone: formData.guardianPhone,
      guardianAadhar: formData.guardianIdentityType === "AADHAR" ? formData.guardianIdentityNumber : null,
      bedId: formData.bedId ? parseInt(formData.bedId, 10) : null,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      isActive: formData.isActive,
      modifiedBy: isNaN(parsedModifiedBy) ? null : parsedModifiedBy,
      charges: (formData.charges || []).map(c => ({
        tenantId: targetTenantId,
        chargeId: c.chargeId,
        chargeType: c.chargeType,
        status: c.status,
        billingCycle: c.billingCycle,
        periodStart: c.periodStart,
        periodEnd: c.periodEnd,
        totalAmount: parseFloat(c.totalAmount) || 0.0,
        balanceAmount: parseFloat(c.balanceAmount) || 0.0,
        paidAmount: parseFloat(c.paidAmount) || 0.0,
        dueDate: c.dueDate,
        paymentMode: c.paymentMode || null,
        transactionId: c.transactionId || null,
        receivedBy: c.receivedBy ? parseInt(c.receivedBy, 10) : null,
        paymentDate: c.paymentDate || null,
        remarks: c.remarks || "NS"
      }))
    };

    try {
      const response = await updateTenantApi(targetTenantId, payload);
      if (response && !response.error) {
        alert("Tenant record updated successfully.");
        onBack();
      } else {
        setErrorModal({ isOpen: true, message: response?.message || "Failed to update record." });
      }
    } catch (err) {
      console.error("Update execution failed:", err);
      setErrorModal({ isOpen: true, message: "Network exception occurred during request handling." });
    }
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ borderBottom: "2px solid #007bff", paddingBottom: "10px" }}>
        Edit Details: {tenant.fullName || "Tenant"}
      </h3>

      {errorModal.isOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <span>⚠️ Error</span>
              <button onClick={() => setErrorModal({ isOpen: false, message: "" })} style={closeXBtnStyle}>&times;</button>
            </div>
            <div style={modalBodyStyle}>{errorModal.message}</div>
            <div style={modalFooterStyle}>
              <button onClick={() => setErrorModal({ isOpen: false, message: "" })} style={modalCloseBtnStyle}>Close</button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleUpdate} style={formGrid}>
        
        {/* SECTION 1: PERSONAL DETAILS */}
        <section style={sectionStyle}>
          <h4>1. Personal Information</h4>
          <label style={labelStyle}>Full Name *</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required style={inputStyle} />
          
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <label style={labelStyle}>Identity Document</label>
          <div style={{ display: "flex", gap: "5px" }}>
            <select name="identityType" value={formData.identityType} onChange={handleChange} style={{ flex: 1, ...inputStyle }}>
              <option value="AADHAR">Identity Card (Aadhaar)</option>
              <option value="PAN">PAN</option>
              <option value="PASSPORT">Passport</option>
              <option value="VOTER_ID">Voter ID</option>
              <option value="DRIVING_LICENSE">Driving License</option>
            </select>
            <input type="text" name="identityNumber" value={formData.identityNumber} onChange={handleChange} placeholder="ID Number" style={{ flex: 2, ...inputStyle }} />
          </div>

          <label style={labelStyle}>Phone Number *</label>
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required style={inputStyle} />
          
          <label style={labelStyle}>Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
          
          <label style={labelStyle}>Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} style={{ ...inputStyle, height: "50px" }} />
        </section>

        {/* SECTION 2: GUARDIAN DETAILS */}
        <section style={sectionStyle}>
          <h4>2. Guardian Information</h4>
          <label style={labelStyle}>Guardian Name</label>
          <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} style={inputStyle} />
          
          <label style={labelStyle}>Guardian Phone</label>
          <input type="text" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} style={inputStyle} />
          
          <label style={labelStyle}>Guardian Identity</label>
          <div style={{ display: "flex", gap: "5px" }}>
            <select name="guardianIdentityType" value={formData.guardianIdentityType} onChange={handleChange} style={{ flex: 1, ...inputStyle }}>
              <option value="AADHAR">Identity Card (Aadhaar)</option>
              <option value="PAN">PAN</option>
              <option value="PASSPORT">Passport</option>
              <option value="OTHER">Other</option>
            </select>
            <input type="text" name="guardianIdentityNumber" value={formData.guardianIdentityNumber} onChange={handleChange} placeholder="ID Number" style={{ flex: 2, ...inputStyle }} />
          </div>
        </section>

        {/* SECTION 3: HOSTEL & ALLOTMENT UPDATE */}
        <section style={sectionStyle}>
          <h4>3. Hostel & Room Allocation</h4>
          <label style={labelStyle}>Hostel</label>
          <select value={selectedHostel} onChange={handleHostelChange} style={inputStyle}>
            <option value="">Select Hostel</option>
            {hostels.map(h => (
              <option key={h.hostelId} value={h.hostelId}>{h.hostelName}</option>
            ))}
          </select>

          <label style={labelStyle}>Room</label>
          <select value={selectedRoom} onChange={handleRoomChange} disabled={!selectedHostel} style={inputStyle}>
            <option value="">Select Room</option>
            {rooms.map(r => (
              <option key={r.roomId} value={r.roomId}>Room {r.roomNumber} ({r.roomType})</option>
            ))}
          </select>

          <label style={labelStyle}>Bed</label>
          <select name="bedId" value={formData.bedId} onChange={handleChange} disabled={!selectedRoom} style={inputStyle}>
            <option value="">Select Bed</option>
            {beds.map(b => (
              <option key={b.bedId} value={b.bedId}>Bed {b.bedNumber}</option>
            ))}
          </select>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Check-In Date</label>
              <input type="date" name="checkInDate" value={formData.checkInDate} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Checkout Date</label>
              <input type="date" name="checkOutDate" value={formData.checkOutDate} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <label style={labelStyle}>Status</label>
          <select name="isActive" value={String(formData.isActive)} onChange={e => setFormData({ ...formData, isActive: e.target.value === "true" })} style={inputStyle}>
            <option value="true">Active</option>
            <option value="false">Exited</option>
          </select>
        </section>

        {/* SECTION 4: CHARGES DIRECT UPDATES */}
        <section style={{ ...sectionStyle, backgroundColor: "#f8f9fa", gridColumn: "1 / -1" }}>
          <h4>4. Charges Management</h4>
          {formData.charges && formData.charges.length > 0 ? (
            formData.charges.map((charge, idx) => (
              <div key={charge.chargeId || idx} style={chargeBoxStyle}>
                <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                  Charge Type: {charge.chargeType} (ID: {charge.chargeId})
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                  <div>
                    <label style={labelStyle}>Total Amount</label>
                    <input
                      type="number"
                      value={charge.totalAmount || ""}
                      onChange={(e) => handleChargeChange(idx, "totalAmount", e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Paid Amount</label>
                    <input
                      type="number"
                      value={charge.paidAmount || ""}
                      onChange={(e) => handleChargeChange(idx, "paidAmount", e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Balance Amount</label>
                    <input
                      type="number"
                      value={charge.balanceAmount || ""}
                      onChange={(e) => handleChargeChange(idx, "balanceAmount", e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select
                      value={charge.status || "PENDING"}
                      onChange={(e) => handleChargeChange(idx, "status", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="PAID">PAID</option>
                      <option value="PARTIAL">PARTIAL</option>
                      <option value="UNPAID">UNPAID</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Due Date</label>
                    <input
                      type="date"
                      value={charge.dueDate || ""}
                      onChange={(e) => handleChargeChange(idx, "dueDate", e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: "13px", color: "#666" }}>No charges associated with this tenant.</p>
          )}
        </section>

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button type="button" onClick={onBack} style={cancelBtn}>Cancel</button>
          <button type="submit" style={submitBtn}>Save Updates</button>
        </div>
      </form>
    </div>
  );
};

const containerStyle = { background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", color: "#333" };
const formGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" };
const sectionStyle = { padding: "15px", border: "1px solid #eee", borderRadius: "6px" };
const chargeBoxStyle = { background: "#ffffff", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", marginBottom: "12px" };
const inputStyle = { width: "100%", padding: "10px", margin: "5px 0", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" };
const labelStyle = { fontSize: "11px", color: "#666", display: "block", marginTop: "6px" };
const submitBtn = { padding: "12px 25px", background: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const cancelBtn = { padding: "12px 25px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };

const modalOverlayStyle = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 };
const modalContentStyle = { background: "#fff", borderRadius: "8px", width: "90%", maxWidth: "450px", boxShadow: "0 5px 15px rgba(0,0,0,0.3)", overflow: "hidden" };
const modalHeaderStyle = { background: "#dc3545", color: "#fff", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "bold" };
const closeXBtnStyle = { background: "none", border: "none", color: "#fff", fontSize: "24px", cursor: "pointer" };
const modalBodyStyle = { padding: "20px", fontSize: "14px", color: "#333", lineHeight: "1.5" };
const modalFooterStyle = { padding: "10px 20px 15px", display: "flex", justifyContent: "flex-end" };
const modalCloseBtnStyle = { padding: "8px 20px", background: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };

export default ModifyTenant;