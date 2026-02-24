import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoWithFade from '../shared/VideoWithFade';
import './FAQSection.css';

const faqs = [
    {
        id: 1,
        question: "What is Indian Chess Academy?",
        answer: "Indian Chess Academy is a premier institution dedicated to nurturing young chess talent with expert coaching and a proven training system."
    },
    {
        id: 2,
        question: "Who are the coaches?",
        answer: "Our team consists of FIDE-rated masters and experienced educators who have a proven track record of mentoring young talent from beginners to national champions."
    },
    {
        id: 3,
        question: "How are classes conducted?",
        answer: "All sessions are conducted live via Zoom in small groups (max 6 students) to ensure individual attention and interactive learning."
    },
    {
        id: 4,
        question: "What age groups do you teach?",
        answer: "We offer tailored classes for children aged 5 and above, grouped specifically by age and skill level to ensure optimal learning progression."
    },
    {
        id: 5,
        question: "Is there a free trial?",
        answer: "Yes! We offer a free 30-minute diagnostic session where a coach assesses your current level, discusses your goals, and recommends the best learning path."
    }
];

const FAQSection = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="faq-section-timeline">
            <div className="faq-bg-pattern" />
            {/* Section Header */}
            <div className="faq-section-header">
                <motion.span
                    className="faq-section-label"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    COMMON QUESTIONS
                </motion.span>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                >
                    Everything You Need to Know
                </motion.h2>
            </div>

            <div className="faq-timeline-container">

                {/* LEFT COLUMN - VIDEO */}
                <div className="faq-media-column">
                    <div className="faq-media-wrapper">
                        <VideoWithFade
                            src="/faq-chess.mp4"
                            className="faq-video"
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN - FAQ TIMELINE */}
                <div className="faq-content-column">
                    {/* Timeline Spine */}
                    <div className="timeline-spine" />

                    <div className="faq-timeline-list">
                        {faqs.map((faq, index) => {
                            const isActive = activeIndex === index;
                            const isLeft = index % 2 === 0;

                            return (
                                <motion.div
                                    key={faq.id}
                                    className={`faq-timeline-row ${isLeft ? 'align-left' : 'align-right'}`}
                                    initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    {/* Timeline Node */}
                                    <div className="timeline-node-wrapper">
                                        <motion.div
                                            className={`timeline-node ${isActive ? 'active' : ''}`}
                                            whileHover={{ scale: 1.2 }}
                                        />
                                    </div>

                                    {/* FAQ Card */}
                                    <motion.div
                                        className={`faq-card ${isActive ? 'active' : ''}`}
                                        whileHover={{ y: -3 }}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        onMouseLeave={() => setActiveIndex(null)}
                                    >
                                        <div className="faq-card-header">
                                            <h3>{faq.question}</h3>
                                            <span className={`faq-icon ${isActive ? 'open' : ''}`}>+</span>
                                        </div>
                                        <AnimatePresence>
                                            {isActive && (
                                                <motion.div
                                                    className="faq-card-body"
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                                >
                                                    <p>{faq.answer}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default FAQSection;
