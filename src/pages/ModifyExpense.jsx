import React, { useState } from "react";
import { updateExpenseApi } from "../services/api";

const ModifyExpense = ({ expense, onBack }) => {
  const [formData, setFormData] = useState({ ...expense });

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateExpenseApi(expense.expenseId, formData);
    onBack();
  };

  return (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}>
      <h3>Edit Expense ID: {expense.transactionId}</h3>
      <form onSubmit={handleUpdate}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <label>Amount: 
            <input type="number" style={input} value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </label>
          <label>Type:
            <select style={input} value={formData.expenseType} onChange={e => setFormData({...formData, expenseType: e.target.value})}>
              <option value="Maintenance">Maintenance</option>
              <option value="Electricity">Electricity</option>
              <option value="Water">Water</option>
            </select>
          </label>
        </div>
        <div style={{ marginTop: "15px" }}>
          <label>Description:</label>
          <textarea style={{ width: "100%", padding: "10px", marginTop: "5px" }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button type="submit" style={{ flex: 1, padding: "10px", background: "#007bff", color: "white", border: "none", borderRadius: "4px" }}>Update</button>
          <button type="button" onClick={onBack} style={{ flex: 1, padding: "10px", background: "#6c757d", color: "white", border: "none", borderRadius: "4px" }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const input = { width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" };

export default ModifyExpense;