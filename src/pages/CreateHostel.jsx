import React, { useState, useEffect } from "react";
import { fetchUsersApi } from "../services/api"; // Importing your existing system users API endpoint

const CreateHostel = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    hostelName: "",
    address: "",
    ownerName: "",
    phoneNumber: "",
    contractStartDate: "",
    contractEndDate: "",
    isActive: true,
    hostelFee: "",
    paymentMode: "CASH", 
    transactionId: "",
    paidBy: "" // Will be dynamically initialized with the first user's ID
  });

  const [systemUsers, setSystemUsers] = useState([]); // Holds array list from /api/users
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load system users on layout mount to populate the paidBy dropdown selection
  useEffect(() => {
    const loadSystemPersonnel = async () => {
      setLoadingUsers(true);
      try {
        const uData = await fetchUsersApi();
        const usersList = uData || [];
        setSystemUsers(usersList);

        // Pre-populate with the first active profile to avoid an empty payload selection state
        if (usersList.length > 0) {
          const firstUserId = usersList[0].id || usersList[0].userId;
          setFormData(prev => ({ ...prev, paidBy: String(firstUserId) }));
        }
      } catch (err) {
        console.error("Error loading system users list for setup attribution:", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadSystemPersonnel();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSaveSubmit = () => {
    // Formats payload safely to conform to backend Java object expectations (BigDecimal and Long)
    const transmissionPayload = {
      ...formData,
      hostelFee: formData.hostelFee ? parseFloat(formData.hostelFee) : 0.0,
      paidBy: formData.paidBy ? parseInt(formData.paidBy) : null
    };
    onSave(transmissionPayload);
  };

  return (
    <div style={{ padding: "20px", background: "#fff", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h3 style={{ borderBottom: "2px solid green", paddingBottom: "8px", marginBottom: "15px" }}>Add New Hostel</h3>
      
      {/* SECTION 1: REGISTRATION META INFO */}
      <h4 style={{ margin: "10px 0", color: "#555" }}>1. Property Information</h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <input name="hostelName" placeholder="Hostel Name" onChange={handleChange} value={formData.hostelName} style={inputStyle} />
        <input name="ownerName" placeholder="Owner Name" onChange={handleChange} value={formData.ownerName} style={inputStyle} />
        <input name="address" placeholder="Address" onChange={handleChange} value={formData.address} style={inputStyle} />
        <input name="phoneNumber" placeholder="Phone Number" onChange={handleChange} value={formData.phoneNumber} style={inputStyle} />
        <div>
          <label style={labelStyle}>Contract Start</label>
          <input name="contractStartDate" type="date" onChange={handleChange} value={formData.contractStartDate} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Contract End</label>
          <input name="contractEndDate" type="date" onChange={handleChange} value={formData.contractEndDate} style={inputStyle} />
        </div>
      </div>

      {/* SECTION 2: REGISTRATION FEES & AUDITING */}
      <h4 style={{ margin: "20px 0 10px 0", color: "#555" }}>2. Operational Setup Fees</h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", background: "#f9f9f9", padding: "15px", borderRadius: "6px" }}>
        <div>
          <label style={labelStyle}>Hostel Setup Fee (₹)</label>
          <input name="hostelFee" type="number" placeholder="0.00" onChange={handleChange} value={formData.hostelFee} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Payment Mode</label>
          <select name="paymentMode" onChange={handleChange} value={formData.paymentMode} style={inputStyle}>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI / QR Code</option>
            <option value="NET_BANKING">Net Banking</option>
            <option value="CARD">Credit / Debit Card</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Transaction / Ref ID</label>
          <input name="transactionId" placeholder="Ref Reference Number" onChange={handleChange} value={formData.transactionId} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Paid By (System User/Staff)</label>
          <select 
            name="paidBy" 
            value={formData.paidBy} 
            onChange={handleChange} 
            style={inputStyle}
            disabled={loadingUsers}
          >
            {loadingUsers && <option value="">Loading accounts...</option>}
            {!loadingUsers && systemUsers.length === 0 && <option value="">No staff profiles found</option>}
            {systemUsers.map(u => {
              const uId = u.id || u.userId;
              return (
                <option key={uId} value={uId}>
                  {u.fullName || u.username || `User #${uId}`}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <label style={{ display: "block", marginTop: "15px", fontWeight: "600", cursor: "pointer" }}>
        <input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} /> Is Active Property Status
      </label>

      <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ padding: "10px 20px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
        <button onClick={handleSaveSubmit} style={{ marginLeft: "10px", background: "green", color: "white", padding: "10px 20px", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>Save Hostel</button>
      </div>
    </div>
  );
};

const inputStyle = { width: "100%", padding: "10px", marginTop: "5px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" };
const labelStyle = { fontSize: "12px", fontWeight: "bold", color: "#666" };

export default CreateHostel;