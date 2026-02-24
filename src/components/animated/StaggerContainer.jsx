import React from 'react';
import { motion } from 'framer-motion';

// Container for staggered children animations
const StaggerContainer = ({
    children,
    className = '',
    staggerDelay = 0.1,
    initialDelay = 0,
    ...props
}) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: initialDelay,
                staggerChildren: staggerDelay
            }
        }
    };

    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={containerVariants}
            {...props}
        >
            {children}
        </motion.div>
    );
};

// Individual stagger item
export const StaggerItem = ({
    children,
    className = '',
    direction = 'up',
    ...props
}) => {
    const directions = {
        up: { y: 30 },
        down: { y: -30 },
        left: { x: -30 },
        right: { x: 30 },
        scale: { scale: 0.9 }
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            ...directions[direction]
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: [0.43, 0.13, 0.23, 0.96]
            }
        }
    };

    return (
        <motion.div
            className={className}
            variants={itemVariants}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default StaggerContainer;
