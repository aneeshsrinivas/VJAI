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

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Signup function
    const signup = async (email, password, role, additionalData = {}) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email,
            role,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            ...additionalData
        });

        setUserRole(role);
        return user;
    };

    // Login function - now updates lastLoginAt
    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Update lastLoginAt in Firestore
        try {
            await updateDoc(doc(db, 'users', userCredential.user.uid), {
                lastLoginAt: serverTimestamp()
            });
        } catch (e) {
            console.log('Could not update lastLoginAt:', e);
        }

        return userCredential;
    };

    // Logout function
    const logout = () => {
        return signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                try {
                    // Fetch user role from Firestore
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setUserRole(userDoc.data().role);
                    } else {
                        // Handle case where user exists in Auth but not Firestore
                        console.warn("User document not found in Firestore. Creating validation record...");
                        // Self-healing: Create a default doc if missing
                        await setDoc(userDocRef, {
                            email: user.email,
                            role: 'customer',
                            createdAt: new Date(),
                            recovered: true
                        });
                        setUserRole('customer');
                    }
                } catch (err) {
                    console.error("Error fetching user data (Access/Network):", err);
                    // Fallback to allow 'partial' login or handle offline state
                    // For now, default to customer to allow UI to load
                    setUserRole('customer');
                }
            } else {
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        signup,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
