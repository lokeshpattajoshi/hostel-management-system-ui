import React, { useState, useEffect } from "react";
import { fetchHostelsApi, fetchRoomsByHostelApi, fetchBedsByHostelApi } from "../services/api";

const AvailableBeds = () => {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);

  const [selectedHostel, setSelectedHostel] = useState(null); // Stores full hostel object
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Load Hostels immediately on component mount
  useEffect(() => {
    fetchHostelsApi().then(data => setHostels(data || []));
  }, []);

  // 2. TRIGGER: When Hostel changes, fetch Rooms for that Hostel
  const handleHostelChange = async (e) => {
    const hostelId = e.target.value;
    const hostelObj = hostels.find(h => String(h.hostelId) === String(hostelId));
    
    setSelectedHostel(hostelObj || null);
    setSelectedRoomId(""); // Reset room selection
    setBeds([]); // Clear beds display
    setRooms([]); // Clear rooms list

    if (hostelId) {
      setLoading(true);
      try {
        const allRooms = await fetchRoomsByHostelApi();
        // Filter rooms belonging to this hostel
        const filteredRooms = allRooms.filter(r => String(r.hostelId) === String(hostelId));
        setRooms(filteredRooms);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // 3. TRIGGER: When Room changes, fetch Beds for that Room
  const handleRoomChange = async (e) => {
    const roomId = e.target.value;
    setSelectedRoomId(roomId);
    setBeds([]); // Clear current beds while loading

    if (roomId && selectedHostel) {
      setLoading(true);
      try {
        // Fetch beds for the specific hostel name
        const allBeds = await fetchBedsByHostelApi(selectedHostel.hostelName);
        // Filter beds belonging to this specific roomId
        const filteredBeds = allBeds.filter(b => String(b.roomId) === String(roomId));
        setBeds(filteredBeds);
      } catch (err) {
        console.error("Error fetching beds:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Get details of the current room to show Room Type (AC/Non-AC)
  const currentRoomData = rooms.find(r => String(r.roomId) === String(selectedRoomId));

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Check Availability</h2>

      <div style={selectorWrapper}>
        {/* STEP 1: HOSTEL */}
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Step 1: Select Hostel</label>
          <select 
            value={selectedHostel?.hostelId || ""} 
            onChange={handleHostelChange} 
            style={selectStyle}
          >
            <option value="">-- Select a Hostel --</option>
            {hostels.map(h => (
              <option key={h.hostelId} value={h.hostelId}>{h.hostelName}</option>
            ))}
          </select>
        </div>

        {/* STEP 2: ROOM */}
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Step 2: Select Room</label>
          <select 
            value={selectedRoomId} 
            disabled={!selectedHostel || loading}
            onChange={handleRoomChange} 
            style={{...selectStyle, opacity: !selectedHostel ? 0.5 : 1}}
          >
            <option value="">-- Select a Room --</option>
            {rooms.map(r => (
              <option key={r.roomId} value={r.roomId}>
                Room {r.roomNumber} ({r.roomType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STEP 3: AVAILABILITY DISPLAY */}
      <div style={{ marginTop: "40px" }}>
        {!selectedRoomId ? (
          <div style={emptyStateStyle}>
            {loading ? "Updating..." : "Please complete the selections above to see beds."}
          </div>
        ) : (
          <div>
            <div style={roomInfoBar}>
              <strong>Room {currentRoomData?.roomNumber}</strong>
              <span style={badgeStyle(currentRoomData?.roomType)}>
                {currentRoomData?.roomType === "AC" ? "❄️ AC" : "💨 Non-AC"}
              </span>
            </div>

            <div style={bedGridStyle}>
              {beds.length > 0 ? (
                beds.map(bed => (
                  <div key={bed.bedId} style={bedCardStyle(bed.isOccupied)}>
                    <div style={{ fontSize: "24px" }}>{bed.isOccupied ? "👤" : "🛏️"}</div>
                    <div style={{ fontWeight: "bold", margin: "5px 0" }}>{bed.bedNumber}</div>
                    <div style={{ fontSize: "12px", color: bed.isOccupied ? "#d9534f" : "#5cb85c" }}>
                      {bed.isOccupied ? "Occupied" : "Available"}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: "center", gridColumn: "1/-1" }}>No beds found in this room.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- STYLES ---
const selectorWrapper = { display: "flex", gap: "20px", background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" };
const labelStyle = { display: "block", marginBottom: "8px", fontWeight: "600", color: "#444" };
const selectStyle = { width: "100%", padding: "12px", borderRadius: "5px", border: "1px solid #ccc", cursor: "pointer" };
const emptyStateStyle = { textAlign: "center", padding: "60px", border: "2px dashed #ddd", borderRadius: "10px", color: "#999" };
const roomInfoBar = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", padding: "10px", borderBottom: "2px solid #eee" };
const bedGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "15px" };

const bedCardStyle = (isOccupied) => ({
  padding: "15px",
  textAlign: "center",
  borderRadius: "8px",
  border: `2px solid ${isOccupied ? "#f5c6cb" : "#c3e6cb"}`,
  background: isOccupied ? "#f8d7da" : "#d4edda",
  transition: "transform 0.1s"
});

const badgeStyle = (type) => ({
  padding: "4px 12px",
  borderRadius: "15px",
  fontSize: "12px",
  color: "#fff",
  background: type === "AC" ? "#007bff" : "#6c757d"
});

export default AvailableBeds;