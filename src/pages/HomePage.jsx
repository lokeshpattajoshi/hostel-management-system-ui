import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserManagementApp from "./UserManagementApp";
import HostelManagementApp from "./HostelManagementApp"; 
import RoomManagementApp from "./RoomManagementApp"; 
import BedManagementApp from "./BedManagementApp"; 
import TenantManagementApp from "./TenantManagementApp";
import ExpenseManagementApp from "./ExpenseManagementApp"; 
import IncomeManagementApp from "./IncomeManagementApp"; // <-- 1. IMPORTED INCOME APP

function HomePage() {
  const [activeModule, setActiveModule] = useState("DASHBOARD");
  const [userSubView, setUserSubView] = useState("VIEW");
  const [hostelSubView, setHostelSubView] = useState("VIEW"); 
  const [roomSubView, setRoomSubView] = useState("VIEW"); 
  const [bedSubView, setBedSubView] = useState("VIEW"); 
  const [tenantSubView, setTenantSubView] = useState("VIEW");
  const [expenseSubView, setExpenseSubView] = useState("VIEW"); 
  const [incomeSubView, setIncomeSubView] = useState("VIEW"); // <-- 2. ADDED INCOME STATE
  
  const navigate = useNavigate();
  const modules = ["Users", "Hostels", "Rooms", "Beds", "Tenants", "Expenses", "Incomes", "Reports"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate("/", { replace: true });
    }
  };

  // --- Unified Click Handler ---
  const handleModuleNavigation = (moduleName, viewType) => {
    console.log(`Navigating to ${moduleName} with view ${viewType}`);
    
    if (moduleName === "Users") setUserSubView(viewType);
    if (moduleName === "Hostels") setHostelSubView(viewType);
    if (moduleName === "Rooms") setRoomSubView(viewType);
    if (moduleName === "Beds") setBedSubView(viewType);
    if (moduleName === "Tenants") setTenantSubView(viewType);
    if (moduleName === "Expenses") setExpenseSubView(viewType); 
    if (moduleName === "Incomes") setIncomeSubView(viewType); // <-- 3. INCOME NAVIGATION
    
    setActiveModule(moduleName);
  };

  const renderContent = () => {
    const backButton = (
      <button
        onClick={() => setActiveModule("DASHBOARD")}
        style={{
          marginBottom: "15px",
          padding: "8px 15px",
          cursor: "pointer",
          borderRadius: "4px",
          border: "1px solid #ccc",
          background: "#fff"
        }}
      >
        ← Back to Dashboard
      </button>
    );

    // Module Routing Logic
    if (activeModule === "Users") return <div>{backButton}<UserManagementApp initialView={userSubView} /></div>;
    if (activeModule === "Hostels") return <div>{backButton}<HostelManagementApp initialView={hostelSubView} /></div>;
    if (activeModule === "Rooms") return <div>{backButton}<RoomManagementApp initialView={roomSubView} /></div>;
    if (activeModule === "Beds") return <div>{backButton}<BedManagementApp initialView={bedSubView} /></div>;
    if (activeModule === "Tenants") return <div>{backButton}<TenantManagementApp initialView={tenantSubView} /></div>;
    if (activeModule === "Expenses") return <div>{backButton}<ExpenseManagementApp initialView={expenseSubView} /></div>;
    
    // <-- 4. MOUNTED INCOME APP INTERFACE HERE TO FIX CHIPS DISPLAY -->
    if (activeModule === "Incomes") {
      return (
        <div>
          {backButton}
          <IncomeManagementApp initialView={incomeSubView} />
        </div>
      );
    }

    if (activeModule === "Reports") {
      return (
        <div>
          {backButton}
          <div style={{ background: "#fff", padding: "30px", borderRadius: "8px", textAlign: "center", border: "1px solid #eee" }}>
            <h3>System Reports & Financial Ledger Statements</h3>
            <p style={{ color: "#666" }}>Analytical tools are currently being updated.</p>
          </div>
        </div>
      );
    }

    // DASHBOARD VIEW
    return (
      <>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Dashboard</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {modules.map((item) => (
            <div
              key={item}
              style={{
                border: "1px solid #ccc",
                padding: "20px",
                textAlign: "center",
                background: "#fff",
                borderRadius: "8px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              }}
            >
              <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>{item}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                
                {item === "Reports" ? (
                  <button
                    onClick={() => handleModuleNavigation(item, "VIEW")}
                    style={{ ...btnStyle, background: "#f8f9fa", fontWeight: "bold" }}
                  >
                    Open Executive Summary
                  </button>
                ) : (
                  <>
                    <button onClick={() => handleModuleNavigation(item, "CREATE")} style={btnStyle}>
                      Create
                    </button>

                    <button onClick={() => handleModuleNavigation(item, "VIEW")} style={btnStyle}>
                      View All
                    </button>

                    {item === "Beds" && (
                      <button 
                        onClick={() => handleModuleNavigation("Beds", "AVAILABLE")} 
                        style={{
                          ...btnStyle, background: "#e7f3ff", color: "#007bff", borderColor: "#007bff", fontWeight: "bold"
                        }}
                      >
                        Check Availability Map
                      </button>
                    )}

                    <button onClick={() => handleModuleNavigation(item, "VIEW")} style={btnStyle}>
                      Modify
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 30px",
          background: "#007bff",
          color: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "20px" }}>Hostel Management</h2>
        <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
      </nav>

      <div style={{ padding: "30px" }}>
        {renderContent()}
      </div>
    </div>
  );
}

const btnStyle = {
  padding: "10px",
  cursor: "pointer",
  background: "#fff",
  border: "1px solid #ced4da",
  borderRadius: "4px",
  fontWeight: "500",
  outline: "none"
};

const logoutBtnStyle = {
  background: "#dc3545",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default HomePage;