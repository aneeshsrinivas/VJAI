import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast, ToastContainer } from 'react-toastify';
import emailService from '../services/emailService';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CTASection from '../components/shared/CTASection';
import Button from '../components/ui/Button';
import EmailIcon from '../components/icons/EmailIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import ClockIcon from '../components/icons/ClockIcon';
import './ContactUs.css';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await addDoc(collection(db, 'contact_inquiries'), {
                ...formData,
                status: 'NEW',
                createdAt: serverTimestamp()
            });

            // Send Email Notification
            await emailService.sendContactFormEmail(formData);

            toast.success('Thank you! We will get back to you shortly.');
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            toast.error('Failed to submit. Please try again.');
            console.error('Error submitting contact form:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="contact-us-page">
            <ToastContainer position="top-right" autoClose={4000} />
            <Navbar />

            <section className="contact-hero">
                <div className="contact-hero-content">
                    <h1>Contact Us</h1>
                    <p>Get in touch with our team. We're here to help!</p>
                </div>
            </section>

            <section className="contact-content">
                <div className="contact-container">
                    <div className="contact-grid">
                        <div className="contact-form-section">
                            <h2>Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Message *</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>
                                <Button type="submit" className="submit-contact-btn" disabled={submitting}>
                                    {submitting ? 'Sending...' : 'Send Message'}
                                </Button>
                            </form>
                        </div>

                        <div className="contact-info-section">
                            <h2>Get in Touch</h2>
                            <div className="contact-info-cards">
                                <div className="contact-info-card">
                                    <EmailIcon size={40} color="#D4AF37" />
                                    <h3>Email</h3>
                                    <p>info@indianchessacad.com</p>
                                </div>
                                <div className="contact-info-card">
                                    <PhoneIcon size={40} color="#D4AF37" />
                                    <h3>Phone</h3>
                                    <p>+91 77381 73864</p>
                                </div>
                                <div className="contact-info-card">
                                    <ClockIcon size={40} color="#D4AF37" />
                                    <h3>Office Hours</h3>
                                    <p>Mon-Sat: 9 AM - 7 PM</p>
                                    <p>Sunday: Closed</p>
                                </div>
                                <div className="contact-info-card">
                                    <div className="social-icons-contact">
                                        <a href="https://www.linkedin.com/company/indian-chess-academy/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                                        <a href="https://www.instagram.com/indianchessacademy/" target="_blank" rel="noopener noreferrer">Instagram</a>
                                        <a href="https://www.facebook.com/people/Indian-Chess-Academy/61555847004612/" target="_blank" rel="noopener noreferrer">Facebook</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <CTASection />
            <Footer />
        </div>
    );
};

export default ContactUs;
