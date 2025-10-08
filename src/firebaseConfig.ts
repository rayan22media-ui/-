import { initializeApp } from "firebase/app";
// FIX: Import getAuth as a named export from firebase/auth.
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCF26ozSFFHs5hzymzCVIZ5c4Hn5l5KSL4",
  authDomain: "wino-17628.firebaseapp.com",
  projectId: "wino-17628",
  storageBucket: "wino-17628.appspot.com",
  messagingSenderId: "759405345321",
  appId: "1:759405345321:web:256de3250b6f7a5ee17a38",
  measurementId: "G-4LHQ702W68"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export the services you need
// FIX: Call getAuth directly.
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);