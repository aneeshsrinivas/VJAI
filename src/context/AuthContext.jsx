import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Default admin credentials
const ADMIN_EMAIL = 'indianchessacademy@chess.com';
const ADMIN_PASSWORD = 'pass@1234';

// Role detection based on email domain
const detectRoleFromEmail = (email) => {
    if (!email) return 'customer';
    const lowerEmail = email.toLowerCase();

    // Admin email
    if (lowerEmail === ADMIN_EMAIL.toLowerCase()) {
        return 'admin';
    }

    // Coach emails (any @coach.com domain)
    if (lowerEmail.endsWith('@coach.com')) {
        return 'coach';
    }

    // Parent/Customer emails (gmail.com and others)
    return 'customer';
};

// Development mode flag - set to true to bypass Firebase for testing
const DEV_MODE = true;
const DEV_USER = {
    uid: 'dev-user-001',
    email: 'parent@example.com'
};
const DEV_COACH_USER = {
    uid: 'dev-coach-001',
    email: 'coach@coach.com'
};
const DEV_ADMIN_USER = {
    uid: 'dev-admin-001',
    email: 'indianchessacademy@chess.com'
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Signup function with auto-role detection
    const signup = async (email, password, additionalData = {}) => {
        // Auto-detect role based on email
        const detectedRole = detectRoleFromEmail(email);

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email,
            role: detectedRole,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            ...additionalData
        });

        setUserRole(detectedRole);
        return { user, role: detectedRole };
    };

    // Login function with admin detection
    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if admin email
        const detectedRole = detectRoleFromEmail(email);
        let finalRole = detectedRole;

        // Update lastLoginAt in Firestore and get stored role
        try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                await updateDoc(userRef, {
                    lastLoginAt: serverTimestamp()
                });
                // Use the stored role from Firestore
                const storedRole = userDoc.data().role;
                finalRole = storedRole || detectedRole;
                setUserRole(finalRole);
                setUserData(userDoc.data());
                return { user, role: storedRole };
            } else {
                // Create user doc if missing (for admin or new users)
                await setDoc(userRef, {
                    email: user.email,
                    role: detectedRole,
                    createdAt: serverTimestamp(),
                    lastLoginAt: serverTimestamp()
                });
                setUserRole(detectedRole);
                return { user, role: detectedRole };
            }
        } catch (e) {
            console.log('Could not update lastLoginAt:', e);
            setUserRole(detectedRole);
            return { user, role: detectedRole };
        }

        return { user, role: finalRole };
    };

    // Logout function
    const logout = () => {
        setUserRole(null);
        setUserData(null);
        setCurrentUser(null);

        if (DEV_MODE) {
            // In dev mode, just clear the state
            return Promise.resolve();
        }

        return signOut(auth);
    };

    // Initialize default admin account (run once on first load)
    const initializeAdmin = async () => {
        try {
            // Try to create admin account (will fail silently if exists)
            await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
            console.log('Admin account created');

            // Get the user and create Firestore doc
            const adminUser = auth.currentUser;
            if (adminUser) {
                await setDoc(doc(db, 'users', adminUser.uid), {
                    email: ADMIN_EMAIL,
                    role: 'admin',
                    fullName: 'System Admin',
                    createdAt: serverTimestamp(),
                    lastLoginAt: serverTimestamp()
                });
                // Sign out so user can log in manually
                await signOut(auth);
            }
        } catch (e) {
            // Account already exists or other error - that's fine
            if (e.code !== 'auth/email-already-in-use') {
                console.log('Admin init note:', e.message);
            }
        }
    };

    useEffect(() => {
        // In dev mode, immediately set a logged-in user
        if (DEV_MODE) {
            const user = DEV_USER;
            const detectedRole = detectRoleFromEmail(user.email);
            setCurrentUser(user);
            setUserRole(detectedRole);
            setUserData({
                email: user.email,
                role: detectedRole,
                fullName: 'Test Parent',
                createdAt: new Date(),
                lastLoginAt: new Date()
            });
            setLoading(false);
            return;
        }

        // Original Firebase auth code
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                try {
                    // Fetch user role from Firestore
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserRole(data.role);
                        setUserData(data);
                    } else {
                        // Handle case where user exists in Auth but not Firestore
                        const detectedRole = detectRoleFromEmail(user.email);
                        await setDoc(userDocRef, {
                            email: user.email,
                            role: detectedRole,
                            createdAt: serverTimestamp(),
                            recovered: true
                        });
                        setUserRole(detectedRole);
                    }
                } catch (err) {
                    console.error("Error fetching user data:", err);
                    setUserRole(detectRoleFromEmail(user.email));
                }
            } else {
                setUserRole(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Function to switch between dev users (for testing)
    const switchDevUser = (userType = 'parent') => {
        if (!DEV_MODE) return;

        let user;
        switch (userType.toLowerCase()) {
            case 'admin':
                user = DEV_ADMIN_USER;
                break;
            case 'coach':
                user = DEV_COACH_USER;
                break;
            case 'parent':
            default:
                user = DEV_USER;
                break;
        }

        const detectedRole = detectRoleFromEmail(user.email);
        setCurrentUser(user);
        setUserRole(detectedRole);
        setUserData({
            email: user.email,
            role: detectedRole,
            fullName: userType.charAt(0).toUpperCase() + userType.slice(1),
            createdAt: new Date(),
            lastLoginAt: new Date()
        });
    };

    const value = {
        currentUser,
        userRole,
        userData,
        signup,
        login,
        logout,
        detectRoleFromEmail,
        switchDevUser,
        isDevMode: DEV_MODE
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
