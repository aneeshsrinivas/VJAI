import React from 'react';
import { motion } from 'framer-motion';

// Page transition wrapper component
const PageTransition = ({ children, className = '' }) => {
    const pageVariants = {
        initial: {
            opacity: 0,
            y: 20
        },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.43, 0.13, 0.23, 0.96],
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.3
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
