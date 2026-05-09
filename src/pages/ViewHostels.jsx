import React from "react";

const ViewHostels = ({ hostels, searchQuery, setSearchQuery, onSearch, onDelete, onEdit }) => {
  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by Hostel Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button onClick={onSearch} style={{ padding: "10px 20px", background: "#007bff", color: "#white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Search
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
        <thead>
          <tr style={{ background: "#eee", textAlign: "left" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Name</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Owner</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Phone</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Status</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hostels.map((h) => (
            <tr key={h.hostelId}>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>{h.hostelName}</td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>{h.ownerName}</td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>{h.phoneNumber}</td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {h.isActive ? "🟢 Active" : "🔴 Inactive"}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                <button onClick={() => onEdit(h)} style={{ marginRight: "5px", background: "#ffc107", border: "none", padding: "5px 10px", cursor: "pointer" }}>Update</button>
                <button onClick={() => onDelete(h.hostelId)} style={{ background: "#dc3545", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewHostels;