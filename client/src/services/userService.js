import { authService } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

const handleRequest = async (url, options, retries = 0) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: authService.getAuthHeaders(),
    });

    if (response.status === 401 && retries < 2) {
      const isValid = await authService.validateAuth();
      if (isValid) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return handleRequest(url, options, retries + 1);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Request failed:", {
        status: response.status,
        error: errorData.error,
        url,
        method: options?.method,
      });
      throw new Error(errorData.error || "Request failed");
    }

    return response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

export const userService = {
  // Register new user
  async register(userData) {
    console.log("Registering user with data:", userData);
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.text();
      console.log("Server response:", data);

      if (!response.ok) {
        try {
          const error = JSON.parse(data);
          throw new Error(error.error || "Failed to register user");
        } catch (e) {
          throw new Error(`Server error: ${data} (${e.message})`);
        }
      }

      try {
        return JSON.parse(data);
      } catch (e) {
        throw new Error(`Invalid JSON response from server: ${e.message}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Get all users
  async getAllUsers() {
    return handleRequest(`${API_URL}/users`);
  },

  // Get user profile
  async getUserProfile() {
    return handleRequest(`${API_URL}/users/profile`);
  },

  // Update user profile
  async updateUserProfile(userData) {
    return handleRequest(`${API_URL}/users/profile`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  // Update user status (active/inactive)
  async updateUserStatus(userId, isActive) {
    return handleRequest(`${API_URL}/users/${userId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isActive }),
    });
  },
};
