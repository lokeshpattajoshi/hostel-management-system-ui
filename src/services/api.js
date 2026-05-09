const BASE_URL = "http://localhost:8080/api";

// --- Existing Login ---
export const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
};

// --- Existing Helper ---
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  return fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

// --- New User Management Functions ---

// Fetch all or search users
export const fetchUsersApi = async (query = "") => {
  const endpoint = query 
    ? `/users/search?name=${encodeURIComponent(query)}&email=${encodeURIComponent(query)}&phoneNumber=${encodeURIComponent(query)}`
    : "/users";
    
  const response = await fetchWithAuth(endpoint, { method: "GET" });
  
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

// Create a new user
export const createUserApi = async (userData) => {
  const response = await fetchWithAuth("/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });

  if (!response.ok) throw new Error("Failed to create user");
  return response.json();
};

// Update an existing user
export const updateUserApi = async (id, userData) => {
  const response = await fetchWithAuth(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });

  if (!response.ok) throw new Error("Failed to update user");
  return response.json();
};

// Delete a user
export const deleteUserApi = async (id) => {
  const response = await fetchWithAuth(`/users/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete user");
  // Delete often returns 204 No Content, so we don't always call .json()
  return response; 
};

// --- Hostel Management Functions ---

export const fetchHostelsApi = async (name = "") => {
  const endpoint = name ? `/hostels?name=${encodeURIComponent(name)}` : "/hostels";
  const response = await fetchWithAuth(endpoint, { method: "GET" });
  if (!response.ok) throw new Error("Failed to fetch hostels");
  return response.json();
};

export const createHostelApi = async (hostelData) => {
  const response = await fetchWithAuth("/hostels", {
    method: "POST",
    body: JSON.stringify(hostelData),
  });
  if (!response.ok) throw new Error("Failed to create hostel");
  return response.json();
};

export const updateHostelApi = async (id, hostelData) => {
  const response = await fetchWithAuth(`/hostels/${id}`, {
    method: "PUT",
    body: JSON.stringify(hostelData),
  });
  if (!response.ok) throw new Error("Failed to update hostel");
  return response.json();
};

export const deleteHostelApi = async (id) => {
  const response = await fetchWithAuth(`/hostels/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete hostel");
  return response;
};