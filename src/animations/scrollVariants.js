export const fadeIn = (direction = 'up', duration = 0.6, delay = 0) => {
    return {
        hidden: {
            y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
            x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0,
            opacity: 0,
        },
        show: {
            y: 0,
            x: 0,
            opacity: 1,
            transition: {
                type: 'tween',
                duration: duration,
                delay: delay,
                ease: [0.25, 0.25, 0.25, 0.75], // Smooth apple-like ease
            },
        },
    };
};

export const staggerContainer = (staggerChildren, delayChildren) => {
    return {
        hidden: {},
        show: {
            transition: {
                staggerChildren: staggerChildren || 0.1,
                delayChildren: delayChildren || 0,
            },
        },
    };
};

export const zoomIn = (duration = 0.6, delay = 0) => {
    return {
        hidden: {
            scale: 0.95,
            opacity: 0,
        },
        show: {
            scale: 1,
            opacity: 1,
            transition: {
                type: 'tween',
                duration: duration,
                delay: delay,
                ease: 'easeOut',
            },
        },
    };
};
