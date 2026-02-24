import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
                        <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/about" onClick={() => setIsMenuOpen(false)}>About Us</Link>
                        <Link to="/services" onClick={() => setIsMenuOpen(false)}>Services</Link>
                        <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
                        <Link to="/faq" onClick={() => setIsMenuOpen(false)}>FAQs</Link>
                    </nav>
                    <div className="navbar-actions mobile-only">
                        <Button onClick={() => { navigate('/login'); setIsMenuOpen(false); }} className="navbar-btn">Login</Button>
                    </div>
                </div>

                <div className="navbar-actions desktop-only">
                    <Button onClick={() => navigate('/login')} className="navbar-btn">Login</Button>
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
