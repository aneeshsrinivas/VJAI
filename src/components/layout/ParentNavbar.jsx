import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, Settings, LogOut, User } from 'lucide-react';
import './ParentNavbar.css';

// ICA Colors
const COLORS = {
    orange: '#FC8A24',
    deepBlue: '#003366',
    oliveGreen: '#6B8E23',
    ivory: '#FFFEF3'
};

const ParentNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();
    const [dropdownOpen, setDropdownOpen] = React.useState(false);

    // Get display name from userData or email
    const getDisplayName = () => {
        if (userData?.fullName && userData.fullName.trim()) return userData.fullName;
        if (userData?.studentName && userData.studentName.trim()) return userData.studentName;
        if (currentUser?.email) {
            // Extract username from email
            const emailName = currentUser.email.split('@')[0];
            return emailName;
        }
        return 'User';
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className="dashboard-navbar" style={{ backgroundColor: COLORS.deepBlue }}>
            <div className="navbar-brand">
                <img src="/ica-logo.png" alt="ICA" className="navbar-logo" />
                <span className="navbar-title" style={{ color: 'white' }}>ICA Student Portal</span>
            </div>

            <div className="navbar-links">
                <a
                    onClick={() => navigate('/parent')}
                    className={`nav-link ${isActive('/parent')}`}
                    style={{ color: isActive('/parent') ? COLORS.orange : 'white' }}
                >
                    Dashboard
                </a>
                <a
                    onClick={() => navigate('/parent/schedule')}
                    className={`nav-link ${isActive('/parent/schedule')}`}
                    style={{ color: isActive('/parent/schedule') ? COLORS.orange : 'white' }}
                >
                    Schedule
                </a>
                <a
                    onClick={() => navigate('/parent/assignments')}
                    className={`nav-link ${isActive('/parent/assignments')}`}
                    style={{ color: isActive('/parent/assignments') ? COLORS.orange : 'white' }}
                >
                    Assignments
                </a>
                <a
                    onClick={() => navigate('/parent/payments')}
                    className={`nav-link ${isActive('/parent/payments')}`}
                    style={{ color: isActive('/parent/payments') ? COLORS.orange : 'white' }}
                >
                    Payments
                </a>
            </div>

            {/* User Account Dropdown */}
            <div className="account-dropdown-wrapper">
                <button
                    className="account-dropdown-trigger"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        color: 'white'
                    }}
                >
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: COLORS.orange,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '14px'
                    }}>
                        {getDisplayName().charAt(0).toUpperCase()}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: '600', fontSize: '13px' }}>{getDisplayName()}</div>
                        <div style={{ fontSize: '11px', opacity: 0.7 }}>Parent Account</div>
                    </div>
                    <ChevronDown size={16} style={{ opacity: 0.7 }} />
                </button>

                {dropdownOpen && (
                    <div className="account-dropdown-menu" style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '8px',
                        background: 'white',
                        borderRadius: '10px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        minWidth: '200px',
                        zIndex: 1000,
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
                            <div style={{ fontWeight: '600', color: COLORS.deepBlue }}>{getDisplayName()}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{currentUser?.email}</div>
                        </div>
                        <div style={{ padding: '8px' }}>
                            <button
                                onClick={() => { setDropdownOpen(false); navigate('/parent/settings'); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: 'none',
                                    background: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: COLORS.deepBlue,
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                            >
                                <Settings size={16} /> Settings
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: 'none',
                                    background: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#DC2626',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#FEE2E2'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Click outside to close dropdown */}
            {dropdownOpen && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                    onClick={() => setDropdownOpen(false)}
                />
            )}
        </nav>
    );
};

export default ParentNavbar;
