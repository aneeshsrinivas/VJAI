import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import VideoWithFade from './VideoWithFade';
import MagneticButton from './MagneticButton';
import './CTASection.css';

const CTASection = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                    // Disable scroll during animation
                    document.body.style.overflow = 'hidden';

                    // Re-enable scroll after animation completes (3.5 seconds)
                    setTimeout(() => {
                        setAnimationComplete(true);
                        document.body.style.overflow = '';
                    }, 3500);
                }
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
            document.body.style.overflow = '';
        };
    }, [isVisible]);

    return (
        <section ref={sectionRef} className="cta-section-cinematic">
            <motion.div
                className="cta-expansion-wrapper"
                style={{ scale, opacity }}
            >
                {/* Background Video */}
                <div className="cta-bg-video-wrapper">
                    <VideoWithFade
                        src="/chess-story.mp4"
                        className="cta-bg-video"
                    />
                    <motion.div
                        className="cta-video-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isVisible ? 1 : 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    />
                </div>

                <AnimatePresence>
                    {isVisible && (
                        <div className="cta-content-wrapper">
                            <motion.div
                                className="cta-headline"
                                initial={{ opacity: 0, scale: 0.9, z: -100 }}
                                animate={{ opacity: 1, scale: 1, z: 0 }}
                                transition={{
                                    duration: 1.2,
                                    ease: [0.22, 1, 0.36, 1],
                                    delay: 0.5
                                }}
                            >
                                <h2>Ready to Master Chess?</h2>
                            </motion.div>

                            <motion.p
                                className="cta-supporting-text"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    ease: [0.22, 1, 0.36, 1],
                                    delay: 1.0
                                }}
                            >
                                Join our community of passionate learners. Book a free demo class and experience world-class coaching firsthand.
                            </motion.p>

                            <motion.div
                                className="cta-button-wrapper"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    ease: [0.22, 1, 0.36, 1],
                                    delay: 1.5
                                }}
                            >
                                <MagneticButton
                                    variant="primary"
                                    onClick={() => navigate('/demo-booking')}
                                >
                                    Book Free Demo <span style={{ marginLeft: '8px' }}>→</span>
                                </MagneticButton>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </section>
    );
};

export default CTASection;
