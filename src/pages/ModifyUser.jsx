import React, { useState } from "react";

const ModifyUser = ({ user, onUpdate, onCancel }) => {
  // Initialize state with all fields from the user object
  const [formData, setFormData] = useState({
    userId: user.userId, // Ensure ID is kept for the PUT request
    fullName: user.fullName || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || "",
    role: user.role || "TENANT",
    isActive: user.isActive ?? true,
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};
    if (!formData.fullName.trim()) tempErrors.fullName = "Full Name is required";
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Invalid email format";
    }
    if (!formData.role) tempErrors.role = "Role is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div style={{ border: "2px solid #007bff", padding: "20px", borderRadius: "8px", background: "#fff" }}>
      <h3>Modify User</h3>

      {/* Full Name */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Full Name *</label>
        <input
          name="fullName"
          type="text"
          style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          value={formData.fullName}
          onChange={handleInputChange}
        />
        {errors.fullName && <p style={{ color: "red", fontSize: "12px", margin: "4px 0" }}>{errors.fullName}</p>}
      </div>

      {/* Email */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Email *</label>
        <input
          name="email"
          type="email"
          style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          value={formData.email}
          onChange={handleInputChange}
        />
        {errors.email && <p style={{ color: "red", fontSize: "12px", margin: "4px 0" }}>{errors.email}</p>}
      </div>

      {/* Phone Number */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Phone Number</label>
        <input
          name="phoneNumber"
          type="text"
          style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          value={formData.phoneNumber}
          onChange={handleInputChange}
        />
      </div>

      {/* Role Dropdown */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Role *</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
        >
          <option value="ADMIN">ADMIN</option>
          <option value="SUPERVISOR">SUPERVISOR</option>
          <option value="SALES">SALES</option>
          <option value="TENANT">TENANT</option>
        </select>
      </div>

      {/* Is Active Toggle */}
      <div style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}>
        <input
          name="isActive"
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={handleInputChange}
          style={{ marginRight: "10px", cursor: "pointer" }}
        />
        <label htmlFor="isActive" style={{ cursor: "pointer" }}>User is Active</label>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => validate() && onUpdate(formData)}
          style={{
            background: "#007bff",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Update User
        </button>
        <button
          onClick={onCancel}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            border: "1px solid #ccc",
            background: "#fff"
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ModifyUser;