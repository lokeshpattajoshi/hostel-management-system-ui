import React, { useState, useEffect } from "react";
import { fetchExpensesApi, deleteExpenseApi } from "../services/api";

const ViewExpenses = ({ onEdit }) => {
  const [expenses, setExpenses] = useState([]);
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    loadExpenses();
  }, [filterType]);

  const loadExpenses = async () => {
    const data = await fetchExpensesApi(filterType);
    setExpenses(data || []);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this expense record?")) {
      await deleteExpenseApi(id);
      loadExpenses();
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <label>Filter by Type:</label>
        <select 
          style={{ padding: "8px", borderRadius: "4px" }} 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Electricity">Electricity</option>
          <option value="Water">Water</option>
          <option value="Salary">Salary</option>
        </select>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr style={{ background: "#f4f4f4" }}>
            <th style={th}>Date</th>
            <th style={th}>Type</th>
            <th style={th}>Amount</th>
            <th style={th}>Ref ID</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(exp => (
            <tr key={exp.expenseId} style={{ borderBottom: "1px solid #eee" }}>
              <td style={td}>{exp.expenseDate}</td>
              <td style={td}><strong>{exp.expenseType}</strong><br/><small>{exp.description}</small></td>
              <td style={td}>₹{exp.amount}</td>
              <td style={td}>{exp.transactionId}</td>
              <td style={td}>
                <button onClick={() => onEdit(exp)} style={editBtn}>Edit</button>
                <button onClick={() => handleDelete(exp.expenseId)} style={delBtn}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const tableStyle = { width: "100%", borderCollapse: "collapse", background: "white" };
const th = { padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" };
const td = { padding: "12px" };
const editBtn = { marginRight: "5px", padding: "5px 10px", background: "#ffc107", border: "none", borderRadius: "4px", cursor: "pointer" };
const delBtn = { padding: "5px 10px", background: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };

export default ViewExpenses;