import React, { useEffect, useState } from "react";
import { fetchWithAuth, deleteHostelApi } from "../services/api"; 
import ModifyHostel from "./ModifyHostel"; 

const ViewHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Tracks the active hostel selected for modification. When null, the main table list displays.
  const [editingHostel, setEditingHostel] = useState(null); 

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async (name = "") => {
    try {
      const endpoint = name ? `/hostels?name=${encodeURIComponent(name)}` : "/hostels";
      const data = await fetchWithAuth(endpoint);
      
      if (data && Array.isArray(data)) {
        setHostels(data);
      }
    } catch (error) {
      console.error("Error fetching hostels data list:", error);
      alert("Failed to fetch hostels from database storage.");
    }
  };

  const handleSearch = () => {
    fetchHostels(searchQuery.trim());
  };

  const handleDelete = async (hostelId) => {
    try {
      await deleteHostelApi(hostelId);
      alert("Hostel entry deleted successfully.");
      setEditingHostel(null); 
      fetchHostels(searchQuery); 
    } catch (error) {
      console.error("Error executing database delete procedure:", error);
      alert("Failed to delete backend hostel entity record.");
    }
  };

  const handleEditClick = (hostel) => {
    setEditingHostel(hostel);
  };

  // FIXED: Now fully invokes the backend Spring Boot @PutMapping("/{id}") endpoint at /api/hostels/{id}
  const handleUpdateSave = async (updatedPayload) => {
    try {
      const hostelId = updatedPayload.hostelId || updatedPayload.id;
      
      if (!hostelId) {
        alert("Error: Missing unique hostel identification reference.");
        return;
      }

      const endpoint = `/hostels/${hostelId}`;
      
      // Making direct PUT request through your fetch wrapper setup
      await fetchWithAuth(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedPayload)
      });
      
      alert("Hostel profile parameters updated successfully!");
      setEditingHostel(null); // Returns view frame back to the lookup dashboard table matrix
      fetchHostels(searchQuery); // Refreshes target dashboard array
    } catch (error) {
      console.error("Error applying network entity modification patches:", error);
      alert("Failed to persist updated configurations to backend database storage.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Hostel Registry Directory</h2>

      {/* CONDITIONAL COMPONENT DISPLAY SWITCH */}
      {editingHostel ? (
        <div style={{ marginBottom: "30px" }}>
          <button 
            onClick={() => setEditingHostel(null)} 
            style={{ marginBottom: "15px", padding: "8px 14px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "500" }}
          >
            &larr; Back to Hostels Table List
          </button>
          
          <ModifyHostel 
            hostel={editingHostel} 
            onUpdate={handleUpdateSave} 
            onDelete={handleDelete} 
            onCancel={() => setEditingHostel(null)} 
          />
        </div>
      ) : (
        <>
          {/* Inline Search UI Layer */}
          <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Search hostels by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "8px", width: "300px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            <button onClick={handleSearch} style={{ padding: "8px 16px", background: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              Search
            </button>
          </div>

          {/* Hostels Data Grid Layout */}
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
            <thead>
              <tr style={{ background: "#f8f9fa", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>
                <th style={{ padding: "12px" }}>ID</th>
                <th style={{ padding: "12px" }}>Hostel Name</th>
                <th style={{ padding: "12px" }}>Address</th>
                <th style={{ padding: "12px" }}>Owner Name</th>
                <th style={{ padding: "12px" }}>Actions Management</th>
              </tr>
            </thead>
            <tbody>
              {hostels.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#6c757d" }}>No hostels matching target filter keys found.</td>
                </tr>
              ) : (
                hostels.map((hostel) => (
                  <tr key={hostel.hostelId} style={{ borderBottom: "1px solid #dee2e6" }}>
                    <td style={{ padding: "12px" }}>{hostel.hostelId}</td>
                    <td style={{ padding: "12px", fontWeight: "500" }}>{hostel.hostelName}</td>
                    <td style={{ padding: "12px" }}>{hostel.address || "N/A"}</td>
                    <td style={{ padding: "12px" }}>{hostel.ownerName || "N/A"}</td>
                    <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => handleEditClick(hostel)} 
                        style={{ padding: "6px 12px", background: "#ffc107", color: "#000", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "500" }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(hostel.hostelId)} 
                        style={{ padding: "6px 12px", background: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ViewHostels;