import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserManagementApp from "./UserManagementApp";
import HostelManagementApp from "./HostelManagementApp"; 
import RoomManagementApp from "./RoomManagementApp"; 
import BedManagementApp from "./BedManagementApp"; 

function HomePage() {
  const [activeModule, setActiveModule] = useState("DASHBOARD");
  const [userSubView, setUserSubView] = useState("VIEW");
  const [hostelSubView, setHostelSubView] = useState("VIEW"); 
  const [roomSubView, setRoomSubView] = useState("VIEW"); 
  const [bedSubView, setBedSubView] = useState("VIEW"); 
  
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
      localStorage.clear();
      navigate("/", { replace: true });
    }
  };

  // Click handlers for modules
  const handleUserModuleClick = (viewType) => {
    setUserSubView(viewType);
    setActiveModule("Users");
  };

  const handleHostelModuleClick = (viewType) => {
    setHostelSubView(viewType);
    setActiveModule("Hostels");
  };

  const handleRoomModuleClick = (viewType) => {
    setRoomSubView(viewType);
    setActiveModule("Rooms");
  };

  const handleBedModuleClick = (viewType) => {
    setBedSubView(viewType);
    setActiveModule("Beds");
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

    // DASHBOARD VIEW
    return (
      <>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Dashboard</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            position: "relative",
            zIndex: 1,
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
                
                {/* CREATE BUTTON */}
                <button
                  onClick={() => {
                    switch(item) {
                      case "Users": handleUserModuleClick("CREATE"); break;
                      case "Hostels": handleHostelModuleClick("CREATE"); break;
                      case "Rooms": handleRoomModuleClick("CREATE"); break;
                      case "Beds": handleBedModuleClick("CREATE"); break;
                      default: console.log(item + " module coming soon");
                    }
                  }}
                  style={btnStyle}
                >
                  Create
                </button>

                {/* VIEW/SEARCH BUTTON */}
                <button
                  onClick={() => {
                    switch(item) {
                      case "Users": handleUserModuleClick("VIEW"); break;
                      case "Hostels": handleHostelModuleClick("VIEW"); break;
                      case "Rooms": handleRoomModuleClick("VIEW"); break;
                      case "Beds": handleBedModuleClick("VIEW"); break;
                      default: console.log(item + " module coming soon");
                    }
                  }}
                  style={btnStyle}
                >
                  View All
                </button>

                {/* SPECIAL BUTTON FOR BEDS: AVAILABILITY MAP */}
                {item === "Beds" && (
                  <button 
                    onClick={() => handleBedModuleClick("AVAILABLE")} 
                    style={{
                      ...btnStyle, 
                      background: "#e7f3ff", 
                      color: "#007bff", 
                      borderColor: "#007bff",
                      fontWeight: "bold"
                    }}
                  >
                    Check Availability Map
                  </button>
                )}

                {/* MODIFY BUTTON (Redirects to View for selection) */}
                <button
                  onClick={() => {
                    switch(item) {
                      case "Users": handleUserModuleClick("VIEW"); break;
                      case "Hostels": handleHostelModuleClick("VIEW"); break;
                      case "Rooms": handleRoomModuleClick("VIEW"); break;
                      case "Beds": handleBedModuleClick("VIEW"); break;
                      default: console.log(item + " module coming soon");
                    }
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
  padding: "10px",
  cursor: "pointer",
  background: "#f8f9fa",
  border: "1px solid #ced4da",
  borderRadius: "4px",
  fontWeight: "500",
  transition: "0.2s"
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