import React, { useState, useEffect } from "react";
import { 
  fetchAllHostelsForDropdownApi, 
  fetchAllTenantsForDropdownApi, 
  fetchAllAdminsForDropdownApi, 
  fetchWithAuth, 
  createIncomeApi 
} from "../services/api";

const CreateIncome = ({ onSave, onCancel }) => {
  const [hostels, setHostels] = useState([]);
  const [allTenants, setAllTenants] = useState([]); 
  const [admins, setAdmins] = useState([]); 
  
  // Cascade filters
  const [selectedHostel, setSelectedHostel] = useState("");
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [beds, setBeds] = useState([]);
  const [selectedBed, setSelectedBed] = useState("");

  const [loadingData, setLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Income entry type: STANDARD or ADVANCE
  const [incomeType, setIncomeType] = useState("STANDARD");
  
  // Financial profile tracking
  const [activeCharge, setActiveCharge] = useState(null);
  const [monthlyList, setMonthlyList] = useState([]);
  const [selectedMonthItem, setSelectedMonthItem] = useState(null);
  
  // Dynamically read the logged-in user ID
  const currentUserId = parseInt(localStorage.getItem("userId"), 10) || 1;

  const [formData, setFormData] = useState({
    tenantId: "",
    chargeId: "", 
    amount: "", 
    chargeType: "RENT_RENEWAL",
    incomeDate: new Date().toISOString().split('T')[0],
    paymentMode: "UPI",
    description: "",
    transactionId: "",
    advanceAmount: 0,
    createdBy: currentUserId,
    receivedByUserId: ""
  });

  // Helper function to get YYYY-MM-DD for the 1st of the NEXT month based on latest entry
  const getNextMonthFormattedDate = (list) => {
    let baseDate = new Date();

    if (list && list.length > 0) {
      const lastItem = list[list.length - 1];
      const sourceDateStr = lastItem.periodEnd || lastItem.month;
      const parsedDate = new Date(sourceDateStr);
      if (!isNaN(parsedDate.getTime())) {
        baseDate = parsedDate;
      }
    }

    const nextMonthDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1);
    const year = nextMonthDate.getFullYear();
    const month = String(nextMonthDate.getMonth() + 1).padStart(2, "0");
    const day = "01";
    
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const initFormReferences = async () => {
      try {
        setLoadingData(true);
        const [hostelData, adminData] = await Promise.all([
          fetchAllHostelsForDropdownApi(),
          fetchAllAdminsForDropdownApi()
        ]);
        
        setHostels(Array.isArray(hostelData) ? hostelData : []);
        setAdmins(Array.isArray(adminData) ? adminData : []);
      } catch (err) {
        console.error("Initialization error loading dropdown data:", err);
        setHostels([]);
        setAdmins([]);
      } finally {
        setLoadingData(false);
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
    setMonthlyList([]);
    clearFinancialForm();

    if (hostelId) {
      setLoadingData(true);
      try {
        const safeTenants = await fetchAllTenantsForDropdownApi(hostelId);
        const tenantArray = Array.isArray(safeTenants) ? safeTenants : [];
        setAllTenants(tenantArray);

        const uniqueRooms = [...new Set(tenantArray.map(t => t.roomNumber || t.roomNo).filter(Boolean))];
        const sortedRooms = [...uniqueRooms].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
        setRooms(sortedRooms);
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
    setMonthlyList([]);
    clearFinancialForm();

    if (roomNum) {
      const filteredBeds = allTenants
        .filter(t => String(t.roomNumber || t.roomNo) === String(roomNum) && (t.bedNumber || t.bedNo))
        .map(t => t.bedNumber || t.bedNo);
      
      const uniqueBeds = [...new Set(filteredBeds)].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
      setBeds(uniqueBeds);
    }
  };

  // 3. Bed Select -> Pulls ledger metrics
  const handleBedChange = async (e) => {
    const bedNum = e.target.value;
    setSelectedBed(bedNum);
    setActiveCharge(null);
    setMonthlyList([]);
    clearFinancialForm();

    if (!bedNum || !selectedRoom || !selectedHostel) return;

    const targetTenant = allTenants.find(
      t => String(t.roomNumber || t.roomNo) === String(selectedRoom) && String(t.bedNumber || t.bedNo) === String(bedNum)
    );

    if (!targetTenant) {
      console.warn("Could not find matching tenant state for Room:", selectedRoom, "Bed:", bedNum);
      return;
    }

    const resolvedTenantId = targetTenant.tenantId || targetTenant.id;

    try {
      setLoadingData(true);
      
      const url = `/income/pending-summary?hostelId=${selectedHostel}&tenantId=${resolvedTenantId}&_t=${Date.now()}`;
      const response = await fetchWithAuth(url);

      const rawCharges = Array.isArray(response) 
        ? response 
        : (response?.data || response?.content || []);

      const rentCharge = rawCharges.find(c => String(c.chargeType).toUpperCase() === "RENT") || rawCharges[0];

      if (rentCharge) {
        const parsedTotal = parseFloat(rentCharge.totalAmount ?? 0);
        const parsedPaid = parseFloat(rentCharge.paidAmount ?? 0);
        const parsedBalance = parseFloat(rentCharge.balanceAmount ?? 0);
        const parsedChargeId = rentCharge.chargeId || rentCharge.id || null;

        let extractedMonthly = [];
        if (rentCharge.monthlySummary && Array.isArray(rentCharge.monthlySummary)) {
          extractedMonthly = rentCharge.monthlySummary;
        }

        setMonthlyList(extractedMonthly);

        const dynamicChargeState = {
          chargeId: parsedChargeId,
          tenantName: rentCharge.tenantName || targetTenant.tenantName || targetTenant.fullName,
          totalAmount: parsedTotal,
          paidAmount: parsedPaid,
          balanceAmount: parsedBalance,
          chargeType: rentCharge.chargeType || "RENT"
        };

        setActiveCharge(dynamicChargeState);
        
        const firstUnpaidMonth = extractedMonthly.find(m => m.balanceAmount > 0 || m.status !== "PAID");
        if (firstUnpaidMonth) {
          setSelectedMonthItem(firstUnpaidMonth);
        }

        const isAdvance = parsedBalance === 0;
        setIncomeType(isAdvance ? "ADVANCE" : "STANDARD");

        // Map incomeDate to the period start date of the pending month if standard mode, otherwise next month for advance
        const computedDate = isAdvance 
          ? getNextMonthFormattedDate(extractedMonthly)
          : (firstUnpaidMonth?.periodStart || firstUnpaidMonth?.month || new Date().toISOString().split('T')[0]);

        const initialAmountToSet = isAdvance
          ? parsedTotal
          : (firstUnpaidMonth 
              ? (firstUnpaidMonth.balanceAmount > 0 ? firstUnpaidMonth.balanceAmount : firstUnpaidMonth.totalAmount)
              : (parsedBalance > 0 ? parsedBalance : parsedTotal));

        setFormData(prev => ({
          ...prev,
          tenantId: resolvedTenantId,
          chargeId: parsedChargeId || "",
          chargeType: isAdvance ? "RENT_RENEWAL" : (rentCharge.chargeType || "RENT"),
          incomeDate: computedDate,
          amount: initialAmountToSet > 0 ? initialAmountToSet : "" 
        }));
      } else {
        setActiveCharge({
          chargeId: null,
          tenantName: targetTenant.tenantName || targetTenant.fullName,
          totalAmount: 0,
          paidAmount: 0,
          balanceAmount: 0,
          chargeType: "RENT"
        });
        setMonthlyList([]);
        setIncomeType("ADVANCE");
        setFormData(prev => ({ 
          ...prev, 
          tenantId: resolvedTenantId, 
          chargeId: "",
          chargeType: "RENT_RENEWAL",
          incomeDate: getNextMonthFormattedDate([]),
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
    setFormData(prev => ({ 
      ...prev, 
      tenantId: "", 
      chargeId: "", 
      amount: "", 
      chargeType: "RENT_RENEWAL",
      incomeDate: new Date().toISOString().split('T')[0]
    }));
    setSelectedMonthItem(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Select month from breakdown table
  const handleSelectMonthRow = (item) => {
    if (item.status === "PAID" || item.balanceAmount <= 0) return;
    
    setSelectedMonthItem(item);
    setIncomeType("STANDARD");
    
    const targetAmount = item.balanceAmount > 0 ? item.balanceAmount : item.totalAmount;
    
    // Automatically set the income date to the month start/period being settled
    const settlementMonthDate = item.periodStart || item.month || new Date().toISOString().split('T')[0];

    setFormData(prev => ({
      ...prev,
      chargeId: item.chargeId || prev.chargeId,
      chargeType: activeCharge?.chargeType || "RENT",
      incomeDate: settlementMonthDate,
      amount: targetAmount
    }));
  };

  // Cumulative Summaries
  const cumulativeTotalAmount = monthlyList.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0), 0);
  const cumulativePaidAmount = monthlyList.reduce((acc, curr) => acc + (parseFloat(curr.paidAmount) || 0), 0);
  const cumulativeBalanceAmount = monthlyList.reduce((acc, curr) => acc + (parseFloat(curr.balanceAmount) || 0), 0);

  // BASE MONTHLY RENT OR SELECTED MONTH TOTAL
  const displayMonthlyRent = selectedMonthItem 
    ? parseFloat(selectedMonthItem.totalAmount || 0)
    : parseFloat(activeCharge?.totalAmount || 0);

  // BASE DUE FOR CURRENT CONTEXT
  const currentPendingDue = selectedMonthItem 
    ? parseFloat(selectedMonthItem.balanceAmount || 0)
    : parseFloat(activeCharge?.balanceAmount || 0);

  // AMOUNT PAYING NOW
  const amountPayingNow = parseFloat(formData.amount) || 0;

  // DYNAMIC CONTEXT EVALUATION FOR DUES & REMAINING BALANCES
  const baseBillBalance = incomeType === "ADVANCE" 
    ? displayMonthlyRent 
    : (currentPendingDue > 0 ? currentPendingDue : displayMonthlyRent);

  const subsequentRemainingBalance = Math.max(0, baseBillBalance - amountPayingNow);

  // VALIDATIONS
  // If STANDARD mode with an unpaid due -> Limit to current pending due
  // If ADVANCE mode (or standard with 0 pending due) -> Limit to Monthly Rent
  const maxAllowedAmount = incomeType === "STANDARD" && currentPendingDue > 0 
    ? currentPendingDue 
    : displayMonthlyRent;

  const isOverpaid = activeCharge && maxAllowedAmount > 0 && amountPayingNow > maxAllowedAmount;
  const isZeroOrNegative = activeCharge && amountPayingNow <= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (amountPayingNow <= 0) {
      alert("Validation Error: Amount Paying Now (₹) cannot be zero or empty.");
      return;
    }

    if (isOverpaid) {
      alert(`Validation Error: Amount Paying Now (₹${amountPayingNow}) cannot be more than the maximum allowed limit (₹${maxAllowedAmount}).`);
      return;
    }

    try {
      setIsSubmitting(true);

      const rawChargeId = formData.chargeId || activeCharge?.chargeId;
      const validChargeId = rawChargeId ? parseInt(rawChargeId, 10) : null;

      const resolvedChargeType = incomeType === "ADVANCE" ? "RENT_RENEWAL" : (formData.chargeType || "RENT");

      const payload = {
        hostelId: parseInt(selectedHostel, 10),
        tenantId: parseInt(formData.tenantId, 10),
        chargeId: validChargeId,
        amount: amountPayingNow,
        incomeDate: formData.incomeDate,
        
        chargeType: resolvedChargeType,
        paymentType: resolvedChargeType,
        paymentMode: formData.paymentMode,
        
        description: formData.description || (incomeType === "ADVANCE" ? "Monthly advance/renewal income collection" : "Standard bill payment"),
        transactionId: formData.transactionId || null,
        advanceAmount: incomeType === "ADVANCE" ? amountPayingNow : (parseFloat(formData.advanceAmount) || 0),
        createdBy: formData.createdBy ? parseInt(formData.createdBy, 10) : currentUserId,
        receivedByUserId: formData.receivedByUserId ? parseInt(formData.receivedByUserId, 10) : null
      };

      const res = await createIncomeApi(payload);
      if (res) {
        alert("Income posted successfully.");
        if (onSave) onSave(res);
      }
    } catch (err) {
      console.error("Submission processing failed:", err);
      alert("Failed to submit income entry. Please check console logs.");
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
              <option key={h.hostelId || h.id} value={h.hostelId || h.id}>{h.hostelName || h.name}</option>
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
              <span style={historyLabel}>Monthly Rent Amount</span>
              <span style={{ ...historyValue, color: "#2980b9" }}>
                ₹{displayMonthlyRent.toFixed(2)}
              </span>
            </div>
            <div style={historyCard}>
              <span style={historyLabel}>Total Amount Paid by Tenant</span>
              <span style={{ ...historyValue, color: "#27ae60" }}>
                ₹{(selectedMonthItem ? selectedMonthItem.paidAmount : activeCharge.paidAmount).toFixed(2)}
              </span>
            </div>
            <div style={historyCard}>
              <span style={historyLabel}>Current Outstanding Due</span>
              <span style={{ ...historyValue, color: currentPendingDue > 0 ? "#c0392b" : "#27ae60" }}>
                ₹{currentPendingDue.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* MONTHLY SUMMARY TABLE WITH CUMULATIVE TOTALS */}
        {monthlyList.length > 0 && (
          <div style={{ gridColumn: "1 / -1", marginTop: "10px", overflowX: "auto" }}>
            <label style={{ ...labelStyle, fontWeight: "bold", marginBottom: "6px" }}>
              Monthly Rent Billing Breakdown:
            </label>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={thStyle}>Month</th>
                  <th style={thStyle}>Billing Period</th>
                  <th style={thStyle}>Total Rent</th>
                  <th style={thStyle}>Amount Paid</th>
                  <th style={thStyle}>Balance</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {monthlyList.map((item, index) => {
                  const isPaid = item.status === "PAID" || item.balanceAmount <= 0;
                  const isSelected = selectedMonthItem?.month === item.month;
                  
                  return (
                    <tr 
                      key={index} 
                      style={{ 
                        ...tableRowStyle, 
                        background: isSelected ? "#e7f3ff" : (isPaid ? "#f8f9fa" : "#ffffff") 
                      }}
                    >
                      <td style={tdStyle}><strong>{item.month}</strong></td>
                      <td style={tdStyle}>{item.periodStart} to {item.periodEnd}</td>
                      <td style={tdStyle}>₹{parseFloat(item.totalAmount).toFixed(2)}</td>
                      <td style={{ ...tdStyle, color: "#27ae60" }}>₹{parseFloat(item.paidAmount).toFixed(2)}</td>
                      <td style={{ ...tdStyle, color: item.balanceAmount > 0 ? "#c0392b" : "#27ae60" }}>
                        ₹{parseFloat(item.balanceAmount).toFixed(2)}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          background: isPaid ? "#d4edda" : "#fff3cd",
                          color: isPaid ? "#155724" : "#856404"
                        }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button
                          type="button"
                          disabled={isPaid}
                          onClick={() => handleSelectMonthRow(item)}
                          style={{
                            padding: "4px 8px",
                            fontSize: "11px",
                            borderRadius: "3px",
                            border: "none",
                            cursor: isPaid ? "not-allowed" : "pointer",
                            background: isPaid ? "#e0e0e0" : "#007bff",
                            color: isPaid ? "#888" : "#fff"
                          }}
                        >
                          {isPaid ? "Fully Paid" : "Select & Pay"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                
                {/* CUMULATIVE TOTAL ROW */}
                <tr style={cumulativeRowStyle}>
                  <td colSpan="2" style={tdStyle}><strong>Cumulative Total</strong></td>
                  <td style={{ ...tdStyle, color: "#2980b9" }}><strong>₹{cumulativeTotalAmount.toFixed(2)}</strong></td>
                  <td style={{ ...tdStyle, color: "#27ae60" }}><strong>₹{cumulativePaidAmount.toFixed(2)}</strong></td>
                  <td style={{ ...tdStyle, color: cumulativeBalanceAmount > 0 ? "#c0392b" : "#27ae60" }}>
                    <strong>₹{cumulativeBalanceAmount.toFixed(2)}</strong>
                  </td>
                  <td colSpan="2" style={tdStyle}></td>
                </tr>
              </tbody>
            </table>
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
                  disabled={activeCharge.balanceAmount === 0 && (!selectedMonthItem || selectedMonthItem.balanceAmount === 0)}
                  onChange={() => {
                    setIncomeType("STANDARD");
                    const targetAmount = selectedMonthItem 
                      ? selectedMonthItem.balanceAmount 
                      : activeCharge.balanceAmount;

                    const settlementDate = selectedMonthItem?.periodStart || selectedMonthItem?.month || new Date().toISOString().split('T')[0];

                    setFormData(prev => ({
                      ...prev,
                      chargeType: activeCharge?.chargeType || "RENT",
                      incomeDate: settlementDate,
                      amount: targetAmount > 0 ? targetAmount : ""
                    }));
                  }} 
                />
                Pay Pending Bill Due (₹{(selectedMonthItem ? selectedMonthItem.balanceAmount : activeCharge.balanceAmount).toFixed(2)})
              </label>
              <label style={{ fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                <input 
                  type="radio" 
                  name="incomeType" 
                  value="ADVANCE" 
                  checked={incomeType === "ADVANCE"} 
                  onChange={() => {
                    setIncomeType("ADVANCE");
                    
                    const defaultRentAmount = activeCharge?.totalAmount || 0;
                    const nextMonthDate = getNextMonthFormattedDate(monthlyList);

                    setFormData(prev => ({
                      ...prev,
                      chargeType: "RENT_RENEWAL",
                      incomeDate: nextMonthDate,
                      amount: defaultRentAmount > 0 ? defaultRentAmount : ""
                    }));
                  }} 
                />
                New Monthly Renewal / Advance Payment
              </label>
            </div>
          </div>
        )}

        {/* MONTHLY RENT */}
        <div style={{ ...fieldGroup, borderLeft: "3px solid #007bff", paddingLeft: "10px", marginTop: "10px" }}>
          <label style={labelStyle}>Monthly Rent (₹)</label>
          <input 
            type="text" 
            value={activeCharge ? `₹ ${displayMonthlyRent.toFixed(2)}` : "₹ 0.00"} 
            disabled 
            style={{ ...inputStyle, background: "#f8f9fa", fontWeight: "bold" }} 
          />
        </div>

        {/* AMOUNT PAYING NOW */}
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
              borderColor: (isOverpaid || isZeroOrNegative) ? "#dc3545" : "#ced4da",
              backgroundColor: (isOverpaid || isZeroOrNegative) ? "#fff8f8" : "#ffffff"
            }} 
            placeholder="0.00" 
          />
          {isOverpaid && (
            <span style={{ color: "#dc3545", fontSize: "11px", marginTop: "3px", fontWeight: "bold" }}>
              Error: Amount Paying Now cannot be more than {incomeType === "ADVANCE" ? "Monthly Rent" : "Outstanding Due"} (₹{maxAllowedAmount.toFixed(2)}).
            </span>
          )}
          {isZeroOrNegative && (
            <span style={{ color: "#dc3545", fontSize: "11px", marginTop: "3px", fontWeight: "bold" }}>
              Error: Amount Paying Now cannot be zero or negative.
            </span>
          )}
        </div>

        {/* REAL-TIME DYNAMIC BALANCE REMAINING */}
        <div style={{ ...fieldGroup, borderLeft: "3px solid #ffc107", paddingLeft: "10px", marginTop: "10px" }}>
          <label style={labelStyle}>Balance Remaining on Bill (₹)</label>
          <input 
            type="text" 
            value={
              !activeCharge 
                ? "₹ 0.00" 
                : isOverpaid 
                  ? "Invalid Amount" 
                  : `₹ ${subsequentRemainingBalance.toFixed(2)}`
            } 
            disabled 
            style={{ 
              ...inputStyle, 
              background: "#f8f9fa", 
              color: isOverpaid ? "#dc3545" : "#495057",
              fontWeight: "bold" 
            }} 
          />
        </div>

        {/* SETTLEMENT PERIOD / TARGET MONTH DATE */}
        <div style={fieldGroup}>
          <label style={labelStyle}>
            {incomeType === "STANDARD" 
              ? `Settlement Period Month (Due Date${selectedMonthItem ? `: ${selectedMonthItem.month}` : ""})` 
              : "Rent Target Period Month"}
          </label>
          <input 
            type="date" 
            name="incomeDate" 
            value={formData.incomeDate} 
            onChange={handleChange} 
            required 
            style={inputStyle} 
          />
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
              <option key={a.userId || a.id} value={a.userId || a.id}>
                {a.fullName || a.username || a.name || `Admin #${a.userId || a.id}`}
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
            disabled={!activeCharge || isOverpaid || isZeroOrNegative || isSubmitting} 
            style={{ 
              ...submitBtn, 
              opacity: (!activeCharge || isOverpaid || isZeroOrNegative || isSubmitting) ? 0.6 : 1, 
              cursor: (!activeCharge || isOverpaid || isZeroOrNegative || isSubmitting) ? "not-allowed" : "pointer" 
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

// Table styles for monthly breakdown
const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "8px", fontSize: "12px" };
const tableHeaderRowStyle = { background: "#edf2f7", textAlign: "left" };
const tableRowStyle = { borderBottom: "1px solid #e2e8f0" };
const cumulativeRowStyle = { background: "#f1f5f9", borderTop: "2px solid #cbd5e1", fontWeight: "bold" };
const thStyle = { padding: "8px 10px", color: "#4a5568", borderBottom: "2px solid #cbd5e1" };
const tdStyle = { padding: "8px 10px" };

export default CreateIncome;