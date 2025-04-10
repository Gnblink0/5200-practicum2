import { getAuth } from "firebase/auth";

class AuthService {
  constructor() {
    this.authState = {
      isAuthenticated: false,
      user: null,
      role: null,
      lastValidated: null,
    };
    this.init();
  }

  // Initialize auth state from localStorage
  init() {
    try {
      const email = localStorage.getItem("userEmail");
      const uid = localStorage.getItem("userUID");
      const role = localStorage.getItem("userRole");
      const storedUserData = localStorage.getItem("userData");

      if (email && uid) {
        this.authState = {
          isAuthenticated: true,
          user: storedUserData ? JSON.parse(storedUserData) : { email, uid },
          role,
          lastValidated: new Date(),
        };
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error initializing auth state:", error);
      this.clearAuth();
      return false;
    }
  }

  // Validate current auth state
  async validateAuth() {
    try {
      const email = localStorage.getItem("userEmail");
      const uid = localStorage.getItem("userUID");

      if (!email || !uid) {
        console.error(
          "Auth validation failed: Missing credentials in localStorage"
        );
        return false;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-User-Email": email,
            "X-User-UID": uid,
          },
        }
      );

      if (!response.ok) {
        console.error(
          "Auth validation failed: Backend returned",
          response.status
        );
        return false;
      }

      const userData = await response.json();
      this.updateAuthState(userData);
      return true;
    } catch (error) {
      console.error("Auth validation error:", error);
      return false;
    }
  }

  // Update auth state with new user data
  updateAuthState(userData) {
    try {
      this.authState = {
        isAuthenticated: true,
        user: userData,
        role: userData.role,
        lastValidated: new Date(),
      };

      // Store complete user data
      localStorage.setItem("userEmail", userData.email);
      localStorage.setItem("userUID", userData.uid);
      localStorage.setItem("userRole", userData.role);
      localStorage.setItem(
        "userData",
        JSON.stringify({
          ...userData,
          lastUpdated: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("Error updating auth state:", error);
      this.clearAuth();
    }
  }

  // Persist auth data to localStorage
  persistAuth(userData) {
    try {
      localStorage.setItem("userEmail", userData.email);
      localStorage.setItem("userUID", userData.uid);
      localStorage.setItem("userRole", userData.role);
    } catch (error) {
      console.error("Error persisting auth data:", error);
      this.clearAuth();
    }
  }

  // Clear auth state
  async clearAuth() {
    try {
      // 清除所有localStorage数据
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userUID");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userData");

      // 重置authState
      this.authState = {
        isAuthenticated: false,
        user: null,
        role: null,
        lastValidated: null,
      };

      // 登出Firebase
      const auth = getAuth();
      if (auth.currentUser) {
        await auth.signOut();
      }
    } catch (error) {
      console.error("Error clearing auth state:", error);
    }
  }

  // Get auth headers for API requests
  getAuthHeaders() {
    try {
      const email = localStorage.getItem("userEmail");
      const uid = localStorage.getItem("userUID");

      if (!email || !uid) {
        throw new Error("Missing auth credentials");
      }

      return {
        "Content-Type": "application/json",
        "X-User-Email": email,
        "X-User-UID": uid,
      };
    } catch (error) {
      console.error("Error getting auth headers:", error);
      return {
        "Content-Type": "application/json",
      };
    }
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
