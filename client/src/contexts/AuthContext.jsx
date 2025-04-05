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

  async function signup(email, password, userData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // After Firebase auth, create user in our backend
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
          setCurrentUser({ ...userCredential.user, ...userData });
          return { userCredential, role: userData.role };
        } else {
          // If user not found in backend, log out from Firebase
          await signOut(auth);
          throw new Error("Account not found or has been deleted");
        }
      } catch (error) {
        // If backend request fails, log out from Firebase
        await signOut(auth);
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    return signOut(auth);
  }

  async function deleteAccount(password) {
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      await auth.currentUser.delete();

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
        throw new Error("Failed to delete user profile");
      }

      setCurrentUser(null);
    } catch (error) {
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
            setCurrentUser({ ...user, ...userData });
          } else {
            // If user not found in backend, log out
            await signOut(auth);
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // On error, log out user
          await signOut(auth);
          setCurrentUser(null);
        }
      } else {
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
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
