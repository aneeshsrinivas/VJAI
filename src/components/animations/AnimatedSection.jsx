import React from 'react';
import { motion } from 'framer-motion';

// Animated section that reveals on scroll
const AnimatedSection = ({
    children,
    className = '',
    direction = 'up',
    delay = 0,
    duration = 0.6,
    ...props
}) => {
    const directions = {
        up: { hidden: { y: 50 }, visible: { y: 0 } },
        down: { hidden: { y: -50 }, visible: { y: 0 } },
        left: { hidden: { x: -50 }, visible: { x: 0 } },
        right: { hidden: { x: 50 }, visible: { x: 0 } },
        scale: { hidden: { scale: 0.9 }, visible: { scale: 1 } }
    };

    const variants = {
        hidden: {
            opacity: 0,
            ...directions[direction].hidden
        },
        visible: {
            opacity: 1,
            ...directions[direction].visible,
            transition: {
                duration,
                delay,
                ease: [0.43, 0.13, 0.23, 0.96]
            }
        }
    };

    return (
        <motion.section
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={variants}
            {...props}
        >
            {children}
        </motion.section>
    );
};

export default AnimatedSection;
