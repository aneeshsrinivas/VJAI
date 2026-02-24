import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import './MagneticButton.css';

const MagneticButton = ({ children, variant = 'primary', onClick, className = '' }) => {
    const buttonRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const button = buttonRef.current;
        if (!button) return;

        const handleMouseMove = (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(button, {
                x: x * 0.2, // Reduced movement for "Calm" feel
                y: y * 0.2,
                duration: 0.4,
                ease: 'power2.out'
            });
        };

        const handleMouseLeave = () => {
            gsap.to(button, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: 'power2.out'
            });
        };

        button.addEventListener('mousemove', handleMouseMove);
        button.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            button.removeEventListener('mousemove', handleMouseMove);
            button.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <motion.button
            ref={buttonRef}
            className={`magnetic-button magnetic-button-${variant} ${className}`}
            onClick={onClick}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <span className="magnetic-btn-text">{children}</span>
        </motion.button>
    );
};

export default MagneticButton;
