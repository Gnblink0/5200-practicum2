const API_URL = import.meta.env.VITE_API_URL;

export const prescriptionService = {
  // Get prescriptions for a user (doctor or patient)
  getPrescriptions: async (userId, role) => {
    const response = await fetch(`${API_URL}/prescriptions/${role}/${userId}`, {
      headers: {
        "X-User-Email": localStorage.getItem("userEmail"),
        "X-User-UID": localStorage.getItem("userUID"),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch prescriptions");
    return response.json();
  },

  // Create a new prescription
  createPrescription: async (prescriptionData) => {
    const response = await fetch(`${API_URL}/prescriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Email": localStorage.getItem("userEmail"),
        "X-User-UID": localStorage.getItem("userUID"),
      },
      body: JSON.stringify(prescriptionData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create prescription");
    }
    return response.json();
  },

  // Update a prescription
  updatePrescription: async (id, prescriptionData) => {
    const response = await fetch(`${API_URL}/prescriptions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-User-Email": localStorage.getItem("userEmail"),
        "X-User-UID": localStorage.getItem("userUID"),
      },
      body: JSON.stringify(prescriptionData),
    });
    if (!response.ok) throw new Error("Failed to update prescription");
    return response.json();
  },

  // Delete a prescription
  deletePrescription: async (id) => {
    const response = await fetch(`${API_URL}/prescriptions/${id}`, {
      method: "DELETE",
      headers: {
        "X-User-Email": localStorage.getItem("userEmail"),
        "X-User-UID": localStorage.getItem("userUID"),
      },
    });
    if (!response.ok) throw new Error("Failed to delete prescription");
    return response.json();
  },
}; 