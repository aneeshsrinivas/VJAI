import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import './StatsSection.css';

// ============================================
// CUSTOM SVG ICONS (Not Emojis)
// ============================================
const StudentIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="studentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#F88B22" />
            </linearGradient>
        </defs>
        <circle cx="32" cy="20" r="10" stroke="url(#studentGrad)" strokeWidth="2.5" fill="none" />
        <path d="M14 52c0-10 8-18 18-18s18 8 18 18" stroke="url(#studentGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M24 10l8-6 8 6" stroke="url(#studentGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
);

const CoachIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="coachGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#F88B22" />
            </linearGradient>
        </defs>
        <circle cx="32" cy="18" r="8" stroke="url(#coachGrad)" strokeWidth="2.5" fill="none" />
        <path d="M16 54c0-9 7-16 16-16s16 7 16 16" stroke="url(#coachGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <rect x="26" y="4" width="12" height="8" rx="2" stroke="url(#coachGrad)" strokeWidth="2" fill="none" />
        <path d="M32 28v8M28 32h8" stroke="url(#coachGrad)" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const TrophyIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#F88B22" />
            </linearGradient>
        </defs>
        <path d="M20 12h24v16c0 8-5 12-12 12s-12-4-12-12V12z" stroke="url(#trophyGrad)" strokeWidth="2.5" fill="none" />
        <path d="M20 16H12c0 8 4 12 8 12" stroke="url(#trophyGrad)" strokeWidth="2" fill="none" />
        <path d="M44 16h8c0 8-4 12-8 12" stroke="url(#trophyGrad)" strokeWidth="2" fill="none" />
        <path d="M28 40h8v6H28z" stroke="url(#trophyGrad)" strokeWidth="2" fill="none" />
        <path d="M22 46h20v6H22z" stroke="url(#trophyGrad)" strokeWidth="2" fill="none" />
        <path d="M30 20l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" fill="url(#trophyGrad)" />
    </svg>
);

const StarIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#F88B22" />
            </linearGradient>
        </defs>
        <path d="M32 8l6 18h18l-14 11 5 18-15-11-15 11 5-18L8 26h18z" stroke="url(#starGrad)" strokeWidth="2.5" fill="none" />
        <circle cx="32" cy="32" r="6" fill="url(#starGrad)" opacity="0.3" />
    </svg>
);

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ end, suffix = '', decimals = 0, label, subtext, icon: Icon, delay = 0 }) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const cardRef = useRef(null);
    const isInView = useInView(cardRef, { once: true, margin: "-100px" });

    useEffect(() => {
        if (!isInView || hasAnimated) return;
        setHasAnimated(true);

        const startTime = Date.now();
        const duration = 2000;
        const endValue = parseFloat(end);

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = easeOut * endValue;

            setCount(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        setTimeout(() => requestAnimationFrame(animate), delay * 150);
    }, [isInView, end, delay, hasAnimated]);

    const displayValue = decimals > 0
        ? count.toFixed(decimals)
        : Math.floor(count);

    return (
        <motion.div
            ref={cardRef}
            className="stat-card-premium"
            initial={{ opacity: 0, y: 50, rotateX: -10 }}
            animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{
                delay: delay * 0.15,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1]
            }}
            whileHover={{
                y: -12,
                transition: { duration: 0.3 }
            }}
        >
            <motion.div
                className="stat-icon-wrapper"
                animate={isInView ? {
                    y: [0, -5, 0],
                    rotate: [0, 3, -3, 0]
                } : {}}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay * 0.2
                }}
            >
                <Icon />
            </motion.div>

            <div className="stat-value-wrapper">
                <span className="stat-number">{displayValue}</span>
                <span className="stat-suffix">{suffix}</span>
            </div>

            <p className="stat-label">{label}</p>
            {subtext && <p className="stat-subtext">{subtext}</p>}
        </motion.div>
    );
};

// ============================================
// STATS SECTION
// ============================================
const StatsSection = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

    const stats = [
        {
            end: 500,
            suffix: '+',
            label: 'STUDENTS TRAINED',
            subtext: 'Since 2018',
            icon: StudentIcon
        },
        {
            end: 15,
            suffix: '+',
            label: 'FIDE-RATED COACHES',
            subtext: 'Average rating: 2100',
            icon: CoachIcon
        },
        {
            end: 98,
            suffix: '%',
            label: 'TOURNAMENT WIN RATE',
            subtext: 'First tournament success',
            icon: TrophyIcon
        },
        {
            end: 4.9,
            decimals: 1,
            label: 'STUDENT RATING',
            subtext: 'Based on 200+ reviews',
            icon: StarIcon
        },
    ];

    return (
        <section className="stats-section-premium" ref={sectionRef}>
            {/* Background Elements */}
            <div className="stats-bg-pattern" />
            <div className="stats-bg-gradient" />

            {/* Floating Particles */}
            <div className="stats-particles">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="stat-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.1, 0.35, 0.1]
                        }}
                        transition={{
                            duration: 4 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </div>

            <div className="stats-container">
                <div className="stats-grid-premium">
                    {stats.map((stat, idx) => (
                        <StatCard
                            key={idx}
                            {...stat}
                            delay={idx}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
