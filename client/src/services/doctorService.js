const API_URL = import.meta.env.VITE_API_URL;

const doctorService = {
  // Helper method for common headers
  getHeaders() {
    const user = JSON.parse(localStorage.getItem('user'));
    return {
      'Content-Type': 'application/json',
      'X-User-Email': user.email,
      'X-User-UID': user.uid
    };
  },

  // Doctor profile related methods
  async getDoctors() {
    const response = await fetch(`${API_URL}/doctors`, {
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch doctors');
    return response.json();
  },

  // Get doctor by ID
  async getDoctorById(id) {
    const response = await fetch(`${API_URL}/doctors/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch doctor");
    }

    return response.json();
  },

  // Update doctor profile
  async updateProfile(doctorId, profileData) {
    const response = await fetch(`${API_URL}/doctors/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(profileData)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  // Schedule related methods
  async getSchedules(doctorId) {
    const response = await fetch(`${API_URL}/doctors/${doctorId}/schedules`, {
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch schedules');
    return response.json();
  },

  async createSchedule(doctorId, scheduleData) {
    const response = await fetch(`${API_URL}/doctors/${doctorId}/schedules`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(scheduleData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create schedule');
    }
    return response.json();
  },

  async deleteSchedule(doctorId, scheduleId) {
    const response = await fetch(`${API_URL}/doctors/${doctorId}/schedules/${scheduleId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete schedule');
    return response.json();
  },

  // Availability check
  async checkAvailability(doctorId, startTime, endTime) {
    const response = await fetch(`${API_URL}/doctors/${doctorId}/check-availability`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ startTime, endTime })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to check availability');
    }
    return response.json();
  }
};

export default doctorService; 