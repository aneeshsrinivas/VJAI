import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Trophy, Search, BookOpen, Swords } from 'lucide-react'; // Premium Icons
import Footer from '../components/layout/Footer';
import CTASection from '../components/shared/CTASection';
import ChessGame from '../components/features/ChessGame'; // Phase 2 Interaction
import VideoWithFade from '../components/shared/VideoWithFade';
import './Services.css';

// Replaced emojis with Lucide Icons for professional look
const servicesData = [
    {
        title: "Private Coaching",
        description: "One-on-one mentorship tailored to your unique playstyle and goals.",
        icon: <Target size={32} color="#F88B22" strokeWidth={1.5} />
    },
    {
        title: "Group Masterclasses",
        description: "Small, interactive sessions fostering peer learning and healthy competition.",
        icon: <Users size={32} color="#F88B22" strokeWidth={1.5} />
    },
    {
        title: "Tournament Prep",
        description: "Rigorous simulation and psychological conditioning for competitive play.",
        icon: <Trophy size={32} color="#F88B22" strokeWidth={1.5} />
    },
    {
        title: "Game Analysis",
        description: "Deep-dive reviews of your games to turn mistakes into mastery.",
        icon: <Search size={32} color="#F88B22" strokeWidth={1.5} />
    },
    {
        title: "Foundations Course",
        description: "Structured curriculum for beginners to build unbreakable core skills.",
        icon: <BookOpen size={32} color="#F88B22" strokeWidth={1.5} />
    },
    {
        title: "Advanced Strategy",
        description: "Complex tactical training and endgame theory for rated players.",
        icon: <Swords size={32} color="#F88B22" strokeWidth={1.5} />
    }
];

const Services = () => {
    const [isContentUnlocked, setIsContentUnlocked] = React.useState(false);
    const videoRef = React.useRef(null);
    const [isLooping, setIsLooping] = React.useState(false);

    // Cinematic Fade Loop Logic
    React.useEffect(() => {
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

    const handleContentUnlock = () => {
        setIsContentUnlocked(true);
        // Add small delay to allow render, then scroll
        setTimeout(() => {
            const grid = document.getElementById('services-grid');
            if (grid) {
                grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    return (
        <div className="services-page-phase1">
            {/* Navbar handled globally */}

            {/* 1. HERO SECTION */}
            <section className="services-hero-phase1">
                <div className="hero-bg-wrapper">
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
                        src="/chess-video2.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="hero-bg-img"
                    />
                    <div className="hero-overlay-cinematic"></div>
                </div>

                <div className="services-container relative-z">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <h1>The Art of <br /><span className="text-highlight-orange">Strategic Mastery</span></h1>
                        <p className="hero-subtext">Premium chess education tailored for the next generation of grandmasters.</p>
                    </motion.div>

                    <motion.div
                        className="scroll-indicator-phase1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                    >
                        <span>Scroll to Experience</span>
                        <div className="scroll-line"></div>
                    </motion.div>
                </div>
            </section>

            {/* 2. CHESS INTERACTION (Phase 2) */}
            {/* Locks content until completed/skipped */}
            <ChessGame onUnlock={handleContentUnlock} />

            {/* 3. CORE SERVICES GRID (Conditionally Rendered or Hidden) */}
            {isContentUnlocked && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <section id="services-grid" className="services-grid-section">
                        <div className="services-container">
                            <motion.h2
                                className="section-title-editorial-white"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                OUR SERVICES
                            </motion.h2>

                            <motion.div
                                className="services-grid"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.1 }
                                    }
                                }}
                            >
                                {servicesData.map((service, index) => (
                                    <motion.div
                                        key={index}
                                        className="service-card-phase1"
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                                        }}
                                    >
                                        <div className="card-icon">{service.icon}</div>
                                        <h3>{service.title}</h3>
                                        <p>{service.description}</p>
                                        <div className="card-hover-overlay"></div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </section>

                    {/* 4. VISUAL BREAK SECTION */}
                    <section className="visual-break-section">
                        <div className="visual-break-bg">
                            <VideoWithFade
                                src="/chess-story.mp4"
                                className="visual-break-video"
                            />
                            <div className="visual-break-overlay"></div>
                        </div>
                        <div className="services-container relative-z">
                            <motion.blockquote
                                className="visual-quote"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 1 }}
                            >
                                "Chess is the gymnasium of the mind."
                                <footer>— Blaise Pascal</footer>
                            </motion.blockquote>
                        </div>
                    </section>

                    {/* 5. CTA SECTION (Reused) */}
                    <CTASection />
                    <Footer />
                </motion.div>
            )}
        </div>
    );
};

export default Services;
