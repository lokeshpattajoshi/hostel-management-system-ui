import React, { useState, useEffect } from "react";
import { fetchHostelsApi, fetchRoomsByHostelApi, fetchBedsByHostelApi, createBedApi } from "../services/api";

const CreateBed = ({ onCancel }) => {
  const [hostels, setHostels] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedHostelId, setSelectedHostelId] = useState("");
  
  // Track existing bed assignments for the chosen room to validate maximum capacity limits
  const [existingBedsCount, setExistingBedsCount] = useState(0);
  
  const [formData, setFormData] = useState({ roomId: "", bedNumber: "" });
  const [status, setStatus] = useState({ type: "", message: "" }); 

  // 1. Fetch only the master hostel selection records on layout load
  useEffect(() => {
    const loadHostels = async () => {
      try {
        const hData = await fetchHostelsApi();
        if (hData && Array.isArray(hData)) {
          setHostels(hData);
        } else {
          setHostels([]);
        }
      } catch (err) {
        console.error("Error loading hostels list:", err);
        setHostels([]);
      }
    };
    loadHostels();
  }, []);

  // 2. Dynamically fetch rooms only when a valid hostel ID is chosen
  useEffect(() => {
    const loadRoomsForHostel = async () => {
      if (!selectedHostelId || selectedHostelId === "undefined") {
        setFilteredRooms([]);
        return;
      }

      try {
        const rData = await fetchRoomsByHostelApi(selectedHostelId);
        if (rData && Array.isArray(rData)) {
          setFilteredRooms(rData);
        } else {
          setFilteredRooms([]);
        }
      } catch (err) {
        console.error("Error filtering down rooms for selected hostel:", err);
        setFilteredRooms([]);
      }
    };

    loadRoomsForHostel();
    setFormData((prev) => ({ ...prev, roomId: "" }));
    setExistingBedsCount(0); 
  }, [selectedHostelId]);

  // 3. NEW TRIGGER: Whenever the user changes the room dropdown, check how many beds it already contains
  const handleRoomChange = async (roomId) => {
    setFormData({ ...formData, roomId });
    setExistingBedsCount(0);
    setStatus({ type: "", message: "" });

    if (!roomId) return;

    const selectedHostelObj = hostels.find(h => String(h.hostelId) === String(selectedHostelId));
    if (!selectedHostelObj) return;

    try {
      // Pull total beds for this hostel and filter by the selected roomId to get the current count
      const allBeds = await fetchBedsByHostelApi(selectedHostelObj.hostelName);
      if (allBeds && Array.isArray(allBeds)) {
        const count = allBeds.filter(b => String(b.roomId) === String(roomId)).length;
        setExistingBedsCount(count);
      }
    } catch (err) {
      console.error("Error counting existing beds for validation logic:", err);
    }
  };

  // Find properties of the currently active room selection to check against limits
  const currentRoom = filteredRooms.find(r => String(r.roomId) === String(formData.roomId));

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!formData.roomId || !formData.bedNumber) {
      setStatus({ type: "error", message: "Please select a room and enter a bed number." });
      return;
    }

    // CRITICAL CAPACITY VALIDATION GUARD
    if (currentRoom) {
      const maxAllowedBeds = Number(currentRoom.capacity);
      
      if (existingBedsCount >= maxAllowedBeds) {
        setStatus({ 
          type: "error", 
          message: `Cannot add bed! Room ${currentRoom.roomNumber} has a maximum capacity of ${maxAllowedBeds} beds, and it already contains ${existingBedsCount}.` 
        });
        return;
      }
    }

    try {
      const result = await createBedApi(formData);
      if (result) {
        setStatus({ type: "success", message: `Successfully added Bed ${formData.bedNumber}!` });
        setFormData({ roomId: "", bedNumber: "" }); // Clear form for next entry
        setExistingBedsCount(prev => prev + 1); // Increment local counter optimistically
      } else {
        setStatus({ type: "error", message: "Failed to add bed. Please check your connection." });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Error: " + err.message });
    }
  };

  return (
    <div style={formCardStyle}>
      <h3>Add New Bed</h3>
      
      {/* STATUS MESSAGE DISPLAY PANEL */}
      {status.message && (
        <div style={{
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "4px",
          textAlign: "center",
          background: status.type === "success" ? "#d4edda" : "#f8d7da",
          color: status.type === "success" ? "#155724" : "#721c24",
          border: `1px solid ${status.type === "success" ? "#c3e6cb" : "#f5c6cb"}`
        }}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={groupStyle}>
          <label>1. Select Hostel</label>
          <select value={selectedHostelId} onChange={(e) => setSelectedHostelId(e.target.value)} style={inputStyle}>
            <option value="">-- Choose Hostel --</option>
            {hostels.map(h => <option key={h.hostelId} value={h.hostelId}>{h.hostelName}</option>)}
          </select>
        </div>

        <div style={groupStyle}>
          <label>2. Select Room</label>
          <select 
            value={formData.roomId} 
            disabled={!selectedHostelId || filteredRooms.length === 0}
            onChange={(e) => handleRoomChange(e.target.value)} // Wired to tracking monitor handler
            style={inputStyle}
          >
            <option value="">
              {selectedHostelId 
                ? (filteredRooms.length > 0 ? "-- Choose Room --" : "-- No Rooms Found for this Hostel --") 
                : "-- Choose a Hostel First --"
              }
            </option>
            {filteredRooms.map(r => (
              <option key={r.roomId} value={r.roomId}>
                Room {r.roomNumber} (Max: {r.capacity} Beds)
              </option>
            ))}
          </select>
          
          {/* Informational Subtext Tracker */}
          {formData.roomId && currentRoom && (
            <div style={{ fontSize: "12px", marginTop: "4px", color: existingBedsCount >= currentRoom.capacity ? "#dc3545" : "#6c757d" }}>
              Current Allocation: <strong>{existingBedsCount} / {currentRoom.capacity}</strong> Beds Used
            </div>
          )}
        </div>

        <div style={groupStyle}>
          <label>3. Bed Name/Number</label>
          <input 
            type="text"
            value={formData.bedNumber}
            onChange={(e) => setFormData({...formData, bedNumber: e.target.value})}
            placeholder="e.g. B1"
            style={inputStyle}
            disabled={currentRoom && existingBedsCount >= currentRoom.capacity} // Disable if room is full
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button 
            type="submit" 
            style={{
              ...saveBtn, 
              background: currentRoom && existingBedsCount >= currentRoom.capacity ? "#94c2ed" : "#007bff",
              cursor: currentRoom && existingBedsCount >= currentRoom.capacity ? "not-allowed" : "pointer"
            }}
            disabled={currentRoom && existingBedsCount >= currentRoom.capacity}
          >
            Add Bed
          </button>
          <button type="button" onClick={onCancel} style={cancelBtn}>Close</button>
        </div>
      </form>
    </div>
  );
};

const formCardStyle = { maxWidth: "400px", margin: "0 auto", padding: "25px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" };
const groupStyle = { marginBottom: "15px" };
const inputStyle = { width: "100%", padding: "10px", marginTop: "5px", borderRadius: "6px", border: "1px solid #ddd" };
const saveBtn = { flex: 1, padding: "12px", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold" };
const cancelBtn = { flex: 1, padding: "12px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" };

export default CreateBed;