import React, { useState, useEffect } from "react";
import { fetchHostelsApi, fetchTenantsApi, fetchWithAuth, createIncomeApi, fetchAdminUsersApi } from "../services/api";

const CreateIncome = ({ onSave, onCancel }) => {
  const [hostels, setHostels] = useState([]);
  const [allTenants, setAllTenants] = useState([]); 
  const [admins, setAdmins] = useState([]); // Store authorizing admin users
  
  // Cascade filters
  const [selectedHostel, setSelectedHostel] = useState("");
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [beds, setBeds] = useState([]);
  const [selectedBed, setSelectedBed] = useState("");

  const [loadingData, setLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Income entry type: STANDARD (Paying current due) or ADVANCE (Paying upcoming month)
  const [incomeType, setIncomeType] = useState("STANDARD");
  
  // Financial profile tracking
  const [activeCharge, setActiveCharge] = useState(null);
  
  // Dynamically read the logged-in administrator's user ID from localStorage
  const currentUserId = parseInt(localStorage.getItem("userId")) || 1;

  const [formData, setFormData] = useState({
    tenantId: "",
    chargeId: "", 
    amount: "", 
    incomeDate: new Date().toISOString().split('T')[0],
    paymentMode: "UPI",
    description: "",
    transactionId: "",
    advanceAmount: 0,
    createdBy: currentUserId,
    receivedByUserId: ""
  });

  useEffect(() => {
    const initFormReferences = async () => {
      try {
        const hostelData = await fetchHostelsApi();
        const adminData = await fetchAdminUsersApi();
        
        setHostels(hostelData || []);
        setAdmins(adminData || []);
      } catch (err) {
        console.error("Initialization error matching reference objects:", err);
      }
    };
    initFormReferences();
  }, []);

  // 1. Hostel Select
  const handleHostelChange = async (e) => {
    const hostelId = e.target.value;
    setSelectedHostel(hostelId);
    
    setAllTenants([]);
    setRooms([]);
    setSelectedRoom("");
    setBeds([]);
    setSelectedBed("");
    setActiveCharge(null);
    clearFinancialForm();

    if (hostelId) {
      setLoadingData(true);
      try {
        const tenantData = await fetchTenantsApi("", "", hostelId);
        const safeTenants = tenantData || [];
        setAllTenants(safeTenants);

        const uniqueRooms = [...new Set(safeTenants.map(t => t.roomNumber || t.roomNo).filter(Boolean))];
        setRooms(uniqueRooms.sort((a, b) => String(a).localeCompare(String(b), undefined, {numeric: true})));
      } catch (err) {
        console.error("Error fetching tenants for hostel:", err);
      } finally {
        setLoadingData(false);
      }
    }
  };

  // 2. Room Select
  const handleRoomChange = (e) => {
    const roomNum = e.target.value;
    setSelectedRoom(roomNum);
    
    setBeds([]);
    setSelectedBed("");
    setActiveCharge(null);
    clearFinancialForm();

    if (roomNum) {
      const filteredBeds = allTenants
        .filter(t => String(t.roomNumber || t.roomNo) === String(roomNum) && (t.bedNumber || t.bedNo))
        .map(t => t.bedNumber || t.bedNo);
      
      setBeds([...new Set(filteredBeds)].sort((a, b) => String(a).localeCompare(String(b), undefined, {numeric: true})));
    }
  };

  // 3. Bed Select -> Pulls live ledger metrics from pending-summary endpoint
  const handleBedChange = async (e) => {
    const bedNum = e.target.value;
    setSelectedBed(bedNum);
    setActiveCharge(null);
    clearFinancialForm();

    if (!bedNum || !selectedRoom || !selectedHostel) return;

    const targetTenant = allTenants.find(
      t => String(t.roomNumber || t.roomNo) === String(selectedRoom) && String(t.bedNumber || t.bedNo) === String(bedNum)
    );

    if (!targetTenant) {
      console.warn("Could not find matching tenant state for Room:", selectedRoom, "Bed:", bedNum);
      return;
    }

    try {
      setLoadingData(true);
      
      const url = `/income/pending-summary?hostelId=${selectedHostel}&tenantId=${targetTenant.tenantId || targetTenant.id}&_t=${Date.now()}`;
      const response = await fetchWithAuth(url);

      const rawCharges = Array.isArray(response) 
        ? response 
        : (response?.data || response?.content || []);

      if (rawCharges.length > 0) {
        const primaryBill = rawCharges[0];

        const parsedTotal = parseFloat(primaryBill.totalAmount ?? 0);
        const parsedPaid = parseFloat(primaryBill.paidAmount ?? 0);
        const parsedBalance = parseFloat(primaryBill.balanceAmount ?? 0);
        const parsedChargeId = primaryBill.chargeId;

        const dynamicChargeState = {
          chargeId: parsedChargeId,
          tenantName: primaryBill.tenantName || targetTenant.tenantName || targetTenant.fullName,
          totalAmount: parsedTotal,
          paidAmount: parsedPaid,
          balanceAmount: parsedBalance,
          chargeType: primaryBill.chargeType || "RENT"
        };

        setActiveCharge(dynamicChargeState);
        
        // Auto-detect mode: If balance is zero, offer advance mode by default
        if (parsedBalance === 0) {
          setIncomeType("ADVANCE");
        } else {
          setIncomeType("STANDARD");
        }

        setFormData(prev => ({
          ...prev,
          tenantId: primaryBill.tenantId || targetTenant.tenantId || targetTenant.id,
          chargeId: parsedChargeId,
          amount: parsedBalance > 0 ? parsedBalance : "" 
        }));
      } else {
        // Fallback when no active bill exists
        setActiveCharge({
          chargeId: null,
          tenantName: targetTenant.tenantName || targetTenant.fullName,
          totalAmount: 0,
          paidAmount: 0,
          balanceAmount: 0,
          chargeType: "Fully Paid / Renewal Needed"
        });
        setIncomeType("ADVANCE");
        setFormData(prev => ({ 
          ...prev, 
          tenantId: targetTenant.tenantId || targetTenant.id, 
          amount: "" 
        }));
      }
    } catch (error) {
      console.error("API error parsing financial components:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const clearFinancialForm = () => {
    setFormData(prev => ({ ...prev, tenantId: "", chargeId: "", amount: "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // LEDGER CONTEXT CALCULATIONS
  const totalOutstanding = activeCharge ? activeCharge.balanceAmount : 0;
  const amountPayingNow = parseFloat(formData.amount) || 0;
  
  const subsequentRemainingBalance = incomeType === "STANDARD" 
    ? Math.max(0, totalOutstanding - amountPayingNow) 
    : 0;

  // Validation: Overpaid check only applies in standard bill payment mode
  const isOverpaid = incomeType === "STANDARD" && totalOutstanding > 0 && amountPayingNow > totalOutstanding;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOverpaid) {
      alert(`Validation Error: Amount Paying Now (₹${amountPayingNow}) cannot exceed current outstanding balance (₹${totalOutstanding}).`);
      return;
    }

    if (amountPayingNow <= 0) {
      alert("Validation Error: Please enter a valid payment amount greater than zero.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        hostelId: parseInt(selectedHostel),
        tenantId: parseInt(formData.tenantId),
        chargeId: incomeType === "STANDARD" && formData.chargeId ? parseInt(formData.chargeId) : null,
        amount: amountPayingNow,
        incomeDate: formData.incomeDate,
        paymentMode: formData.paymentMode,
        description: formData.description || (incomeType === "ADVANCE" ? "Monthly advance/renewal income collection" : "Standard bill payment"),
        transactionId: formData.transactionId,
        advanceAmount: incomeType === "ADVANCE" ? amountPayingNow : (parseFloat(formData.advanceAmount) || 0),
        createdBy: formData.createdBy,
        receivedByUserId: formData.receivedByUserId ? parseInt(formData.receivedByUserId) : null
      };

      const res = await createIncomeApi(payload);
      if (res) {
        alert("Income posted successfully.");
        onSave();
      }
    } catch (err) {
      console.error("Submission processing failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h3 style={headerStyle}>Add New Income Entry</h3>
      <form onSubmit={handleSubmit} style={formGrid}>
        
        {/* FILTERS */}
        <div style={fieldGroup}>
          <label style={labelStyle}>1. Hostel Name</label>
          <select value={selectedHostel} onChange={handleHostelChange} required style={inputStyle}>
            <option value="">-- Select Hostel --</option>
            {hostels.map(h => (
              <option key={h.hostelId} value={h.hostelId}>{h.hostelName}</option>
            ))}
          </select>
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>2. Room Number</label>
          <select value={selectedRoom} onChange={handleRoomChange} disabled={!selectedHostel} required style={inputStyle}>
            <option value="">-- Select Room --</option>
            {rooms.map(room => (
              <option key={room} value={room}>Room {room}</option>
            ))}
          </select>
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>3. Bed Allocation {loadingData && "(Syncing...)"}</label>
          <select value={selectedBed} onChange={handleBedChange} disabled={!selectedRoom} required style={inputStyle}>
            <option value="">-- Select Bed --</option>
            {beds.map(bed => (
              <option key={bed} value={bed}>Bed {bed}</option>
            ))}
          </select>
        </div>

        {/* PROFILE BANNER */}
        {activeCharge && (
          <div style={profileBannerStyle}>
            <div style={{ fontWeight: "600", color: "#2c3e50" }}>
              Occupant Profile Name: <span style={{ color: "#007bff", marginLeft: "5px" }}>{activeCharge.tenantName}</span>
            </div>
            <div style={{ fontSize: "12px", color: "#7f8c8d", marginTop: "3px" }}>
              Active Category Context: {activeCharge.chargeType} (Statement ID: #{activeCharge.chargeId || "N/A"})
            </div>
          </div>
        )}

        {/* LEDGER HISTORICAL BREAKDOWN CARDS */}
        {activeCharge && (
          <div style={historyDashboardStyle}>
            <div style={historyCard}>
              <span style={historyLabel}>Total Bill Value</span>
              <span style={{ ...historyValue, color: "#2980b9" }}>₹{activeCharge.totalAmount.toFixed(2)}</span>
            </div>
            <div style={historyCard}>
              <span style={historyLabel}>Previously Paid</span>
              <span style={{ ...historyValue, color: "#27ae60" }}>₹{activeCharge.paidAmount.toFixed(2)}</span>
            </div>
            <div style={historyCard}>
              <span style={historyLabel}>Current Outstanding Due</span>
              <span style={{ ...historyValue, color: activeCharge.balanceAmount > 0 ? "#c0392b" : "#27ae60" }}>
                ₹{activeCharge.balanceAmount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* PAYMENT TYPE TOGGLE */}
        {activeCharge && (
          <div style={{ ...fieldGroup, gridColumn: "1 / -1", background: "#f8f9fa", padding: "10px", borderRadius: "6px", border: "1px solid #dee2e6" }}>
            <label style={{ ...labelStyle, fontWeight: "bold", marginBottom: "8px" }}>Collection Category Context:</label>
            <div style={{ display: "flex", gap: "20px" }}>
              <label style={{ fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                <input 
                  type="radio" 
                  name="incomeType" 
                  value="STANDARD" 
                  checked={incomeType === "STANDARD"} 
                  disabled={totalOutstanding === 0}
                  onChange={() => setIncomeType("STANDARD")} 
                />
                Pay Pending Bill Due (₹{totalOutstanding.toFixed(2)})
              </label>
              <label style={{ fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                <input 
                  type="radio" 
                  name="incomeType" 
                  value="ADVANCE" 
                  checked={incomeType === "ADVANCE"} 
                  onChange={() => setIncomeType("ADVANCE")} 
                />
                New Monthly Renewal / Advance Payment
              </label>
            </div>
          </div>
        )}

        {/* ENTRY FIELDS */}
        <div style={{ ...fieldGroup, borderLeft: "3px solid #007bff", paddingLeft: "10px", marginTop: "10px" }}>
          <label style={labelStyle}>Current Outstanding Due (₹)</label>
          <input 
            type="text" 
            value={activeCharge ? `₹ ${totalOutstanding.toFixed(2)}` : "₹ 0.00"} 
            disabled 
            style={{ ...inputStyle, background: "#f8f9fa", fontWeight: "bold" }} 
          />
        </div>

        <div style={{ ...fieldGroup, borderLeft: "3px solid #28a745", paddingLeft: "10px", marginTop: "10px" }}>
          <label style={labelStyle}>Amount Paying Now (₹)</label>
          <input 
            type="number" 
            name="amount" 
            value={formData.amount} 
            onChange={handleChange} 
            disabled={!activeCharge}
            required 
            min="0.01"
            step="0.01"
            style={{ 
              ...inputStyle, 
              borderColor: isOverpaid ? "#dc3545" : "#ced4da" 
            }} 
            placeholder="0.00" 
          />
          {isOverpaid && (
            <span style={{ color: "#dc3545", fontSize: "11px", marginTop: "3px", fontWeight: "bold" }}>
              Error: Cannot pay more than balance left! Select "Advance Payment" above to record future amounts.
            </span>
          )}
        </div>

        <div style={{ ...fieldGroup, borderLeft: "3px solid #ffc107", paddingLeft: "10px", marginTop: "10px" }}>
          <label style={labelStyle}>Balance Remaining on Bill (₹)</label>
          <input 
            type="text" 
            value={isOverpaid ? "Overpayment Error" : `₹ ${subsequentRemainingBalance.toFixed(2)}`} 
            disabled 
            style={{ 
              ...inputStyle, 
              background: "#f8f9fa", 
              color: isOverpaid ? "#dc3545" : "#495057",
              fontWeight: "bold" 
            }} 
          />
        </div>

        {/* METADATA */}
        <div style={fieldGroup}>
          <label style={labelStyle}>Income Posting Date</label>
          <input type="date" name="incomeDate" value={formData.incomeDate} onChange={handleChange} required style={inputStyle} />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Payment Mode</label>
          <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} style={inputStyle}>
            <option value="UPI">UPI</option>
            <option value="CASH">Cash</option>
            <option value="CHEQUE">Cheque</option>
            <option value="NET_BANKING">Net Banking</option>
            <option value="DEBIT_CARD">Debit Card</option>
          </select>
        </div>

        {/* Received By Personnel dropdown */}
        <div style={fieldGroup}>
          <label style={labelStyle}>Received By Personnel (Admin)</label>
          <select 
            name="receivedByUserId" 
            value={formData.receivedByUserId} 
            onChange={handleChange} 
            required
            style={inputStyle}
          >
            <option value="">Select Receiving Admin Agent</option>
            {admins.map(a => (
              <option key={a.userId} value={a.userId}>
                {a.fullName}
              </option>
            ))}
          </select>
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Transaction / Reference ID</label>
          <input type="text" name="transactionId" value={formData.transactionId} onChange={handleChange} style={inputStyle} placeholder="TXN123456789" />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Advance Allocations</label>
          <input type="number" name="advanceAmount" value={formData.advanceAmount} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ ...fieldGroup, gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Accounting Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyle, height: "60px" }} placeholder="Contextual notes..." />
        </div>

        <div style={actionContainer}>
          <button type="button" onClick={onCancel} disabled={isSubmitting} style={cancelBtn}>Cancel</button>
          <button 
            type="submit" 
            disabled={!activeCharge || isOverpaid || isSubmitting || amountPayingNow <= 0} 
            style={{ 
              ...submitBtn, 
              opacity: (!activeCharge || isOverpaid || isSubmitting || amountPayingNow <= 0) ? 0.6 : 1, 
              cursor: (!activeCharge || isOverpaid || isSubmitting || amountPayingNow <= 0) ? "not-allowed" : "pointer" 
            }}
          >
            {isSubmitting ? "Processing..." : "Post Income"}
          </button>
        </div>
      </form>
    </div>
  );
};

// Layout configurations
const containerStyle = { background: "#fff", padding: "25px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
const formGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "15px", marginTop: "15px" };
const fieldGroup = { display: "flex", flexDirection: "column", justifyContent: "center" };
const labelStyle = { fontSize: "12px", color: "#495057", fontWeight: "600", marginBottom: "4px" };
const inputStyle = { padding: "10px", borderRadius: "4px", border: "1px solid #ced4da", fontSize: "14px", width: "100%", boxSizing: "border-box" };
const actionContainer = { gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" };
const headerStyle = { borderBottom: "1px solid #dee2e6", paddingBottom: "8px", margin: "0 0 15px 0" };
const submitBtn = { padding: "10px 20px", background: "#28a745", color: "#fff", border: "none", borderRadius: "4px", fontSize: "14px", fontWeight: "500" };
const cancelBtn = { padding: "10px 20px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", fontSize: "14px" };

const profileBannerStyle = { gridColumn: "1 / -1", background: "#eef7ff", padding: "12px 15px", borderRadius: "6px", borderLeft: "4px solid #007bff", marginTop: "5px" };
const historyDashboardStyle = { gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", background: "#f8f9fa", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" };
const historyCard = { display: "flex", flexDirection: "column", background: "#fff", padding: "10px", borderRadius: "4px", border: "1px solid #edf2f7" };
const historyLabel = { fontSize: "11px", color: "#718096", textTransform: "uppercase", fontWeight: "500", marginBottom: "2px" };
const historyValue = { fontSize: "16px", fontWeight: "bold" };

export default CreateIncome;