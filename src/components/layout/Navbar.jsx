import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();

    return (
        <header className="shared-navbar">
            <div className="navbar-container">
                <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img src="/logo.png" alt="Indian Chess Academy" className="navbar-logo-image" />
                </div>
                <nav className="navbar-menu">
                    <a href="/">Home</a>
                    <a href="/about">About Us</a>
                    <a href="/services">Services</a>
                    <a href="/contact">Contact Us</a>
                    <a href="/faq">FAQs</a>
                </nav>
                <Button onClick={() => navigate('/login')} className="navbar-btn">Login</Button>
            </div>
        </header>
    );
};

export default Navbar;
