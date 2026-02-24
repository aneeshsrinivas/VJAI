// ========================================
// PREMIUM SCROLL ANIMATION VARIANTS
// Cinematic Emergence Patterns
// ========================================

/**
 * Heading Animations - Rising into View
 * Use for H1, H2 elements that need emphasis
 */
export const headingEmergence = {
    initial: {
        opacity: 0,
        y: 30,
        scale: 0.96
    },
    whileInView: {
        opacity: 1,
        y: 0,
        scale: 1
    },
    viewport: {
        once: true,
        margin: "-100px"
    },
    transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
    }
};

/**
 * Subheading/Label Animations
 * Appears before main heading
 */
export const labelEmergence = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98
    },
    whileInView: {
        opacity: 1,
        y: 0,
        scale: 1
    },
    viewport: {
        once: true,
        margin: "-100px"
    },
    transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
    }
};

/**
 * Image Animations - Soft Depth Reveal
 * Creates a gentle zoom-in with upward float
 */
export const imageEmergence = {
    initial: {
        opacity: 0,
        y: 40,
        scale: 0.94
    },
    whileInView: {
        opacity: 1,
        y: 0,
        scale: 1
    },
    viewport: {
        once: true,
        margin: "-80px"
    },
    transition: {
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1]
    }
};

/**
 * Text Content Animations
 * For paragraphs and body copy
 */
export const textEmergence = {
    initial: {
        opacity: 0,
        y: 25
    },
    whileInView: {
        opacity: 1,
        y: 0
    },
    viewport: {
        once: true,
        margin: "-100px"
    },
    transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
    }
};

/**
 * Card Animations - Alternating Directions
 * Use with index to create alternating pattern
 */
export const cardEmergence = (index, delay = 0) => ({
    initial: {
        opacity: 0,
        y: 30,
        x: index % 2 === 0 ? -20 : 20,
        scale: 0.97
    },
    whileInView: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1
    },
    viewport: {
        once: true,
        margin: "-60px"
    },
    transition: {
        duration: 0.8,
        delay: delay + (index * 0.15),
        ease: [0.22, 1, 0.36, 1]
    }
});

/**
 * Sequential Section Pattern
 * Helper to create staggered delays
 */
export const getSequentialDelay = (step) => {
    const delays = {
        label: 0,
        heading: 0.15,
        image: 0.25,
        text: 0.35,
        cards: 0.45
    };
    return delays[step] || 0;
};

/**
 * Container Variants - For Parent Elements
 * Use with staggerChildren for automatic sequencing
 */
export const containerEmergence = {
    initial: {},
    whileInView: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.1
        }
    },
    viewport: {
        once: true,
        margin: "-80px"
    }
};

/**
 * Child Variants - For Items in Container
 */
export const childEmergence = {
    initial: {
        opacity: 0,
        y: 25,
        scale: 0.98
    },
    whileInView: {
        opacity: 1,
        y: 0,
        scale: 1
    },
    transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
    }
};

/**
 * Button/CTA Animations
 * Subtle emergence for interactive elements
 */
export const ctaEmergence = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.95
    },
    whileInView: {
        opacity: 1,
        y: 0,
        scale: 1
    },
    viewport: {
        once: true,
        margin: "-100px"
    },
    transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
    }
};

/**
 * Feature Grid Animations
 * For items in a grid layout
 */
export const gridItemEmergence = (index, totalDelay = 0.5) => ({
    initial: {
        opacity: 0,
        y: 30,
        scale: 0.96
    },
    whileInView: {
        opacity: 1,
        y: 0,
        scale: 1
    },
    viewport: {
        once: true,
        margin: "-50px"
    },
    transition: {
        duration: 0.75,
        delay: totalDelay + (index * 0.1),
        ease: [0.22, 1, 0.36, 1]
    }
});

/**
 * Example Usage:
 * 
 * import { headingEmergence, imageEmergence, textEmergence, cardEmergence } from './animations/emergence';
 * 
 * // Heading
 * <motion.h2 {...headingEmergence}>
 *   Your Heading
 * </motion.h2>
 * 
 * // Image with delay
 * <motion.img 
 *   {...imageEmergence}
 *   transition={{ ...imageEmergence.transition, delay: 0.25 }}
 *   src="..."
 * />
 * 
 * // Cards
 * {cards.map((card, i) => (
 *   <motion.div key={i} {...cardEmergence(i, 0.45)}>
 *     {card.content}
 *   </motion.div>
 * ))}
 */
