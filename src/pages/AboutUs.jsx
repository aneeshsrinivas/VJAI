import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import './AboutUs.css';

const AboutUs = () => {
    return (
        <div className="about-us-page">
            <Navbar />

            <section className="about-hero">
                <div className="about-hero-content">
                    <h1>About Indian Chess Academy</h1>
                    <p>Building champions through personalized mentoring and strategic excellence</p>
                </div>
            </section>

            <section className="about-story">
                <div className="about-container">
                    <h2>Our Story</h2>
                    <p>
                        Indian Chess Academy was founded on a simple idea: chess should be taught in a way that feels engaging, personal, and meaningful.
                        What began as a side project by Viraj Pandit, a computer science engineer with a lifelong passion for the game, soon became a response
                        to the overly generic and impersonal nature of most online chess classes.
                    </p>
                    <p>
                        As the academy grew, Viraj teamed up with Nachiket Chitre, whose structured approach and shared love for chess helped shape the academy's direction.
                        Together, they created an environment where students receive close, thoughtful mentoring. Every session is designed with care, allowing coaches to
                        adapt to each student's pace and style — building not just skill, but confidence.
                    </p>
                </div>
            </section>

            <section className="about-team">
                <div className="about-container">
                    <h2>Meet Our Founders</h2>
                    <div className="team-grid">
                        <div className="team-card">
                            <div className="team-image-placeholder">VP</div>
                            <h3>Viraj Pandit</h3>
                            <p className="team-role">Co-Founder & Lead Coach</p>
                            <p>Computer science engineer with a passion for chess education. Viraj brings technical expertise and innovative teaching methods to create engaging learning experiences.</p>
                        </div>
                        <div className="team-card">
                            <div className="team-image-placeholder">NC</div>
                            <h3>Nachiket Chitre</h3>
                            <p className="team-role">Co-Founder & Curriculum Director</p>
                            <p>Structured approach and deep chess knowledge. Nachiket designs comprehensive curricula that adapt to each student's learning style and pace.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-values">
                <div className="about-container">
                    <h2>Our Values</h2>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon">🎯</div>
                            <h3>Personalized Learning</h3>
                            <p>Every student receives tailored instruction that adapts to their unique pace and style.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">💡</div>
                            <h3>Strategic Thinking</h3>
                            <p>We teach chess as a tool for developing critical thinking and problem-solving skills.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">🤝</div>
                            <h3>Supportive Community</h3>
                            <p>Building confidence through encouragement, mentorship, and a positive learning environment.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">🏆</div>
                            <h3>Excellence</h3>
                            <p>Committed to helping every student reach their full potential, from beginner to tournament level.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutUs;
