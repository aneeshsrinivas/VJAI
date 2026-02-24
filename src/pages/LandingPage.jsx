import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { toast, ToastContainer } from 'react-toastify';
// Navbar removed - lifted to App.jsx
import Footer from '../components/layout/Footer';
import CTASection from '../components/shared/CTASection';
import PricingSection from '../components/sections/PricingSection';
import { HeroSection, StatsSection, AboutSection, TestimonialsSection, FAQSection } from '../components/sections';
import './LandingPage.css';
import '../components/shared/PremiumModal.css';
import VideoIcon from '../components/icons/VideoIcon';
import TrophyIcon from '../components/icons/TrophyIcon';
import TargetIcon from '../components/icons/TargetIcon';
import CoursewareIcon from '../components/icons/CoursewareIcon';
import ChessKnightIcon from '../components/icons/ChessKnightIcon';
import ChessBishopIcon from '../components/icons/ChessBishopIcon';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
    const navigate = useNavigate();
    const [activeFAQ, setActiveFAQ] = useState(null);
    const [activeModal, setActiveModal] = useState(null);

    // Refs for GSAP animations
    const heroRef = useRef(null);

    // FAQs data
    const faqs = [
        {
            question: 'What is Indian Chess Academy?',
            answer: 'Indian Chess Academy is a premier platform offering live online chess coaching for children. Our structured programs are designed to build skills from the beginner to tournament level.'
        },
        {
            question: 'Who are the coaches?',
            answer: 'Our coaches are experienced players and educators who are passionate about teaching and have a proven track record of mentoring young chess talents.'
        },
        {
            question: 'What age groups do you teach?',
            answer: 'We offer classes for children aged 5 and above, grouped by age and skill level.'
        },
        {
            question: 'How are classes conducted?',
            answer: 'All classes are conducted live on Zoom in small groups to ensure individual attention.'
        },
        {
            question: 'What is the class schedule?',
            answer: 'Classes are held twice a week, each session lasting 60 minutes.'
        }
    ];

    // GSAP Hero animations - Disabled mismatched animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            // NOTE: The previous animations targeted classes that do not exist in the current component structure
            // (e.g., .hero-bg-image, .hero-title-home).
            // These have been temporarily commented out to prevent errors.

            /* 
            // Slow hero drift to keep background alive without heavy video
            gsap.to('.hero-bg-image', { ... });
            // ... (rest of the mismatched animations)
            */

        }, heroRef);

        return () => ctx.revert();
    }, []);

    // Prevent body/html scroll when modal is active
    useEffect(() => {
        if (activeModal) {
            document.body.style.setProperty('overflow', 'hidden', 'important');
            document.documentElement.style.setProperty('overflow', 'hidden', 'important');
        } else {
            document.body.style.removeProperty('overflow');
            document.documentElement.style.removeProperty('overflow');
        }
        return () => {
            document.body.style.removeProperty('overflow');
            document.documentElement.style.removeProperty('overflow');
        };
    }, [activeModal]);

    // Animation variants
    const modalBackdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    const modalContentVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 30 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            y: 0,
            transition: {
                duration: 0.3,
                ease: 'easeOut'
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: 20,
            transition: { duration: 0.2 }
        }
    };

    return (
        <div className="landing-page-home" ref={heroRef}>
            <ToastContainer position="top-right" autoClose={4000} />
            {/* Navigation Header - Removed (Handled in App.jsx) */}

            {/* Premium Hero Section */}
            <HeroSection />

            {/* Premium Stats Section */}
            <StatsSection />

            {/* Premium About Section */}
            <div id="about">
                <AboutSection
                    onCoursewareClick={() => setActiveModal('courseware')}
                    onOnlineClassesClick={() => setActiveModal('online-classes')}
                />
            </div>

            {/* Premium Testimonials Section */}
            <div id="testimonials">
                <TestimonialsSection />
            </div>

            {/* Premium Pricing Section */}
            <div id="pricing">
                <PricingSection />
            </div>

            {/* Premium FAQ Section */}
            <div id="faq">
                <FAQSection />
            </div>

            {/* CTA Section */}
            <CTASection />

            {/* Footer */}
            <Footer />

            {/* Courseware Modal */}
            <AnimatePresence>
                {activeModal === 'courseware' && (
                    <motion.div
                        className="modal-overlay"
                        onClick={() => setActiveModal(null)}
                        variants={modalBackdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <motion.div
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                            variants={modalContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {/* Fixed Header */}
                            <div className="modal-header-fixed">
                                <motion.button
                                    className="modal-close"
                                    onClick={() => setActiveModal(null)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    ×
                                </motion.button>
                                <h2 className="modal-title">Comprehensive Courseware</h2>
                                <p className="modal-description">
                                    Our curriculum is meticulously designed by Grandmasters to guide students from their first move to tournament mastery. Each level builds upon the last, ensuring a solid foundation and continuous improvement.
                                </p>
                            </div>

                            {/* Scrollable Body */}
                            <div className="modal-body">
                                <motion.div
                                    className="course-level"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <div className="course-section">
                                        <h4><ChessKnightIcon /> Beginner Level (Rating 0-1000)</h4>
                                        <p className="level-subtitle">Foundations of Strategy</p>
                                        <ul>
                                            <li>Understanding piece movement and value</li>
                                            <li>Basic tactical patterns (pins, forks, skewers)</li>
                                            <li>Introduction to opening principles</li>
                                            <li>Fundamental checkmate patterns</li>
                                        </ul>
                                    </div>

                                    <div className="course-section">
                                        <h4><ChessBishopIcon /> Intermediate Level (Rating 1000-1600)</h4>
                                        <p className="level-subtitle">Tactical Mastery & Positional Play</p>
                                        <ul>
                                            <li>Advanced combination calculation</li>
                                            <li>Middle-game planning and structure analysis</li>
                                            <li>Endgame theory (Key squares, opposition)</li>
                                            <li>Building a personalized opening repertoire</li>
                                        </ul>
                                    </div>

                                    <div className="course-section">
                                        <h4><TrophyIcon /> Advanced Level (Rating 1600+)</h4>
                                        <p className="level-subtitle">Competitive Excellence</p>
                                        <ul>
                                            <li>Deep calculation and visualization training</li>
                                            <li>Complex positional sacrifices and dynamic play</li>
                                            <li>Prophylaxis and defensive resources</li>
                                            <li>Grandmaster game analysis and psychology</li>
                                        </ul>
                                    </div>

                                    <div className="course-meta">
                                        <span>📖 500+ Lessons</span>
                                        <span>💡 10,000+ Puzzles</span>
                                        <span>🏅 Tournament Prep</span>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Online Classes Modal */}
            <AnimatePresence>
                {activeModal === 'online-classes' && (
                    <motion.div
                        className="modal-overlay"
                        onClick={() => setActiveModal(null)}
                        variants={modalBackdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <motion.div
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                            variants={modalContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {/* Fixed Header */}
                            <div className="modal-header-fixed">
                                <motion.button
                                    className="modal-close"
                                    onClick={() => setActiveModal(null)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    ×
                                </motion.button>
                                <h2 className="modal-title">Live Online Academy</h2>
                                <p className="modal-description">
                                    Experience the rigor of a classical chess academy from the comfort of your home. Our live online classes are interactive, engaging, and focused on serious improvement.
                                </p>
                            </div>

                            {/* Scrollable Body */}
                            <div className="modal-body">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <div className="class-feature">
                                        <h3><VideoIcon /> Live Interactive Sessions</h3>
                                        <p>Small group classes (max 8 students) conducted via Zoom. Interactive boards allow students to solve problems in real-time under coach supervision.</p>
                                    </div>

                                    <div className="class-feature">
                                        <h3><TrophyIcon /> Monthly Internal Tournaments</h3>
                                        <p>Students compete in regular academy tournaments to test their skills. Games are analyzed by coaches to identify mistakes and areas for growth.</p>
                                    </div>

                                    <div className="class-feature">
                                        <h3><TargetIcon /> Personalized Progress Tracking</h3>
                                        <p>We track puzzle ratings, game accuracy, and class participation to provide quarterly progress reports and personalized training recommendations.</p>
                                    </div>

                                    <div className="class-feature">
                                        <h3><CoursewareIcon /> Recorded Library Access</h3>
                                        <p>Missed a class? Access our library of recorded sessions and supplementary video lessons to catch up or review complex topics.</p>
                                    </div>

                                    <button className="modal-cta" onClick={() => navigate('/demo-booking')}>
                                        Schedule Your Free Assessment
                                    </button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default LandingPage;
