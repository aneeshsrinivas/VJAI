import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/layout/Footer';
import CTASection from '../components/shared/CTASection';
import VideoWithFade from '../components/shared/VideoWithFade';
import './LegalPages.css';

const TermsAndConditions = () => {
    return (
        <div className="legal-page-modern">
            {/* Navbar handled globally */}

            {/* Hero Section */}
            <section className="legal-hero-modern">
                <div className="hero-bg-wrapper">
                    <img src="/chess-hero-bg.jpg" alt="Terms Background" className="hero-bg-img" />
                    <div className="hero-overlay-gradient"></div>
                </div>
                <div className="about-container relative-z">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Terms & <span className="text-highlight">Conditions</span>
                    </motion.h1>
                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        Transparency and trust are the foundation of our academy.
                    </motion.p>
                </div>
            </section>

            {/* Split Content */}
            <section className="legal-content-modern">
                <div className="about-container legal-split-layout">

                    {/* Left: Text Content */}
                    <div className="legal-text-side">
                        <motion.div
                            className="legal-doc-container"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="legal-section">
                                <h2>1. Acceptance of Terms</h2>
                                <p>
                                    By accessing and using Indian Chess Academy's services, you accept and agree to be bound by the terms and provision of this agreement.
                                    If you do not agree to abide by the above, please do not use this service.
                                </p>
                            </div>

                            <div className="legal-section">
                                <h2>2. Use of Services</h2>
                                <p>
                                    Indian Chess Academy provides online chess coaching services for children. Our services include live classes, recorded sessions,
                                    study materials, and personalized coaching. You agree to use these services only for lawful purposes and in accordance with these Terms.
                                </p>
                            </div>

                            <div className="legal-section">
                                <h2>3. Registration and Account</h2>
                                <p>
                                    To access certain features of our services, you may be required to register for an account. You agree to provide accurate, current,
                                    and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                                </p>
                                <p>
                                    You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us
                                    immediately of any unauthorized use of your account.
                                </p>
                            </div>

                            <div className="legal-section">
                                <h2>4. Payment and Refunds</h2>
                                <p>
                                    Payment for our services must be made in advance. We accept various payment methods including UPI, credit/debit cards, and net banking.
                                    All fees are non-refundable except as required by law or as explicitly stated in our refund policy.
                                </p>
                                <p>
                                    We offer a 7-day money-back guarantee from the date of enrollment. If you are not satisfied with our services within this period,
                                    you may request a full refund.
                                </p>
                            </div>

                            <div className="legal-section">
                                <h2>5. Class Attendance and Conduct</h2>
                                <p>
                                    Students are expected to attend all scheduled classes. If a student is unable to attend a class, advance notice should be provided.
                                    Missed classes may be made up subject to coach availability.
                                </p>
                                <p>
                                    Students and parents are expected to maintain respectful and appropriate conduct during all interactions with coaches and staff.
                                    We reserve the right to terminate services for any student who engages in disruptive or inappropriate behavior.
                                </p>
                            </div>

                            <div className="legal-section">
                                <h2>6. Intellectual Property</h2>
                                <p>
                                    All content provided through our services, including but not limited to course materials, videos, worksheets, and study guides,
                                    is the intellectual property of Indian Chess Academy. You may not reproduce, distribute, or create derivative works from this content
                                    without our express written permission.
                                </p>
                            </div>

                            <div className="legal-section">
                                <h2>7. Privacy and Data Protection</h2>
                                <p>
                                    We are committed to protecting your privacy. Our Privacy Policy explains how we collect, use, and protect your personal information.
                                    By using our services, you consent to the collection and use of information as described in our Privacy Policy.
                                </p>
                            </div>

                            <div className="legal-section">
                                <h2>8. Limitation of Liability</h2>
                                <p>
                                    Indian Chess Academy shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from
                                    your use or inability to use our services. Our total liability to you for all claims arising from the use of our services shall not
                                    exceed the amount you paid for the services.
                                </p>
                            </div>

                            <div className="legal-section">
                                <h2>9. Modifications to Terms</h2>
                                <p>
                                    We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on our website.
                                    Your continued use of our services after such modifications constitutes your acceptance of the updated Terms.
                                </p>
                            </div>

                            <div className="legal-section">
                                <h2>10. Contact Information</h2>
                                <p>
                                    If you have any questions about these Terms, please contact us at:
                                </p>
                                <div className="contact-mini-block">
                                    <p><strong>Email:</strong> info@indianchessacad.com</p>
                                    <p><strong>Phone:</strong> +91 77381 73864</p>
                                </div>
                            </div>

                            <div className="legal-footer-note">
                                <p><em>Last updated: January 2026</em></p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Sticky Video */}
                    <div className="legal-visual-side">
                        <div className="sticky-legal-wrapper">
                            <div className="video-frame">
                                <VideoWithFade
                                    src="/chess-video.mp4"
                                    className="legal-video"
                                />
                                <div className="video-overlay-tint"></div>
                            </div>
                            <div className="video-label-legal">
                                <span>Fair Play & Integrity</span>
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

export default TermsAndConditions;
