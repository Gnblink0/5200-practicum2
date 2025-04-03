import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL;

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) return { 'Content-Type': 'application/json' };
  
  return {
    'Content-Type': 'application/json',
    'X-User-Email': user.email,
    'X-User-UID': user.uid
  };
}

export const adminApi = {
  // Get all admins
  async getAllAdmins() {
    const response = await fetch(`${API_URL}/admins`, {
      headers: await getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch admins');
    return response.json();
  },

  // Get single admin
  async getAdmin(id) {
    const response = await fetch(`${API_URL}/admins/${id}`, {
      headers: await getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch admin');
    return response.json();
  },

  // Update admin permissions
  async updatePermissions(id, permissions) {
    const response = await fetch(`${API_URL}/admins/${id}/permissions`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ permissions })
    });
    if (!response.ok) throw new Error('Failed to update permissions');
    return response.json();
  },

  // Update admin status
  async updateStatus(id, isActive) {
    const response = await fetch(`${API_URL}/admins/${id}/status`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ isActive })
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  },

  // Delete admin
  async deleteAdmin(id) {
    const response = await fetch(`${API_URL}/admins/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete admin');
    return response.json();
  }
};

export const userApi = {
  // Register new user
  async register(userData) {
    console.log('Registering user with data:', userData);
    console.log('API URL:', API_URL);
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.text();
      console.log('Server response:', data);

      if (!response.ok) {
        try {
          const error = JSON.parse(data);
          throw new Error(error.error || 'Failed to register user');
        } catch (e) {
          throw new Error('Server error: ' + data);
        }
      }

      try {
        return JSON.parse(data);
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Get user profile
  async getProfile() {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: await getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  // Update user profile
  async updateProfile(userData) {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  }
}; 