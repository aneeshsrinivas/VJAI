import React from 'react';

const GreetingIcon = ({ size = 24, color = 'currentColor' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Sparkle/celebration icon as greeting */}
        <path
            d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z"
            fill={color}
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
        <circle cx="19" cy="5" r="1.5" fill={color} opacity="0.7" />
        <circle cx="5" cy="18" r="1" fill={color} opacity="0.5" />
        <circle cx="20" cy="17" r="1" fill={color} opacity="0.6" />
    </svg>
);

export default GreetingIcon;
