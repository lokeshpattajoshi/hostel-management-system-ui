import React, { useState, useEffect } from "react";
import { 
  fetchHostelsApi, 
  fetchRoomsByHostelApi, 
  fetchAvailableBedsApi, 
  createTenantApi,
  fetchUsersApi 
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
    billingCycle: "MONTHLY",
    
    // ✅ New Financial & Charge Schema Fields
    rent: "",
    rentPaid: "",
    securityAmount: "",
    securityPaid: "",
    admissionCharge: "",
    admissionPaid: "",
    
    paymentMode: "CASH",
    transactionId: "",
    paymentDate: new Date().toISOString().split('T')[0], // Default to today
    receivedBy: "",                                      // ID maps here from selection
    dueDate: "",
    remarks: "",

    /* Legacy fields maintained for backward compatibility */
    chargeType: "RENT",
    totalAmount: "",
    paidAmount: ""
  });

  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]); 
  const [selectedHostel, setSelectedHostel] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [errorStatus, setErrorStatus] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const hData = await fetchHostelsApi();
        setHostels(hData || []);

        const uData = await fetchUsersApi();
        const usersList = uData || [];
        setSystemUsers(usersList);

        if (usersList.length > 0) {
          const firstUserId = usersList[0].id || usersList[0].userId;
          setFormData(prev => ({ 
            ...prev, 
            onboardedBy: String(firstUserId),
            receivedBy: String(firstUserId) // Default collector to the first user
          }));
        }
      } catch (err) {
        console.error("Error loading master onboarding options layout:", err);
      }
    };
    loadData();
  }, []);

  const handleHostelChange = async (e) => {
    const hId = e.target.value; 
    setSelectedHostel(hId);
    
    setRooms([]); 
    setSelectedRoom(""); 
    setBeds([]);

    if (hId) {
      const rData = await fetchRoomsByHostelApi(hId);
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
    setErrorStatus("");

    const parsedOnboardedBy = parseInt(formData.onboardedBy, 10);
    const parsedReceivedBy = parseInt(formData.receivedBy, 10);
    
    if (!formData.onboardedBy || isNaN(parsedOnboardedBy)) {
      setErrorStatus("A valid Staff/User must be selected to process this onboarding.");
      return;
    }

    // Prepare complete updated request payload matching the DTO mapping exactly
    const payload = {
      ...formData,
      age: parseInt(formData.age, 10) || 0,
      bedId: parseInt(formData.bedId, 10),
      onboardedBy: parsedOnboardedBy,
      receivedBy: isNaN(parsedReceivedBy) ? parsedOnboardedBy : parsedReceivedBy,
      
      // Numerical Parsing for accounting fields
      rent: parseFloat(formData.rent) || 0,
      rentPaid: parseFloat(formData.rentPaid) || 0,
      securityAmount: parseFloat(formData.securityAmount) || 0,
      securityPaid: parseFloat(formData.securityPaid) || 0,
      admissionCharge: parseFloat(formData.admissionCharge) || 0,
      admissionPaid: parseFloat(formData.admissionPaid) || 0,

      // Fallback calculation maps for legacy endpoint protection fields
      totalAmount: (parseFloat(formData.rent) || 0) + (parseFloat(formData.securityAmount) || 0) + (parseFloat(formData.admissionCharge) || 0),
      paidAmount: (parseFloat(formData.rentPaid) || 0) + (parseFloat(formData.securityPaid) || 0) + (parseFloat(formData.admissionPaid) || 0),
      
      guardianAadhar: formData.guardianIdentityType === "AADHAR" ? formData.guardianIdentityNumber : null
    };

    try {
      const response = await createTenantApi(payload);
      if (response) {
        alert("Tenant onboarded successfully!");
        onCancel();
      } else {
        setErrorStatus("Server rejected transaction. Please verify database parameters match.");
      }
    } catch (err) {
      setErrorStatus("Network failure: " + err.message);
    }
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ borderBottom: "2px solid #007bff", paddingBottom: "10px" }}>Onboard New Tenant</h3>
      
      {errorStatus && (
        <div style={{ padding: "10px", marginBottom: "15px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "4px", border: "1px solid #f5c6cb" }}>
          {errorStatus}
        </div>
      )}

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
          
          <label style={labelStyle}>Onboarded By (Staff Record)</label>
          <select 
            name="onboardedBy" 
            value={formData.onboardedBy} 
            onChange={handleChange} 
            required 
            style={inputStyle}
          >
            {systemUsers.map(u => {
              const uId = u.id || u.userId;
              return <option key={uId} value={uId}>{u.fullName || u.username || `User #${uId}`}</option>;
            })}
          </select>
        </section>

        {/* SECTION 4: FINANCIALS & CHARGES */}
        <section style={{ ...sectionStyle, backgroundColor: "#fff8e1" }}>
          <h4>4. Charges & Financials</h4>
          
          {/* Monthly Rent Setup */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Rent Per Month *</label>
              <input type="number" name="rent" placeholder="Rent Amt" value={formData.rent} onChange={handleChange} required style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Rent Paid Now *</label>
              <input type="number" name="rentPaid" placeholder="Amt Paid" value={formData.rentPaid} onChange={handleChange} required style={inputStyle} />
            </div>
          </div>

          {/* Security Deposit Settings */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Security Amount</label>
              <input type="number" name="securityAmount" placeholder="Total Security" value={formData.securityAmount} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Security Paid</label>
              <input type="number" name="securityPaid" placeholder="Security Paid" value={formData.securityPaid} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* Admission Charges */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Admission Charges</label>
              <input type="number" name="admissionCharge" placeholder="Total Charges" value={formData.admissionCharge} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Admission Paid</label>
              <input type="number" name="admissionPaid" placeholder="Admission Paid" value={formData.admissionPaid} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* Payment Parameters */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Payment Mode</label>
              <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} style={inputStyle}>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="CARD">Credit / Debit Card</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Payment Date</label>
              <input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange} required style={inputStyle} />
            </div>
          </div>

          {/* Paid To / Collected By Dropdown mapping to receivedBy */}
          <label style={labelStyle}>Paid To (Collected By)</label>
          <select 
            name="receivedBy" 
            value={formData.receivedBy} 
            onChange={handleChange} 
            required 
            style={inputStyle}
          >
            {systemUsers.map(u => {
              const uId = u.id || u.userId;
              return <option key={uId} value={uId}>{u.fullName || u.username || `User #${uId}`}</option>;
            })}
          </select>

          <input 
            type="text" 
            name="transactionId" 
            value={formData.transactionId} 
            placeholder="Transaction ID / Ref No. (Optional)" 
            onChange={handleChange} 
            style={inputStyle} 
          />

          <label style={labelStyle}>Next Rent Due Date</label>
          <input type="date" name="dueDate" onChange={handleChange} required style={inputStyle} />
          
          <input type="text" name="remarks" placeholder="Remarks" value={formData.remarks} onChange={handleChange} style={inputStyle} />
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
const labelStyle = { fontSize: "11px", color: "#666", display: "block", marginTop: "6px" };
const submitBtn = { padding: "12px 25px", background: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const cancelBtn = { padding: "12px 25px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };

export default CreateTenant;