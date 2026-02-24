import React from 'react';
import { motion } from 'framer-motion';
import { useVideoFadeLoop } from '../../hooks/useVideoFadeLoop';

/**
 * Video component with smooth fade loop transition
 * Prevents jarring loop restart by fading to black before looping
 * 
 * @param {Object} props
 * @param {string} props.src - Video source URL
 * @param {string} props.className - CSS class for the video element
 * @param {Object} props.style - Inline styles for the video element
 * @param {boolean} props.autoPlay - Auto-play video (default: true)
 * @param {boolean} props.loop - Loop video (default: true)
 * @param {boolean} props.muted - Mute video (default: true)
 * @param {boolean} props.playsInline - Play inline on mobile (default: true)
 */
const VideoWithFade = ({
    src,
    className = '',
    style = {},
    autoPlay = true,
    loop = true,
    muted = true,
    playsInline = true,
    ...otherProps
}) => {
    const { videoRef, isLooping } = useVideoFadeLoop();

    return (
        <>
            {/* BLACK FADE OVERLAY FOR SMOOTH LOOP */}
            <motion.div
                className="loop-fade-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLooping ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'black',
                    zIndex: 2,
                    pointerEvents: 'none'
                }}
            />
            <video
                ref={videoRef}
                src={src}
                autoPlay={autoPlay}
                loop={loop}
                muted={muted}
                playsInline={playsInline}
                className={className}
                style={style}
                {...otherProps}
            />
        </>
    );
};

export default VideoWithFade;
