import React from 'react';
import { motion } from 'framer-motion';

// Page transition wrapper component
const PageTransition = ({ children, className = '' }) => {
    const pageVariants = {
        initial: {
            opacity: 0,
        },
        animate: {
            opacity: 1,
            transition: {
                duration: 0.35,
                ease: [0.25, 0.1, 0.25, 1],
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.15
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

export default PageTransition;
