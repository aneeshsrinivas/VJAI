import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ChessGame.css';

// Predefined Chess Narrative Steps
const STEPS = [
    {
        moveText: null,
        explanation: 'Your strategy begins with one move.',
        service: null
    },
    {
        moveText: 'White Move — e2 to e4',
        explanation: 'Control the center from move one. Every strong position begins with controlling key squares.',
        service: { title: 'Strategic Foundations', desc: 'Master opening principles and control the center from move one.' }
    },
    {
        moveText: 'Black Move — e7 to e5',
        explanation: 'Your opponent responds. The battle for the center begins.',
        service: { title: 'Positional Understanding', desc: 'Learn to recognize threats and opportunities at every turn.' }
    },
    {
        moveText: 'White Move — d1 to h5',
        explanation: 'Bring pieces into the game. Development creates opportunities.',
        service: { title: 'Active Development', desc: 'Develop pieces with purpose, creating threats while improving position.' }
    },
    {
        moveText: 'Black Move — b8 to c6',
        explanation: 'Position your pieces on commanding diagonals. Pressure the weakest squares.',
        service: { title: 'Tactical Vision', desc: 'Spot hidden combinations and potential sacrifices before they happen.' }
    },
    {
        moveText: 'White Move — f1 to c4',
        explanation: 'Calculating the checkmate and protecting the queen\'s back. The bishop moves to support the queen, preventing any counterattack.',
        service: { title: 'Strategic Protection', desc: 'Position pieces to protect key attackers while setting up decisive threats.' }
    },
    {
        moveText: 'Black Move — g8 to f6',
        explanation: 'Force your opponent into a losing position. Every move tightens the net.',
        service: { title: 'Forcing Sequences', desc: 'Execute unstoppable combinations that leave no escape.' }
    },
    {
        moveText: 'Checkmate — h5 to f7',
        explanation: 'The queen delivers the final blow. The king has no escape.',
        service: { title: 'Checkmate Mastery', desc: 'Deliver the final blow with precision and confidence.' }
    }
];

const ChessGame = ({ onUnlock }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const boardRef = React.useRef(null);

    const currentStep = STEPS[stepIndex];
    const isFirstStep = stepIndex === 0;
    const isLastStep = stepIndex === STEPS.length - 1;
    const isCheckmate = currentStep.moveText === 'Checkmate — h5 to f7';

    // Auto-scroll board into view when step changes (not on initial mount)
    React.useEffect(() => {
        if (boardRef.current && stepIndex > 0) {
            boardRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [stepIndex]);

    const handleNext = () => {
        if (stepIndex < STEPS.length - 1) {
            setStepIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (stepIndex > 0) {
            setStepIndex(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        if (onUnlock) onUnlock();
    };

    return (
        <section className="chess-game-section" tabIndex={0}>
            <div className="chess-game-container">
                <h2 className="game-section-title">The Art of War</h2>

                <div className="chess-ui-layout">
                    {/* LEFT: Board */}
                    <div className="chess-board-wrapper" ref={boardRef}>
                        <div className="chess-board-image-wrapper">
                            <AnimatePresence mode='wait'>
                                <motion.img
                                    key={stepIndex}
                                    src={`/step${stepIndex}.png`}
                                    alt={`Chess position step ${stepIndex}`}
                                    className="chess-board-image"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                />
                            </AnimatePresence>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="chess-navigation">
                            <button
                                className="chess-nav-btn prev"
                                onClick={handlePrevious}
                                disabled={isFirstStep}
                            >
                                ◀ Previous
                            </button>
                            <button
                                className="chess-nav-btn next"
                                onClick={handleNext}
                                disabled={isLastStep}
                            >
                                Next ▶
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: Service Reveal */}
                    <div className="service-reveal-panel">
                        <AnimatePresence mode='wait'>
                            {currentStep.service ? (
                                <motion.div
                                    key={currentStep.service.title}
                                    className="service-reveal-card"
                                    initial={{ opacity: 0, x: stepIndex % 2 === 0 ? 50 : -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: stepIndex % 2 === 0 ? -50 : 50 }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                >
                                    <div className="move-badge">Phase {stepIndex}</div>

                                    {/* Move Text */}
                                    {currentStep.moveText && (
                                        <div className="move-text">{currentStep.moveText}</div>
                                    )}

                                    {/* Explanation */}
                                    <div className={`instruction-text ${isCheckmate ? 'mate' : ''}`}>
                                        {currentStep.explanation}
                                    </div>

                                    <h3>{currentStep.service.title}</h3>
                                    <p>{currentStep.service.desc}</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="service-placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <p>Your strategy begins with a single move.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {isCheckmate && (
                            <motion.div
                                className="end-game-cta"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <button onClick={handleSkip} className="explore-btn">
                                    Explore All Services
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Skip button positioned outside container for absolute positioning */}
            <div className="skip-container">
                <button className="skip-btn" onClick={handleSkip}>
                    Skip Experience →
                </button>
            </div>
        </section>
    );
};

export default ChessGame;
