import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="shared-footer">
            <div className="footer-content">
                <div className="footer-logo-section">
                    <img src="/logo.png" alt="Indian Chess Academy" className="footer-logo-large" />
                </div>
                <div className="footer-columns">
                    <div className="footer-column">
                        <h4>Our Courses</h4>
                        <a href="/pricing">All Courses</a>
                        <a href="/pricing">Beginner</a>
                        <a href="/pricing">Intermediate</a>
                        <a href="/pricing">Advanced</a>
                        <a href="/pricing">1v1 Tutoring</a>
                        <a href="/pricing">Certification Programs</a>
                    </div>
                    <div className="footer-column">
                        <h4>Academy</h4>
                        <a href="/">Home</a>
                        <a href="/about">About Us</a>
                        <a href="/services">Services</a>
                        <a href="/contact">Contact Us</a>
                        <a href="/faq">FAQs</a>
                        <a href="/terms">Terms & Conditions</a>
                        <a href="/privacy">Privacy Policy</a>
                    </div>
                    <div className="footer-column">
                        <h4>Connect with us</h4>
                        <a href="https://www.linkedin.com/company/106137887/" target="_blank" rel="noopener noreferrer">
                            <span className="footer-icon">🔗</span> LinkedIn
                        </a>
                        <a href="https://www.instagram.com/indianchessacademy/" target="_blank" rel="noopener noreferrer">
                            <span className="footer-icon">📷</span> Instagram
                        </a>
                        <a href="https://www.facebook.com/profile.php?id=61555847004612" target="_blank" rel="noopener noreferrer">
                            <span className="footer-icon">📘</span> Facebook
                        </a>
                        <a href="https://wa.me/917738173864" target="_blank" rel="noopener noreferrer">
                            <span className="footer-icon">💬</span> WhatsApp
                        </a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>Copyright 2026 © Indian Chess Academy | Built with strategic elegance</p>
            </div>
        </footer>
    );
};

export default Footer;
