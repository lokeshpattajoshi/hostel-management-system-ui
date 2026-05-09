import React, { useState } from "react";

const CreateUser = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "TENANT", // Default role from your Enum
    password: ""    // Matches UserRequestDTO field
  });

  const [errors, setErrors] = useState({});

  // ✅ 1. Define the validate function here
  const validate = () => {
    let tempErrors = {};
    if (!formData.fullName.trim()) tempErrors.fullName = "Full Name is required";
    
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      tempErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }

    setErrors(tempErrors);
    
    // Returns true if errors object is empty
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field as user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px", background: "#fff" }}>
      <h3>Create New User</h3>

      {/* Full Name */}
      <div style={{ marginBottom: "15px" }}>
        <label>Full Name <span style={{ color: "red" }}>*</span></label>
        <input
          name="fullName"
          type="text"
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          value={formData.fullName}
          onChange={handleInputChange}
        />
        {errors.fullName && <p style={{ color: "red", fontSize: "12px", margin: "4px 0" }}>{errors.fullName}</p>}
      </div>

      {/* Email */}
      <div style={{ marginBottom: "15px" }}>
        <label>Email <span style={{ color: "red" }}>*</span></label>
        <input
          name="email"
          type="email"
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          value={formData.email}
          onChange={handleInputChange}
        />
        {errors.email && <p style={{ color: "red", fontSize: "12px", margin: "4px 0" }}>{errors.email}</p>}
      </div>

      {/* Phone Number */}
      <div style={{ marginBottom: "15px" }}>
        <label>Phone Number</label>
        <input
          name="phoneNumber"
          type="text"
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          value={formData.phoneNumber}
          onChange={handleInputChange}
        />
      </div>

      {/* Role Dropdown */}
      <div style={{ marginBottom: "15px" }}>
        <label>Role <span style={{ color: "red" }}>*</span></label>
        <select
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        >
          <option value="ADMIN">ADMIN</option>
          <option value="SUPERVISOR">SUPERVISOR</option>
          <option value="SALES">SALES</option>
          <option value="TENANT">TENANT</option>
        </select>
      </div>

      {/* Password */}
      <div style={{ marginBottom: "15px" }}>
        <label>Password <span style={{ color: "red" }}>*</span></label>
        <input
          name="password"
          type="password"
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          value={formData.password}
          onChange={handleInputChange}
        />
        {errors.password && <p style={{ color: "red", fontSize: "12px", margin: "4px 0" }}>{errors.password}</p>}
      </div>

      {/* ✅ 2. validate() is now called on click */}
      <div style={{ marginTop: "20px" }}>
        <button 
          onClick={() => validate() && onSave(formData)} 
          style={{ background: "green", color: "white", padding: "10px 20px", border: "none", cursor: "pointer" }}
        >
          Save User
        </button>
        <button 
          onClick={onCancel} 
          style={{ marginLeft: "10px", padding: "10px 20px" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateUser;