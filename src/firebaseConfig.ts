
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Declare the global variable that Vite will inject.
declare const __ENV__: {
    VITE_FIREBASE_API_KEY: string;
    VITE_FIREBASE_AUTH_DOMAIN: string;
    VITE_FIREBASE_PROJECT_ID: string;
    VITE_FIREBASE_STORAGE_BUCKET: string;
    VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    VITE_FIREBASE_APP_ID: string;
    VITE_FIREBASE_MEASUREMENT_ID?: string;
};

// Read the configuration from the injected global object.
const firebaseConfig = {
  apiKey: __ENV__.VITE_FIREBASE_API_KEY,
  authDomain: __ENV__.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: __ENV__.VITE_FIREBASE_PROJECT_ID,
  storageBucket: __ENV__.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: __ENV__.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: __ENV__.VITE_FIREBASE_APP_ID,
  measurementId: __ENV__.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase safely
let auth = null;
let db = null;
let storage = null;
let firebaseInitializationSuccess = false;

const requiredConfigKeys = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
};

// Check for missing variables.
const missingVars = Object.entries(requiredConfigKeys)
  .filter(([key]) => !firebaseConfig[key as keyof typeof firebaseConfig])
  .map(([, envVar]) => envVar);


if (missingVars.length > 0) {
    console.error(`Firebase Initialization Failed: The following required environment variables are missing or invalid in your .env file: ${missingVars.join(', ')}. Please check your setup.`);
    firebaseInitializationSuccess = false;
} else {
    try {
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