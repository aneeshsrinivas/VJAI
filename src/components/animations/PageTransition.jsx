import React from 'react';
import { motion } from 'framer-motion';

// Page transition wrapper component
const PageTransition = ({ children, className = '' }) => {
    const pageVariants = {
        initial: {
            opacity: 0,
            y: 24,
            scale: 0.99,
        },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
            }
        },
        exit: {
            opacity: 0,
            y: -16,
            scale: 0.98,
            transition: {
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1],
            }
        }
    };

    return (
        <motion.div
            className={`page-transition ${className}`}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
        >
            {children}
        </motion.div>
    );
};

const PageTransition = ({ children, className = '' }) => (
    <motion.div
        className={`page-transition ${className}`}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        style={{ willChange: 'opacity, transform' }}
    >
        {children}
    </motion.div>
);

export default PageTransition;
