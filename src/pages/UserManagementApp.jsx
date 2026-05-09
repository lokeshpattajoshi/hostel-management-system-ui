import React, { useState, useEffect } from "react";
// Import the functions from your API.js
import { 
  fetchUsersApi, 
  createUserApi, 
  updateUserApi, 
  deleteUserApi 
} from "../services/api"; 
import CreateUser from "./CreateUser";
import ViewUser from "./ViewUser";
import ModifyUser from "./ModifyUser";

const UserManagementApp = ({ initialView = "VIEW" }) => {
  const [view, setView] = useState(initialView);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  // 1. Fetch Users using the new API service
  const fetchUsers = async (query = "") => {
    try {
      const data = await fetchUsersApi(query);
      setUsers(data);
      setError("");
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load users. Please check your connection or login again.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Handle Save (Create or Update)
  const handleSave = async (userData) => {
    try {
      if (view === "CREATE") {
        // Map fields to match UserRequestDTO
        const payload = {
          fullName: userData.fullName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          role: userData.role,
          password: userData.password // Mapping 'password' for DTO
        };
        await createUserApi(payload);
      } else {
        // Update uses existing userData including userId
        await updateUserApi(userData.userId, userData);
      }
      
      setView("VIEW");
      fetchUsers();
    } catch (err) {
      alert("Error saving user: " + err.message);
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUserApi(id);
        fetchUsers();
      } catch (err) {
        alert("Could not delete user.");
      }
    }
  };

  return (
    <div style={{ padding: "10px" }}>
      {/* Error display if API fails */}
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

      {view === "VIEW" && (
        <ViewUser 
          users={users} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onSearch={() => fetchUsers(searchQuery)} 
          onDelete={handleDelete}
          onEdit={(u) => { 
            setCurrentUser(u); 
            setView("MODIFY"); 
          }} 
        />
      )}

      {view === "CREATE" && (
        <CreateUser 
          onSave={handleSave} 
          onCancel={() => setView("VIEW")} 
        />
      )}

      {view === "MODIFY" && (
        <ModifyUser 
          user={currentUser} 
          onUpdate={handleSave} 
          onCancel={() => setView("VIEW")} 
        />
      )}
    </div>
  );
};

export default UserManagementApp;