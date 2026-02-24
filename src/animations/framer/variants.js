export const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    }
};

export const fadeInDown = {
    hidden: { opacity: 0, y: -40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    }
};

export const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
};

export const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 10 }
    }
};

export const rotateIn = {
    hidden: { opacity: 0, rotate: -15, scale: 0.9 },
    visible: {
        opacity: 1,
        rotate: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 260, damping: 20 }
    }
};

export const staggerContainer = (staggerAmount = 0.1, delayAmount = 0.2) => ({
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: staggerAmount,
            delayChildren: delayAmount
        }
    }
});

export const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    }
};

export const characterReveal = {
    hidden: { opacity: 0, y: 50 },
    visible: (index) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: index * 0.05,
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1]
        }
    })
};

export const wordReveal = {
    hidden: { opacity: 0, y: 30, rotateX: -40 },
    visible: (index) => ({
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: {
            delay: index * 0.08,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1]
        }
    })
};

export const cardHover = {
    rest: {
        scale: 1,
        y: 0,
        boxShadow: '0 12px 40px rgba(12, 51, 98, 0.15)'
    },
    hover: {
        scale: 1.02,
        y: -8,
        boxShadow: '0 25px 60px rgba(12, 51, 98, 0.2)',
        transition: { duration: 0.25, ease: [0.76, 0, 0.24, 1] }
    },
    tap: {
        scale: 0.98,
        transition: { duration: 0.15 }
    }
};

export const card3DTilt = {
    rest: {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        boxShadow: '0 12px 40px rgba(12, 51, 98, 0.15)'
    },
    hover: (tilt) => ({
        rotateX: tilt?.x || 0,
        rotateY: tilt?.y || 0,
        scale: 1.02,
        boxShadow: '0 25px 60px rgba(12, 51, 98, 0.25)',
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    })
};

export const buttonMagnetic = {
    rest: {
        scale: 1,
        x: 0,
        y: 0,
        boxShadow: '0 4px 20px rgba(12, 51, 98, 0.08)'
    },
    hover: (offset) => ({
        scale: 1.05,
        x: offset?.x || 0,
        y: offset?.y || 0,
        boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)',
        transition: { type: 'spring', stiffness: 400, damping: 30 }
    }),
    tap: {
        scale: 0.95,
        transition: { duration: 0.15 }
    }
};

export const shimmer = {
    initial: { backgroundPosition: '-200% 0' },
    animate: {
        backgroundPosition: '200% 0',
        transition: { duration: 1.5, repeat: Infinity, ease: 'linear' }
    }
};

export const modalBackdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.2, delay: 0.1 } }
};

export const modalContent = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 260, damping: 20 }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.2 }
    }
};

export const flip = {
    front: { rotateY: 0 },
    back: { rotateY: 180 }
};

export const accordion = {
    collapsed: {
        height: 0,
        opacity: 0,
        transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1] }
    },
    expanded: {
        height: 'auto',
        opacity: 1,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    }
};

export const iconRotate = {
    collapsed: { rotate: 0 },
    expanded: { rotate: 180, transition: { duration: 0.3 } }
};

export const floatingPiece = {
    animate: {
        y: [0, -15, 0],
        rotate: [0, 5, 0],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
        }
    }
};

export const pulsingGlow = {
    animate: {
        boxShadow: [
            '0 0 20px rgba(212, 175, 55, 0.3)',
            '0 0 40px rgba(212, 175, 55, 0.5)',
            '0 0 20px rgba(212, 175, 55, 0.3)'
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
        }
    }
};

export const scrollIndicator = {
    animate: {
        y: [0, 8, 0],
        opacity: [0.5, 1, 0.5],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
        }
    }
};
