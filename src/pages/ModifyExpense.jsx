import React, { useState, useEffect } from "react";
import { updateExpenseApi } from "../services/api";

const ModifyExpense = ({ expense, onBack }) => {
  const [formData, setFormData] = useState({
    amount: "",
    expenseType: "Maintenance",
    paymentMode: "CASH",
    description: "",
    transactionId: ""
  });

  // Keep internal local component form fields fresh if parent row pointers pivot
  useEffect(() => {
    if (expense) {
      setFormData({
        ...expense,
        amount: expense.amount || "",
        expenseType: expense.expenseType || "Maintenance",
        paymentMode: expense.paymentMode || "CASH",
        description: expense.description || expense.remarks || "",
        transactionId: expense.transactionId || ""
      });
    }
  }, [expense]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : 0.0
      };
      
      const targetId = expense.expenseId || expense.id;
      await updateExpenseApi(targetId, payload);
      alert("Expense parameters saved successfully!");
      onBack(); // Return to master ledger grid view
    } catch (err) {
      console.error("Failed to sync structural changes back downstream:", err);
      alert("Could not update selected expense record parameters.");
    }
  };

  return (
    <div style={{ background: "#fff", padding: "25px", borderRadius: "8px", border: "1px solid #ced4da", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <h3 style={{ borderBottom: "2px solid #007bff", paddingBottom: "8px", color: "#333" }}>
        📝 Edit Expense Identifier Ref: {formData.transactionId || "N/A"}
      </h3>
      
      <form onSubmit={handleUpdate} style={{ marginTop: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
          <label style={labelStyle}>Amount (₹): 
            <input 
              type="number" 
              step="any"
              style={input} 
              value={formData.amount} 
              onChange={e => setFormData({...formData, amount: e.target.value})} 
              required
            />
          </label>
          <label style={labelStyle}>Expense Category Type:
            <select style={input} value={formData.expenseType} onChange={e => setFormData({...formData, expenseType: e.target.value})}>
              <option value="Maintenance">Maintenance</option>
              <option value="Electricity">Electricity</option>
              <option value="Water">Water</option>
              <option value="Rent">Rent</option>
              <option value="Salary">Staff Salary</option>
              <option value="Other">Other</option>
            </select>
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
          <label style={labelStyle}>Payment Method Mode:
            <select style={input} value={formData.paymentMode} onChange={e => setFormData({...formData, paymentMode: e.target.value})}>
              <option value="CASH">Cash Transaction</option>
              <option value="UPI">UPI / QR Code Scan</option>
              <option value="NET_BANKING">Net Banking EFT</option>
              <option value="CARD">Credit / Debit Card</option>
            </select>
          </label>
          <label style={labelStyle}>Transaction Reference Voucher ID:
            <input 
              type="text"
              style={input} 
              value={formData.transactionId} 
              onChange={e => setFormData({...formData, transactionId: e.target.value})} 
            />
          </label>
        </div>

        <div style={{ marginTop: "15px" }}>
          <label style={labelStyle}>Allocation Remarks / Description:</label>
          <textarea 
            style={{ width: "100%", padding: "10px", marginTop: "5px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc", minHeight: "80px" }} 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
          />
        </div>

        <div style={{ marginTop: "25px", display: "flex", gap: "12px" }}>
          <button type="submit" style={{ flex: 1, padding: "11px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
            Save Changes
          </button>
          <button type="button" onClick={onBack} style={{ flex: 1, padding: "11px", background: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const input = { width: "100%", padding: "10px", marginTop: "5px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc", fontSize: "14px" };
const labelStyle = { fontSize: "13px", fontWeight: "600", color: "#495057", display: "block" };

export default ModifyExpense;