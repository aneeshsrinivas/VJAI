import React from 'react';
import LinkedInIcon from '../icons/LinkedInIcon';
import InstagramIcon from '../icons/InstagramIcon';
import FacebookIcon from '../icons/FacebookIcon';
import WhatsAppIcon from '../icons/WhatsAppIcon';
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
                        <a href="/pricing?level=beginner">Beginner</a>
                        <a href="/pricing?level=intermediate">Intermediate</a>
                        <a href="/pricing?level=advanced">Advanced</a>
                        <a href="/pricing?type=1v1">1v1 Tutoring</a>
                        <a href="/pricing?type=certification">Certification Programs</a>
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
                        <a href="https://www.linkedin.com/company/indian-chess-academy/" target="_blank" rel="noopener noreferrer" className="social-link">
                            <LinkedInIcon size={20} color="#EBD6C3" />
                            <span>LinkedIn</span>
                        </a>
                        <a href="https://www.instagram.com/indianchessacademy/" target="_blank" rel="noopener noreferrer" className="social-link">
                            <InstagramIcon size={20} color="#EBD6C3" />
                            <span>Instagram</span>
                        </a>
                        <a href="https://www.facebook.com/people/Indian-Chess-Academy/61555847004612/" target="_blank" rel="noopener noreferrer" className="social-link">
                            <FacebookIcon size={20} color="#EBD6C3" />
                            <span>Facebook</span>
                        </a>
                        <a href="https://api.whatsapp.com/send/?phone=917738173864&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="social-link">
                            <WhatsAppIcon size={20} color="#EBD6C3" />
                            <span>WhatsApp</span>
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
