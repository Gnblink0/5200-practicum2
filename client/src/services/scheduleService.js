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
      console.error('Schedule request failed:', {
        url,
        status: response.status,
        error: errorData
      });

      if (errorData.verificationStatus) {
        throw new Error(errorData.message || `Please wait for admin verification (${errorData.verificationStatus})`);
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
  // Get doctor's schedules
  getSchedules: async () => {
    try {
      const schedules = await handleRequest(`${API_URL}/schedules`, {
        headers: authService.getAuthHeaders()
      });
      console.log('Retrieved schedules:', schedules);
      return schedules;
    } catch (error) {
      console.error('Error getting schedules:', error);
      throw error;
    }
  },

  // Create a new schedule
  createSchedule: async (scheduleData) => {
    try {
      console.log('Creating schedule with data:', scheduleData);
      const schedule = await handleRequest(`${API_URL}/schedules`, {
        method: "POST",
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(scheduleData)
      });
      console.log('Created schedule:', schedule);
      return schedule;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  },

  // Update a schedule
  updateSchedule: async (id, scheduleData) => {
    try {
      console.log('Updating schedule:', { id, scheduleData });
      const schedule = await handleRequest(`${API_URL}/schedules/${id}`, {
        method: "PUT",
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(scheduleData)
      });
      console.log('Updated schedule:', schedule);
      return schedule;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  },

  // Delete a schedule
  deleteSchedule: async (id) => {
    try {
      console.log('Deleting schedule:', id);
      const result = await handleRequest(`${API_URL}/schedules/${id}`, {
        method: "DELETE",
        headers: authService.getAuthHeaders()
      });
      console.log('Deleted schedule:', result);
      return result;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }
};

console.log({
  email: localStorage.getItem("userEmail"),
  uid: localStorage.getItem("userUID"),
});
