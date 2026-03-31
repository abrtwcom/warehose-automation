import { getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Firebase configuration using environment variables
// In production (Firebase Hosting), these must be set as GitHub Secrets or in the CI/CD pipeline
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCfn8sXkHx4wl-dfOVTXeNznyu--G4ydDY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "iot-inventory-87709788-95492.firebaseapp.com",
  databaseURL: "https://iot-inventory-87709788-95492-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "iot-inventory-87709788-95492",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "iot-inventory-87709788-95492.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1076687162237",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1076687162237:web:aae0d350af69a8d84fda14",
};

const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

// Check for missing configuration keys
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.warn(
    `⚠️ Firebase Configuration Warning: Missing keys [${missingKeys.join(", ")}]. ` +
    `Ensure VITE_FIREBASE_* environment variables are set in your .env file (local) or CI/CD secrets (production).`
  );
}

// Initialize Firebase only if we have at least the Project ID
// This prevents the entire app from crashing on start if config is missing
let app;
try {
  if (getApps().length === 0) {
    if (!firebaseConfig.projectId) {
      throw new Error("Firebase Project ID is missing. Firebase cannot be initialized.");
    }
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
} catch (error) {
  console.error("🔥 Firebase Initialization Error:", error.message);
  // Fallback or dummy app could be initialized here if needed for rendering non-Firebase parts
  app = null;
}

export const database = app ? getDatabase(app) : null;
export const auth = app ? getAuth(app) : null;
export default app;
