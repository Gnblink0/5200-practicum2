import React, { createContext, useState, useContext, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { authService } from "../services/authService";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshUserState() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      authService.updateAuthState(userData);
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      console.error('Error refreshing user state:', error);
      throw error;
    }
  }

  async function signup(email, password, userData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-Email": email,
            "X-User-UID": userCredential.user.uid,
          },
          body: JSON.stringify({
            email,
            uid: userCredential.user.uid,
            username: email,
            ...userData,
          }),
        }
      );

      if (!response.ok) {
        await userCredential.user.delete();
        throw new Error("Failed to create user in backend");
      }

      const responseData = await response.json();
      authService.updateAuthState(responseData);
      setCurrentUser(responseData);
    } catch (error) {
      await authService.clearAuth();
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Initialize auth service with Firebase credentials
      const tempAuthData = {
        email,
        uid: userCredential.user.uid,
      };
      authService.persistAuth(tempAuthData);
      
      // Get user data from backend
      const userData = await refreshUserState();

      return {
        user: userCredential.user,
        role: userData.role,
        userData: userData
      };
    } catch (error) {
      await authService.clearAuth();
      throw error;
    }
  }

  async function logout() {
    await authService.clearAuth();
    setCurrentUser(null);
  }

  // Validate auth state periodically
  useEffect(() => {
    let validationInterval;
    
    const validateAuthState = async () => {
      if (currentUser && !authService.isAuthValid()) {
        try {
          const isValid = await authService.validateAuth();
          if (!isValid) {
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Auth validation error:", error);
          setCurrentUser(null);
        }
      }
    };

    if (currentUser) {
      validationInterval = setInterval(validateAuthState, 60000); // Check every minute
    }

    return () => {
      if (validationInterval) {
        clearInterval(validationInterval);
      }
    };
  }, [currentUser]);

  // Initialize auth state from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Initialize from localStorage if available
          if (authService.init()) {
            const isValid = await authService.validateAuth();
            if (isValid) {
              setCurrentUser(authService.getAuthState().user);
            } else {
              setCurrentUser(null);
            }
          } else {
            // If no stored auth, clear everything
            await authService.clearAuth();
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Auth state initialization error:", error);
          await authService.clearAuth();
          setCurrentUser(null);
        }
      } else {
        await authService.clearAuth();
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    refreshUserState
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
