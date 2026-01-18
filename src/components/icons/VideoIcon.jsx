import React from 'react';

const VideoIcon = ({ size = 24, color = 'currentColor' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect x="2" y="6" width="14" height="12" rx="2" stroke={color} strokeWidth="2" />
        <path
            d="M16 10L22 6V18L16 14V10Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default VideoIcon;
