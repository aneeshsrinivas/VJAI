import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
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

    // Coach emails (@coach.com domain)
    if (lowerEmail.endsWith('@coach.com')) {
        return 'coach';
    }

    // Student emails (@student.com domain)
    if (lowerEmail.endsWith('@student.com')) {
        return 'customer'; // Students use customer role
    }

    // Admin emails (@chess.com domain)
    if (lowerEmail.endsWith('@chess.com')) {
        return 'admin';
    }

    // Parent/Customer emails (gmail.com and others)
    return 'customer';
};

// Development mode flag - set to true to bypass Firebase for testing
const DEV_MODE = false;
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

const LICHESS_API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// Fire-and-forget: sync Lichess ratings if approved and last sync > 24h
async function syncLichessRating(uid, username) {
    try {
        const res = await fetch(`${LICHESS_API_BASE}/api/lichess/user/${encodeURIComponent(username)}`);
        const json = await res.json();
        if (!json.success) return;

        const { rapid, puzzle } = json.data;

        // Write new rating snapshot to subcollection
        await addDoc(collection(db, 'users', uid, 'ratingHistory'), {
            rapid: rapid || 0,
            puzzle: puzzle || 0,
            timestamp: serverTimestamp(),
            source: 'sync',
        });

        // Update current ratings + lastSyncedAt on user doc
        await updateDoc(doc(db, 'users', uid), {
            currentRapid: rapid || 0,
            currentPuzzle: puzzle || 0,
            lastSyncedAt: serverTimestamp(),
        });
    } catch (err) {
        console.error('Lichess rating sync failed:', err);
    }
}

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Tab-specific session isolation using sessionStorage (persists across page reloads in same tab)
    const getSessionUid = () => sessionStorage.getItem('sessionUid');
    const setSessionUid = (uid) => sessionStorage.setItem('sessionUid', uid);
    const clearSessionUid = () => sessionStorage.removeItem('sessionUid');

    // Mark tab as locked when contamination detected - persists across page reloads
    const isTabLocked = () => sessionStorage.getItem('tabLocked') === 'true';
    const lockTab = () => sessionStorage.setItem('tabLocked', 'true');
    const unlockTab = () => sessionStorage.removeItem('tabLocked');

    // Guard flag to block state updates if session contamination detected
    const isSessionValidRef = useRef(true);

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

                // Trigger Lichess rating sync for approved customer accounts
                const ud = userDoc.data();
                if (storedRole === 'customer' && ud.lichessStatus === 'approved' && ud.lichessUsername) {
                    const lastSync = ud.lastSyncedAt?.toDate?.() || new Date(0);
                    const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
                    if (hoursSinceSync >= 24) {
                        syncLichessRating(user.uid, ud.lichessUsername); // fire-and-forget
                    }
                }

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
            console.log('🔐 onAuthStateChanged fired. User:', user?.uid, 'Email:', user?.email);

            // FIRST CHECK: Is this tab locked due to contamination?
            if (isTabLocked()) {
                console.log('🔒 TAB IS LOCKED. Ignoring all state updates. User must refresh page.');
                setLoading(false);
                return;
            }

            // Session isolation: check if this tab's session matches the incoming user
            const storedSessionUid = getSessionUid();
            console.log('📍 Session isolation check - Stored UID:', storedSessionUid, 'Incoming UID:', user?.uid);

            if (user && storedSessionUid && storedSessionUid !== user.uid) {
                // Different user detected - SESSION CONTAMINATION!
                console.warn('🚨 SESSION MISMATCH! This tab had UID', storedSessionUid, 'but received user', user.uid);
                console.warn('🔄 RELOADING PAGE to prevent contamination. This is the safest approach.');

                // Mark that tab is locked
                lockTab();

                // Reload the page - this completely wipes state and forces fresh auth flow
                // Add small delay to ensure console logs are visible
                setTimeout(() => {
                    window.location.reload();
                }, 100);
                return;
            }

            // If session was invalidated by guard flag, don't process further
            if (!isSessionValidRef.current) {
                console.log('⛔ Session is invalid. Skipping state update.');
                setLoading(false);
                return;
            }

            // Re-enable session on successful login (only when re-enabling a valid session)
            if (user && storedSessionUid === user.uid) {
                isSessionValidRef.current = true;
            }

            // On first login, record the session UID in sessionStorage (tab-specific)
            if (user && !storedSessionUid) {
                console.log('✅ First login in this tab. Storing session UID:', user.uid);
                setSessionUid(user.uid);
                isSessionValidRef.current = true;
            }
            // On logout, clear the session UID
            if (!user) {
                console.log('🔓 User logged out. Clearing session UID');
                clearSessionUid();
                unlockTab(); // Allow re-login if user was locked
                isSessionValidRef.current = true;
            }

            setCurrentUser(user);
            if (user) {
                try {
                    // Fetch user role from Firestore
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        console.log('📄 Fetched user data. Role:', data.role, 'Name:', data.fullName);
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
                        console.log('📝 Created new user doc with role:', detectedRole);
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
