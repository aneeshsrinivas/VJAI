import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Hook for scroll-triggered animations
export const useScrollAnimation = (options = {}) => {
    const elementRef = useRef(null);
    const {
        animation = 'fadeUp',
        duration = 0.6,
        delay = 0,
        threshold = 0.2,
        once = true
    } = options;

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const animations = {
            fadeUp: { from: { opacity: 0, y: 50 }, to: { opacity: 1, y: 0 } },
            fadeDown: { from: { opacity: 0, y: -50 }, to: { opacity: 1, y: 0 } },
            fadeLeft: { from: { opacity: 0, x: -50 }, to: { opacity: 1, x: 0 } },
            fadeRight: { from: { opacity: 0, x: 50 }, to: { opacity: 1, x: 0 } },
            scaleIn: { from: { opacity: 0, scale: 0.8 }, to: { opacity: 1, scale: 1 } },
            rotateIn: { from: { opacity: 0, rotation: -10 }, to: { opacity: 1, rotation: 0 } }
        };

        const anim = animations[animation] || animations.fadeUp;

        gsap.set(element, anim.from);

        const trigger = ScrollTrigger.create({
            trigger: element,
            start: `top ${(1 - threshold) * 100}%`,
            onEnter: () => {
                gsap.to(element, {
                    ...anim.to,
                    duration,
                    delay,
                    ease: 'power3.out'
                });
            },
            onLeaveBack: once ? undefined : () => {
                gsap.to(element, { ...anim.from, duration: 0.3 });
            }
        });

        return () => trigger.kill();
    }, [animation, duration, delay, threshold, once]);

    return elementRef;
};

// Hook for stagger animations
export const useStaggerAnimation = (options = {}) => {
    const containerRef = useRef(null);
    const {
        childSelector = '.stagger-item',
        stagger = 0.1,
        duration = 0.5,
        delay = 0,
        direction = 'up'
    } = options;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const children = container.querySelectorAll(childSelector);
        if (!children.length) return;

        const directions = {
            up: { y: 30 },
            down: { y: -30 },
            left: { x: -30 },
            right: { x: 30 }
        };

        gsap.set(children, { opacity: 0, ...directions[direction] });

        const trigger = ScrollTrigger.create({
            trigger: container,
            start: 'top 80%',
            onEnter: () => {
                gsap.to(children, {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    duration,
                    stagger,
                    delay,
                    ease: 'power2.out'
                });
            }
        });

        return () => trigger.kill();
    }, [childSelector, stagger, duration, delay, direction]);

    return containerRef;
};

// Hook for parallax effect
export const useParallax = (speed = 0.5) => {
    const elementRef = useRef(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const trigger = gsap.to(element, {
            yPercent: -30 * speed,
            ease: 'none',
            scrollTrigger: {
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });

        return () => {
            if (trigger.scrollTrigger) {
                trigger.scrollTrigger.kill();
            }
        };
    }, [speed]);

    return elementRef;
};

// Hook for text reveal animation
export const useTextReveal = (options = {}) => {
    const textRef = useRef(null);
    const { delay = 0, duration = 0.8, splitBy = 'words' } = options;

    useEffect(() => {
        const element = textRef.current;
        if (!element) return;

        const text = element.textContent;
        element.textContent = '';

        let items;
        if (splitBy === 'chars') {
            items = text.split('');
        } else {
            items = text.split(' ');
        }

        items.forEach((item, i) => {
            const span = document.createElement('span');
            span.textContent = splitBy === 'chars' ? item : item + ' ';
            span.style.display = 'inline-block';
            span.style.opacity = '0';
            span.style.transform = 'translateY(20px)';
            element.appendChild(span);
        });

        const spans = element.querySelectorAll('span');

        const trigger = ScrollTrigger.create({
            trigger: element,
            start: 'top 85%',
            onEnter: () => {
                gsap.to(spans, {
                    opacity: 1,
                    y: 0,
                    duration,
                    stagger: 0.03,
                    delay,
                    ease: 'power3.out'
                });
            }
        });

        return () => {
            trigger.kill();
            element.textContent = text;
        };
    }, [delay, duration, splitBy]);

    return textRef;
};

// Hook for counter animation
export const useCounter = (endValue, options = {}) => {
    const counterRef = useRef(null);
    const { duration = 2, prefix = '', suffix = '' } = options;

    useEffect(() => {
        const element = counterRef.current;
        if (!element) return;

        const counter = { value: 0 };

        const trigger = ScrollTrigger.create({
            trigger: element,
            start: 'top 90%',
            onEnter: () => {
                gsap.to(counter, {
                    value: endValue,
                    duration,
                    ease: 'power1.out',
                    onUpdate: () => {
                        element.textContent = `${prefix}${Math.round(counter.value)}${suffix}`;
                    }
                });
            }
        });

        return () => trigger.kill();
    }, [endValue, duration, prefix, suffix]);

    return counterRef;
};

export default {
    useScrollAnimation,
    useStaggerAnimation,
    useParallax,
    useTextReveal,
    useCounter
};