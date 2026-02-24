import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/layout/Footer';
import CTASection from '../components/shared/CTASection';
import VideoWithFade from '../components/shared/VideoWithFade';
import './FAQ.css';

const FAQ = () => {
    // FAQ Data
    const faqs = [
        {
            category: "General Information",
            questions: [
                {
                    id: 1,
                    question: "What is Indian Chess Academy?",
                    answer: "Indian Chess Academy is a premier institution dedicated to teaching chess to enthusiasts of all levels. We combine traditional coaching methods with modern technology to foster strategic thinking and mastery."
                },
                {
                    id: 2,
                    question: "Who are the coaches?",
                    answer: "Our team consists of FIDE-rated players and experienced trainers who have mentored state and national champions. They bring years of competitive experience to every class."
                },
                {
                    id: 3,
                    question: "Where are you located?",
                    answer: "We are based in Mumbai, but we offer comprehensive online training programs accessible to students globally."
                }
            ]
        },
        {
            category: "Classes & Curriculum",
            questions: [
                {
                    id: 4,
                    question: "How are classes conducted?",
                    answer: "Classes are conducted both online (via Zoom/Google Meet) and offline. We use interactive boards and analysis tools to ensure an engaging learning experience."
                },
                {
                    id: 5,
                    question: "What age groups do you teach?",
                    answer: "We accept students starting from age 5 up to adults. Our curriculum is tailored to different age groups and skill levels."
                },
                {
                    id: 6,
                    question: "Is there a free trial?",
                    answer: "Yes! We offer a complimentary demo session so you can experience our teaching methodology before committing."
                }
            ]
        },
        {
            category: "Registration & Payments",
            questions: [
                {
                    id: 7,
                    question: "How do I register?",
                    answer: "You can register by clicking the 'Enrol Now' button on our website or contacting us directly via WhatsApp or phone. Our team will guide you through the process."
                },
                {
                    id: 8,
                    question: "What are the payment options?",
                    answer: "We accept payments via UPI, Credit/Debit cards, and Bank Transfers. Installment options are available for long-term courses."
                },
                {
                    id: 9,
                    question: "Do you offer refunds?",
                    answer: "We have a flexible refund policy for the first 2 classes. If you are not satisfied, we provide a full refund, no questions asked."
                }
            ]
        },
        {
            category: "Tournaments & Events",
            questions: [
                {
                    id: 10,
                    question: "Do you organize tournaments?",
                    answer: "Yes, we host monthly internal tournaments for our students to practice competitive play. We also guide students on participating in state and national FIDE rated events."
                },
                {
                    id: 11,
                    question: "How can I get FIDE rated?",
                    answer: "Participating in FIDE-rated tournaments is the path. Our advanced curriculum specifically prepares students for these events with game analysis and psychological prep."
                }
            ]
        }
    ];

    const [activeId, setActiveId] = useState(null);

    return (
        <div className="faq-page-modern">

            {/* LAYER 1: FIXED HERO (Video + Title) - Stays in place */}
            <div className="fixed-hero-layer">
                <div className="faq-fullscreen-video-bg">
                    <VideoWithFade
                        src="/chess-video.mp4"
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
                        <span className="text-highlight">Guided</span> Answers
                    </motion.h1>
                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        Helping you make the right move for your child's future.
                    </motion.p>

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

            {/* LAYER 2: SCROLLING CONTENT - Scrolls OVER the fixed layer */}
            <div className="scrolling-content-layer">
                {/* Spacer allows viewing the fixed hero initially */}
                <div className="spacer-100vh"></div>

                {/* Actual Content starts here */}
                <section className="faq-content-modern">
                    <div className="faq-timeline-wrapper">
                        {/* Central Timeline Line */}
                        <div className="faq-timeline-line"></div>

                        {faqs.map((group, index) => (
                            <div key={index} className="faq-category-block">
                                <div className="faq-category-header">
                                    <span className="category-number">0{index + 1}</span>
                                    <h2>{group.category}</h2>
                                </div>

                                <div className="faq-questions-list">
                                    {group.questions.map((q) => (
                                        <motion.div
                                            key={q.id}
                                            className={`faq-item-editorial ${activeId === q.id ? 'active' : ''}`}
                                            // HOVER INTERACTION REQUESTED
                                            onMouseEnter={() => setActiveId(q.id)}
                                            onMouseLeave={() => setActiveId(null)}

                                            // Scroll Animation
                                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                            viewport={{ margin: "-10% 0px -10% 0px", once: false }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <div className="item-connector"></div>

                                            <div className="question-heading">
                                                <h3>{q.question}</h3>
                                                <span className="toggle-icon">+</span>
                                            </div>

                                            <AnimatePresence>
                                                {activeId === q.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                                        className="answer-body"
                                                    >
                                                        <div className="answer-content">
                                                            {q.answer}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <CTASection />
                    <Footer />
                </section>
            </div>
        </div>
    );
};

export default FAQ;
