import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.12, ease: 'easeIn' }
    }
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
