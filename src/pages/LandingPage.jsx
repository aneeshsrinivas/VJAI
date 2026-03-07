import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
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

const LandingPage = () => {
    const navigate = useNavigate();
    const [activeFAQ, setActiveFAQ] = useState(null);
    const [activeModal, setActiveModal] = useState(null);

    const { userData } = useAuth();

    useEffect(() => {
        if (userData?.role) {
            console.log('🔄 User already logged in on Home, redirecting to dashboard:', userData.role);
            if (userData.role === 'admin') navigate('/admin');
            else if (userData.role === 'coach') navigate('/coach');
            else if (userData.role === 'customer' || userData.role === 'student') navigate('/parent');
        }
    }, [userData, navigate]);

    useEffect(() => {
        if (activeModal) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.setProperty('overflow', 'hidden', 'important');
            if (scrollbarWidth > 0) {
                document.body.style.setProperty('padding-right', `${scrollbarWidth}px`);
            }
        } else {
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('padding-right');
        }
        return () => {
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('padding-right');
        };
    }, [activeModal]);

    const modalBackdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.15 } },
        exit: { opacity: 0, transition: { duration: 0.15 } }
    };

    const modalContentVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 16 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
        },
        exit: {
            opacity: 0,
            scale: 0.97,
            y: 10,
            transition: { duration: 0.15 }
        }
    };

    return (
        <div className="landing-page-home">
            <ToastContainer position="top-right" autoClose={4000} />

            <HeroSection />
            <StatsSection />

            <div id="about">
                <AboutSection
                    onCoursewareClick={() => setActiveModal('courseware')}
                    onOnlineClassesClick={() => setActiveModal('online-classes')}
                />
            </div>

            <div id="testimonials">
                <TestimonialsSection />
            </div>

            <div id="pricing">
                <PricingSection />
            </div>

            <div id="faq">
                <FAQSection />
            </div>

            <CTASection />
            <Footer />

            {/* Modals rendered via portal directly in document.body to escape
                the PageTransition will-change:transform compositing context
                which otherwise breaks position:fixed children */}
            {createPortal(
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
                                data-lenis-prevent
                                onClick={(e) => e.stopPropagation()}
                                variants={modalContentVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
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
                                        Our curriculum is meticulously designed by Grandmasters to guide students from their first move to tournament mastery.
                                    </p>
                                </div>
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
                </AnimatePresence>,
                document.body
            )}

            {createPortal(
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
                                data-lenis-prevent
                                onClick={(e) => e.stopPropagation()}
                                variants={modalContentVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
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
                                        Experience the rigor of a classical chess academy from the comfort of your home.
                                    </p>
                                </div>
                                <div className="modal-body">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        <div className="class-feature">
                                            <h3><VideoIcon /> Live Interactive Sessions</h3>
                                            <p>Small group classes (max 8 students) conducted via Zoom with interactive boards.</p>
                                        </div>
                                        <div className="class-feature">
                                            <h3><TrophyIcon /> Monthly Internal Tournaments</h3>
                                            <p>Students compete in regular academy tournaments to test their skills.</p>
                                        </div>
                                        <div className="class-feature">
                                            <h3><TargetIcon /> Personalized Progress Tracking</h3>
                                            <p>We track puzzle ratings, game accuracy, and class participation to provide quarterly progress reports.</p>
                                        </div>
                                        <div className="class-feature">
                                            <h3><CoursewareIcon /> Recorded Library Access</h3>
                                            <p>Access our library of recorded sessions and supplementary video lessons.</p>
                                        </div>
                                        <button className="modal-cta" onClick={() => navigate('/demo-booking')}>
                                            Schedule Your Free Assessment
                                        </button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default LandingPage;
