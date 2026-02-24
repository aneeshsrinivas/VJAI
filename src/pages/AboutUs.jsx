import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Footer from '../components/layout/Footer';
import CTASection from '../components/shared/CTASection';
import TargetIcon from '../components/icons/TargetIcon';
import LightbulbIcon from '../components/icons/LightbulbIcon';
import HandshakeIcon from '../components/icons/HandshakeIcon';
import TrophyIcon from '../components/icons/TrophyIcon';
import VideoWithFade from '../components/shared/VideoWithFade';
import './AboutUs.css';

const FadeIn = ({ children, delay = 0, className = "" }) => (
    <motion.div
        className={className}
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
    >
        {children}
    </motion.div>
);

const AboutUs = () => {
    const videoRef = useRef(null);
    const [isLooping, setIsLooping] = useState(false);

    // Cinematic Fade Loop Logic
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.play().catch(() => { });

        const handleTimeUpdate = () => {
            if (!video.duration) return;

            // Trigger Fade Out 0.8s before end
            if (video.currentTime >= video.duration - 0.8) {
                if (!isLooping) setIsLooping(true);
            }

            // Reset Fade when we are back at start
            if (video.currentTime < 1.0 && isLooping) {
                setTimeout(() => setIsLooping(false), 200);
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, [isLooping]);
    return (
        <div className="about-us-page-modern">
            {/* Navbar handled globally in App.jsx */}

            {/* 1. Cinematic Hero Section */}
            <section className="about-hero-modern">
                <div className="hero-image-container">
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
                    <video
                        ref={videoRef}
                        src="/chess-video1.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="hero-bg-image"
                    />
                    <div className="hero-overlay-gradient"></div>
                </div>

                <div className="about-container relative-z">
                    {/* Manifesto Headline */}
                    <motion.h1
                        className="about-headline-editorial"
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Reimagining <span className="text-highlight">Chess Mastery.</span>
                    </motion.h1>

                    {/* Supporting Text */}
                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Building champions through personalized mentoring<br />
                        and strategic excellence.
                    </motion.p>

                    {/* Scroll Indicator */}
                    <motion.div
                        className="scroll-indicator"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
                    >
                        <span>Scroll to Explore</span>
                    </motion.div>
                </div>
            </section>

            {/* 2. Story Section (Scroll Text + Sticky Video) */}
            <section className="about-story-modern">
                <div className="about-container story-layout">

                    {/* Left: Scrolling Text Content */}
                    <div className="story-text-side">
                        <div className="story-header">
                            <motion.div
                                className="about-meta-label dark-label"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            >
                                HOW WE STARTED
                            </motion.div>

                            <motion.h2
                                className="story-headline-editorial"
                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                            >
                                Our Origins.<br />
                                <span className="subtitle-faded">A Passion Project.</span>
                            </motion.h2>

                            <motion.p
                                className="story-intro"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            >
                                From a single student to a premier academy building champions.
                            </motion.p>
                            <div className="decorative-line"></div>
                        </div>

                        {/* First Card - Fades in from LEFT */}
                        <motion.div
                            className="story-card"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <h3>The Vision</h3>
                            <p>
                                Indian Chess Academy was founded on a simple idea: chess should be taught in a way that feels engaging, personal, and meaningful.
                                What began as a side project by Viraj Pandit, a computer science engineer with a lifelong passion for the game, soon became a response
                                to the overly generic and impersonal nature of most online chess classes.
                            </p>
                        </motion.div>
                    </div>

                    {/* Right: Sticky Video + Second Card */}
                    <div className="story-visual-side">
                        <div className="sticky-video-wrapper">
                            <div className="video-frame">
                                <VideoWithFade
                                    src="/chess-story.mp4"
                                    className="story-video"
                                />
                                <div className="video-overlay-tint"></div>
                            </div>
                            <div className="video-caption">
                                <span>Mastering The Board</span>
                            </div>
                        </div>

                        {/* Second Card - Fades in from RIGHT, below video */}
                        <motion.div
                            className="story-card"
                            style={{ marginTop: '40px' }}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <h3>The Partnership</h3>
                            <p>
                                As the academy grew, Viraj teamed up with Nachiket Chitre, whose structured approach and shared love for chess helped shape the academy's direction.
                                Together, they created an environment where students receive close, thoughtful mentoring. Every session is designed with care, allowing coaches to
                                adapt to each student's pace and style — building not just skill, but confidence.
                            </p>
                        </motion.div>
                    </div>

                </div>
            </section>

            {/* 3. Founders Section (Asymmetric) */}
            <section className="about-founders-modern">
                <div className="about-container">
                    <motion.h2
                        className="section-title-center"
                        initial={{ opacity: 0, y: 30, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Meet The Minds
                    </motion.h2>

                    <div className="founders-asymmetric-grid">
                        {/* First Founder - Image then Info */}
                        <div className="founder-card-large primary-founder">
                            <motion.div
                                className="founder-img-container"
                                initial={{ opacity: 0, y: 40, scale: 0.94 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <img src="/team/viraj-pandit.jpg" alt="Viraj Pandit" />
                                <div className="founder-overlay">
                                    <h3>Viraj Pandit</h3>
                                    <span>Co-Founder & Head Coach</span>
                                </div>
                            </motion.div>
                            <motion.div
                                className="founder-info"
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <p>FIDE coach, sharp tactician, transforms raw talent into tournament-ready champions.</p>
                            </motion.div>
                        </div>

                        <div className="founder-spacer"></div> {/* Visual Gap */}

                        {/* Second Founder - Info then Image */}
                        <div className="founder-card-large secondary-founder">
                            <motion.div
                                className="founder-info-top"
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <p>Patient mentor and ICA Co-Founder, brings chess alive for curious young minds.</p>
                            </motion.div>
                            <motion.div
                                className="founder-img-container"
                                initial={{ opacity: 0, y: 40, scale: 0.94 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.9, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <img src="/team/nachiket-chitre.jpg" alt="Nachiket Chitre" />
                                <div className="founder-overlay">
                                    <h3>Nachiket Chitre</h3>
                                    <span>FIDE Master & Co-Founder</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Coaches (Horizontal Scroll / Masonry) */}
            <section className="about-coaches-modern">
                <div className="about-container">
                    <FadeIn>
                        <h2 className="section-title-left">Our Coaches</h2>
                        <p className="section-desc">Rated players and certified instructors dedicated to your growth.</p>
                    </FadeIn>

                    <div className="coaches-horizontal-scroll">
                        {/* Coach 1 */}
                        <FadeIn className="coach-minimal-card" delay={0.1}>
                            <img src="/coaches/viraj-pandit.jpg" alt="Viraj Pandit" />
                            <div className="coach-details">
                                <h4>Viraj Pandit</h4>
                                <span>FIDE-Rated Coach</span>
                            </div>
                        </FadeIn>
                        {/* Coach 2 */}
                        <FadeIn className="coach-minimal-card" delay={0.2}>
                            <img src="/coaches/aum-vyas.jpg" alt="Aum Vyas" />
                            <div className="coach-details">
                                <h4>Aum Vyas</h4>
                                <span>Chess Instructor</span>
                            </div>
                        </FadeIn>
                        {/* Coach 3 */}
                        <FadeIn className="coach-minimal-card" delay={0.3}>
                            <img src="/coaches/tushar-deshpande.jpg" alt="Tushar Deshpande" />
                            <div className="coach-details">
                                <h4>Tushar Deshpande</h4>
                                <span>Senior Instructor</span>
                            </div>
                        </FadeIn>
                        {/* Coach 4 */}
                        <FadeIn className="coach-minimal-card" delay={0.4}>
                            <img src="/coaches/aryan-chitale.jpg" alt="Aryan Chitale" />
                            <div className="coach-details">
                                <h4>Aryan Chitale</h4>
                                <span>FIDE-Rated Player</span>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* 5. Values (Offset Gradient Cards) */}
            <section className="about-values-modern">
                <div className="about-container">
                    <FadeIn>
                        <h2 className="section-title-right">Core Values</h2>
                    </FadeIn>

                    <div className="values-offset-layout">
                        <FadeIn className="value-modern-card" delay={0}>
                            <div className="value-icon-bg"><TargetIcon size={80} color="rgba(252, 138, 36, 0.1)" /></div>
                            <div className="value-content">
                                <TargetIcon size={40} color="#FC8A24" />
                                <h3>Personalized Learning</h3>
                                <p>Tailored instruction adapting to your unique pace and style.</p>
                            </div>
                        </FadeIn>

                        <FadeIn className="value-modern-card offset-down" delay={0.1}>
                            <div className="value-icon-bg"><LightbulbIcon size={80} color="rgba(252, 138, 36, 0.1)" /></div>
                            <div className="value-content">
                                <LightbulbIcon size={40} color="#FC8A24" />
                                <h3>Strategic Thinking</h3>
                                <p>Chess as a tool for critical thinking and problem-solving.</p>
                            </div>
                        </FadeIn>

                        <FadeIn className="value-modern-card" delay={0.2}>
                            <div className="value-icon-bg"><HandshakeIcon size={80} color="rgba(252, 138, 36, 0.1)" /></div>
                            <div className="value-content">
                                <HandshakeIcon size={40} color="#FC8A24" />
                                <h3>Supportive Community</h3>
                                <p>Building confidence through mentorship and encouragement.</p>
                            </div>
                        </FadeIn>

                        <FadeIn className="value-modern-card offset-down" delay={0.3}>
                            <div className="value-icon-bg"><TrophyIcon size={80} color="rgba(252, 138, 36, 0.1)" /></div>
                            <div className="value-content">
                                <TrophyIcon size={40} color="#FC8A24" />
                                <h3>Excellence</h3>
                                <p>Committed to helping every student reach their full potential.</p>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            <CTASection />
            <Footer />
        </div>
    );
};

export default AboutUs;
