const API_URL = import.meta.env.VITE_API_URL;

// Helper function: Convert server error messages to user-friendly messages
const translateErrorMessage = (error) => {
  const errorMessages = {
    "Missing required fields": "Please fill in all required appointment information",
    "Doctor not found or inactive": "Sorry, this doctor is currently not available for appointments",
    "Time slot not available or has expired": "Sorry, this time slot is no longer available",
    "You already have an appointment during this time": "You already have another appointment scheduled during this time",
    "Appointment time is not within doctor's available schedule": "Sorry, this time slot is not within the doctor's available schedule",
  };
  return errorMessages[error] || error;
};

export const appointmentService = {
  // Get doctor's appointments
  getDoctorAppointments: async () => {
    const response = await fetch(`${API_URL}/appointments/doctor/appointments`, {
      headers: {
        "X-User-Email": localStorage.getItem("userEmail"),
        "X-User-UID": localStorage.getItem("userUID"),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch appointments");
    return response.json();
  },

  // Get appointments for a user (doctor or patient)
  getAppointments: async (userId, role) => {
    const response = await fetch(`${API_URL}/appointments/${role}/${userId}`, {
      headers: {
        "X-User-Email": localStorage.getItem("userEmail"),
        "X-User-UID": localStorage.getItem("userUID"),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch appointments");
    return response.json();
  },

  // Create a new appointment
  createAppointment: async (appointmentData) => {
    console.log('Creating appointment with data:', appointmentData);
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": localStorage.getItem("userEmail"),
          "X-User-UID": localStorage.getItem("userUID"),
        },
        body: JSON.stringify(appointmentData),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        const errorMessage = data.error ? translateErrorMessage(data.error) : "Failed to create appointment, please try again later";
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('Error in createAppointment:', error);
      throw error;
    }
  },

  // Update an appointment
  updateAppointment: async (id, appointmentData) => {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-User-Email": localStorage.getItem("userEmail"),
        "X-User-UID": localStorage.getItem("userUID"),
      },
      body: JSON.stringify(appointmentData),
    });
    if (!response.ok) throw new Error("Failed to update appointment");
    return response.json();
  },

  // Delete an appointment
  deleteAppointment: async (id) => {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: "DELETE",
      headers: {
        "X-User-Email": localStorage.getItem("userEmail"),
        "X-User-UID": localStorage.getItem("userUID"),
      },
    });
    if (!response.ok) throw new Error("Failed to delete appointment");
    return response.json();
  },
}; 