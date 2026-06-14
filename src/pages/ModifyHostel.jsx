import React, { useState, useEffect } from "react";
import { fetchUsersApi } from "../services/api";

const ModifyHostel = ({ hostel, onUpdate, onDelete, onCancel }) => {
  // 1. Core Reactive Form State setup
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
    paidBy: ""
  });

  const [systemUsers, setSystemUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // 2. FIXED synchronization hook loop: Triggers automatically when edit component receives data props
  useEffect(() => {
    if (hostel) {
      setFormData({
        ...hostel,
        hostelFee: hostel.hostelFee !== undefined && hostel.hostelFee !== null ? hostel.hostelFee : "",
        paymentMode: hostel.paymentMode || "CASH",
        transactionId: hostel.transactionId || "",
        paidBy: hostel.paidBy ? String(hostel.paidBy) : ""
      });
    }
  }, [hostel]);

  // 3. Dropdown Metadata loader configuration
  useEffect(() => {
    const loadSystemPersonnel = async () => {
      setLoadingUsers(true);
      try {
        const uData = await fetchUsersApi();
        const usersList = uData || [];
        setSystemUsers(usersList);

        // Fallback default dropdown state matching selection allocation
        if (!formData.paidBy && usersList.length > 0) {
          const firstUserId = usersList[0].id || usersList[0].userId;
          setFormData(prev => ({ ...prev, paidBy: String(firstUserId) }));
        }
      } catch (err) {
        console.error("Error loading system users list for update attribution:", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadSystemPersonnel();
  }, [formData.paidBy]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault(); // Defends layout structure against default browser reload cycles
    
    // Explicitly enforce numeric parsing conversions to mirror backend data signatures (BigDecimal/Long)
    const transmissionPayload = {
      ...formData,
      hostelId: formData.hostelId || hostel.hostelId, 
      hostelFee: formData.hostelFee ? parseFloat(formData.hostelFee) : 0.0,
      paidBy: formData.paidBy ? parseInt(formData.paidBy) : null
    };
    onUpdate(transmissionPayload);
  };

  const handleDeleteSubmit = () => {
    if (window.confirm(`Are you sure you want to completely delete ${hostel.hostelName}?`)) {
      onDelete(hostel.hostelId);
    }
  };

  return (
    <form onSubmit={handleUpdateSubmit} style={{ padding: "20px", background: "#fff", border: "2px solid #ffc107", borderRadius: "8px" }}>
      <h3 style={{ borderBottom: "2px solid #ffc107", paddingBottom: "8px", marginBottom: "15px" }}>
        Update Hostel: {hostel.hostelName}
      </h3>
      
      <h4 style={{ margin: "10px 0", color: "#555" }}>1. Property Information</h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <div>
          <label style={labelStyle}>Hostel Name</label>
          <input name="hostelName" value={formData.hostelName || ""} onChange={handleChange} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Owner Name</label>
          <input name="ownerName" value={formData.ownerName || ""} onChange={handleChange} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Address</label>
          <input name="address" value={formData.address || ""} onChange={handleChange} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Phone Number</label>
          <input name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleChange} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Contract Start</label>
          <input name="contractStartDate" type="date" value={formData.contractStartDate || ""} onChange={handleChange} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Contract End</label>
          <input name="contractEndDate" type="date" value={formData.contractEndDate || ""} onChange={handleChange} required style={inputStyle} />
        </div>
      </div>

      <h4 style={{ margin: "20px 0 10px 0", color: "#555" }}>2. Operational Setup Fees</h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", background: "#fafafa", padding: "15px", borderRadius: "6px", border: "1px solid #eee" }}>
        <div>
          <label style={labelStyle}>Hostel Setup Fee (₹)</label>
          <input name="hostelFee" type="number" step="any" placeholder="0.00" value={formData.hostelFee} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Payment Mode</label>
          <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} style={inputStyle}>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI / QR Code</option>
            <option value="NET_BANKING">Net Banking</option>
            <option value="CARD">Credit / Debit Card</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Transaction / Ref ID</label>
          <input name="transactionId" placeholder="Ref Reference Number" value={formData.transactionId} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Paid By (System User/Staff)</label>
          <select name="paidBy" value={formData.paidBy} onChange={handleChange} style={inputStyle} disabled={loadingUsers}>
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
        <input name="isActive" type="checkbox" checked={!!formData.isActive} onChange={handleChange} /> Is Active Property Status
      </label>

      <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button type="button" onClick={handleDeleteSubmit} style={{ padding: "10px 20px", background: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
          Delete Hostel
        </button>

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={onCancel} style={{ padding: "10px 20px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Cancel
          </button>
          <button type="submit" style={{ background: "#ffc107", color: "#000", padding: "10px 20px", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
            Update Hostel
          </button>
        </div>
      </div>
    </form>
  );
};

const inputStyle = { width: "100%", padding: "10px", marginTop: "5px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" };
const labelStyle = { fontSize: "12px", fontWeight: "bold", color: "#666" };

export default ModifyHostel;