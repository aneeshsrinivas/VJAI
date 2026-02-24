import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
    // Reset scroll position on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const variants = {
        initial: {
            opacity: 0,
            y: 8, // Tiny vertical offset (8px)
        },
        animate: {
            opacity: 1,
            y: 0,
        },
        exit: {
            opacity: 0,
            y: -8, // Tiny vertical offset (8px)
        }
    };

    return (
        <motion.div
            className="page-content"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
                duration: 0.4, // 300-400ms range
                ease: [0.215, 0.61, 0.355, 1], // easeOutCubic
            }}
            style={{ width: '100%', minHeight: '100vh', transformOrigin: 'top center' }}
            onAnimationComplete={(definition) => {
                if (definition === "animate") {
                    const elems = document.querySelectorAll('.page-content');
                    elems.forEach(el => el.style.transform = 'none');
                }
            }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
