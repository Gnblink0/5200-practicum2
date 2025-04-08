import { auth } from "../config/firebase";

class AuthService {
  constructor() {
    this.authState = {
      isAuthenticated: false,
      user: null,
      role: null,
      lastValidated: null
    };
  }

  // Initialize auth state from localStorage
  init() {
    const email = localStorage.getItem("userEmail");
    const uid = localStorage.getItem("userUID");
    const role = localStorage.getItem("userRole");

    if (email && uid) {
      this.authState = {
        isAuthenticated: true,
        user: { email, uid },
        role,
        lastValidated: new Date()
      };
      return true;
    }
    return false;
  }

  // Validate current auth state
  async validateAuth() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        await this.clearAuth();
        return false;
      }

      const userData = await response.json();
      this.updateAuthState(userData);
      return true;
    } catch (error) {
      console.error("Auth validation error:", error);
      await this.clearAuth();
      return false;
    }
  }

  // Update auth state with new user data
  updateAuthState(userData) {
    this.authState = {
      isAuthenticated: true,
      user: userData,
      role: userData.role,
      lastValidated: new Date()
    };
    this.persistAuth(userData);
  }

  // Persist auth data to localStorage
  persistAuth(userData) {
    localStorage.setItem("userEmail", userData.email);
    localStorage.setItem("userUID", userData.uid);
    localStorage.setItem("userRole", userData.role);
  }

  // Clear auth state
  async clearAuth() {
    this.authState = {
      isAuthenticated: false,
      user: null,
      role: null,
      lastValidated: null
    };
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userUID");
    localStorage.removeItem("userRole");
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Firebase signout error:", error);
    }
  }

  // Get auth headers for API requests
  getAuthHeaders() {
    return {
      "Content-Type": "application/json",
      "X-User-Email": localStorage.getItem("userEmail"),
      "X-User-UID": localStorage.getItem("userUID")
    };
  }

  // Check if auth is valid and not expired
  isAuthValid() {
    if (!this.authState.isAuthenticated || !this.authState.lastValidated) {
      return false;
    }
    
    // Check if validation was done in the last 5 minutes
    const validationAge = new Date() - new Date(this.authState.lastValidated);
    return validationAge < 5 * 60 * 1000; // 5 minutes
  }

  // Get current auth state
  getAuthState() {
    return this.authState;
  }
}

export const authService = new AuthService(); 