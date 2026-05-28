import React, { useState, useEffect } from "react";
import { 
  fetchHostelsApi, 
  fetchRoomsByHostelApi, 
  fetchAvailableBedsApi, 
  createTenantApi,
  fetchAdminUsersApi 
} from "../services/api";

const CreateTenant = ({ onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "MALE",
    address: "",
    identityType: "AADHAR",
    identityNumber: "",
    phoneNumber: "",
    email: "",
    guardianName: "",
    guardianIdentityType: "AADHAR",
    guardianIdentityNumber: "",
    guardianPhone: "",
    bedId: "",
    checkInDate: new Date().toISOString().split('T')[0],
    onboardedBy: "",
    isActive: true,
    chargeType: "RENT",
    billingCycle: "MONTHLY",
    totalAmount: "",
    paidAmount: "",
    dueDate: "",
    remarks: ""
  });

  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const hData = await fetchHostelsApi();
      const aData = await fetchAdminUsersApi();
      setHostels(hData || []);
      setAdmins(aData || []);
    };
    loadData();
  }, []);

  const handleHostelChange = async (e) => {
    const hId = e.target.value; 
    setSelectedHostel(hId);
    
    // Reset dependent dropdowns
    setRooms([]); 
    setSelectedRoom(""); 
    setBeds([]);

    if (hId) {
      // Calls http://localhost:8080/api/rooms/{hId}
      const rData = await fetchRoomsByHostelApi(hId);
      // Condition removed: showing all rooms returned by the API
      setRooms(rData || []);
    }
  };

  const handleRoomChange = async (e) => {
    const rId = e.target.value; 
    setSelectedRoom(rId);
    setBeds([]);
    setFormData(prev => ({ ...prev, bedId: "" }));

    if (rId) {
      const bData = await fetchAvailableBedsApi(rId);
      setBeds(bData || []);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      age: parseInt(formData.age) || 0,
      bedId: parseInt(formData.bedId),
      onboardedBy: parseInt(formData.onboardedBy),
      totalAmount: parseFloat(formData.totalAmount) || 0,
      paidAmount: parseFloat(formData.paidAmount) || 0,
      // Generic placeholder used for Aadhaar in compliance with privacy protocols
      guardianAadhar: formData.guardianIdentityType === "AADHAR" ? formData.guardianIdentityNumber : null
    };

    const response = await createTenantApi(payload);
    if (response) {
      alert("Tenant onboarded successfully!");
      onCancel();
    }
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ borderBottom: "2px solid #007bff", paddingBottom: "10px" }}>Onboard New Tenant</h3>
      <form onSubmit={handleSubmit} style={formGrid}>
        
        {/* SECTION 1: PERSONAL INFORMATION */}
        <section style={sectionStyle}>
          <h4>1. Personal Information</h4>
          <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} required style={inputStyle} />
          <div style={{ display: "flex", gap: "10px" }}>
            <input type="number" name="age" placeholder="Age" onChange={handleChange} required style={inputStyle} />
            <select name="gender" onChange={handleChange} style={inputStyle}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "5px" }}>
            <select name="identityType" onChange={handleChange} style={{ flex: 1, ...inputStyle }}>
              <option value="AADHAR">Aadhaar</option>
              <option value="PAN">PAN</option>
            </select>
            <input type="text" name="identityNumber" placeholder="ID Number" onChange={handleChange} required style={{ flex: 2, ...inputStyle }} />
          </div>
          <input type="text" name="phoneNumber" placeholder="Phone" onChange={handleChange} required style={inputStyle} />
          <textarea name="address" placeholder="Address" onChange={handleChange} style={{ ...inputStyle, height: "50px" }} />
        </section>

        {/* SECTION 2: GUARDIAN INFORMATION */}
        <section style={sectionStyle}>
          <h4>2. Guardian Information</h4>
          <input type="text" name="guardianName" placeholder="Guardian Name" onChange={handleChange} required style={inputStyle} />
          <input type="text" name="guardianPhone" placeholder="Guardian Phone" onChange={handleChange} required style={inputStyle} />
          <div style={{ display: "flex", gap: "5px" }}>
            <select name="guardianIdentityType" onChange={handleChange} style={{ flex: 1, ...inputStyle }}>
              <option value="AADHAR">Aadhaar</option>
              <option value="OTHER">Other</option>
            </select>
            <input type="text" name="guardianIdentityNumber" placeholder="ID Number" onChange={handleChange} style={{ flex: 2, ...inputStyle }} />
          </div>
        </section>

        {/* SECTION 3: HOSTEL ALLOTMENT */}
        <section style={sectionStyle}>
          <h4>3. Hostel Allotment</h4>
          <select value={selectedHostel} onChange={handleHostelChange} required style={inputStyle}>
            <option value="">Select Hostel</option>
            {hostels.map(h => (
              <option key={h.hostelId} value={h.hostelId}>{h.hostelName}</option>
            ))}
          </select>

          <select 
            value={selectedRoom} 
            onChange={handleRoomChange} 
            disabled={!selectedHostel} 
            required 
            style={inputStyle}
          >
            <option value="">Select Room</option>
            {rooms.map(r => (
              <option key={r.roomId} value={r.roomId}>
                Room {r.roomNumber} ({r.roomType})
              </option>
            ))}
          </select>

          <select 
            name="bedId" 
            value={formData.bedId} 
            onChange={handleChange} 
            disabled={!selectedRoom} 
            required 
            style={inputStyle}
          >
            <option value="">Select Bed</option>
            {beds.map(b => (
              <option key={b.bedId} value={b.bedId}>Bed {b.bedNumber}</option>
            ))}
          </select>

          <label style={labelStyle}>Check-in Date</label>
          <input type="date" name="checkInDate" value={formData.checkInDate} onChange={handleChange} required style={inputStyle} />
          
          <select name="onboardedBy" onChange={handleChange} required style={inputStyle}>
            <option value="">Admin</option>
            {admins.map(a => <option key={a.id} value={a.id}>{a.fullName}</option>)}
          </select>
        </section>

        {/* SECTION 4: CHARGES */}
        <section style={{ ...sectionStyle, backgroundColor: "#fff8e1" }}>
          <h4>4. Charges</h4>
          <div style={{ display: "flex", gap: "10px" }}>
            <select name="chargeType" onChange={handleChange} style={inputStyle}>
              <option value="RENT">Rent</option>
              <option value="SECURITY_DEPOSIT">Security</option>
            </select>
            <input type="number" name="totalAmount" placeholder="Total" onChange={handleChange} required style={inputStyle} />
          </div>
          <input type="number" name="paidAmount" placeholder="Paid Now" onChange={handleChange} required style={inputStyle} />
          <label style={labelStyle}>Due Date</label>
          <input type="date" name="dueDate" onChange={handleChange} required style={inputStyle} />
          <input type="text" name="remarks" placeholder="Remarks" onChange={handleChange} style={inputStyle} />
        </section>

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} style={cancelBtn}>Cancel</button>
          <button type="submit" style={submitBtn}>Complete Onboarding</button>
        </div>
      </form>
    </div>
  );
};

const containerStyle = { background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" };
const formGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" };
const sectionStyle = { padding: "15px", border: "1px solid #eee", borderRadius: "6px" };
const inputStyle = { width: "100%", padding: "10px", margin: "5px 0", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" };
const labelStyle = { fontSize: "11px", color: "#666", display: "block" };
const submitBtn = { padding: "12px 25px", background: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const cancelBtn = { padding: "12px 25px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };

export default CreateTenant;