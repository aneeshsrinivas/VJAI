import React from 'react';
import { motion } from 'framer-motion';
import './ScrollIndicator.css';

const ScrollIndicator = ({ onClick }) => {
    return (
        <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            onClick={onClick}
        >
            <span className="scroll-text">Scroll to explore</span>
            <motion.div
                className="scroll-mouse"
                animate={{ y: [0, 8, 0] }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <div className="mouse-body">
                    <motion.div
                        className="mouse-wheel"
                        animate={{ y: [0, 6, 0] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ScrollIndicator;
