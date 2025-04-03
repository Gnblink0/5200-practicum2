import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, userData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // After Firebase auth, create user in our backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': email,
          'X-User-UID': userCredential.user.uid
        },
        body: JSON.stringify({
          email,
          uid: userCredential.user.uid,
          username: email,
          ...userData
        })
      });
      
      if (!response.ok) {
        // If backend registration fails, delete the Firebase user
        await userCredential.user.delete();
        throw new Error('Failed to create user in backend');
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user data from backend
      let retries = 3;
      while (retries > 0) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
            headers: {
              'Content-Type': 'application/json',
              'X-User-Email': email,
              'X-User-UID': userCredential.user.uid
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setCurrentUser({ ...userCredential.user, ...userData });
            return userCredential;
          } else {
            console.error('Failed to fetch profile:', response.status);
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          }
        }
      }
      
      if (retries === 0) {
        console.error('Failed to fetch user profile after all retries');
        setCurrentUser(userCredential.user); // Set only Firebase user data if backend fails
        return userCredential;
      }
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user data from our backend with retry mechanism
        let retries = 3;
        while (retries > 0) {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
              headers: {
                'Content-Type': 'application/json',
                'X-User-Email': user.email,
                'X-User-UID': user.uid
              }
            });
            if (response.ok) {
              const userData = await response.json();
              setCurrentUser({ ...user, ...userData });
              break;
            } else {
              console.error('Failed to fetch profile:', response.status);
              retries--;
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
              }
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            }
          }
        }
        if (retries === 0) {
          console.error('Failed to fetch user profile after all retries');
          setCurrentUser(user); // Set only Firebase user data if backend fails
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
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 