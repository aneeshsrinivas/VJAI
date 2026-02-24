import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const createScrollReveal = (element, options = {}) => {
    const config = {
        y: 60,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
        ...options
    };

    return gsap.fromTo(element,
        { opacity: 0, y: config.y },
        {
            opacity: 1,
            y: 0,
            duration: config.duration,
            ease: config.ease,
            scrollTrigger: {
                trigger: element,
                start: config.start,
                toggleActions: config.toggleActions,
            }
        }
    );
};

export const createStaggerReveal = (container, items, options = {}) => {
    const config = {
        y: 50,
        stagger: 0.1,
        duration: 0.4,
        ease: 'power3.out',
        start: 'top 80%',
        ...options
    };

    return gsap.fromTo(items,
        { opacity: 0, y: config.y },
        {
            opacity: 1,
            y: 0,
            duration: config.duration,
            stagger: config.stagger,
            ease: config.ease,
            scrollTrigger: {
                trigger: container,
                start: config.start,
            }
        }
    );
};

export const createParallax = (element, speed = 0.5, options = {}) => {
    const config = {
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        ...options
    };

    return gsap.to(element, {
        yPercent: -100 * speed,
        ease: 'none',
        scrollTrigger: {
            trigger: element,
            start: config.start,
            end: config.end,
            scrub: config.scrub,
        }
    });
};

export const createHorizontalScroll = (container, track, options = {}) => {
    const config = {
        ease: 'none',
        pin: true,
        anticipatePin: 1,
        ...options
    };

    const scrollWidth = track.scrollWidth - container.offsetWidth;

    return gsap.to(track, {
        x: -scrollWidth,
        ease: config.ease,
        scrollTrigger: {
            trigger: container,
            start: 'center center',
            end: () => `+=${scrollWidth}`,
            scrub: 1,
            pin: config.pin,
            anticipatePin: config.anticipatePin,
        }
    });
};

export const createPinSection = (element, options = {}) => {
    const config = {
        start: 'top top',
        end: '+=100%',
        pin: true,
        pinSpacing: true,
        ...options
    };

    return ScrollTrigger.create({
        trigger: element,
        start: config.start,
        end: config.end,
        pin: config.pin,
        pinSpacing: config.pinSpacing,
    });
};

export const createCounter = (element, target, options = {}) => {
    const config = {
        duration: 2,
        ease: 'power2.out',
        start: 'top 80%',
        suffix: '',
        ...options
    };

    const counter = { value: 0 };

    return gsap.to(counter, {
        value: target,
        duration: config.duration,
        ease: config.ease,
        onUpdate: () => {
            element.textContent = Math.round(counter.value) + config.suffix;
        },
        scrollTrigger: {
            trigger: element,
            start: config.start,
            once: true,
        }
    });
};

export const createTextSplit = (element, options = {}) => {
    const config = {
        type: 'chars',
        stagger: 0.03,
        duration: 0.5,
        ease: 'power3.out',
        start: 'top 85%',
        y: 50,
        ...options
    };

    const text = element.textContent;
    element.textContent = '';

    const chars = text.split('').map((char) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        element.appendChild(span);
        return span;
    });

    return gsap.fromTo(chars,
        { opacity: 0, y: config.y },
        {
            opacity: 1,
            y: 0,
            duration: config.duration,
            stagger: config.stagger,
            ease: config.ease,
            scrollTrigger: {
                trigger: element,
                start: config.start,
                once: true,
            }
        }
    );
};

export const createRevealMask = (element, options = {}) => {
    const config = {
        direction: 'left',
        duration: 0.8,
        ease: 'power3.inOut',
        start: 'top 80%',
        ...options
    };

    const clipPaths = {
        left: { from: 'inset(0 100% 0 0)', to: 'inset(0 0% 0 0)' },
        right: { from: 'inset(0 0 0 100%)', to: 'inset(0 0 0 0%)' },
        top: { from: 'inset(0 0 100% 0)', to: 'inset(0 0 0% 0)' },
        bottom: { from: 'inset(100% 0 0 0)', to: 'inset(0% 0 0 0)' },
    };

    const clip = clipPaths[config.direction];

    return gsap.fromTo(element,
        { clipPath: clip.from },
        {
            clipPath: clip.to,
            duration: config.duration,
            ease: config.ease,
            scrollTrigger: {
                trigger: element,
                start: config.start,
                once: true,
            }
        }
    );
};

export const createProgressBar = (element, options = {}) => {
    const config = {
        start: 'top top',
        end: 'bottom bottom',
        ...options
    };

    return gsap.to(element, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
            trigger: document.body,
            start: config.start,
            end: config.end,
            scrub: 0.3,
        }
    });
};

export const createNavHide = (nav, options = {}) => {
    const config = {
        showThreshold: -30,
        hideThreshold: 30,
        duration: 0.3,
        ...options
    };

    let lastScrollY = 0;

    ScrollTrigger.create({
        start: 'top top',
        end: 'max',
        onUpdate: (self) => {
            const scrollY = window.scrollY;
            const direction = scrollY > lastScrollY ? 'down' : 'up';
            const delta = scrollY - lastScrollY;

            if (direction === 'down' && delta > config.hideThreshold && scrollY > 100) {
                gsap.to(nav, { y: '-100%', duration: config.duration, ease: 'power2.out' });
            } else if (direction === 'up' && delta < config.showThreshold) {
                gsap.to(nav, { y: '0%', duration: config.duration, ease: 'power2.out' });
            }

            lastScrollY = scrollY;
        }
    });
};

export const killAllScrollTriggers = () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
};
