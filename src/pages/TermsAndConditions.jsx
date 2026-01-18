import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CTASection from '../components/shared/CTASection';
import './TermsAndConditions.css';

const TermsAndConditions = () => {
    return (
        <div className="terms-page">
            <Navbar />

            <section className="terms-hero">
                <div className="terms-hero-content">
                    <h1>Terms & Conditions</h1>
                    <p>Please read these terms carefully before using our services</p>
                </div>
            </section>

            <section className="terms-content">
                <div className="terms-container">
                    <div className="terms-section">
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Indian Chess Academy's services, you accept and agree to be bound by the terms and provision of this agreement.
                            If you do not agree to abide by the above, please do not use this service.
                        </p>
                    </div>

                    <div className="terms-section">
                        <h2>2. Use of Services</h2>
                        <p>
                            Indian Chess Academy provides online chess coaching services for children. Our services include live classes, recorded sessions,
                            study materials, and personalized coaching. You agree to use these services only for lawful purposes and in accordance with these Terms.
                        </p>
                    </div>

                    <div className="terms-section">
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

                    <div className="terms-section">
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

                    <div className="terms-section">
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

                    <div className="terms-section">
                        <h2>6. Intellectual Property</h2>
                        <p>
                            All content provided through our services, including but not limited to course materials, videos, worksheets, and study guides,
                            is the intellectual property of Indian Chess Academy. You may not reproduce, distribute, or create derivative works from this content
                            without our express written permission.
                        </p>
                    </div>

                    <div className="terms-section">
                        <h2>7. Privacy and Data Protection</h2>
                        <p>
                            We are committed to protecting your privacy. Our Privacy Policy explains how we collect, use, and protect your personal information.
                            By using our services, you consent to the collection and use of information as described in our Privacy Policy.
                        </p>
                    </div>

                    <div className="terms-section">
                        <h2>8. Limitation of Liability</h2>
                        <p>
                            Indian Chess Academy shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from
                            your use or inability to use our services. Our total liability to you for all claims arising from the use of our services shall not
                            exceed the amount you paid for the services.
                        </p>
                    </div>

                    <div className="terms-section">
                        <h2>9. Modifications to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on our website.
                            Your continued use of our services after such modifications constitutes your acceptance of the updated Terms.
                        </p>
                    </div>

                    <div className="terms-section">
                        <h2>10. Contact Information</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <p>
                            Email: info@indianchessacad.com<br />
                            Phone: +91 77381 73864
                        </p>
                    </div>

                    <div className="terms-footer-note">
                        <p><em>Last updated: January 2026</em></p>
                    </div>
                </div>
            </section>

            <CTASection />
            <Footer />
        </div>
    );
};

export default TermsAndConditions;
