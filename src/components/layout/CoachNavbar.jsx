import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AccountDropdown from '../ui/AccountDropdown';
import UserGroupIcon from '../icons/UserGroupIcon';
import './CoachNavbar.css';

const CoachNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userData } = useAuth();

    const navLinks = [
        { path: '/coach', label: 'Dashboard' },
        { path: '/coach/schedule', label: 'Schedule' },
        { path: '/coach/batches', label: 'Batches' },
        { path: '/coach/chat', label: 'Messages' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="coach-navbar">
            <div className="coach-navbar-container">
                <div className="coach-navbar-brand">
                    <h2 className="coach-navbar-title">ICA Coach Portal</h2>
                </div>

                <div className="coach-navbar-links">
                    {navLinks.map((link) => (
                        <button
                            key={link.path}
                            onClick={() => navigate(link.path)}
                            className={`coach-nav-link ${isActive(link.path) ? 'active' : ''}`}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>

                <div className="coach-navbar-account">
                    <AccountDropdown
                        userName={userData?.fullName || "Coach"}
                        userRole="Coach"
                        customIcon={<UserGroupIcon />}
                    />
                </div>
            </div>
        </nav>
    );
};

export default CoachNavbar;
