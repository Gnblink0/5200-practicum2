const API_URL = import.meta.env.VITE_API_URL;

export const appointmentService = {
  async getAppointments(userId, role) {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await fetch(`${API_URL}/appointments/${role}/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-UID': user.uid
      }
    });
    if (!response.ok) throw new Error('Failed to fetch appointments');
    return response.json();
  },

  async createAppointment(appointmentData) {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-UID': user.uid
      },
      body: JSON.stringify(appointmentData)
    });
    if (!response.ok) throw new Error('Failed to create appointment');
    return response.json();
  },

  async updateAppointment(id, updateData) {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-UID': user.uid
      },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error('Failed to update appointment');
    return response.json();
  }
}; 