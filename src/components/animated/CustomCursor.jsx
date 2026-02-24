import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import './CustomCursor.css';

// Lightweight chess-inspired cursor (gold knight + subtle halo)
const CustomCursor = () => {
    const [isHovered, setIsHovered] = useState(false);

    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    const followerX = useSpring(mouseX, { stiffness: 140, damping: 16, mass: 0.2 });
    const followerY = useSpring(mouseY, { stiffness: 140, damping: 16, mass: 0.2 });

    useEffect(() => {
        const moveCursor = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleHover = (e) => {
            const target = e.target;
            const interactive = target.tagName === 'BUTTON'
                || target.tagName === 'A'
                || target.closest('button')
                || target.closest('a')
                || target.getAttribute('role') === 'button';
            setIsHovered(Boolean(interactive));
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleHover);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleHover);
        };
    }, [mouseX, mouseY]);

    if (typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)) return null;

    return (
        <>
            <motion.div
                className="cursor-dot"
                style={{ x: mouseX, y: mouseY }}
                aria-hidden
            />
            <motion.div
                className="cursor-knight"
                style={{ x: mouseX, y: mouseY, scale: isHovered ? 0.9 : 1 }}
                aria-hidden
            />
            <motion.div
                className={`cursor-halo ${isHovered ? 'hovered' : ''}`}
                style={{ x: followerX, y: followerY }}
                aria-hidden
            />
        </>
    );
};

export default CustomCursor;
