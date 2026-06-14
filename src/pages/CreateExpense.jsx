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
    paymentMode: "CASH", // Default enum value matching downstream expectations
    description: "",
    transactionId: ""
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const hostelData = await fetchHostelsApi();
        const adminData = await fetchAdminUsersApi();
        setHostels(hostelData || []);
        setAdmins(adminData || []);
      } catch (err) {
        console.error("Failed to load initial data references:", err);
        alert("Error loading structural reference configurations.");
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submissionPayload = {
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : 0.0
      };
      
      await createExpenseApi(submissionPayload);
      alert("Expense entry recorded cleanly into server balance accounts!");
      onCancel();
    } catch (err) {
      console.error("Submission error exception caught:", err); 
      alert("Failed to create entity entry record file targets.");
    }
  };

  return (
    <div style={cardStyle}>
      <h3 style={{ borderBottom: "2px solid #28a745", paddingBottom: "8px", marginBottom: "20px" }}>
        ➕ Record New Operational Expense
      </h3>
      <form onSubmit={handleSubmit}>
        <div style={formGrid}>
          <label style={labelStyle}>Hostel Scope Location:
            <select style={input} required value={formData.hostelId} onChange={e => setFormData({...formData, hostelId: e.target.value})}>
              <option value="">Select Target Hostel Property</option>
              {hostels.map(h => <option key={h.hostelId} value={h.hostelId}>{h.hostelName}</option>)}
            </select>
          </label>

          <label style={labelStyle}>Disbursed Paid By Personnel (Admin):
            <select style={input} required value={formData.paidByUserId} onChange={e => setFormData({...formData, paidByUserId: e.target.value})}>
              <option value="">Select Authorizing Admin Agent</option>
              {admins.map(a => <option key={a.userId} value={a.userId}>{a.fullName}</option>)}
            </select>
          </label>
        </div>

        <div style={formGrid}>
          <label style={labelStyle}>Total Ledger Amount (₹):
            <input type="number" step="any" style={input} placeholder="0.00" value={formData.amount} required onChange={e => setFormData({...formData, amount: e.target.value})} />
          </label>
          <label style={labelStyle}>Transaction Processing Date:
            <input type="date" style={input} value={formData.expenseDate} onChange={e => setFormData({...formData, expenseDate: e.target.value})} />
          </label>
        </div>

        <div style={formGrid}>
          <label style={labelStyle}>Expense Core Typology Categorization:
            <select style={input} value={formData.expenseType} onChange={e => setFormData({...formData, expenseType: e.target.value})}>
              <option value="Maintenance">Maintenance Tasks</option>
              <option value="Electricity">Electricity Utility Power Bills</option>
              <option value="Water">Water Infrastructure Logistics</option>
              <option value="Rent">Property Space Lease Rent</option>
              <option value="Salary">Staff Operations Base Salary</option>
              <option value="Other">Other Ancillary Overhead Charges</option>
            </select>
          </label>
          
          {/* UPDATED: Dropdown option display labels now perfectly match ModifyExpense dropdown look */}
          <label style={labelStyle}>Payment Method Channel:
            <select style={input} value={formData.paymentMode} onChange={e => setFormData({...formData, paymentMode: e.target.value})}>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI / QR Code</option>
              <option value="NET_BANKING">Net Banking</option>
              <option value="CARD">Credit / Debit Card</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={labelStyle}>Transaction Token Voucher / Reference Reference Key ID:
            <input style={input} value={formData.transactionId} placeholder="e.g. TXN-EXP-9921" onChange={e => setFormData({...formData, transactionId: e.target.value})} />
          </label>
        </div>

        <label style={labelStyle}>Detailed Statement Scope Allocation Description:
          <textarea style={textArea} value={formData.description} placeholder="Describe operational specifics here (e.g. Server wiring room HVAC maintenance fix)" onChange={e => setFormData({...formData, description: e.target.value})} />
        </label>

        <div style={btnGroup}>
          <button type="submit" style={btnSubmit}>Commit Expense Log</button>
          <button type="button" onClick={onCancel} style={btnCancel}>Dismiss Form View</button>
        </div>
      </form>
    </div>
  );
};

const cardStyle = { background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" };
const formGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" };
const input = { width: "100%", padding: "10px", marginTop: "5px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" };
const textArea = { width: "100%", padding: "10px", marginTop: "5px", boxSizing: "border-box", minHeight: "70px", borderRadius: "4px", border: "1px solid #ccc" };
const btnGroup = { display: "flex", gap: "10px", marginTop: "20px" };
const btnSubmit = { flex: 1, padding: "11px", background: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const btnCancel = { flex: 1, padding: "11px", background: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };
const labelStyle = { fontSize: "13px", fontWeight: "600", color: "#495057", display: "block" };

export default CreateExpense;