import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CTASection from '../components/shared/CTASection';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
    return (
        <div className="privacy-page">
            <Navbar />

            <section className="privacy-hero">
                <div className="privacy-hero-content">
                    <h1>Privacy Policy</h1>
                    <p>How we collect, use, and protect your information</p>
                </div>
            </section>

            <section className="privacy-content">
                <div className="privacy-container">
                    <div className="privacy-section">
                        <h2>1. Information We Collect</h2>
                        <p>
                            We collect information that you provide directly to us when you register for our services, including:
                        </p>
                        <ul>
                            <li>Student's name, age, and grade level</li>
                            <li>Parent/guardian contact information (name, email, phone number)</li>
                            <li>Payment information (processed securely through third-party payment processors)</li>
                            <li>Chess skill level and learning preferences</li>
                        </ul>
                        <p>
                            We also automatically collect certain information when you use our services, including:
                        </p>
                        <ul>
                            <li>Class attendance and participation data</li>
                            <li>Progress reports and assessment results</li>
                            <li>Communication records with coaches and staff</li>
                            <li>Technical information such as IP address, browser type, and device information</li>
                        </ul>
                    </div>

                    <div className="privacy-section">
                        <h2>2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to:
                        </p>
                        <ul>
                            <li>Provide, maintain, and improve our chess coaching services</li>
                            <li>Process payments and manage your account</li>
                            <li>Communicate with you about classes, schedules, and updates</li>
                            <li>Track student progress and provide personalized coaching</li>
                            <li>Send you promotional materials and updates (with your consent)</li>
                            <li>Comply with legal obligations and protect our rights</li>
                        </ul>
                    </div>

                    <div className="privacy-section">
                        <h2>3. Information Sharing and Disclosure</h2>
                        <p>
                            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                        </p>
                        <ul>
                            <li><strong>With Coaches:</strong> We share necessary student information with assigned coaches to provide effective instruction</li>
                            <li><strong>Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf (e.g., payment processing, email delivery)</li>
                            <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests</li>
                            <li><strong>With Your Consent:</strong> We may share information with your explicit consent</li>
                        </ul>
                    </div>

                    <div className="privacy-section">
                        <h2>4. Data Security</h2>
                        <p>
                            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access,
                            alteration, disclosure, or destruction. These measures include:
                        </p>
                        <ul>
                            <li>Encryption of sensitive data during transmission</li>
                            <li>Secure storage of personal information</li>
                            <li>Regular security assessments and updates</li>
                            <li>Limited access to personal information by authorized personnel only</li>
                        </ul>
                        <p>
                            However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your
                            personal information, we cannot guarantee its absolute security.
                        </p>
                    </div>

                    <div className="privacy-section">
                        <h2>5. Children's Privacy</h2>
                        <p>
                            Our services are designed for children, and we take special care to protect children's privacy. We collect only the information
                            necessary to provide our services and do not knowingly collect information from children without parental consent.
                        </p>
                        <p>
                            Parents have the right to review, update, or delete their child's personal information at any time by contacting us.
                        </p>
                    </div>

                    <div className="privacy-section">
                        <h2>6. Your Rights and Choices</h2>
                        <p>
                            You have the following rights regarding your personal information:
                        </p>
                        <ul>
                            <li><strong>Access:</strong> You can request access to the personal information we hold about you</li>
                            <li><strong>Correction:</strong> You can request correction of inaccurate or incomplete information</li>
                            <li><strong>Deletion:</strong> You can request deletion of your personal information, subject to legal requirements</li>
                            <li><strong>Opt-out:</strong> You can opt-out of receiving promotional communications from us</li>
                        </ul>
                        <p>
                            To exercise these rights, please contact us using the information provided below.
                        </p>
                    </div>

                    <div className="privacy-section">
                        <h2>7. Cookies and Tracking Technologies</h2>
                        <p>
                            We use cookies and similar tracking technologies to collect information about your browsing activities and to improve your
                            experience on our website. You can control cookies through your browser settings.
                        </p>
                    </div>

                    <div className="privacy-section">
                        <h2>8. Changes to This Privacy Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on
                            our website and updating the "Last Updated" date. Your continued use of our services after such changes constitutes your
                            acceptance of the updated Privacy Policy.
                        </p>
                    </div>

                    <div className="privacy-section">
                        <h2>9. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                        </p>
                        <p>
                            Email: info@indianchessacad.com<br />
                            Phone: +91 77381 73864
                        </p>
                    </div>

                    <div className="privacy-footer-note">
                        <p><em>Last updated: January 2026</em></p>
                    </div>
                </div>
            </section>

            <CTASection />
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
