import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { COLORS, SPRINGS } from '../../animations/config';
import './AnimatedButton.css';

const AnimatedButton = ({
    children,
    variant = 'primary',
    size = 'medium',
    magnetic = true,
    shimmer = true,
    loading = false,
    disabled = false,
    onClick,
    className = '',
    ...props
}) => {
    const buttonRef = useRef(null);
    const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = useCallback((e) => {
        if (!magnetic || !buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * 0.15;
        const deltaY = (e.clientY - centerY) * 0.15;

        setMagneticOffset({ x: deltaX, y: deltaY });
    }, [magnetic]);

    const handleMouseLeave = useCallback(() => {
        setMagneticOffset({ x: 0, y: 0 });
        setIsHovered(false);
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const buttonVariants = {
        rest: {
            scale: 1,
            boxShadow: COLORS.shadows.subtle,
        },
        hover: {
            scale: 1.05,
            boxShadow: variant === 'primary' ? COLORS.shadows.goldGlow : COLORS.shadows.glow,
        },
        tap: {
            scale: 0.95,
        }
    };

    const variantClasses = {
        primary: 'btn-animated-primary',
        secondary: 'btn-animated-secondary',
        ghost: 'btn-animated-ghost',
        gold: 'btn-animated-gold',
    };

    const sizeClasses = {
        small: 'btn-animated-sm',
        medium: 'btn-animated-md',
        large: 'btn-animated-lg',
    };

    return (
        <motion.button
            ref={buttonRef}
            className={`btn-animated ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${loading ? 'btn-loading' : ''}`}
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            animate={{
                x: magneticOffset.x,
                y: magneticOffset.y,
            }}
            transition={SPRINGS.snappy}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            disabled={disabled || loading}
            data-cursor="magnetic"
            {...props}
        >
            {shimmer && isHovered && (
                <motion.div
                    className="btn-shimmer"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
            )}

            {loading ? (
                <span className="btn-spinner-container">
                    <motion.span
                        className="btn-spinner"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <span className="btn-loading-text">Loading...</span>
                </span>
            ) : (
                <span className="btn-content">{children}</span>
            )}

            <motion.div
                className="btn-ripple"
                initial={{ scale: 0, opacity: 0.5 }}
                whileTap={{ scale: 4, opacity: 0 }}
                transition={{ duration: 0.5 }}
            />
        </motion.button>
    );
};

export default AnimatedButton;
