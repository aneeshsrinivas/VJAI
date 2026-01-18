import React from 'react';

const ChessBishopIcon = ({ size = 24, color = 'currentColor' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Bishop chess piece */}
        <ellipse cx="12" cy="21" rx="6" ry="2" fill={color} opacity="0.3" />
        <path
            d="M8 20H16V19C16 18.4 15.6 18 15 18H9C8.4 18 8 18.4 8 19V20Z"
            fill={color}
        />
        <path
            d="M9 18L10 15H14L15 18"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <path
            d="M10 15C10 15 9 12 9 10C9 7 10.5 5 12 4C13.5 5 15 7 15 10C15 12 14 15 14 15"
            fill={color}
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Mitre cut/slit */}
        <path
            d="M10.5 9L13.5 7"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        {/* Top ball */}
        <circle cx="12" cy="3" r="1.5" fill={color} />
    </svg>
);

export default ChessBishopIcon;
