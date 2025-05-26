import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Add the Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Signup function with Firebase
  const signup = async (email, password, role) => {
    try {
      // Create new auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        role,
        createdAt: serverTimestamp()
      });
      
      // Create empty document in respective collection based on role
      if (role === 'student') {
        await setDoc(doc(db, 'students', user.uid), {
          email,
          hasCompletedProfile: false,
          createdAt: serverTimestamp()
        });
      } else {
        await setDoc(doc(db, 'mentors', user.uid), {
          email,
          createdAt: serverTimestamp()
        });
      }
      
      // Return user with role information
      return {
        ...user,
        role
      };
    } catch (error) {
      console.error("Error in signup:", error);
      throw error;
    }
  };

  // Improved login function with offline handling
  async function login(email, password) {
    try {
      // Set persistence to LOCAL to keep user logged in
      await setPersistence(auth, browserLocalPersistence);
      
      // Attempt login
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // If offline, return the basic user object without Firestore data
      if (!navigator.onLine) {
        console.log("Logging in while offline - using basic user data only");
        return {
          success: true,
          user: {
            uid: result.user.uid,
            email: result.user.email,
            emailVerified: result.user.emailVerified,
            // Set a placeholder role that will be updated when online
            role: localStorage.getItem(`user_role_${result.user.uid}`) || 'unknown'
          }
        };
      }
      
      // If online, fetch additional user data from Firestore
      try {
        // Determine collection based on uid prefix or try both
        let userData = null;
        let userRole = null;
        
        // Try students collection first
        const studentDoc = await getDoc(doc(db, 'students', result.user.uid));
        if (studentDoc.exists()) {
          userData = studentDoc.data();
          userRole = 'student';
        } else {
          // Then try mentors
          const mentorDoc = await getDoc(doc(db, 'mentors', result.user.uid));
          if (mentorDoc.exists()) {
            userData = mentorDoc.data();
            userRole = 'mentor';
          } else {
            // Fallback to users collection
            const userDoc = await getDoc(doc(db, 'users', result.user.uid));
            if (userDoc.exists()) {
              userData = userDoc.data();
              userRole = userData.role || 'user';
            }
          }
        }
        
        // Save role to localStorage for offline use
        if (userRole) {
          localStorage.setItem(`user_role_${result.user.uid}`, userRole);
        }
        
        // Set user data with role
        const userWithRole = {
          uid: result.user.uid,
          email: result.user.email,
          emailVerified: result.user.emailVerified,
          role: userRole,
          ...userData
        };
        
        setCurrentUser(userWithRole);
        return { success: true, user: userWithRole };
        
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Still return basic user info even if Firestore fetch fails
        return { 
          success: true,
          user: {
            uid: result.user.uid,
            email: result.user.email,
            emailVerified: result.user.emailVerified,
            role: localStorage.getItem(`user_role_${result.user.uid}`) || 'unknown'
          },
          warning: "Limited offline functionality available"
        };
      }
    } catch (error) {
      console.error("Error in login:", error);
      
      // Special handling for offline errors
      if (error.message?.includes('offline')) {
        // Try to retrieve cached credentials if any
        const cachedEmail = localStorage.getItem('last_user_email');
        if (cachedEmail === email) {
          return {
            success: false,
            error: "You are currently offline. Internet connection required for login."
          };
        }
      }
      
      return { success: false, error: error.message };
    }
  }

  // Add or update the loginWithGoogle function
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if this is a new user
      const userDocRef = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDocRef);
      
      if (!userSnapshot.exists()) {
        // New user, create their record
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          // Default role for Google sign-ins
          role: 'student',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
        
        // Also create an empty student record
        await setDoc(doc(db, 'students', user.uid), {
          email: user.email,
          name: user.displayName || '',
          hasCompletedProfile: false,
          createdAt: serverTimestamp()
        });
        
        // Return the user with role information
        return {
          ...user,
          role: 'student',
          hasCompletedProfile: false
        };
      } else {
        // Existing user, update last login
        const userData = userSnapshot.data();
        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp()
        });
        
        // Return the user with role information
        return {
          ...user,
          role: userData.role,
          hasCompletedProfile: userData.hasCompletedProfile || false
        };
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  // Improved logout function
  async function logout() {
    try {
      // Clear cached user data
      if (currentUser?.uid) {
        localStorage.removeItem(`user_role_${currentUser.uid}`);
      }
      
      // Sign out from Firebase auth
      await signOut(auth);
      
      // Clear any local storage or session data
      localStorage.removeItem('authUser');
      sessionStorage.removeItem('authUser');
      
      // Set current user to null
      setCurrentUser(null);
      
      // Force page reload to clear any React component state
      window.location.href = '/login';
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  // Effect to handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if we're offline
          if (!navigator.onLine) {
            console.log("Offline mode - using cached user data");
            // Use cached role if available
            const cachedRole = localStorage.getItem(`user_role_${user.uid}`);
            
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              role: cachedRole || 'unknown',
              offlineMode: true
            });
            setLoading(false);
            return;
          }
          
          // Get user document from Firestore
          let userData = null;
          let userRole = null;
          
          // Try students collection first
          const studentDoc = await getDoc(doc(db, 'students', user.uid));
          if (studentDoc.exists()) {
            userData = studentDoc.data();
            userRole = 'student';
          } else {
            // Then try mentors
            const mentorDoc = await getDoc(doc(db, 'mentors', user.uid));
            if (mentorDoc.exists()) {
              userData = mentorDoc.data();
              userRole = 'mentor';
            } else {
              // Fallback to users collection
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              if (userDoc.exists()) {
                userData = userDoc.data();
                userRole = userData.role || 'user';
              }
            }
          }
          
          // Save role to localStorage for offline use
          if (userRole) {
            localStorage.setItem(`user_role_${user.uid}`, userRole);
          }
          localStorage.setItem('last_user_email', user.email);
          
          // Combine auth user with Firestore data
          const fullUserData = {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            role: userRole,
            ...userData
          };
          
          setCurrentUser(fullUserData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Still set basic user info even if Firestore fetch fails
          const cachedRole = localStorage.getItem(`user_role_${user.uid}`);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            role: cachedRole || 'unknown',
            offlineMode: !navigator.onLine
          });
        }
      } else {
        // No user is signed in
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    isOffline,
    login,
    signup,
    loginWithGoogle, // Add this
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Add this to your main.jsx or index.jsx file
const originalConsoleError = console.error;
console.error = function(message, ...args) {
  if (typeof message === 'string' && 
      (message.includes('ERR_BLOCKED_BY_CLIENT') || 
       message.includes('Firestore/Listen/channel'))) {
    return;
  }
  originalConsoleError.apply(console, [message, ...args]);
};