import React, { useState, useEffect } from "react";
import { fetchHostelsApi, createExpenseApi, fetchAdminUsersApi } from "../services/api";

const CreateExpense = ({ onCancel }) => {
  const [hostels, setHostels] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [formData, setFormData] = useState({
    hostelId: "",
    paidByUserId: "",
    amount: "",
    expenseDate: new Date().toISOString().split('T')[0],
    expenseType: "Maintenance",
    description: "",
    transactionId: ""
  });

// Inside CreateExpense.jsx
useEffect(() => {
  const loadData = async () => {
    try {
      const hostelData = await fetchHostelsApi();
      const adminData = await fetchAdminUsersApi();
      setHostels(hostelData || []);
      setAdmins(adminData || []);
    } catch (err) {
      console.error("Failed to load initial data:", err);
      alert("Error loading Admins or Hostels. Check if Backend is running.");
    }
  };
  loadData();
}, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await createExpenseApi(formData);
    // If createExpenseApi uses .json() and the server returns status 200 but no body,
    // the error happens RIGHT HERE.
    alert("Expense recorded successfully!");
    onCancel();
  } catch (err) {
    console.error("Submission error:", err); 
    alert("Check console - possible empty JSON response");
  }
};

  return (
    <div style={cardStyle}>
      <h3>Record New Expense</h3>
      <form onSubmit={handleSubmit}>
        <div style={formGrid}>
          <label>Hostel:
            <select style={input} required onChange={e => setFormData({...formData, hostelId: e.target.value})}>
              <option value="">Select Hostel</option>
              {hostels.map(h => <option key={h.hostelId} value={h.hostelId}>{h.hostelName}</option>)}
            </select>
          </label>

          <label>Paid By (Admin):
            <select style={input} required onChange={e => setFormData({...formData, paidByUserId: e.target.value})}>
              <option value="">Select Admin</option>
              {admins.map(a => <option key={a.userId} value={a.userId}>{a.fullName}</option>)}
            </select>
          </label>
        </div>

        <div style={formGrid}>
          <label>Amount:
            <input type="number" style={input} placeholder="0.00" required onChange={e => setFormData({...formData, amount: e.target.value})} />
          </label>
          <label>Date:
            <input type="date" style={input} value={formData.expenseDate} onChange={e => setFormData({...formData, expenseDate: e.target.value})} />
          </label>
        </div>

        <div style={formGrid}>
          <label>Type:
            <select style={input} value={formData.expenseType} onChange={e => setFormData({...formData, expenseType: e.target.value})}>
              <option value="Maintenance">Maintenance</option>
              <option value="Electricity">Electricity</option>
              <option value="Water">Water</option>
              <option value="Rent">Rent</option>
              <option value="Salary">Staff Salary</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label>Transaction ID / Ref:
            <input style={input} placeholder="e.g. EXP123" onChange={e => setFormData({...formData, transactionId: e.target.value})} />
          </label>
        </div>

        <label>Description:
          <textarea style={textArea} placeholder="Describe the expense (e.g. AC Repair)" onChange={e => setFormData({...formData, description: e.target.value})} />
        </label>

        <div style={btnGroup}>
          <button type="submit" style={btnSubmit}>Save Expense</button>
          <button type="button" onClick={onCancel} style={btnCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const cardStyle = { background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" };
const formGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" };
const input = { width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" };
const textArea = { width: "100%", padding: "8px", marginTop: "5px", minHeight: "60px", borderRadius: "4px", border: "1px solid #ccc" };
const btnGroup = { display: "flex", gap: "10px", marginTop: "20px" };
const btnSubmit = { flex: 1, padding: "10px", background: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };
const btnCancel = { flex: 1, padding: "10px", background: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };

export default CreateExpense;