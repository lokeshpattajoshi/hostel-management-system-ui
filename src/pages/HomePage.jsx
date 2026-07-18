import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserManagementApp from "./UserManagementApp";
import HostelManagementApp from "./HostelManagementApp"; 
import RoomManagementApp from "./RoomManagementApp"; 
import BedManagementApp from "./BedManagementApp"; 
import TenantManagementApp from "./TenantManagementApp";
import ExpenseManagementApp from "./ExpenseManagementApp"; 
import IncomeManagementApp from "./IncomeManagementApp"; 
import ReportManagement from "./ReportManagement";
import ApprovalQueueManagementApp from "./ApprovalQueueManagementApp"; // 1. Import the approvals app wrapper

function HomePage() {
  const [activeModule, setActiveModule] = useState("DASHBOARD");
  const [userSubView, setUserSubView] = useState("VIEW");
  const [hostelSubView, setHostelSubView] = useState("VIEW"); 
  const [roomSubView, setRoomSubView] = useState("VIEW"); 
  const [bedSubView, setBedSubView] = useState("VIEW"); 
  const [tenantSubView, setTenantSubView] = useState("VIEW");
  const [expenseSubView, setExpenseSubView] = useState("VIEW"); 
  const [incomeSubView, setIncomeSubView] = useState("VIEW");
  
  // States to keep track of logged in user's profile metadata
  const [userRole, setUserRole] = useState("");
  const [userFullName, setUserFullName] = useState("");

  const navigate = useNavigate();

  const executeSessionTermination = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      executeSessionTermination();
      return;
    }

    // Read the auth metadata saved on login success
    const storedRole = localStorage.getItem("role");
    const storedFullName = localStorage.getItem("fullName");

    setUserRole(storedRole || "USER");
    setUserFullName(storedFullName || "Guest User");

    const handleGlobalAuthFailure = (event) => {
      if (event.detail && event.detail.status === 401) {
        alert("Your session has expired or you are unauthorized. Redirecting to login...");
        executeSessionTermination();
      }
    };

    window.addEventListener("api-auth-failure", handleGlobalAuthFailure);
    return () => {
      window.removeEventListener("api-auth-failure", handleGlobalAuthFailure);
    };
  }, [navigate]);

  // 2. Added "Approvals" to the list of base administrative structures
  const baseModules = ["Users", "Hostels", "Rooms", "Beds", "Tenants", "Expenses", "Incomes", "Reports", "Approvals"];
  const allowedModules = userRole === "ADMIN" || userRole === "SUPER_ADMIN"
    ? baseModules 
    : ["Hostels", "Rooms", "Beds", "Tenants", "Incomes"]; // Regular users only access execution tables

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      executeSessionTermination();
    }
  };

  const handleModuleNavigation = (moduleName, viewType) => {
    console.log(`Navigating to ${moduleName} with view ${viewType}`);
    
    if (moduleName === "Users") setUserSubView(viewType);
    if (moduleName === "Hostels") setHostelSubView(viewType);
    if (moduleName === "Rooms") setRoomSubView(viewType);
    if (moduleName === "Beds") setBedSubView(viewType);
    if (moduleName === "Tenants") setTenantSubView(viewType);
    if (moduleName === "Expenses") setExpenseSubView(viewType); 
    if (moduleName === "Incomes") setIncomeSubView(viewType); 
    
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

    if (activeModule === "Users") return <div>{backButton}<UserManagementApp initialView={userSubView} /></div>;
    if (activeModule === "Hostels") return <div>{backButton}<HostelManagementApp initialView={hostelSubView} /></div>;
    if (activeModule === "Rooms") return <div>{backButton}<RoomManagementApp initialView={roomSubView} /></div>;
    if (activeModule === "Beds") return <div>{backButton}<BedManagementApp initialView={bedSubView} /></div>;
    
    if (activeModule === "Tenants") {
      return (
        <div>
          {backButton}
          <TenantManagementApp initialView={tenantSubView} userRole={userRole} />
        </div>
      );
    }
    
    if (activeModule === "Expenses") return <div>{backButton}<ExpenseManagementApp initialView={expenseSubView} /></div>;
    
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
          <ReportManagement />
        </div>
      );
    }

    // 3. Conditional route catch to surface the Queue workspace layout
    if (activeModule === "Approvals") {
      return (
        <div>
          {backButton}
          <ApprovalQueueManagementApp />
        </div>
      );
    }

    return (
      <>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Dashboard</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {allowedModules.map((item) => (
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
                  <>
                    <button
                      onClick={() => handleModuleNavigation(item, "VIEW")}
                      style={{ ...btnStyle, background: "#e7f3ff", color: "#007bff", borderColor: "#007bff", fontWeight: "bold" }}
                    >
                      📈 View Report
                    </button>
                    
                    <button
                      onClick={() => handleModuleNavigation(item, "VIEW")}
                      style={{ ...btnStyle, background: "#f8f9fa" }}
                    >
                      Open Executive Summary
                    </button>
                  </>
                ) : item === "Approvals" ? (
                  <>
                    {/* Unique button rendering map layout for authorizations pane */}
                    <button
                      onClick={() => handleModuleNavigation(item, "VIEW")}
                      style={{ ...btnStyle, background: "#e6fffa", color: "#234e52", borderColor: "#81e6d9", fontWeight: "bold" }}
                    >
                      🛡️ Open Approval Queue
                    </button>
                  </>
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img 
            src="/logo.jpg" 
            alt="Hostel Management Logo" 
            style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: "6px", 
              objectFit: "cover",
              background: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.2)"
            }} 
          />
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>Hostel Management</h2>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {userFullName && (
            <span style={{ fontSize: "14px", fontWeight: "500", opacity: "0.95" }}>
              👋 Welcome, <strong>{userFullName}</strong>
            </span>
          )}
          <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
        </div>
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