
/*
 * All communication with the Express/MongoDB backend lives here.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { method = "GET", body, token } = {}) {
  const headers = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    console.error("API connection error:", error);

    throw new ApiError(
      "Could not reach the server. Please check whether the backend is running.",
      0
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message || data?.error || `Request failed (${response.status})`,
      response.status
    );
  }

  return data;
}

// Build hospital search query parameters.
function buildHospitalSearchParams(filters = {}) {
  const params = new URLSearchParams();

  const state = String(filters.state || "").trim();
  const district = String(filters.district || "").trim();
  const city = String(filters.city || "").trim();
  const hospitalName = String(filters.hospitalName || "").trim();

  if (state) params.set("state", state);
  if (district) params.set("district", district);
  if (city) params.set("city", city);

  // The backend route expects the hospital name in the "name" parameter.
  if (hospitalName) params.set("name", hospitalName);

  return params.toString();
}

export const api = {
  // ---------------- AUTH ----------------

  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  verifyLoginOtp: (email, otp) =>
    request("/auth/verify-login-otp", {
      method: "POST",
      body: { email, otp },
    }),

  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: payload,
    }),

  // ---------------- DONORS ----------------

  getDonors: () => request("/donors"),

  getNearbyDonors: (lat, lng) => {
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
    });

    return request(`/donors/nearby?${params.toString()}`);
  },

  getMyDonorProfile: (token) =>
    request("/donors/me", { token }),

  registerDonor: (payload, token) =>
    request("/donors", {
      method: "POST",
      body: payload,
      token,
    }),

  // ---------------- HOSPITALS ----------------

  getHospitals: () => request("/hospitals"),

  searchHospitals: async (filters = {}) => {
    const query = buildHospitalSearchParams(filters);
    const path = query
      ? `/hospitals/search?${query}`
      : "/hospitals/search";

    const result = await request(path);

    // Expected backend response:
    // { source: "Geoapify", count: 15, data: [...] }
    if (Array.isArray(result)) {
      return {
        source: "Geoapify",
        count: result.length,
        data: result,
      };
    }

    if (result && Array.isArray(result.data)) {
      return {
        ...result,
        count: result.count ?? result.data.length,
        data: result.data,
      };
    }

    if (result && Array.isArray(result.hospitals)) {
      return {
        ...result,
        count: result.count ?? result.hospitals.length,
        data: result.hospitals,
      };
    }

    console.warn("Unexpected hospital search response:", result);

    return {
      source: result?.source || "Unknown",
      count: 0,
      data: [],
      warning: result?.warning || "No hospital data was returned.",
    };
  },

  
  // ---------------- REFERRALS ----------------

  getMyReferral: (token) =>
    request("/referrals/mine", { token }),

  getReferralHistory: (token) =>
    request("/referrals/history", { token }),

  recordReferralRegistration: (referralCode, token) =>
    request("/referrals/record", {
      method: "POST",
      body: { referralCode },
      token,
    }),


  // ---------------- EMERGENCY REQUESTS ----------------

  getEmergencyRequests: () =>
    request("/emergency"),

  createEmergencyRequest: (payload) =>
    request("/emergency", {
      method: "POST",
      body: payload,
    }),
};
