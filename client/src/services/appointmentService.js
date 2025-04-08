import { authService } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const handleRequest = async (url, options, retries = 0) => {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 401 && retries < MAX_RETRIES) {
      // Try to validate auth state
      const isValid = await authService.validateAuth();
      if (isValid) {
        // If validation successful, retry with new headers
        await sleep(RETRY_DELAY);
        return handleRequest(url, {
          ...options,
          headers: authService.getAuthHeaders()
        }, retries + 1);
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Request failed:', {
        url,
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData.error || `Request failed: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

// Helper function: Convert server error messages to user-friendly messages
const translateErrorMessage = (error) => {
  const errorMessages = {
    "Missing required fields": "Please fill in all required appointment information",
    "Doctor not found or inactive": "Sorry, this doctor is currently not available for appointments",
    "Time slot not available or has expired": "Sorry, this time slot is no longer available",
    "You already have an appointment during this time": "You already have another appointment scheduled during this time",
    "No available schedule found for the selected time slot": "This time slot is not available in the doctor's schedule. Please select a different time.",
    "Invalid time range: appointment end time must be after start time": "Please ensure the appointment end time is after the start time.",
    "Invalid appointment time: cannot create appointments in the past": "Appointments cannot be created for past dates. Please select a future time.",
    "Selected time conflicts with an existing appointment": "The doctor already has an appointment during this time slot. Please choose another time.",
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
        throw new Error('Invalid role or user ID');
      }

      // Get and validate auth headers
      const headers = authService.getAuthHeaders();
      const email = headers['X-User-Email'];
      const uid = headers['X-User-UID'];

      if (!email || !uid) {
        console.error('Missing auth headers:', { email: !!email, uid: !!uid });
        throw new Error('Authentication required. Please log in again.');
      }

      // Log request details for debugging
      console.log('Fetching appointments with:', {
        role,
        userId,
        headers: {
          email,
          uid
        }
      });

      const response = await fetch(`${API_URL}/appointments/${role.toLowerCase()}/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': email,
          'X-User-UID': uid
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Appointment fetch error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `Failed to fetch appointments: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Successfully fetched appointments:', data.length);
      return data;
    } catch (error) {
      console.error('Error in getAppointments:', error);
      throw error;
    }
  },

  // Get doctor's appointments
  getDoctorAppointments: async () => {
    return handleRequest(`${API_URL}/appointments/doctor/appointments`, {
      headers: authService.getAuthHeaders()
    });
  },

  // Get patient's appointments
  getPatientAppointments: async () => {
    try {
      // Get and validate auth headers
      const headers = authService.getAuthHeaders();
      const email = headers['X-User-Email'];
      const uid = headers['X-User-UID'];

      if (!email || !uid) {
        console.error('Missing auth headers:', { email: !!email, uid: !!uid });
        throw new Error('Authentication required. Please log in again.');
      }

      // Get current user ID from auth state
      const authState = authService.getAuthState();
      if (!authState.user || !authState.user._id) {
        throw new Error('User ID not found. Please log in again.');
      }

      // Log request details for debugging
      console.log('Fetching patient appointments with:', {
        userId: authState.user._id,
        headers: {
          email,
          uid
        }
      });

      const response = await fetch(`${API_URL}/appointments/patient/${authState.user._id}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': email,
          'X-User-UID': uid
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Patient appointments fetch error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `Failed to fetch appointments: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Successfully fetched patient appointments:', data.length);
      return data;
    } catch (error) {
      console.error('Error in getPatientAppointments:', error);
      throw error;
    }
  },

  getPatientAppointments: async (userId) => {
    const url = `${API_URL}/appointments/patient/${userId}`;
    return handleRequest(url, {
      headers: authService.getAuthHeaders()
    });
  },

  // Create a new appointment
  createAppointment: async (appointmentData) => {
    try {
      // Client-side validation
      if (!appointmentData.startTime || !appointmentData.endTime) {
        throw new Error("Start time and end time are required");
      }

      const startTime = new Date(appointmentData.startTime);
      const endTime = new Date(appointmentData.endTime);
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new Error("Invalid time format");
      }
      
      if (startTime >= endTime) {
        throw new Error("Invalid time range: appointment end time must be after start time");
      }
      
      if (startTime < new Date()) {
        throw new Error("Invalid appointment time: cannot create appointments in the past");
      }

      console.log('Creating appointment:', {
        ...appointmentData,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });

      const response = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Appointment creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error
        });
        throw new Error(translateErrorMessage(errorData.error));
      }

      const data = await response.json();
      console.log('Appointment created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createAppointment:', error);
      throw new Error(translateErrorMessage(error.message));
    }
  },

  // Update an appointment
  updateAppointment: async (id, appointmentData) => {
    return handleRequest(`${API_URL}/appointments/${id}`, {
      method: "PUT",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(appointmentData)
    });
  },

  // Delete an appointment
  deleteAppointment: async (id) => {
    return handleRequest(`${API_URL}/appointments/${id}`, {
      method: "DELETE",
      headers: authService.getAuthHeaders()
    });
  },

  // Get available time slots for a doctor
  getAvailableTimeSlots: async (doctorId, date) => {
    return handleRequest(
      `${API_URL}/appointments/available-slots/${doctorId}?date=${date}`,
      {
        headers: authService.getAuthHeaders()
      }
    );
  }
}; 