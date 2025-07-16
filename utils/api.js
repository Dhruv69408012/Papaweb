const API_BASE_URL = "http://localhost:5000/api";

// Generic API call function
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
}

// Products API calls
export const productsAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value);
      }
    });
    return apiCall(`/products?${searchParams.toString()}`);
  },

  getById: (id) => apiCall(`/products/${id}`),

  getSymptoms: () => apiCall("/products/symptoms/all"),

  getCategories: () => apiCall("/products/categories/all"),
};

// Remedies API calls
export const remediesAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value);
      }
    });
    return apiCall(`/remedies?${searchParams.toString()}`);
  },

  getById: (id) => apiCall(`/remedies/${id}`),

  getSymptoms: () => apiCall("/remedies/symptoms/all"),

  getCategories: () => apiCall("/remedies/categories/all"),
};

// Health check
export const healthCheck = () => apiCall("/health");
