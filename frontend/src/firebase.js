import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app, auth, db;

try {
  // Only initialize if we have an API key
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.warn("⚠️ No Firebase API Key found. Running in Local MVP Mock Mode.");
    // Export mock objects that won't crash the app
    auth = { 
      currentUser: { 
        uid: "mock-user-1", 
        phoneNumber: "+919999999999",
        getIdToken: async () => "mock-token"
      } 
    };
    db = {}; // Mock firestore
  }
} catch (error) {
  console.error("Firebase initialization error", error);
  auth = { currentUser: null };
  db = {};
}

export { auth, db };
