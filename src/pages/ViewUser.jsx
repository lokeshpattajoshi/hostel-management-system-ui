import React from "react";

const ViewUser = ({ users, onEdit, onDelete, onSearch, searchQuery, setSearchQuery }) => {
  return (
    <div>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input type="text" placeholder="Search Name, Email, or Phone..." 
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "10px", flex: 1 }} />
        <button onClick={onSearch} style={{ padding: "10px 20px" }}>Search</button>
      </div>

      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f4f4f4" }}>
            <th>Full Name</th><th>Email</th><th>Phone</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userId}>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.phoneNumber || "N/A"}</td>
              <td>
                <button onClick={() => onEdit(user)} style={{ background: "#007bff", color: "white", border: "none", padding: "5px", marginRight: "5px" }}>Edit</button>
                <button onClick={() => onDelete(user.userId)} style={{ background: "red", color: "white", border: "none", padding: "5px" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewUser;