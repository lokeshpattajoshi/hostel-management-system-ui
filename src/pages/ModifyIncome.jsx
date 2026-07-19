import React, { useState, useEffect } from "react";
import { updateIncomeApi, fetchAdminUsersApi } from "../services/api";

const ModifyIncome = ({ activeRecord, onSave, onCancel }) => {
  const [admins, setAdmins] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    paymentMode: "UPI",
    description: "",
    transactionId: "",
    advanceAmount: 0,
    incomeDate: "",
    receivedByUserId: "",
    chargeId: "",
    createdBy: "",
    createdByUserName: "",
    createdDate: ""
  });

  const loggedInAdminId = localStorage.getItem("userId") || "1"; 

  // Fetch administrator reference listing matching organizational lookups
  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const adminData = await fetchAdminUsersApi();
        setAdmins(adminData || []);
      } catch (err) {
        console.error("Error fetching admin list drop-downs:", err);
      }
    };
    loadAdmins();
  }, []);

  useEffect(() => {
    if (activeRecord) {
      const structuredCreatedDate = activeRecord.createdDate 
        ? activeRecord.createdDate.split("T")[0] 
        : "";

      setFormData({
        amount: activeRecord.amount || "",
        paymentMode: activeRecord.paymentMode || "UPI",
        description: activeRecord.description || "",
        transactionId: activeRecord.transactionId || "",
        advanceAmount: activeRecord.advanceAmount || 0,
        incomeDate: activeRecord.incomeDate || "",
        receivedByUserId: activeRecord.receivedByUserId || loggedInAdminId,
        chargeId: activeRecord.chargeId || "",
        createdBy: activeRecord.createdBy || "",
        createdByUserName: activeRecord.createdByUserName || "",
        createdDate: structuredCreatedDate
      });
    }
  }, [activeRecord, loggedInAdminId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatorChange = (e) => {
    const selectedId = e.target.value;
    const matchedAdmin = admins.find(a => a.userId.toString() === selectedId.toString());
    
    setFormData((prev) => ({
      ...prev,
      createdBy: selectedId,
      createdByUserName: matchedAdmin ? matchedAdmin.userName : ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeRecord?.incomeId) return;

    const initialTimestamp = activeRecord.createdDate || new Date().toISOString();
    const cleanCreatedDate = formData.createdDate === initialTimestamp.split("T")[0]
      ? initialTimestamp
      : `${formData.createdDate}T${initialTimestamp.split("T")[1] || "00:00:00.000000"}`;

    const payload = {
      ...activeRecord,
      amount: parseFloat(formData.amount),
      paymentMode: formData.paymentMode,
      description: formData.description,
      transactionId: formData.transactionId,
      advanceAmount: parseFloat(formData.advanceAmount) || 0,
      incomeDate: formData.incomeDate,
      receivedByUserId: formData.receivedByUserId ? parseInt(formData.receivedByUserId, 10) : null,
      chargeId: formData.chargeId ? parseInt(formData.chargeId, 10) : null,
      createdBy: formData.createdBy ? parseInt(formData.createdBy, 10) : null,
      createdByUserName: formData.createdByUserName,
      createdDate: cleanCreatedDate
    };

    const res = await updateIncomeApi(activeRecord.incomeId, payload);
    if (res) {
      alert("Ledger records modified successfully.");
      onSave();
    }
  };

  if (!activeRecord) {
    return <div style={{ padding: "20px", color: "#dc3545" }}>Select an entry row to begin modification workflows.</div>;
  }

  return (
    <div style={containerStyle}>
      <h3 style={headerStyle}>Modify Ledger Record Entry (ID: #{activeRecord.incomeId})</h3>
      
      <div style={profileBannerStyle}>
        <div style={{ fontWeight: "600", color: "#2c3e50" }}>
          Occupant Name: <span style={{ color: "#007bff", marginLeft: "5px" }}>{activeRecord.tenantName || "N/A"}</span>
        </div>
        <div style={{ fontSize: "13px", color: "#495057", marginTop: "4px" }}>
          Hostel Context: <strong>{activeRecord.hostelName || "N/A"}</strong>
        </div>
        <div style={{ fontSize: "12px", color: "#7f8c8d", marginTop: "2px" }}>
          Original Mapping Labels: Charge ID #{activeRecord.chargeId || "N/A"} | Tenant ID #{activeRecord.tenantId || "N/A"}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={formGrid}>
        
        <div style={fieldGroup}>
          <label style={labelStyle}>Payment Amount (₹)</label>
          <input type="number" name="amount" value={formData.amount} onChange={handleChange} required style={inputStyle} step="0.01" />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Adjust Advance Allocations (₹)</label>
          <input type="number" name="advanceAmount" value={formData.advanceAmount} onChange={handleChange} style={inputStyle} step="0.01" />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Charge ID Linkage</label>
          <input type="number" name="chargeId" value={formData.chargeId} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Income Booking Date</label>
          <input type="date" name="incomeDate" value={formData.incomeDate} onChange={handleChange} required style={inputStyle} />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Record Creation Date</label>
          <input type="date" name="createdDate" value={formData.createdDate} onChange={handleChange} required style={inputStyle} />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Payment Mode</label>
          <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} style={inputStyle}>
            <option value="UPI">UPI</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card / Debit</option>
            <option value="NET_BANKING">Net Banking</option>
            <option value="CHEQUE">Cheque</option>
          </select>
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Transaction ID / Reference Reference</label>
          <input type="text" name="transactionId" value={formData.transactionId} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Received By Personnel</label>
          <select 
            name="receivedByUserId" 
            value={formData.receivedByUserId} 
            onChange={handleChange} 
            required 
            style={inputStyle}
          >
            <option value="">Select Receiving Admin Agent</option>
            {admins.map(a => (
              <option key={a.userId} value={a.userId}>
                {a.fullName}
              </option>
            ))}
          </select>
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Created By Personnel</label>
          <select 
            name="createdBy" 
            value={formData.createdBy} 
            onChange={handleCreatorChange} 
            required 
            style={inputStyle}
          >
            <option value="">Select Creating Admin Agent</option>
            {admins.map(a => (
              <option key={a.userId} value={a.userId}>
                {a.fullName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ ...fieldGroup, gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Accounting Audit Description Memo</label>
          <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyle, height: "60px" }} />
        </div>

        <div style={actionContainer}>
          <button type="button" onClick={onCancel} style={cancelBtn}>Cancel Changes</button>
          <button type="submit" style={submitBtn}>Apply Database Modifications</button>
        </div>
      </form>
    </div>
  );
};

const containerStyle = { background: "#fff", padding: "25px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
const formGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "15px", marginTop: "15px" };
const fieldGroup = { display: "flex", flexDirection: "column" };
const labelStyle = { fontSize: "12px", color: "#495057", fontWeight: "500", marginBottom: "4px" };
const inputStyle = { padding: "10px", borderRadius: "4px", border: "1px solid #ced4da", fontSize: "14px", width: "100%", boxSizing: "border-box" };
const actionContainer = { gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" };
const headerStyle = { borderBottom: "1px solid #dee2e6", paddingBottom: "8px", margin: "0 0 15px 0" };
const submitBtn = { padding: "10px 20px", background: "#ffc107", color: "#000", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", fontWeight: "500" };
const cancelBtn = { padding: "10px 20px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px" };
const profileBannerStyle = { background: "#eef7ff", padding: "12px 15px", borderRadius: "6px", borderLeft: "4px solid #007bff", marginBottom: "15px" };

export default ModifyIncome;