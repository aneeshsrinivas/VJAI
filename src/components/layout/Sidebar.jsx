import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, GraduationCap, Wallet, Radio, MessageSquare,
    CreditCard, Calendar, BookOpen, Layers, Shield, BarChart3, LogOut, ChevronRight, AlertTriangle, Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import './Sidebar.css';

const Sidebar = ({ role = 'admin', activePath = '/dashboard' }) => {
    const navigate = useNavigate();
    const { logout, currentUser, userData } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    // Fetch user profile dynamically
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!currentUser?.uid) return;

            if (role === 'coach') {
                // Try coaches collection first
                const coachQuery = query(
                    collection(db, 'coaches'),
                    where('userId', '==', currentUser.uid)
                );
                const coachSnap = await getDocs(coachQuery);
                if (!coachSnap.empty) {
                    setUserProfile(coachSnap.docs[0].data());
                    return;
                }
            }

            // Fallback to users collection
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
                setUserProfile(userDoc.data());
            }
        };

        fetchUserProfile();
    }, [currentUser, role]);

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed', error);
            window.location.href = '/login';
        }
    };

    const getUserDisplayName = () => {
        if (userProfile?.fullName) return userProfile.fullName;
        if (userProfile?.coachName) return userProfile.coachName;
        if (userProfile?.name) return userProfile.name;
        if (userData?.fullName) return userData.fullName;

        // Extract from email
        const email = currentUser?.email || '';
        const username = email.split('@')[0];

        // Special handling for known users
        if (username.includes('abhirambhat')) return 'Abhiram Bhat';

        // Capitalize first letter
        return username.charAt(0).toUpperCase() + username.slice(1) || (role === 'admin' ? 'Admin' : 'Coach');
    };

    const getUserInitials = () => {
        const name = getUserDisplayName();
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return parts[0].charAt(0) + parts[1].charAt(0);
        }
        return name.charAt(0).toUpperCase();
    };

    const links = role === 'admin' ? [
        { label: 'Command Center', icon: <LayoutDashboard size={20} />, path: '/admin' },
        { label: 'Live Analytics', icon: <BarChart3 size={20} />, path: '/admin/live-analytics' },
        { label: 'Demo Pipeline', icon: <Users size={20} />, path: '/admin/demos' },
        { label: 'Students', icon: <GraduationCap size={20} />, path: '/admin/students' },
        { label: 'Coach Roster', icon: <BookOpen size={20} />, path: '/admin/coaches' },
        { label: 'Finances', icon: <Wallet size={20} />, path: '/admin/finances' },
        { label: 'Broadcast', icon: <Radio size={20} />, path: '/admin/broadcast' },
        { label: 'Messages', icon: <MessageSquare size={20} />, path: '/chat' },
        { label: 'Subscriptions', icon: <CreditCard size={20} />, path: '/admin/subscriptions' },
        { label: 'Accounts', icon: <Shield size={20} />, path: '/admin/accounts' },
    ] : [
        { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/coach' },
        { label: 'My Students', icon: <Users size={20} />, path: '/coach/students' },
        { label: 'Batches', icon: <Layers size={20} />, path: '/coach/batches' },
        { label: 'Schedule', icon: <Calendar size={20} />, path: '/coach/schedule' },
        { label: 'Messages', icon: <MessageSquare size={20} />, path: '/coach/chat' },
    ];

    return (
        <>
            {/* Custom Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="logout-modal-overlay">
                    <div className="logout-modal">
                        <div className="logout-modal-icon">
                            <AlertTriangle size={28} color="#dc2626" />
                        </div>
                        <h3>Confirm Logout</h3>
                        <p>
                            Are you sure you want to log out of the {role === 'admin' ? 'Admin Panel' : 'Coach Portal'}?
                            You will need to sign in again.
                        </p>
                        <div className="logout-modal-actions">
                            <button className="btn-cancel" onClick={() => setShowLogoutConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn-confirm" onClick={handleLogout}>
                                Yes, Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <aside className="sidebar">
                {/* Brand Header with Chess Logo */}
                <div className="sidebar-brand">
                    <div className="brand-logo">
                        <Crown size={20} color="#FC8A24" />
                    </div>
                    <div className="brand-text">
                        <span className="brand-name">Indian Chess Academy</span>
                        <span className="brand-role">{role === 'admin' ? '⚡ Admin Portal' : '♟️ Coach Portal'}</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {links.map((link) => (
                        <div
                            key={link.path}
                            className={`nav-item ${activePath === link.path ? 'active' : ''}`}
                            onClick={() => navigate(link.path)}
                        >
                            <span className="nav-icon">{link.icon}</span>
                            <span className="nav-label">{link.label}</span>
                            {activePath === link.path && <div className="active-indicator"></div>}
                        </div>
                    ))}
                </nav>

                {/* User Profile Footer - Works for Both Admin and Coach */}
                <div className="sidebar-footer">
                    {showDropdown && (
                        <div className="dropdown-menu">
                            <button
                                className="dropdown-logout-btn"
                                onClick={() => {
                                    setShowDropdown(false);
                                    setShowLogoutConfirm(true);
                                }}
                            >
                                <LogOut size={16} />
                                <span>Log Out</span>
                            </button>
                        </div>
                    )}

                    <button
                        className={`user-profile-btn ${showDropdown ? 'active' : ''}`}
                        onClick={() => setShowDropdown(!showDropdown)}
                        type="button"
                    >
                        <div className={`user-avatar ${role === 'admin' ? 'admin' : 'coach'}`}>
                            {getUserInitials()}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{getUserDisplayName()}</div>
                            <div className="user-role">
                                {role === 'admin' ? '👑 System Administrator' : '🎓 Chess Coach'}
                            </div>
                        </div>
                        <ChevronRight
                            size={16}
                            className={`chevron ${showDropdown ? 'rotated' : ''}`}
                        />
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
