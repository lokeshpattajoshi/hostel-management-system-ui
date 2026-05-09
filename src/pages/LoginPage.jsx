import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ Auto-clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Validation
    if (!email || !password) {
      setError("Email and Password are required");
      return;
    }

    setLoading(true);

    try {
      // 1. Call the login function
      const response = await login(email, password);

      // 2. IMPORTANT: Since our api.js returns the raw 'response' for login 
      // (as seen in the login function we wrote earlier), we handle it here:
      if (response.ok) {
        const data = await response.json(); // Still need .json() for the raw login fetch
        
        if (data && data.token) {
          localStorage.setItem("token", data.token);
          navigate("/home");
        } else {
          setError("Invalid login response from server");
        }
      } else {
        // If the email is coming back as null on the backend, 
        // double-check the 'login' function in api.js 
        // matches the keys { email, password }
        setError("Invalid email or password.");
      }
    } catch (err) {
      setError("Connection failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "350px",
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Login</h2>

        {error && (
          <div
            style={{
              background: "#ffdddd",
              color: "#a10000",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Email Address
          </label>
          <input
            type="email" // Changed from text to email for better validation
            name="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: loading ? "#999" : "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  boxSizing: "border-box", // Prevents input from overflowing form width
};

export default LoginPage;