const API_URL = import.meta.env.VITE_API_URL;

export const prescriptionService = {
  async getPrescriptions(userId, role) {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await fetch(`${API_URL}/prescriptions/${role}/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-UID': user.uid
      }
    });
    if (!response.ok) throw new Error('Failed to fetch prescriptions');
    return response.json();
  },

  async createPrescription(prescriptionData) {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await fetch(`${API_URL}/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-UID': user.uid
      },
      body: JSON.stringify(prescriptionData)
    });
    if (!response.ok) throw new Error('Failed to create prescription');
    return response.json();
  },

  async updatePrescription(id, updateData) {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await fetch(`${API_URL}/prescriptions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-UID': user.uid
      },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update prescription');
    }
    return response.json();
  },

  async deletePrescription(id) {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await fetch(`${API_URL}/prescriptions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-UID': user.uid
      }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete prescription');
    }
    return response.json();
  }
}; 