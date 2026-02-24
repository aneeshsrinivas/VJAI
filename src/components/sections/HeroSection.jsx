import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import './HeroSection.css';

// MAGNETIC BUTTON
const MagneticButton = ({ children, variant = 'primary', onClick, className = '' }) => {
    const buttonRef = useRef(null);
    useEffect(() => {
        const button = buttonRef.current;
        if (!button) return;
        const handleMouseMove = (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(button, { x: x * 0.2, y: y * 0.2, duration: 0.4, ease: 'power2.out' });
        };
        const handleMouseLeave = () => {
            gsap.to(button, { x: 0, y: 0, duration: 0.6, ease: 'power2.out' });
        };
        button.addEventListener('mousemove', handleMouseMove);
        button.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            button.removeEventListener('mousemove', handleMouseMove);
            button.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);
    return (
        <motion.button
            ref={buttonRef}
            className={`hero-cta hero-cta-${variant} ${className}`}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <span className="cta-text">{children}</span>
        </motion.button>
    );
};

// SCROLL INDICATOR
const ScrollIndicatorPremium = ({ onClick }) => (
    <motion.div
        className="hero-scroll-indicator"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        onClick={onClick}
    >
        <motion.div className="scroll-mouse">
            <div className="mouse-body">
                <motion.div
                    className="mouse-wheel"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        </motion.div>
    </motion.div>
);

// MAIN HERO SECTION
const HeroSection = () => {
    const navigate = useNavigate();
    const sectionRef = useRef(null);
    const headlineRef = useRef(null);
    const videoRef = useRef(null);

    // Smooth Loop State
    const [isLooping, setIsLooping] = useState(false);

    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
    const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    useEffect(() => {
        if (!headlineRef.current) return;
        const lines = headlineRef.current.querySelectorAll('.hero-line');
        gsap.fromTo(lines, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.2, ease: 'power3.out', delay: 0.5 });
    }, []);

    const handleScroll = () => {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    };

    // --- CINEMATIC FADE LOOP LOGIC ---
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Force Play
        video.play().catch(() => { });

        const handleTimeUpdate = () => {
            if (!video.duration) return;

            // Trigger Fade Out 0.8s before end
            if (video.currentTime >= video.duration - 0.8) {
                if (!isLooping) setIsLooping(true);
            }

            // Allow Loop to Happen (video.loop is true)
            // Reset Fade when we are back at start
            if (video.currentTime < 1.0 && isLooping) {
                // Wait a tiny bit for the jump to settle, then fade back in
                setTimeout(() => setIsLooping(false), 200);
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, [isLooping]);


    return (
        <section className="hero-premium" ref={sectionRef}>
            <motion.div className="hero-background" style={{ y: backgroundY }}>

                {/* BLACK FADE OVERLAY FOR SMOOTH LOOP */}
                <motion.div
                    className="loop-fade-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLooping ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{
                        position: 'absolute', inset: 0, background: 'black', zIndex: 2, pointerEvents: 'none'
                    }}
                />

                <div className="hero-bg-overlay" />

                <video
                    ref={videoRef}
                    className="hero-bg-video"
                    autoPlay
                    muted
                    loop // Standard loop, but hidden by fade
                    playsInline
                    preload="auto"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
                >
                    <source src="/chess-slow.mp4" type="video/mp4" />
                </video>
            </motion.div>

            <motion.div className="hero-content" style={{ y: contentY, opacity }}>
                {/* Manifesto Headline */}
                <motion.h1
                    className="hero-headline-editorial"
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                >
                    Master Strategy.<br />
                    <span className="text-highlight">Dominate The Board.</span>
                </motion.h1>

                {/* Supporting Text */}
                <motion.p
                    className="hero-supporting-text"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                    Personalized training from FIDE-rated coaches.<br />
                    Building champions through strategic excellence.
                </motion.p>

                <motion.div
                    className="hero-cta-group"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <MagneticButton variant="primary" onClick={() => navigate('/select-role')}>
                        Start Training Now
                    </MagneticButton>
                    <MagneticButton variant="secondary" onClick={() => navigate('/pricing')}>
                        View Pricing
                    </MagneticButton>
                </motion.div>


            </motion.div>
            <ScrollIndicatorPremium onClick={handleScroll} />
        </section>
    );
};

export default HeroSection;
