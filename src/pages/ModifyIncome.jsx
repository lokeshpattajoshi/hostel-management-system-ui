import React, { useState, useEffect } from "react";
import { updateIncomeApi } from "../services/api";

const ModifyIncome = ({ activeRecord, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: "",
    paymentMode: "UPI",
    description: "",
    transactionId: "",
    advanceAmount: 0
  });

  useEffect(() => {
    if (activeRecord) {
      setFormData({
        amount: activeRecord.amount || "",
        paymentMode: activeRecord.paymentMode || "UPI",
        description: activeRecord.description || "",
        transactionId: activeRecord.transactionId || "",
        advanceAmount: activeRecord.advanceAmount || 0
      });
    }
  }, [activeRecord]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeRecord?.incomeId) return;

    const payload = {
      ...activeRecord,
      amount: parseFloat(formData.amount),
      paymentMode: formData.paymentMode,
      description: formData.description,
      transactionId: formData.transactionId,
      advanceAmount: parseFloat(formData.advanceAmount) || 0
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
      <form onSubmit={handleSubmit} style={formGrid}>
        
        <div style={fieldGroup}>
          <label style={labelStyle}>Payment Amount (₹)</label>
          <input type="number" name="amount" value={formData.amount} onChange={handleChange} required style={inputStyle} />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Payment Mode</label>
          <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} style={inputStyle}>
            <option value="UPI">UPI</option>
            <option value="CASH">Cash</option>
            <option value="NET_BANKING">Net Banking</option>
            <option value="DEBIT_CARD">Debit Card</option>
          </select>
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Transaction ID / Reference Reference</label>
          <input type="text" name="transactionId" value={formData.transactionId} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Adjust Advance Allocations</label>
          <input type="number" name="advanceAmount" value={formData.advanceAmount} onChange={handleChange} style={inputStyle} />
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

export default ModifyIncome;