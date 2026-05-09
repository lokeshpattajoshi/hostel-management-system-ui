const API_BASE_URL = "http://localhost:8080/api";

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
      return null;
    }

    // Handle No Content (Delete/Empty Results)
    if (response.status === 204) return [];

    const text = await response.text();
    if (!text) return []; // Return empty array if body is empty string

    try {
      return JSON.parse(text); // Try to parse as JSON
    } catch (e) {
      return text; // Return as plain text if not JSON
    }
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
};

export const login = async (email, password) => {
  return await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Ensure the key name (email) matches your Backend DTO
    body: JSON.stringify({ email: email, password: password }),
  });
};

// --- Updated API Functions (Removed .json() because helper does it) ---

export const fetchUsersApi = () => fetchWithAuth("/users");
export const createUserApi = (data) => fetchWithAuth("/users", { method: "POST", body: JSON.stringify(data) });
export const updateUserApi = (id, data) => fetchWithAuth(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteUserApi = (id) => fetchWithAuth(`/users/${id}`, { method: "DELETE" });

export const fetchHostelsApi = () => fetchWithAuth("/hostels");
export const createHostelApi = (data) => fetchWithAuth("/hostels", { method: "POST", body: JSON.stringify(data) });
export const updateHostelApi = (id, data) => fetchWithAuth(`/hostels/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteHostelApi = (id) => fetchWithAuth(`/hostels/${id}`, { method: "DELETE" });

export const fetchRoomsByHostelApi = () => fetchWithAuth("/rooms");
export const createRoomApi = (data) => fetchWithAuth("/rooms", { method: "POST", body: JSON.stringify(data) });
export const updateRoomApi = (id, data) => fetchWithAuth(`/rooms/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteRoomApi = (id) => fetchWithAuth(`/rooms/${id}`, { method: "DELETE" });

export const fetchBedsByHostelApi = (name = "") => 
  fetchWithAuth(name ? `/beds/search?hostelName=${encodeURIComponent(name)}` : "/beds");

export const fetchAvailableBedsApi = (roomId) => fetchWithAuth(`/beds/available?roomId=${roomId}`);
export const createBedApi = (data) => fetchWithAuth("/beds", { method: "POST", body: JSON.stringify(data) });
export const updateBedApi = (id, data) => fetchWithAuth(`/beds/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteBedApi = (id) => fetchWithAuth(`/beds/${id}`, { method: "DELETE" });