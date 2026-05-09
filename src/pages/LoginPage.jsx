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
      const data = await login(email, password);

      if (!data || !data.token) {
        setError("Invalid login response from server");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/home");
    } catch (err) {
      setError(
        err?.message || "Invalid email or password. Please try again."
      );
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

        {/* ✅ Error message at top */}
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

        {/* Email */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Email Address
          </label>
          <input
            type="text"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* Submit Button */}
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

export default LoginPage;