// --- CRITICAL CONFIGURATION ---
// Using process.env to match Create React App specs
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Helper to handle Authentication, HTTP Errors, and JSON parsing safely.
 * Returns { error: true, status, message } on failure to prevent false success states.
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
      return { error: true, status: 401, message: "Unauthorized / Session Expired" };
    }

    // Handle No Content (Delete or empty results)
    if (response.status === 204) return [];

    const text = await response.text();
    let parsedData = null;

    if (text) {
      try {
        parsedData = JSON.parse(text);
      } catch (e) {
        parsedData = text; // Fallback to raw string if not JSON
      }
    }

    // ✅ CHECK FOR HTTP ERROR STATUSES (400, 404, 500, etc.)
    if (!response.ok) {
      const errorMessage =
        (typeof parsedData === "object" && (parsedData?.message || parsedData?.error)) ||
        `Server error (${response.status})`;

      console.error(`API Error [${response.status}] on ${endpoint}:`, parsedData);

      return {
        error: true,
        status: response.status,
        message: errorMessage,
        data: parsedData,
      };
    }

    return parsedData ?? [];
  } catch (error) {
    console.error("Fetch Network Error:", error);
    return {
      error: true,
      status: 0,
      message: "Network error or server unreachable.",
    };
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: true, message: errorData.message || "Invalid credentials" };
    }

    return await response.json();
  } catch (error) {
    console.error("Login Network Error:", error);
    return { error: true, message: "Cannot connect to server. Please check your connection." };
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

/**
 * Universal helper for paginated endpoints (Tenants & Approvals).
 * Loops through pages dynamically until `last: true` or all pages are fetched.
 */
export const fetchAllPages = async (endpoint, baseParams = {}, pageSize = 100) => {
  let allRecords = [];
  let currentPage = 0;
  let isLastPage = false;

  while (!isLastPage) {
    const params = new URLSearchParams(baseParams);
    params.append("pageNumber", currentPage);
    params.append("pageSize", pageSize);

    const response = await fetchWithAuth(`${endpoint}?${params.toString()}`);

    if (response && Array.isArray(response.content)) {
      allRecords = [...allRecords, ...response.content];
      isLastPage = response.last !== undefined 
        ? response.last 
        : currentPage + 1 >= (response.totalPages || 1);
      currentPage++;
    } else if (Array.isArray(response)) {
      // Fallback in case endpoint returns a flat array
      return response;
    } else {
      break;
    }
  }

  return allRecords;
};

export const fetchAllTenantsForDropdownApi = (hostelId = "") => {
  const queryParams = {};
  if (hostelId) queryParams.hostelId = hostelId;
  return fetchAllPages("/tenants", queryParams, 100);
};

// --- TENANTS ---
export const fetchTenantsApi = (name = "", phone = "", hostelId = "", pageNumber = 0, pageSize = 10) => {
  const params = new URLSearchParams();

  if (name && name.trim()) params.append("name", name.trim());
  if (phone && phone.trim()) params.append("phone", phone.trim());
  if (hostelId) params.append("hostelId", hostelId);

  // Append pagination metadata
  params.append("pageNumber", pageNumber);
  params.append("pageSize", pageSize);

  return fetchWithAuth(`/tenants?${params.toString()}`);
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
  return await fetchWithAuth("/reports/dashboard-summary", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const fetchIncomeReportDetailsApi = async (hostelId, startDate, endDate) => {
  const url = `/income?hostelId=${hostelId}&startDate=${startDate}&endDate=${endDate}`;
  return await fetchWithAuth(url);
};

export const fetchExpenseReportDetailsApi = async (hostelId, startDate, endDate) => {
  const url = `/expenses/hostel/${hostelId}/date-range?startDate=${startDate}&endDate=${endDate}`;
  return await fetchWithAuth(url);
};

// --- APPROVALS QUEUE SYSTEM ---
export const createApprovalRequestApi = (data) => 
  fetchWithAuth("/approvals", { method: "POST", body: JSON.stringify(data) });

/**
 * Fetch all pending administrative approvals ledger entries.
 * GET /api/approval/pending
 */
export const fetchPendingApprovalsApi = (pageNumber = 0, pageSize = 10) => {
  const params = new URLSearchParams();
  params.append("page", pageNumber);
  params.append("size", pageSize);

  return fetchWithAuth(`/approval/pending?${params.toString()}`);
};


export const fetchAllHostelsForDropdownApi = () => {
  return fetchAllPages("/hostels", {}, 100);
};

export const fetchAllAdminsForDropdownApi = async () => {
  try {
    // Calling /users directly
    const response = await fetchWithAuth("/users");
    
    // Safely extract array regardless of wrapper structure
    const users = Array.isArray(response)
      ? response
      : response?.data || response?.content || [];

    // Filter for admin users if roles are present, otherwise return full user list
    const admins = users.filter(user => {
      const role = user.role || user.userRole;
      if (typeof role === 'string') {
        return role.toUpperCase().includes('ADMIN');
      }
      if (Array.isArray(user.roles)) {
        return user.roles.some(r => String(r).toUpperCase().includes('ADMIN'));
      }
      return true; // Fallback: return all users if no role field exists
    });

    return admins.length > 0 ? admins : users;
  } catch (error) {
    console.error("Error fetching users for admin dropdown:", error);
    return [];
  }
};

/**
 * Authorize a pending system changes event record.
 * POST /api/approval/{id}/approve?approvedBy={adminId}
 */
export const approveRequestApi = async (id, adminId, remarks) => {
  const url = `/approval/${id}/approve?approvedBy=${encodeURIComponent(adminId)}`;
  return await fetchWithAuth(url, { method: 'POST' });
};

/**
 * Decline and turn back an authorization request.
 * POST /api/approval/{id}/reject?approvedBy={adminId}&reason={remarks}
 */
export const rejectRequestApi = async (id, adminId, remarks) => {
  const url = `/approval/${id}/reject?approvedBy=${encodeURIComponent(adminId)}&reason=${encodeURIComponent(remarks)}`;
  return await fetchWithAuth(url, { method: 'POST' });
};

export const fetchMyPendingApprovalsApi = async (page = 0, size = 10) => {
  return await fetchWithAuth(`/approval/pending?page=${page}&size=${size}`);
};