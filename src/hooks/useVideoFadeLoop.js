import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for smooth video loop transitions with black fade
 * Prevents jarring jump when video loops by fading to black before restart
 * 
 * @returns {Object} { videoRef, isLooping } - Reference for video element and looping state
 */
export const useVideoFadeLoop = () => {
    const videoRef = useRef(null);
    const [isLooping, setIsLooping] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Auto-play video
        video.play().catch(() => { });

        const handleTimeUpdate = () => {
            if (!video.duration) return;

            // Trigger Fade Out 0.4s before end (Reduced from 0.8s)
            if (video.currentTime >= video.duration - 0.4) {
                if (!isLooping) setIsLooping(true);
            }

            // Reset Fade when we are back at start
            if (video.currentTime < 1.0 && isLooping) {
                setTimeout(() => setIsLooping(false), 200);
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, [isLooping]);

    return { videoRef, isLooping };
};
