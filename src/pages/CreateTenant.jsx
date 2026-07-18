import React, { useState, useEffect } from "react";
import { 
  fetchHostelsApi, 
  fetchRoomsByHostelApi, 
  fetchAvailableBedsApi, 
  createTenantApi,
  fetchUsersApi 
} from "../services/api";

const CreateTenant = ({ onCancel }) => {
  // ✅ Directly initialize form fields using the logged-in user session from localStorage
  const [formData, setFormData] = useState(() => {
    const loggedInUid = localStorage.getItem("userId") || "";
    return {
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
      onboardedBy: loggedInUid, 
      isActive: true,
      billingCycle: "MONTHLY",
      
      // Financial & Charge Schema Fields
      rent: "",
      rentPaid: "",
      securityAmount: "",
      securityPaid: "",
      admissionCharge: "",
      admissionPaid: "",
      
      paymentMode: "CASH",
      transactionId: "",
      paymentDate: new Date().toISOString().split('T')[0],
      receivedBy: loggedInUid,                                     
      dueDate: "",
      remarks: "",

      /* Legacy fields maintained for backward compatibility */
      chargeType: "RENT",
      totalAmount: "",
      paidAmount: ""
    };
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

        // Fallback default resolution if localStorage was empty during component initialization
        const sessionUid = localStorage.getItem("userId");
        let fallbackUid = "";
        if (sessionUid) {
          fallbackUid = String(sessionUid);
        } else if (usersList.length > 0) {
          fallbackUid = String(usersList[0].id || usersList[0].userId);
        }

        if (fallbackUid) {
          setFormData(prev => ({ 
            ...prev, 
            onboardedBy: prev.onboardedBy || fallbackUid,
            receivedBy: prev.receivedBy || fallbackUid 
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
    setFormData(prev => ({ ...prev, bedId: "" }));

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

    // 1. Numerical Parsing for Foreign Keys & Session Metrics
    const parsedOnboardedBy = parseInt(formData.onboardedBy, 10);
    const parsedReceivedBy = parseInt(formData.receivedBy, 10);
    
    const sessionUid = localStorage.getItem("userId");
    const parsedCreatedBy = sessionUid ? parseInt(sessionUid, 10) : parsedOnboardedBy;
    
    // 2. Explicit Structural Validation Checks
    if (isNaN(parsedOnboardedBy)) {
      setErrorStatus("A valid Staff/User must be selected to process this onboarding.");
      return;
    }

    if (isNaN(parsedReceivedBy)) {
      setErrorStatus("A valid Receiver must be selected in the Paid To field.");
      return;
    }

    // 3. Assemble Completely Parsed Payload
    const payload = {
      ...formData,
      age: parseInt(formData.age, 10) || 0,
      bedId: parseInt(formData.bedId, 10),
      onboardedBy: parsedOnboardedBy,
      receivedBy: parsedReceivedBy, // Direct assignment maps strictly to Paid To select block
      createdBy: isNaN(parsedCreatedBy) ? null : parsedCreatedBy,
      
      // Numerical Parsing for accounting fields
      rent: parseFloat(formData.rent) || 0,
      rentPaid: parseFloat(formData.rentPaid) || 0,
      securityAmount: parseFloat(formData.securityAmount) || 0,
      securityPaid: parseFloat(formData.securityPaid) || 0,
      admissionCharge: parseFloat(formData.admissionCharge) || 0,
      admissionPaid: parseFloat(formData.admissionPaid) || 0,

      // Fallback calculation fields for legacy endpoint schemas
      totalAmount: (parseFloat(formData.rent) || 0) + (parseFloat(formData.securityAmount) || 0) + (parseFloat(formData.admissionCharge) || 0),
      paidAmount: (parseFloat(formData.rentPaid) || 0) + (parseFloat(formData.securityPaid) || 0) + (parseFloat(formData.admissionPaid) || 0),
      
      guardianAadhar: formData.guardianIdentityType === "AADHAR" ? formData.guardianIdentityNumber : null
    };

    // 4. API Transmission Sequence
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
          <input type="text" name="fullName" value={formData.fullName} placeholder="Full Name" onChange={handleChange} required style={inputStyle} />
          <div style={{ display: "flex", gap: "10px" }}>
            <input type="number" name="age" value={formData.age} placeholder="Age" onChange={handleChange} required style={inputStyle} />
            <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "5px" }}>
            <select name="identityType" value={formData.identityType} onChange={handleChange} style={{ flex: 1, ...inputStyle }}>
              <option value="AADHAR">Aadhaar</option>
              <option value="PAN">PAN</option>
            </select>
            <input type="text" name="identityNumber" value={formData.identityNumber} placeholder="ID Number" onChange={handleChange} required style={{ flex: 2, ...inputStyle }} />
          </div>
          <input type="text" name="phoneNumber" value={formData.phoneNumber} placeholder="Phone" onChange={handleChange} required style={inputStyle} />
          <input type="email" name="email" value={formData.email} placeholder="Email Address (Optional)" onChange={handleChange} style={inputStyle} />
          <textarea name="address" value={formData.address} placeholder="Address" onChange={handleChange} style={{ ...inputStyle, height: "50px" }} />
        </section>

        {/* SECTION 2: GUARDIAN INFORMATION */}
        <section style={sectionStyle}>
          <h4>2. Guardian Information</h4>
          <input type="text" name="guardianName" value={formData.guardianName} placeholder="Guardian Name" onChange={handleChange} required style={inputStyle} />
          <input type="text" name="guardianPhone" value={formData.guardianPhone} placeholder="Guardian Phone" onChange={handleChange} required style={inputStyle} />
          <div style={{ display: "flex", gap: "5px" }}>
            <select name="guardianIdentityType" value={formData.guardianIdentityType} onChange={handleChange} style={{ flex: 1, ...inputStyle }}>
              <option value="AADHAR">Aadhaar</option>
              <option value="OTHER">Other</option>
            </select>
            <input type="text" name="guardianIdentityNumber" value={formData.guardianIdentityNumber} placeholder="ID Number" onChange={handleChange} style={{ flex: 2, ...inputStyle }} />
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
            <option value="">-- Choose Processing Attendant --</option>
            {systemUsers.map(u => {
              const uId = u.id || u.userId;
              return <option key={uId} value={uId}>{u.fullName || u.username || `User #${uId}`}</option>;
            })}
          </select>
        </section>

        {/* SECTION 4: FINANCIALS & CHARGES */}
        <section style={{ ...sectionStyle, backgroundColor: "#fff8e1" }}>
          <h4>4. Charges & Financials</h4>
          
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

          <label style={labelStyle}>Paid To (Collected By)</label>
          <select 
            name="receivedBy" 
            value={formData.receivedBy} 
            onChange={handleChange} 
            required 
            style={inputStyle}
          >
            <option value="">-- Choose Receiver --</option>
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
          <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required style={inputStyle} />
          
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

const containerStyle = { background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", color: "#333" };
const formGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" };
const sectionStyle = { padding: "15px", border: "1px solid #eee", borderRadius: "6px" };
const inputStyle = { width: "100%", padding: "10px", margin: "5px 0", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", background: "#fff", color: "#333" };
const labelStyle = { fontSize: "11px", color: "#666", display: "block", marginTop: "6px" };
const submitBtn = { padding: "12px 25px", background: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const cancelBtn = { padding: "12px 25px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };

export default CreateTenant;