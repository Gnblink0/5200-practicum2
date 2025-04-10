import { authService } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const handleRequest = async (url, options, retries = 0) => {
  try {
    const response = await fetch(url, options);

    if (response.status === 401 && retries < MAX_RETRIES) {
      // Try to validate auth state
      const isValid = await authService.validateAuth();
      if (isValid) {
        // If validation successful, retry with new headers
        await sleep(RETRY_DELAY);
        return handleRequest(
          url,
          {
            ...options,
            headers: authService.getAuthHeaders(),
          },
          retries + 1
        );
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Request failed:", {
        url,
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(
        errorData.error || `Request failed: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Network error:", error);
    throw error;
  }
};

// Helper function: Convert server error messages to user-friendly messages
const translateErrorMessage = (error) => {
  const errorMessages = {
    "Missing required fields":
      "Please fill in all required appointment information",
    "Doctor not found, inactive, or not verified":
      "The selected doctor is not available for appointments. Please select another doctor.",
    "Doctor not found or inactive":
      "The selected doctor is not available for appointments. Please select another doctor.",
    "Time slot not available or has expired":
      "Sorry, this time slot is no longer available",
    "You already have an appointment during this time":
      "You already have another appointment scheduled during this time",
    "No available schedule found for the selected time slot":
      "This time slot is not available in the doctor's schedule. Please select a different time.",
    "Invalid time range: appointment end time must be after start time":
      "Please ensure the appointment end time is after the start time.",
    "Invalid appointment time: cannot create appointments in the past":
      "Appointments cannot be created for past dates. Please select a future time.",
    "Selected time conflicts with an existing appointment":
      "The doctor already has an appointment during this time slot. Please choose another time.",
    "Can only approve/reject pending appointments":
      "This appointment is no longer pending",
    "Can only cancel pending appointments":
      "You can only cancel pending appointments",
    "Patients can only cancel appointments":
      "You can only cancel this appointment",
  };
  return errorMessages[error] || error;
};

const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-User-Email": localStorage.getItem("userEmail"),
  "X-User-UID": localStorage.getItem("userUID"),
});

export const appointmentService = {
  // Get appointments for a specific user and role
  getAppointments: async (role, userId) => {
    try {
      // Validate inputs
      if (!role || !userId) {
        throw new Error("Invalid role or user ID");
      }

      // Get and validate auth headers
      const headers = authService.getAuthHeaders();
      const email = headers["X-User-Email"];
      const uid = headers["X-User-UID"];

      if (!email || !uid) {
        console.error("Missing auth headers:", { email: !!email, uid: !!uid });
        throw new Error("Authentication required. Please log in again.");
      }

      // Log request details for debugging
      console.log("Fetching appointments with:", {
        role,
        userId,
        headers: {
          email,
          uid,
        },
      });

      const response = await fetch(
        `${API_URL}/appointments/${role.toLowerCase()}/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-User-Email": email,
            "X-User-UID": uid,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Appointment fetch error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(
          errorData.message ||
            `Failed to fetch appointments: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Successfully fetched appointments:", data.length);
      return data;
    } catch (error) {
      console.error("Error in getAppointments:", error);
      throw error;
    }
  },

  // Get doctor's appointments
  getDoctorAppointments: async () => {
    return handleRequest(`${API_URL}/appointments/doctor/appointments`, {
      headers: authService.getAuthHeaders(),
    });
  },

  // Get patient's appointments
  getPatientAppointments: async () => {
    try {
      // Get and validate auth headers
      const headers = authService.getAuthHeaders();
      const email = headers["X-User-Email"];
      const uid = headers["X-User-UID"];

      if (!email || !uid) {
        console.error("Missing auth headers:", { email: !!email, uid: !!uid });
        throw new Error("Authentication required. Please log in again.");
      }

      // Get current user ID from auth state
      const authState = authService.getAuthState();
      if (!authState.user || !authState.user._id) {
        throw new Error("User ID not found. Please log in again.");
      }

      // Log request details for debugging
      console.log("Fetching patient appointments with:", {
        userId: authState.user._id,
        headers: {
          email,
          uid,
        },
      });

      const response = await fetch(
        `${API_URL}/appointments/patient/${authState.user._id}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-User-Email": email,
            "X-User-UID": uid,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Patient appointments fetch error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(
          errorData.message ||
            `Failed to fetch appointments: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Successfully fetched patient appointments:", data.length);
      return data;
    } catch (error) {
      console.error("Error in getPatientAppointments:", error);
      throw error;
    }
  },

  getPatientAppointments: async (userId) => {
    const url = `${API_URL}/appointments/patient/${userId}`;
    return handleRequest(url, {
      headers: authService.getAuthHeaders(),
    });
  },

  // Create a new appointment
  createAppointment: async (appointmentData) => {
    try {
      console.log("Creating appointment with data:", appointmentData);

      const response = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Appointment creation failed:", {
          status: response.status,
          error: errorData,
        });
        throw new Error(translateErrorMessage(errorData.error));
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  // Update an appointment
  updateAppointment: async (id, appointmentData) => {
    return handleRequest(`${API_URL}/appointments/${id}`, {
      method: "PUT",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(appointmentData),
    });
  },

  // Delete an appointment
  deleteAppointment: async (id) => {
    return handleRequest(`${API_URL}/appointments/${id}`, {
      method: "DELETE",
      headers: authService.getAuthHeaders(),
    });
  },

  // Get available time slots for a doctor
  getAvailableTimeSlots: async (doctorId, date) => {
    return handleRequest(
      `${API_URL}/appointments/available-slots/${doctorId}?date=${date}`,
      {
        headers: authService.getAuthHeaders(),
      }
    );
  },

  // Update an appointment status
  updateAppointmentStatus: async (id, status) => {
    console.log("Updating appointment status:", { id, status });
    try {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: "PUT",
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Status update failed:", {
          status: response.status,
          error: errorData,
        });
        throw new Error(translateErrorMessage(errorData.error));
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating appointment status:", error);
      throw error;
    }
  },

  // Get all appointments (admin only)
  getAllAppointments: async (filters = {}) => {
    try {
      // Get and validate auth headers
      const headers = authService.getAuthHeaders();
      const email = headers["X-User-Email"];
      const uid = headers["X-User-UID"];

      if (!email || !uid) {
        console.error("Missing auth headers:", { email: !!email, uid: !!uid });
        throw new Error("Authentication required. Please log in again.");
      }

      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const url = `${API_URL}/appointments/all?${queryParams.toString()}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Appointments fetch error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(
          errorData.message ||
            `Failed to fetch appointments: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error in getAllAppointments:", error);
      throw error;
    }
  },
};
