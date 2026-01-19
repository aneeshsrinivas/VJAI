import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { COLLECTIONS } from '../../config/firestoreCollections';
import AccountDropdown from '../ui/AccountDropdown';
import UserGroupIcon from '../icons/UserGroupIcon';
import './ParentNavbar.css';

const ParentNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, userData, logout } = useAuth();
    const [studentName, setStudentName] = useState('');

    useEffect(() => {
        const fetchStudentName = async () => {
            if (!currentUser?.uid) return;

            try {
                // Try to find student linked to this account
                const q = query(
                    collection(db, COLLECTIONS.STUDENTS),
                    where('accountId', '==', currentUser.uid)
                );
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data();
                    // Prefer student name, fallback to parent name
                    setStudentName(data.studentName || data.name || data.parentName || 'Student');
                } else if (userData?.fullName) {
                    setStudentName(userData.fullName);
                } else {
                    setStudentName('Parent Account');
                }
            } catch (error) {
                console.error("Error fetching student name:", error);
                setStudentName('Parent Account');
            }
        };

        fetchStudentName();
    }, [currentUser, userData]);

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className="dashboard-navbar">
            <div className="navbar-brand">
                <img src="/logo.png" alt="ICA" className="navbar-logo" />
                <span className="navbar-title">ICA Student Portal</span>
            </div>
            <div className="navbar-links">
                <a
                    onClick={() => navigate('/parent')}
                    className={`nav-link ${isActive('/parent')}`}
                >
                    Dashboard
                </a>
                <a
                    onClick={() => navigate('/parent/schedule')}
                    className={`nav-link ${isActive('/parent/schedule')}`}
                >
                    Schedule
                </a>
                <a
                    onClick={() => navigate('/parent/assignments')}
                    className={`nav-link ${isActive('/parent/assignments')}`}
                >
                    Assignments
                </a>
                <a
                    onClick={() => navigate('/parent/payments')}
                    className={`nav-link ${isActive('/parent/payments')}`}
                >
                    Payments
                </a>
            </div>
            <AccountDropdown
                userName={studentName || "Loading..."}
                userRole="Student Portal"
                customIcon={<UserGroupIcon size={20} color="white" />}
                onLogout={logout}
            />
        </nav>
    );
};

export default ParentNavbar;
