import React, { createContext, useState, useContext, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../config/firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to update both currentUser state and localStorage
  const updateUser = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('user', JSON.stringify({
        email: user.email,
        uid: user.uid,
        _id: user._id,
        role: user.role
      }));
    } else {
      localStorage.removeItem('user');
    }
  };

  async function signup(email, password, userData = {}) {
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
      // If backend registration fails, delete the Firebase user
      await userCredential.user.delete();
      throw new Error("Failed to create user in backend");
    }

    const responseData = await response.json();
    setCurrentUser({ ...userCredential.user, ...responseData });
  }

  async function login(email, password) {
    // Firebase authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // after Firebase auth, save user info to localStorage
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userUID", userCredential.user.uid);

    try {
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

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser({ ...userCredential.user, ...userData });
        return { userCredential, role: userData.role };
      }


      const responseData = await response.json();
      const user = { ...userCredential.user, ...responseData };
      updateUser(user);
    } catch (error) {
      throw error;
    }
  }

  async function login(email, password) {
    try {
      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Get user data from backend
      try {
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

        if (response.ok) {
          const userData = await response.json();
          const user = { ...userCredential.user, ...userData };
          updateUser(user);
          return { userCredential, role: userData.role };
        } else {
          // If user not found in backend, log out from Firebase
          await signOut(auth);
          updateUser(null);
          throw new Error("Account not found or has been deleted");
        }
      } catch (error) {
        // If backend request fails, log out from Firebase
        await signOut(auth);
        updateUser(null);
        throw error;
      }

    } catch (error) {
      // If backend request fails, log out from Firebase
      await signOut(auth);
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userUID");
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      updateUser(null);
    } catch (error) {
      throw error;
    }

  }

  async function deleteAccount(password) {
    try {
      // 1. Reauthenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // 2. Delete user data from MongoDB
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-User-Email": currentUser.email,
            "X-User-UID": currentUser.uid,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Delete account response:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(
          errorData.error || "Failed to delete user profile from database"
        );
      }

      updateUser(null);

    } catch (error) {
      console.error("Delete account error details:", {
        error: error.message,
        currentUser: {
          email: currentUser.email,
          uid: currentUser.uid,
          role: currentUser.role,
        },
      });
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/users/profile`,
            {
              headers: {
                "Content-Type": "application/json",
                "X-User-Email": user.email,
                "X-User-UID": user.uid,
              },
            }
          );

          if (response.ok) {
            const userData = await response.json();
            const fullUser = { ...user, ...userData };
            updateUser(fullUser);
          } else {
            // If user not found in backend, log out
            await signOut(auth);
            updateUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // On error, log out user
          await signOut(auth);
          updateUser(null);
        }
      } else {
        updateUser(null);
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
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
