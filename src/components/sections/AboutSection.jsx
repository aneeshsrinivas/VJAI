import React from 'react';
import { motion } from 'framer-motion';
import './AboutSection.css';

// ============================================
// ICONS
// ============================================
const CoursewareCardIcon = () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="courseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2E2722" />
                <stop offset="100%" stopColor="#5C4E44" />
            </linearGradient>
        </defs>
        <rect x="12" y="16" width="56" height="48" rx="4" stroke="url(#courseGrad)" strokeWidth="3" fill="none" />
        <path d="M22 30h36M22 42h28M22 54h20" stroke="url(#courseGrad)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="58" cy="52" r="8" stroke="url(#courseGrad)" strokeWidth="2" fill="none" />
        <path d="M56 52l2 2 4-4" stroke="url(#courseGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const OnlineClassCardIcon = () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="onlineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2E2722" />
                <stop offset="100%" stopColor="#5C4E44" />
            </linearGradient>
        </defs>
        <rect x="10" y="14" width="60" height="40" rx="4" stroke="url(#onlineGrad)" strokeWidth="3" fill="none" />
        <path d="M35 60h10v8H35z" stroke="url(#onlineGrad)" strokeWidth="2" fill="none" />
        <path d="M28 68h24" stroke="url(#onlineGrad)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="40" cy="34" r="10" stroke="url(#onlineGrad)" strokeWidth="2" fill="none" />
        <path d="M37 34l6-4v8z" fill="url(#onlineGrad)" strokeWidth="2" />
    </svg>
);

// ============================================
// SERVICE CARD
// ============================================
const ServiceCard = ({ icon: Icon, title, description, onClick, delay }) => {
    return (
        <motion.div
            className="about-service-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: delay, duration: 0.6 }}
            whileHover={{
                y: -6,
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
                borderColor: '#2E2722'
            }}
            onClick={onClick}
        >
            <motion.div
                className="service-icon"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            >
                <Icon />
            </motion.div>
            <h3>{title}</h3>
            <p>{description}</p>
            <span className="service-link">Learn more →</span>
        </motion.div>
    );
};

// ============================================
// ABOUT SECTION (Always Floating)
// ============================================
const AboutSection = ({ onCoursewareClick, onOnlineClassesClick }) => {

    // Shared transition config for text elements
    const fadeFromRight = (delay) => ({
        initial: { opacity: 0, x: 30 },
        whileInView: { opacity: 1, x: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.8, delay: delay, ease: [0.22, 1, 0.36, 1] }
    });

    return (
        <section className="about-section-premium">
            <div className="about-bg-pattern" />

            <div className="about-container">
                <div className="about-split-layout reversed">

                    {/* Visual Area (Image Overlay) */}
                    <motion.div
                        className="about-visual-area"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {/* Image Wrapper (Always Floating) */}
                        <motion.div
                            className="about-image-wrapper"
                            animate={{ y: [0, -12, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <img
                                src="/chess-background.png"
                                alt="Chess Atmosphere"
                                className="about-chess-bg"
                            />
                        </motion.div>
                    </motion.div>

                    {/* Content Area */}
                    <div className="about-content-area">
                        {/* 1. Meta Label */}
                        <motion.div className="about-meta-label" {...fadeFromRight(0.1)}>
                            WHO ARE WE
                        </motion.div>

                        {/* 2. Title & Subtitle */}
                        <motion.h2 className="about-title-editorial" {...fadeFromRight(0.2)}>
                            About Indian Chess Academy.<br />
                            <span className="subtitle-faded">Designing Grandmasters.</span>
                        </motion.h2>

                        {/* 3. Text Blurbs */}
                        <motion.p className="lead about-text-p" {...fadeFromRight(0.3)}>
                            <strong>Indian Chess Academy was founded on a simple idea:</strong> chess should be taught in a way that feels engaging, personal, and meaningful.
                        </motion.p>

                        <motion.p className="about-text-p" {...fadeFromRight(0.4)}>
                            What began as a side project by Viraj Pandit, a computer science engineer with a lifelong passion for the game, soon became a response to the overly generic and impersonal nature of most online chess classes.
                        </motion.p>

                        <motion.p className="about-text-p" {...fadeFromRight(0.5)}>
                            As the academy grew, Viraj teamed up with Nachiket Chitre, whose structured approach and shared love for chess helped shape the academy's direction. Together, they created an environment where students receive close, thoughtful mentoring.
                        </motion.p>

                        {/* 4. Quote */}
                        <motion.blockquote className="about-quote" {...fadeFromRight(0.6)}>
                            <span className="quote-mark">"</span>
                            Every session is designed with care, allowing coaches to adapt to each student's pace and style — building not just skill, but confidence.
                            <span className="quote-mark">"</span>
                        </motion.blockquote>
                    </div>
                </div>

                <div className="about-services">
                    <ServiceCard
                        icon={CoursewareCardIcon}
                        title="Courseware"
                        description="Comprehensive curriculum from basics to advanced strategies, designed by FIDE-rated coaches."
                        onClick={onCoursewareClick}
                        delay={0.1}
                    />
                    <ServiceCard
                        icon={OnlineClassCardIcon}
                        title="Online Classes"
                        description="Live interactive sessions with personalized coaching, flexible schedules, and progress tracking."
                        onClick={onOnlineClassesClick}
                        delay={0.2}
                    />
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
