import React from 'react';
import { motion } from 'framer-motion';
import './TestimonialsSection.css';

// ============================================
// TESTIMONIAL STAR RATING
// ============================================
const StarRating = () => (
    <div className="card-rating">
        {[...Array(5)].map((_, i) => (
            <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F88B22">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        ))}
    </div>
);

// ============================================
// QUOTE ICON
// ============================================
const QuoteIcon = () => (
    <svg className="card-quote-icon" width="32" height="32" viewBox="0 0 24 24" fill="#F88B22">
        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
    </svg>
);

// ============================================
// TESTIMONIAL CARD
// ============================================
const TestimonialCard = ({ text, name, title }) => (
    <div className="testimonial-card-motion">
        <QuoteIcon />
        <p className="card-text">"{text}"</p>
        <div className="card-footer">
            <div className="author-info">
                <h4>{name}</h4>
                <span className="author-role">{title}</span>
            </div>
            <StarRating />
        </div>
    </div>
);

// ============================================
// TESTIMONIALS SECTION
// ============================================
const TestimonialsSection = () => {
    const testimonials = [
        {
            text: "My son's rating improved by 300 points in just 6 months. The analysis sessions are incredibly detailed and professional.",
            name: "Priya Sharma",
            title: "Parent of 8-year-old",
            duration: 8
        },
        {
            text: "The coaches don't just teach moves; they teach how to think. This has helped me not just in chess but in my academic studies too.",
            name: "Arjun Mehta",
            title: "Student, Age 12",
            duration: 6
        },
        {
            text: "We tried other academies, but the structured roadmap here is unmatched. It feels like a true professional training ground.",
            name: "Anjali Rao",
            title: "Parent",
            duration: 9
        },
        {
            text: "Every session adds a new layer of understanding. The endgame mastery course changed my perspective completely.",
            name: "Rohan Gupta",
            title: "Student, Age 14",
            duration: 7
        }
    ];

    return (
        <section className="testimonials-section-motion">
            <div className="testimonials-pattern-overlay" />

            <div className="section-container-motion">
                {/* Left Column - Static */}
                <div className="testimonials-left">
                    <motion.span
                        className="label-pill"
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                        TESTIMONIALS
                    </motion.span>
                    <motion.h2
                        className="motion-heading"
                        initial={{ opacity: 0, y: 30, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Proof, Not Promises
                    </motion.h2>
                    <motion.p
                        className="motion-subtext"
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Real improvement from parents and students who have committed to the journey of mastery.
                    </motion.p>

                    <motion.div
                        className="stat-item"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <span className="testi-num">500+</span>
                        <span className="testi-label">Students<br />Trained</span>
                    </motion.div>
                </div>

                {/* Right Column - Dynamic Cards */}
                <div className="testimonials-right-grid">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                opacity: 0,
                                y: 30,
                                x: i % 2 === 0 ? -20 : 20,
                                scale: 0.97
                            }}
                            whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{
                                duration: 0.8,
                                delay: 0.45 + (i * 0.15),
                                ease: [0.22, 1, 0.36, 1]
                            }}
                        >
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{
                                    duration: t.duration,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    repeatType: "mirror"
                                }}
                            >
                                <TestimonialCard {...t} />
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
