import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const onLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      // navigate("/", { replace: true }) ensures the login page 
      // becomes the top of the stack and history is wiped.
      navigate("/", { replace: true });
    }
  };

  return (
    <div style={{
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      padding: "10px 20px", 
      background: "#007bff", 
      color: "white",
      marginBottom: "20px"
    }}>
      <h3 style={{ margin: 0 }}>Hostel Management System</h3>
      <button 
        onClick={onLogout}
        style={{
          background: "#dc3545",
          color: "white",
          border: "none",
          padding: "8px 15px",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Header;