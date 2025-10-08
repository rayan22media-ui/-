import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ====================================================================================
// ====================================================================================
// =================================== هام جداً =======================================
//
//               !!! الصق إعدادات مشروعك في الـ Firebase هنا !!!
//
// 1. اذهب إلى https://console.firebase.google.com
// 2. اختر مشروعك (أو أنشئ واحداً جديداً).
// 3. اضغط على أيقونة الإعدادات (الترس) واختر "Project settings".
// 4. في تبويب "General"، انزل إلى قسم "Your apps".
// 5. اختر تطبيق الويب الخاص بك.
// 6. تحت "Firebase SDK snippet"، اختر "Config".
// 7. انسخ الكائن (object) الذي يبدأ بـ `{ apiKey: ... }` والصقه هنا بدلاً من 
//    الكائن المؤقت `firebaseConfig`.
//
// ====================================================================================
// ====================================================================================

const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxxxxxxxxxxx"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you need
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
