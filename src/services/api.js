// --- CRITICAL CONFIGURATION ---
// Using process.env to match Create React App specs
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Robust helper to handle Authentication and JSON parsing safely.
 * Enforces array type protections to systematically prevent ".filter() is not a function" crashes.
 */
export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    // Handle Session Expiry / Unauthorized Access
    if (response.status === 401) {
      const authEvent = new CustomEvent("api-auth-failure", { detail: { status: 401 } });
      window.dispatchEvent(authEvent);
      localStorage.clear();
      window.location.href = "/";
      return null;
    }

    // Handle No Content (Delete or empty results)
    if (response.status === 204) return [];

    const text = await response.text();
    if (!text) return []; 

    try {
      const parsedData = JSON.parse(text);
      
      // Intercept backend Error/Exception JSON objects to preserve React loops
      if (parsedData && typeof parsedData === "object" && (parsedData.status || parsedData.error)) {
        console.warn(`Intercepted a backend error object on ${endpoint}:`, parsedData);
        return [];
      }
      
      return parsedData;
    } catch (e) {
      return text; // Return as string if not valid JSON
    }
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
};

// --- AUTH ---
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // If the server returns an error status (like 400 or 401)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || "Invalid credentials" };
    }

    // Safely parse the response into a JSON object (contains your token, etc.)
    return await response.json();
  } catch (error) {
    console.error("Login Network Error:", error);
    return { error: "Cannot connect to server. Please check your connection." };
  }
};

// --- USERS ---
export const fetchUsersApi = () => fetchWithAuth("/users");
export const searchUsersApi = (role) => fetchWithAuth(`/users/search?role=${role}`);
export const fetchAdminUsersApi = () => fetchWithAuth("/users/search?role=ADMIN");
export const createUserApi = (data) => fetchWithAuth("/users", { method: "POST", body: JSON.stringify(data) });
export const updateUserApi = (id, data) => fetchWithAuth(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteUserApi = (id) => fetchWithAuth(`/users/${id}`, { method: "DELETE" });

// --- HOSTELS ---
export const fetchHostelsApi = () => fetchWithAuth("/hostels");
export const createHostelApi = (data) => fetchWithAuth("/hostels", { method: "POST", body: JSON.stringify(data) });
export const updateHostelApi = (id, data) => fetchWithAuth(`/hostels/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteHostelApi = (id) => fetchWithAuth(`/hostels/${id}`, { method: "DELETE" });

// --- ROOMS ---
export const fetchRoomsApi = () => fetchWithAuth("/rooms");
export const fetchRoomsByHostelApi = (hostelId) => fetchWithAuth(`/rooms/hostel/${hostelId}`);
export const fetchRoomsByHostelNameApi = (name) => fetchWithAuth(`/rooms/search?hostelName=${encodeURIComponent(name)}`);
export const createRoomApi = (data) => fetchWithAuth("/rooms", { method: "POST", body: JSON.stringify(data) });
export const updateRoomApi = (id, data) => fetchWithAuth(`/rooms/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteRoomApi = (id) => fetchWithAuth(`/rooms/${id}`, { method: "DELETE" });

// --- BEDS ---
export const fetchBedsApi = () => fetchWithAuth("/beds");
export const fetchBedsByHostelApi = (name = "") => 
  fetchWithAuth(name ? `/beds/search?hostelName=${encodeURIComponent(name)}` : "/beds");
export const fetchAvailableBedsApi = (roomId) => fetchWithAuth(`/beds/available?roomId=${roomId}`);
export const createBedApi = (data) => fetchWithAuth("/beds", { method: "POST", body: JSON.stringify(data) });
export const updateBedApi = (id, data) => fetchWithAuth(`/beds/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteBedApi = (id) => fetchWithAuth(`/beds/${id}`, { method: "DELETE" });

// --- TENANTS ---
export const fetchTenantsApi = (name = "", phone = "", hostelId = "") => {
  const query = `name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&hostelId=${hostelId}`;
  return fetchWithAuth(`/tenants?${query}`);
};
export const createTenantApi = (data) => fetchWithAuth("/tenants", { method: "POST", body: JSON.stringify(data) });
export const updateTenantApi = (id, data) => fetchWithAuth(`/tenants/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteTenantApi = (id) => fetchWithAuth(`/tenants/${id}`, { method: "DELETE" });

// --- EXPENSES ---
export const fetchExpensesApi = (type = "") => 
  fetchWithAuth(`/expenses${type ? `?expenseType=${encodeURIComponent(type)}` : ""}`);
export const searchExpensesApi = (type) => fetchWithAuth(`/expenses?expenseType=${encodeURIComponent(type)}`);
export const createExpenseApi = (data) => fetchWithAuth("/expenses", { method: "POST", body: JSON.stringify(data) });
export const updateExpenseApi = (id, data) => fetchWithAuth(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteExpenseApi = (id) => fetchWithAuth(`/expenses/${id}`, { method: "DELETE" });

// --- INCOME MANAGEMENT ---
export const getIncomeByIdApi = (incomeId) => fetchWithAuth(`/income/${incomeId}`);
export const createIncomeApi = (data) => fetchWithAuth("/income", { method: "POST", body: JSON.stringify(data) });
export const updateIncomeApi = (id, data) => fetchWithAuth(`/income/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteIncomeApi = (id) => fetchWithAuth(`/income/${id}`, { method: "DELETE" });

export const searchIncomeApi = (filters) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== "") {
      params.append(key, filters[key]);
    }
  });
  return fetchWithAuth(`/income?${params.toString()}`);
};

export const fetchPendingTenantChargesApi = (tenantId) => 
  fetchWithAuth(`/tenant-charges?tenantId=${tenantId}&status=PENDING`);

// --- RESTORED REPORTING METHODS ---
export const fetchDashboardSummaryApi = async (payload) => {
  try {
    return await fetchWithAuth("/reports/dashboard-summary", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Error generating dashboard summary parameters:", error);
    return null;
  }
};

export const fetchIncomeReportDetailsApi = async (hostelId, startDate, endDate) => {
  try {
    const url = `/income?hostelId=${hostelId}&startDate=${startDate}&endDate=${endDate}`;
    return await fetchWithAuth(url);
  } catch (error) {
    console.error("Error routing out income detailed report:", error);
    return [];
  }
};

export const fetchExpenseReportDetailsApi = async (hostelId, startDate, endDate) => {
  try {
    const url = `/expenses/hostel/${hostelId}/date-range?startDate=${startDate}&endDate=${endDate}`;
    return await fetchWithAuth(url);
  } catch (error) {
    console.error("Error routing out expense detailed report:", error);
    return [];
  }
};