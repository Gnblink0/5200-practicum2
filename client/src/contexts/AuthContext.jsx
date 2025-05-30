import React, { createContext, useState, useContext, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function refreshUserData(uid, email) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-User-Email": email || localStorage.getItem("userEmail"),
            "X-User-UID": uid || localStorage.getItem("userUID"),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to refresh user data");
      }

      const userData = await response.json();

      // Update localStorage with latest data
      localStorage.setItem("userData", JSON.stringify(userData));

      // Update current user state
      setCurrentUser((prevUser) => ({
        ...prevUser,
        ...userData,
      }));

      return userData;
    } catch (error) {
      console.error("Error refreshing user data:", error);
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
      // 1. clear auth
      await authService.clearAuth();

      // 2. Firebase auth
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      try {
        // 3. get user data
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/users/profile`,
          {
            headers: {
              "Content-Type": "application/json",
              "X-User-Email": email,
              "X-User-UID": userCredential.user.uid,
            },
          }
        );

        if (!response.ok) {
          // if failed to get user data, clear auth
          await authService.clearAuth();
          if (response.status === 401) {
            throw new Error(
              "Your account has been deactivated. Please contact an administrator."
            );
          }
          throw new Error("Failed to refresh user data");
        }

        const userData = await response.json();

        // 4. if user data is successfully fetched, set localStorage
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userUID", userCredential.user.uid);
        localStorage.setItem("userData", JSON.stringify(userData));

        return {
          userData,
          role: userData.role,
        };
      } catch (error) {
        // ensure clear all auth states
        await authService.clearAuth();
        throw error;
      }
    } catch (error) {
      console.error("Login error:", error);
      await authService.clearAuth();
      throw error;
    }
  }

  async function logout() {
    await authService.clearAuth();
    setCurrentUser(null);
  }

  async function deleteAccount(password) {
    try {
      // First verify the password
      const auth = getAuth();
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Delete from Firebase
      await user.delete();

      // Delete from backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-User-Email": user.email,
            "X-User-UID": user.uid,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user from backend");
      }

      // Clear auth state
      await authService.clearAuth();
      setCurrentUser(null);
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  }

  // Validate auth state periodically
  useEffect(() => {
    let validationInterval;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const validateAuthState = async () => {
      if (currentUser && !authService.isAuthValid()) {
        try {
          const isValid = await authService.validateAuth();
          if (!isValid) {
            retryCount++;
            if (retryCount >= MAX_RETRIES) {
              console.error("Auth validation failed after multiple retries");
              setCurrentUser(null);
              await authService.clearAuth();
            }
          } else {
            retryCount = 0; // Reset retry count on success
          }
        } catch (error) {
          console.error("Auth validation error:", error);
          retryCount++;
          if (retryCount >= MAX_RETRIES) {
            setCurrentUser(null);
            await authService.clearAuth();
          }
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
      try {
        if (user) {
          // Try to initialize from localStorage first
          const hasStoredAuth = authService.init();

          if (hasStoredAuth) {
            // Validate stored auth
            const isValid = await authService.validateAuth();
            if (isValid) {
              setCurrentUser(authService.getAuthState().user);
            } else {
              // If stored auth is invalid, try to refresh with Firebase user
              try {
                const userData = await refreshUserData(user.uid, user.email);
                setCurrentUser(userData);
              } catch (error) {
                console.error("Error refreshing user data:", error);
                setCurrentUser(null);
                await authService.clearAuth();
              }
            }
          } else {
            // No stored auth, try to initialize with Firebase user
            try {
              const userData = await refreshUserData(user.uid, user.email);
              setCurrentUser(userData);
            } catch (error) {
              console.error("Error initializing user data:", error);
              setCurrentUser(null);
              await authService.clearAuth();
            }
          }
        } else {
          // No Firebase user, clear everything
          setCurrentUser(null);
          await authService.clearAuth();
        }
      } catch (error) {
        console.error("Auth state initialization error:", error);
        setCurrentUser(null);
        await authService.clearAuth();
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Add periodic verification check for doctors
  useEffect(() => {
    if (currentUser?.role === "Doctor") {
      const checkVerification = async () => {
        try {
          const userData = await refreshUserData();

          // If verification status changed, notify user
          if (userData.isVerified !== currentUser.isVerified) {
            alert(
              "Your verification status has changed. Please log out and log back in to apply changes."
            );
            await logout();
            navigate("/login");
          }
        } catch (error) {
          console.error("Error checking verification:", error);
        }
      };

      // Check every 5 minutes
      const interval = setInterval(checkVerification, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    refreshUserData,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
