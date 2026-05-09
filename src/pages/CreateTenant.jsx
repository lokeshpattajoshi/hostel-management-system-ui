import React, { useState, useEffect } from "react";
import { fetchHostelsApi, fetchRoomsByHostelApi, fetchBedsByHostelApi, createTenantApi } from "../services/api";

const CreateTenant = ({ onCancel }) => {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  const [formData, setFormData] = useState({
    fullName: "", age: "", gender: "MALE",
    identityType: "AADHAR", identityNumber: "",
    phoneNumber: "", email: "", address: "",
    guardianName: "", guardianIdentityType: "AADHAR", 
    guardianIdentityNumber: "", guardianPhone: "",
    bedId: "", checkInDate: "", checkOutDate: "",
    onboardedBy: 1
  });

  useEffect(() => { fetchHostelsApi().then(setHostels); }, []);

  const handleHostelChange = async (hId) => {
    setSelectedHostel(hId);
    const data = await fetchRoomsByHostelApi();
    setRooms(data.filter(r => String(r.hostelId) === String(hId)));
  };

  const handleRoomChange = async (rId) => {
    setSelectedRoom(rId);
    const hostel = hostels.find(h => String(h.hostelId) === String(selectedHostel));
    const data = await fetchBedsByHostelApi(hostel.hostelName);
    setBeds(data.filter(b => String(b.roomId) === String(rId) && !b.isOccupied));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createTenantApi(formData);
    onCancel();
  };

  return (
    <div style={{ padding: "20px", background: "#fff", borderRadius: "8px" }}>
      <form onSubmit={handleSubmit}>
        <h3>Onboard New Tenant</h3>
        <div style={formGrid}>
          <input style={input} placeholder="Full Name" onChange={e => setFormData({...formData, fullName: e.target.value})} required />
          <input style={input} placeholder="Phone" onChange={e => setFormData({...formData, phoneNumber: e.target.value})} required />
          <input style={input} type="number" placeholder="Age" onChange={e => setFormData({...formData, age: e.target.value})} />
          <select style={input} onChange={e => setFormData({...formData, gender: e.target.value})}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>

        <textarea style={textArea} placeholder="Permanent Address" onChange={e => setFormData({...formData, address: e.target.value})} required />

        <div style={formGrid}>
          <select style={input} onChange={e => setFormData({...formData, identityType: e.target.value})}>
            <option value="AADHAR">Aadhaar</option>
            <option value="PAN">PAN</option>
          </select>
          <input style={input} placeholder="Tenant ID Number" onChange={e => setFormData({...formData, identityNumber: e.target.value})} required />
        </div>

        <h4 style={{marginTop: "20px"}}>Guardian Details</h4>
        <div style={formGrid}>
          <input style={input} placeholder="Guardian Name" onChange={e => setFormData({...formData, guardianName: e.target.value})} required />
          <input style={input} placeholder="Guardian Phone" onChange={e => setFormData({...formData, guardianPhone: e.target.value})} required />
          <select style={input} onChange={e => setFormData({...formData, guardianIdentityType: e.target.value})}>
            <option value="AADHAR">Guardian Aadhaar</option>
            <option value="VOTER_ID">Guardian Voter ID</option>
          </select>
          <input style={input} placeholder="Guardian ID Number" onChange={e => setFormData({...formData, guardianIdentityNumber: e.target.value})} required />
        </div>

        <h4 style={{marginTop: "20px"}}>Allocation</h4>
        <div style={formGrid}>
          <select style={input} onChange={e => handleHostelChange(e.target.value)} required>
            <option value="">Hostel</option>
            {hostels.map(h => <option key={h.hostelId} value={h.hostelId}>{h.hostelName}</option>)}
          </select>
          <select style={input} disabled={!selectedHostel} onChange={e => handleRoomChange(e.target.value)} required>
            <option value="">Room</option>
            {rooms.map(r => <option key={r.roomId} value={r.roomId}>{r.roomNumber}</option>)}
          </select>
          <select style={input} disabled={!selectedRoom} onChange={e => setFormData({...formData, bedId: e.target.value})} required>
            <option value="">Bed</option>
            {beds.map(b => <option key={b.bedId} value={b.bedId}>{b.bedNumber}</option>)}
          </select>
        </div>

        <div style={{marginTop: "20px", display: "flex", gap: "10px"}}>
          <button type="submit" style={btnSubmit}>Save Tenant</button>
          <button type="button" onClick={onCancel} style={btnCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const formGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" };
const input = { padding: "10px", border: "1px solid #ccc", borderRadius: "4px" };
const textArea = { width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "10px", minHeight: "60px" };
const btnSubmit = { flex: 1, padding: "12px", background: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };
const btnCancel = { flex: 1, padding: "12px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };

export default CreateTenant;