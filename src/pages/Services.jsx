import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CTASection from '../components/shared/CTASection';
import './Services.css';

const Services = () => {
    return (
        <div className="services-page">
            <Navbar />

            <section className="services-hero">
                <div className="services-hero-content">
                    <h1>Our Services</h1>
                    <p>Comprehensive chess education tailored to every skill level</p>
                </div>
            </section>

            <section className="services-content">
                <div className="services-container">
                    <div className="services-grid">
                        <div className="service-card">
                            <h3>Group Classes</h3>
                            <p>Small group sessions with maximum 6 students per class for personalized attention and interactive learning.</p>
                            <ul>
                                <li>✓ Max 6 students per class</li>
                                <li>✓ Age-grouped batches</li>
                                <li>✓ Interactive sessions</li>
                                <li>✓ Twice weekly classes</li>
                            </ul>
                        </div>
                        <div className="service-card">
                            <h3>1v1 Tutoring</h3>
                            <p>One-on-one coaching tailored to your specific needs and goals. Perfect for focused attention and rapid improvement.</p>
                            <ul>
                                <li>✓ Personalized curriculum</li>
                                <li>✓ Flexible scheduling</li>
                                <li>✓ Focused attention</li>
                                <li>✓ Custom pace</li>
                            </ul>
                        </div>
                        <div className="service-card">
                            <h3>Tournament Preparation</h3>
                            <p>Specialized training for competitive chess. Develop tournament skills, opening preparation, and game analysis.</p>
                            <ul>
                                <li>✓ Opening preparation</li>
                                <li>✓ Game analysis</li>
                                <li>✓ Time management</li>
                                <li>✓ Psychological training</li>
                            </ul>
                        </div>
                        <div className="service-card">
                            <h3>Beginner Programs</h3>
                            <p>Perfect introduction to chess for young learners. Build strong foundations with fun and engaging lessons.</p>
                            <ul>
                                <li>✓ Basic rules & tactics</li>
                                <li>✓ Pattern recognition</li>
                                <li>✓ Simple strategies</li>
                                <li>✓ Confidence building</li>
                            </ul>
                        </div>
                        <div className="service-card">
                            <h3>Advanced Training</h3>
                            <p>For serious players aiming for mastery. Deep analysis, advanced tactics, and strategic understanding.</p>
                            <ul>
                                <li>✓ Deep analysis</li>
                                <li>✓ Advanced tactics</li>
                                <li>✓ Endgame mastery</li>
                                <li>✓ Opening repertoire</li>
                            </ul>
                        </div>
                        <div className="service-card">
                            <h3>Parent Support</h3>
                            <p>Regular updates and guidance for parents. Stay informed about your child's progress and development.</p>
                            <ul>
                                <li>✓ Progress reports</li>
                                <li>✓ Parent-coach meetings</li>
                                <li>✓ Learning resources</li>
                                <li>✓ Tournament guidance</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <CTASection />
            <Footer />
        </div>
    );
};

export default Services;
