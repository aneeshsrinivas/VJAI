// Animation configuration and utility functions
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ============================================
// COLOR SCHEME
// ============================================
export const colors = {
    primary: '#0C3362',      // Deep Navy
    base: '#FEFFEC',         // Soft Off-White
    accent: '#47607E',       // Steel Blue
    white: '#FFFFFF',
    black: '#000000',
};

// ============================================
// TIMING & EASING
// ============================================
export const timing = {
    fast: 0.2,
    normal: 0.4,
    slow: 0.6,
    verySlow: 0.8,
};

export const easing = {
    smooth: [0.43, 0.13, 0.23, 0.96],
    bounce: [0.68, -0.55, 0.265, 1.55],
    elastic: 'elastic.out(1, 0.5)',
    power2: 'power2.out',
    power3: 'power3.out',
    power4: 'power4.out',
    back: 'back.out(1.7)',
};

// ============================================
// FRAMER MOTION VARIANTS
// ============================================

// Fade in from bottom
export const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: timing.normal, ease: easing.smooth }
    }
};

// Fade in from left
export const fadeInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: timing.normal, ease: easing.smooth }
    }
};

// Fade in from right
export const fadeInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: timing.normal, ease: easing.smooth }
    }
};

// Scale in
export const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: timing.normal, ease: easing.smooth }
    }
};

// Stagger container
export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

// Stagger items
export const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: easing.smooth }
    }
};

// Page transition
export const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: easing.smooth }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.3 }
    }
};

// Modal animation
export const modalBackdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const modalContent = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.3, ease: easing.smooth }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 20,
        transition: { duration: 0.2 }
    }
};

// Button hover
export const buttonHover = {
    scale: 1.02,
    transition: { duration: 0.2 }
};

export const buttonTap = {
    scale: 0.98
};

// Card hover
export const cardHover = {
    y: -8,
    boxShadow: '0 20px 40px rgba(12, 51, 98, 0.15)',
    transition: { duration: 0.3, ease: easing.smooth }
};

// ============================================
// GSAP ANIMATION FUNCTIONS
// ============================================

// Text reveal animation
export const animateTextReveal = (element, delay = 0) => {
    gsap.fromTo(element,
        { opacity: 0, y: 50 },
        {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay,
            ease: 'power3.out'
        }
    );
};

// Stagger elements animation
export const animateStagger = (elements, staggerAmount = 0.1) => {
    gsap.fromTo(elements,
        { opacity: 0, y: 30 },
        {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: staggerAmount,
            ease: 'power2.out'
        }
    );
};

// Scroll-triggered fade in
export const scrollFadeIn = (element, direction = 'up') => {
    const directions = {
        up: { y: 50 },
        down: { y: -50 },
        left: { x: -50 },
        right: { x: 50 }
    };

    gsap.fromTo(element,
        { opacity: 0, ...directions[direction] },
        {
            opacity: 1,
            y: 0,
            x: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        }
    );
};

// Counter animation
export const animateCounter = (element, endValue, duration = 2) => {
    gsap.to(element, {
        innerHTML: endValue,
        duration,
        ease: 'power1.out',
        snap: { innerHTML: 1 },
        scrollTrigger: {
            trigger: element,
            start: 'top 90%'
        }
    });
};

// Draw SVG path
export const animateDrawSVG = (path, duration = 1.5) => {
    const length = path.getTotalLength();
    gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length
    });
    gsap.to(path, {
        strokeDashoffset: 0,
        duration,
        ease: 'power2.inOut'
    });
};

// Magnetic button effect
export const createMagneticEffect = (button, strength = 0.3) => {
    const handleMouseMove = (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(button, {
            x: x * strength,
            y: y * strength,
            duration: 0.3,
            ease: 'power2.out'
        });
    };

    const handleMouseLeave = () => {
        gsap.to(button, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)'
        });
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
        button.removeEventListener('mousemove', handleMouseMove);
        button.removeEventListener('mouseleave', handleMouseLeave);
    };
};

// Parallax effect
export const createParallax = (element, speed = 0.5) => {
    gsap.to(element, {
        yPercent: -30 * speed,
        ease: 'none',
        scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    });
};

// Shake animation (for errors)
export const shake = (element) => {
    gsap.to(element, {
        x: [-10, 10, -10, 10, 0],
        duration: 0.4,
        ease: 'power2.out'
    });
};

// Pulse animation
export const pulse = (element, scale = 1.05) => {
    gsap.to(element, {
        scale,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
    });
};

// Confetti celebration
export const createConfetti = (container, count = 50) => {
    const colors = ['#0C3362', '#47607E', '#FEFFEC', '#FFD700', '#FF6B6B'];

    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: 50%;
      top: 50%;
      pointer-events: none;
      z-index: 9999;
    `;
        container.appendChild(confetti);

        gsap.to(confetti, {
            x: gsap.utils.random(-300, 300),
            y: gsap.utils.random(-300, 300),
            rotation: gsap.utils.random(0, 720),
            opacity: 0,
            duration: gsap.utils.random(1, 2),
            ease: 'power2.out',
            onComplete: () => confetti.remove()
        });
    }
};

export default {
    colors,
    timing,
    easing,
    fadeInUp,
    fadeInLeft,
    fadeInRight,
    scaleIn,
    staggerContainer,
    staggerItem,
    pageTransition,
    modalBackdrop,
    modalContent,
    buttonHover,
    buttonTap,
    cardHover,
    animateTextReveal,
    animateStagger,
    scrollFadeIn,
    animateCounter,
    animateDrawSVG,
    createMagneticEffect,
    createParallax,
    shake,
    pulse,
    createConfetti
};
