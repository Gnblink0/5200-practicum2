const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-User-Email": localStorage.getItem("userEmail"),
  "X-User-UID": localStorage.getItem("userUID"),
});

export const prescriptionService = {
  // Get prescriptions for a user (doctor or patient)
  getPrescriptions: async (userId, role) => {
    const response = await fetch(`${API_URL}/prescriptions/${role}/${userId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch prescriptions");
    return response.json();
  },

  // Create a new prescription
  createPrescription: async (prescriptionData) => {
    const response = await fetch(`${API_URL}/prescriptions`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(prescriptionData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Prescription creation failed:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(errorData.error || "Failed to create prescription");
    }
    return response.json();
  },

  // Update a prescription
  updatePrescription: async (id, prescriptionData) => {
    const response = await fetch(`${API_URL}/prescriptions/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(prescriptionData),
    });
    if (!response.ok) throw new Error("Failed to update prescription");
    return response.json();
  },

  // Delete a prescription
  deletePrescription: async (id) => {
    try {
      const response = await fetch(`${API_URL}/prescriptions/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Prescription deletion failed:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
          requestHeaders: getHeaders(),
        });
        throw new Error(errorData.error || "Failed to delete prescription");
      }

      return response.json();
    } catch (error) {
      console.error("Error in deletePrescription:", error);
      throw error;
    }
  },
};
