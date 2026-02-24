import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import emailService from '../services/emailService';
import emailService from '../services/emailService';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CTASection from '../components/shared/CTASection';
import Button from '../components/ui/Button';
import EmailIcon from '../components/icons/EmailIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import VideoWithFade from '../components/shared/VideoWithFade';
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
        <div className="contact-us-page-modern">
            <ToastContainer position="top-right" autoClose={4000} />

            {/* LAYER 1: FIXED HERO (Video + Title) */}
            <div className="fixed-hero-layer">
                <div className="contact-fullscreen-video-bg">
                    <VideoWithFade
                        src="/chess-video3.mp4"
                        className="background-video"
                    />
                    <div className="video-overlay-tint"></div>
                </div>

                <div className="hero-content-fixed">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Get In <span className="text-highlight">Touch</span>
                    </motion.h1>
                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        We're here to help you start your chess journey.
                    </motion.p>
        <div className="contact-us-page">
            <ToastContainer position="top-right" autoClose={4000} />
            <Navbar />

                    <motion.div
                        className="scroll-indicator"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 1 }}
                    >
                        Scroll down to explore
                    </motion.div>
                </div>
            </div>

            {/* LAYER 2: SCROLLING CONTENT - Scrolls OVER Fixed Hero */}
            <div className="scrolling-content-layer">
                <div className="spacer-100vh"></div>

                <section className="contact-content-curtain">
                    <div className="contact-container-centered">

                        {/* Info Cards Row */}
                        <div className="info-cards-row">
                            <div className="info-modern-card glass-card">
                                <EmailIcon size={24} color="#FF6B00" />
                                <div>
                                    <h3>Email</h3>
                                    <p>info@indianchessacad.com</p>
                                </div>
                            </div>
                            <div className="info-modern-card glass-card">
                                <PhoneIcon size={24} color="#FF6B00" />
                                <div>
                                    <h3>Phone</h3>
                                    <p>+91 77381 73864</p>
                                </div>
                            </div>
                            <div className="info-modern-card glass-card">
                                <ClockIcon size={24} color="#FF6B00" />
                                <div>
                                    <h3>Hours</h3>
                                    <p>Mon-Sat: 9 AM - 7 PM</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form Centered */}
                        <motion.div
                            className="contact-form-glass-centered"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2>Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div className="form-group half">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="your.email"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Phone number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Message</label>
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
                        </motion.div>

                        <div className="social-links-row-centered">
                            <a href="https://www.linkedin.com/company/indian-chess-academy/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                            <a href="https://www.instagram.com/indianchessacademy/" target="_blank" rel="noopener noreferrer">Instagram</a>
                            <a href="https://www.facebook.com/people/Indian-Chess-Academy/61555847004612/" target="_blank" rel="noopener noreferrer">Facebook</a>
                        </div>
                    </div>

                    <CTASection />
                    <Footer />
                </section>
            </div>
        </div>
    );
};

export default ContactUs;
