import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Re-use the same config as the main app
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

/**
 * Creates a new user account using a secondary Firebase App instance.
 * This prevents the current Admin user from being signed out.
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const createCoachAccount = async (email, password) => {
    let secondaryApp;
    try {
        const appName = `SecondaryApp_${Date.now()}`;
        secondaryApp = initializeApp(firebaseConfig, appName);
        const secondaryAuth = getAuth(secondaryApp);

        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const user = userCredential.user;

        await signOut(secondaryAuth);

        return { success: true, uid: user.uid, email: user.email };
    } catch (error) {
        console.error('Error creating coach account:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Creates a Parent account for LMS access.
 * Uses secondary app to avoid signing out the admin.
 * 
 * @param {string} email - The parent's login email (can be @student.com format)
 * @param {string} password - Temporary password set by admin
 * @returns {Promise<{success: boolean, uid?: string, error?: string}>}
 */
export const createParentAuthAccount = async (email, password) => {
    let secondaryApp;
    try {
        const appName = `ParentApp_${Date.now()}`;
        secondaryApp = initializeApp(firebaseConfig, appName);
        const secondaryAuth = getAuth(secondaryApp);

        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const user = userCredential.user;

        // Sign out from secondary to clean up
        await signOut(secondaryAuth);

        console.log('✅ Parent Auth account created:', email);
        return { success: true, uid: user.uid, email: user.email };
    } catch (error) {
        console.error('Error creating parent account:', error);
        return { success: false, error: error.message };
    }
};
