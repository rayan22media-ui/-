
// FIX: Add global type declaration for import.meta.env to handle all Vite environment variables
// and resolve TypeScript errors, replacing the failing reference to 'vite/client'.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_API_KEY: string;
      readonly VITE_FIREBASE_API_KEY: string;
      readonly VITE_FIREBASE_AUTH_DOMAIN: string;
      readonly VITE_FIREBASE_PROJECT_ID: string;
      readonly VITE_FIREBASE_STORAGE_BUCKET: string;
      readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
      readonly VITE_FIREBASE_APP_ID: string;
      readonly VITE_FIREBASE_MEASUREMENT_ID: string;
    }
  }
}

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Using Vite's standard `import.meta.env` for environment variables.
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
let auth = null;
let db = null;
let storage = null;
let firebaseInitializationSuccess = false;

// A robust check for required Firebase environment variables.
const requiredConfigKeys = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
};

// Check if the required environment variables are defined.
const missingVars = Object.entries(requiredConfigKeys)
  .filter(([key]) => {
    const value = firebaseConfig[key as keyof typeof firebaseConfig];
    return !value; // A missing env var will be `undefined`.
  })
  .map(([, envVar]) => envVar);


if (missingVars.length > 0) {
    console.error(`Firebase Initialization Failed: The following required environment variables are missing or invalid in your .env file: ${missingVars.join(', ')}. Please check your setup.`);
    firebaseInitializationSuccess = false;
} else {
    try {
      // initializeApp will throw an error if the config is bad.
      const app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      firebaseInitializationSuccess = true;
    } catch (error) {
      console.error("Firebase Initialization Failed: An error occurred during Firebase setup. This could be due to incorrect configuration values or network issues.", error);
      firebaseInitializationSuccess = false;
    }
}


// Export the services you need. They will be null if initialization failed.
export { auth, db, storage, firebaseInitializationSuccess };
