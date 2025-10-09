// src/firebaseConfig.ts
// FIX: Add reference to Vite client types to resolve issues with import.meta.env
/// <reference types="vite/client" />


import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Vite exposes env variables on `import.meta.env`.
// This is the standard and correct way to access them.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase safely
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;
let firebaseInitializationSuccess = false;

// Check if all required environment variables are present.
// This is crucial for debugging setup issues.
if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId ||
    !firebaseConfig.storageBucket ||
    !firebaseConfig.messagingSenderId ||
    !firebaseConfig.appId
) {
    console.error("Firebase Initialization Failed: One or more required environment variables are missing. Please check your .env file and ensure it is configured correctly.");
    firebaseInitializationSuccess = false;
} else {
    try {
      const app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      
      // Enable offline persistence for a smoother experience.
      enableIndexedDbPersistence(db)
        .catch((err) => {
          if (err.code == 'failed-precondition') {
            console.warn("Firebase persistence couldn't be enabled. This is likely because you have multiple tabs open. The app will still work online.");
          } else if (err.code == 'unimplemented') {
            console.warn("Firebase persistence couldn't be enabled as your browser doesn't support it. The app will still work online.");
          }
        });
        
      firebaseInitializationSuccess = true;
    } catch (error) {
      console.error("Firebase Initialization Failed: An error occurred during Firebase setup. This could be due to incorrect configuration values or network issues.", error);
      firebaseInitializationSuccess = false;
    }
}

// Export the services you need. They will be null if initialization failed.
export { auth, db, storage, firebaseInitializationSuccess };