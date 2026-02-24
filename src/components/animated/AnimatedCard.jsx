import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { COLORS, SPRINGS } from '../../animations/config';
import './AnimatedCard.css';

const AnimatedCard = ({
    children,
    variant = 'default',
    tilt = true,
    glow = true,
    delay = 0,
    className = '',
    onClick,
    ...props
}) => {
    const cardRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), SPRINGS.snappy);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), SPRINGS.snappy);

    const handleMouseMove = useCallback((e) => {
        if (!tilt || !cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        mouseX.set(x);
        mouseY.set(y);
    }, [tilt, mouseX, mouseY]);

    const handleMouseLeave = useCallback(() => {
        mouseX.set(0);
        mouseY.set(0);
        setIsHovered(false);
    }, [mouseX, mouseY]);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 60,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                delay,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    const variantClasses = {
        default: 'card-animated-default',
        elevated: 'card-animated-elevated',
        glass: 'card-animated-glass',
        premium: 'card-animated-premium',
        bordered: 'card-animated-bordered',
    };

    return (
        <motion.div
            ref={cardRef}
            className={`card-animated ${variantClasses[variant]} ${className}`}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            style={{
                rotateX: tilt ? rotateX : 0,
                rotateY: tilt ? rotateY : 0,
                transformStyle: 'preserve-3d',
                perspective: 1000,
            }}
            whileHover={{
                y: -8,
                boxShadow: COLORS.shadows.large,
            }}
            transition={SPRINGS.standard}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            {...props}
        >
            {glow && isHovered && (
                <motion.div
                    className="card-glow"
                    style={{
                        background: `radial-gradient(
              600px circle at ${mouseX.get() * 100 + 50}% ${mouseY.get() * 100 + 50}%,
              rgba(212, 175, 55, 0.15),
              transparent 40%
            )`
                    }}
                />
            )}

            <motion.div
                className="card-border-glow"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            />

            <div className="card-content" style={{ transform: 'translateZ(40px)' }}>
                {children}
            </div>
        </motion.div>
    );
};

export default AnimatedCard;
