import React from "react";

const ViewRooms = ({ rooms, searchQuery, setSearchQuery, onSearch, onDelete, onEdit }) => {
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
        <button 
          onClick={onSearch} 
          style={{ padding: "10px 20px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Search
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
        <thead>
          <tr style={{ background: "#eee", textAlign: "left" }}>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Room No</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Hostel Name</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Address</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Type</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Capacity</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.length > 0 ? (
            rooms.map((r) => (
              <tr key={r.roomId}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{r.roomNumber}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{r.hostelName}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{r.hostelAddress}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                   <span style={{ padding: "2px 6px", borderRadius: "4px", background: r.roomType === 'AC' ? '#e3f2fd' : '#f5f5f5' }}>
                    {r.roomType}
                   </span>
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{r.capacity} Beds</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <button onClick={() => onEdit(r)} style={editBtnStyle}>Edit</button>
                  <button onClick={() => onDelete(r.roomId)} style={deleteBtnStyle}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No rooms found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const editBtnStyle = { marginRight: "5px", background: "#ffc107", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" };
const deleteBtnStyle = { background: "#dc3545", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" };

export default ViewRooms;