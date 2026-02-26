import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const { currentUser, logout, userRole, switchDevUser, isDevMode } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDevMenuOpen, setIsDevMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleSwitchUser = (userType) => {
        if (switchDevUser) {
            switchDevUser(userType);
            // Navigate to appropriate dashboard
            if (userType === 'admin') navigate('/admin');
            else if (userType === 'coach') navigate('/coach');
            else navigate('/parent');
        }
        setIsDevMenuOpen(false);
    };

    return (
        <header className="shared-navbar">
            <div className="navbar-container">
                <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img src="/logo.png" alt="Indian Chess Academy" className="navbar-logo-image" />
                    <span className="navbar-logo-text">Indian Chess Academy</span>
                </div>

                <div className={`navbar-menu-container ${isMenuOpen ? 'active' : ''}`}>
                    <nav className="navbar-menu">
                        {!currentUser && (
                            <>
                                <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                                <Link to="/about" onClick={() => setIsMenuOpen(false)}>About Us</Link>
                                <Link to="/services" onClick={() => setIsMenuOpen(false)}>Services</Link>
                                <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
                                <Link to="/faq" onClick={() => setIsMenuOpen(false)}>FAQs</Link>
                            </>
                        )}
                        {currentUser && (
                            <>
                                {userRole === 'customer' && <Link to="/parent" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>}
                                {userRole === 'coach' && <Link to="/coach" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>}
                                {userRole === 'admin' && <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>}
                            </>
                        )}
                    </nav>
                    <div className="navbar-actions mobile-only">
                        {!currentUser ? (
                            <Button onClick={() => { navigate('/login'); setIsMenuOpen(false); }} className="navbar-btn">Login</Button>
                        ) : (
                            <>
                                {isDevMode && (
                                    <div className="dev-switcher-mobile" style={{ marginRight: '10px' }}>
                                        <select
                                            onChange={(e) => handleSwitchUser(e.target.value)}
                                            defaultValue={userRole === 'customer' ? 'parent' : userRole}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '4px',
                                                border: '1px solid #ccc',
                                                fontSize: '12px'
                                            }}
                                        >
                                            <option value="parent">Switch: Parent</option>
                                            <option value="coach">Switch: Coach</option>
                                            <option value="admin">Switch: Admin</option>
                                        </select>
                                    </div>
                                )}
                                <Button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="navbar-btn" style={{ backgroundColor: '#d32f2f' }}>Logout</Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="navbar-actions desktop-only">
                    {!currentUser ? (
                        <Button onClick={() => navigate('/login')} className="navbar-btn">Login</Button>
                    ) : (
                        <>
                            {isDevMode && (
                                <div className="dev-switcher" style={{ marginRight: '10px', position: 'relative' }}>
                                    <button
                                        onClick={() => setIsDevMenuOpen(!isDevMenuOpen)}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '4px',
                                            border: '1px solid #666',
                                            backgroundColor: '#f5f5f5',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Switch User ▼
                                    </button>
                                    {isDevMenuOpen && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            backgroundColor: 'white',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            minWidth: '120px',
                                            zIndex: 1000,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}>
                                            <button
                                                onClick={() => handleSwitchUser('parent')}
                                                style={{
                                                    display: 'block',
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    textAlign: 'left',
                                                    border: 'none',
                                                    backgroundColor: 'transparent',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Parent
                                            </button>
                                            <button
                                                onClick={() => handleSwitchUser('coach')}
                                                style={{
                                                    display: 'block',
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    textAlign: 'left',
                                                    border: 'none',
                                                    backgroundColor: 'transparent',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    borderTop: '1px solid #eee'
                                                }}
                                            >
                                                Coach
                                            </button>
                                            <button
                                                onClick={() => handleSwitchUser('admin')}
                                                style={{
                                                    display: 'block',
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    textAlign: 'left',
                                                    border: 'none',
                                                    backgroundColor: 'transparent',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    borderTop: '1px solid #eee'
                                                }}
                                            >
                                                Admin
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            <Button onClick={handleLogout} className="navbar-btn" style={{ backgroundColor: '#d32f2f' }}>Logout</Button>
                        </>
                    )}
                </div>

                <button className="navbar-hamburger" onClick={toggleMenu} aria-label="Toggle menu">
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
