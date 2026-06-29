import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  browserLocalPersistence, 
  setPersistence
} from 'firebase/auth';
import type { Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let isFirebaseConfigured = false;

// Only initialize if the minimum config (API Key) is provided
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY') {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    // Enable local persistence so sessions are maintained across refreshes/tabs
    setPersistence(auth, browserLocalPersistence);
    isFirebaseConfigured = true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn(
    "Firebase environment variables (VITE_FIREBASE_API_KEY) are missing. " +
    "Firebase Auth is disabled. The app will run in Guest Mode."
  );
}

export const loginWithGoogle = async () => {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error("Firebase is not configured. Please use Guest Mode.");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In failed:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  if (auth) {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase Sign-Out failed:", error);
    }
  }
};

export { auth, isFirebaseConfigured };
