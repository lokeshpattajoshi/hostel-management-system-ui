import React from "react";

const ViewBeds = ({ beds, searchQuery, setSearchQuery, onSearch, onDelete, onEdit }) => {
  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search Hostel Name (e.g. Smart)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button onClick={onSearch} style={{ padding: "10px 20px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Search Beds
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
        <thead>
          <tr style={{ background: "#f8f9fa", textAlign: "left" }}>
            <th style={thStyle}>Bed No</th>
            <th style={thStyle}>Room</th>
            <th style={thStyle}>Hostel</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {beds.map((b) => (
            <tr key={b.bedId}>
              <td style={tdStyle}><strong>{b.bedNumber}</strong></td>
              <td style={tdStyle}>Room {b.roomNumber}</td>
              <td style={tdStyle}>{b.hostelName}</td>
	      <td style={tdStyle}>
  		<span style={{ 
    		padding: "4px 10px", 
    		borderRadius: "20px", 
    		fontSize: "12px", 
    		fontWeight: "bold",
    		background: b.roomType === "AC" ? "#e3f2fd" : "#f5f5f5", 
    		color: b.roomType === "AC" ? "#007bff" : "#555",
    		border: `1px solid ${b.roomType === "AC" ? "#007bff" : "#ccc"}`
  	    }}>
    	   {b.roomType === "AC" ? "❄️ AC" : "💨 Non-AC"}
  	</span>
	</td>
              <td style={tdStyle}>
                <span style={{ color: b.isOccupied ? "red" : "green", fontWeight: "bold" }}>
                  {b.isOccupied ? "Occupied" : "Available"}
                </span>
              </td>
              <td style={tdStyle}>
                <button onClick={() => onEdit(b)} style={{ background: "#ffc107", border: "none", padding: "5px 10px", marginRight: "5px", cursor: "pointer" }}>Edit</button>
                <button onClick={() => onDelete(b.bedId)} style={{ background: "#dc3545", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = { padding: "12px", borderBottom: "2px solid #ddd" };
const tdStyle = { padding: "12px", borderBottom: "1px solid #eee" };

export default ViewBeds;