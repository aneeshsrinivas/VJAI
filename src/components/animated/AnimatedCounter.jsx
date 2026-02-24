import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import './AnimatedCounter.css';

const AnimatedCounter = ({
    end,
    duration = 2,
    suffix = '',
    prefix = '',
    decimals = 0,
    label,
    icon
}) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const countRef = useRef(0);

    useEffect(() => {
        if (!isInView) return;

        const startTime = Date.now();
        const endValue = parseFloat(end);

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);

            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = easeOut * endValue;

            setCount(currentValue);
            countRef.current = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isInView, end, duration]);

    const displayValue = decimals > 0
        ? count.toFixed(decimals)
        : Math.floor(count);

    return (
        <motion.div
            ref={ref}
            className="animated-counter"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            {icon && <span className="counter-icon">{icon}</span>}
            <div className="counter-value">
                <span className="counter-prefix">{prefix}</span>
                <span className="counter-number">{displayValue}</span>
                <span className="counter-suffix">{suffix}</span>
            </div>
            {label && <p className="counter-label">{label}</p>}
        </motion.div>
    );
};

export default AnimatedCounter;
