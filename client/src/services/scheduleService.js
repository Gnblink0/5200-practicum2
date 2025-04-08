import { authService } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

const handleRequest = async (url, options, retries = 0) => {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 401 && retries < 2) {
      // Try to validate auth state
      const isValid = await authService.validateAuth();
      if (isValid) {
        // If validation successful, retry with new headers
        await new Promise(resolve => setTimeout(resolve, 1000));
        return handleRequest(url, {
          ...options,
          headers: authService.getAuthHeaders()
        }, retries + 1);
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.verificationStatus === "pending") {
        throw new Error(errorData.message || "Please wait for admin verification");
      }
      throw new Error(errorData.error || response.statusText || "Request failed");
    }
    
    return response.json();
  } catch (error) {
    if (error.message.includes("Failed to fetch")) {
      console.error("Network error:", error);
      throw new Error("Network error. Please check your connection.");
    }
    throw error;
  }
};

export const scheduleService = {
  // Get doctor's schedules (renamed to match backend)
  getSchedules: async () => {
    return handleRequest(`${API_URL}/schedules`, {
      headers: authService.getAuthHeaders()
    });
  },

  // Create a new schedule
  createSchedule: async (scheduleData) => {
    return handleRequest(`${API_URL}/schedules`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(scheduleData)
    });
  },

  // Update a schedule
  updateSchedule: async (id, scheduleData) => {
    return handleRequest(`${API_URL}/schedules/${id}`, {
      method: "PUT",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(scheduleData)
    });
  },

  // Delete a schedule
  deleteSchedule: async (id) => {
    return handleRequest(`${API_URL}/schedules/${id}`, {
      method: "DELETE",
      headers: authService.getAuthHeaders()
    });
  }
};

console.log({
  email: localStorage.getItem("userEmail"),
  uid: localStorage.getItem("userUID"),
});
