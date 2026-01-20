import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Primary Firebase (Auth & DB)
const app = initializeApp(firebaseConfig);

// Initialize Secondary Firebase (Storage Only)
const storageConfig = {
    apiKey: "AIzaSyCtFDdQn3XCS0gaHyOBcHPhNnqWa45WRbg",
    authDomain: "indian-chess-academy.firebaseapp.com",
    projectId: "indian-chess-academy",
    storageBucket: "indian-chess-academy.firebasestorage.app",
    messagingSenderId: "528022572022",
    appId: "1:528022572022:web:1c946b1703ef265e7d15d7",
    measurementId: "G-S0X3B08L4J"
};
const storageApp = initializeApp(storageConfig, "storageApp");

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
// Use the storageApp for storage service
export const storage = getStorage(storageApp);
export const analytics = getAnalytics(app);

export default app;
