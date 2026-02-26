import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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

// Secondary Firebase app for Storage (has its own hardcoded config)
const storageConfig = {
    apiKey: "AIzaSyCtFDdQn3XCS0gaHyOBcHPhNnqWa45WRbg",
    authDomain: "indian-chess-academy.firebaseapp.com",
    projectId: "indian-chess-academy",
    storageBucket: "indian-chess-academy.firebasestorage.app",
    messagingSenderId: "528022572022",
    appId: "1:528022572022:web:1c946b1703ef265e7d15d7",
    measurementId: "G-S0X3B08L4J"
};

// Guard: only initialize primary Firebase if the API key is present and non-empty
const hasValidConfig = firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== '';

let app = null;
export let auth = null;
export let db = null;

if (hasValidConfig) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (e) {
        console.warn('Firebase primary app initialization failed:', e.message);
        auth = null;
        db = null;
    }
} else {
    console.warn('Firebase config missing — running without primary Firebase (DEV_MODE).');
}

// Initialize Storage from separate app (always available)
let storageApp = null;
export let storage = null;

try {
    storageApp = initializeApp(storageConfig, 'storageApp');
    storage = getStorage(storageApp);
} catch (e) {
    console.warn('Firebase storage initialization failed:', e.message);
}

export default app;
