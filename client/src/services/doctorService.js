const API_URL = import.meta.env.VITE_API_URL;

export const doctorService = {
  async getDoctors() {
    const response = await fetch(`${API_URL}/doctors`, {
      headers: {
        "X-User-Email": localStorage.getItem("userEmail"),
        "X-User-UID": localStorage.getItem("userUID"),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch doctors");
    }

    return response.json();
  },

  async getDoctorById(id) {
    const response = await fetch(`${API_URL}/doctors/${id}`, {
      headers: {
        "X-User-Email": localStorage.getItem("userEmail"),
        "X-User-UID": localStorage.getItem("userUID"),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch doctor");
    }

    return response.json();
  },

  async getDoctorAvailableSlots(doctorId) {
    try {
      console.log('Fetching available slots for doctor:', doctorId);
      
      const response = await fetch(`${API_URL}/schedules/doctor/${doctorId}/available`, {
        headers: {
          "X-User-Email": localStorage.getItem("userEmail"),
          "X-User-UID": localStorage.getItem("userUID"),
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', errorData);
        throw new Error(errorData || "Failed to fetch available slots");
      }

      const data = await response.json();
      console.log('Raw server response:', data);

      // Transform the data into the expected format
      const availableSlots = {};
      
      // Process each date's slots
      Object.entries(data.availableSlots).forEach(([date, slots]) => {
        availableSlots[date] = slots.map(slot => ({
          _id: slot._id,
          startTime: new Date(slot.startTime),
          endTime: new Date(slot.endTime),
          isAvailable: slot.isAvailable
        }));
      });

      console.log('Transformed available slots:', availableSlots);
      return { availableSlots };
    } catch (error) {
      console.error('Error in getDoctorAvailableSlots:', error);
      throw error;
    }
  },
}; 