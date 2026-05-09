import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserManagementApp from "./UserManagementApp";
// 1. Import the Hostel Module
import HostelManagementApp from "./HostelManagementApp"; 

function HomePage() {
  const [activeModule, setActiveModule] = useState("DASHBOARD");
  const [userSubView, setUserSubView] = useState("VIEW");
  // 2. Add sub-view state for Hostels
  const [hostelSubView, setHostelSubView] = useState("VIEW"); 
  
  const navigate = useNavigate();

  const modules = ["Users", "Hostels", "Rooms", "Beds", "Tenants", "Expenses"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.clear();
      navigate("/", { replace: true });
    }
  };

  // 3. Updated click handlers for both modules
  const handleUserModuleClick = (viewType) => {
    setUserSubView(viewType);
    setActiveModule("Users");
  };

  const handleHostelModuleClick = (viewType) => {
    setHostelSubView(viewType);
    setActiveModule("Hostels");
  };

  const renderContent = () => {
    // BACK BUTTON HELPER
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

    // USER MODULE
    if (activeModule === "Users") {
      return (
        <div>
          {backButton}
          <UserManagementApp initialView={userSubView} />
        </div>
      );
    }

    // 4. ADD HOSTEL MODULE LOGIC
    if (activeModule === "Hostels") {
      return (
        <div>
          {backButton}
          <HostelManagementApp initialView={hostelSubView} />
        </div>
      );
    }

    // DEFAULT DASHBOARD
    return (
      <>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Dashboard</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
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
                <button
                  onClick={() => {
                    if (item === "Users") handleUserModuleClick("CREATE");
                    if (item === "Hostels") handleHostelModuleClick("CREATE");
                  }}
                  style={btnStyle}
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    if (item === "Users") handleUserModuleClick("VIEW");
                    if (item === "Hostels") handleHostelModuleClick("VIEW");
                  }}
                  style={btnStyle}
                >
                  View
                </button>
                <button
                  onClick={() => {
                    if (item === "Users") handleUserModuleClick("VIEW");
                    if (item === "Hostels") handleHostelModuleClick("VIEW");
                  }}
                  style={btnStyle}
                >
                  Modify
                </button>
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
  padding: "8px",
  cursor: "pointer",
  background: "#f0f0f0",
  border: "1px solid #ddd",
  borderRadius: "4px",
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