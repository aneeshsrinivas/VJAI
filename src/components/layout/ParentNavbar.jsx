import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AccountDropdown from '../ui/AccountDropdown';
import UserGroupIcon from '../icons/UserGroupIcon';
import './ParentNavbar.css';

const ParentNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

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
                userName="Sharma Family"
                userRole="Parent Account"
                customIcon={<UserGroupIcon size={20} color="white" />}
            />
        </nav>
    );
};

export default ParentNavbar;
