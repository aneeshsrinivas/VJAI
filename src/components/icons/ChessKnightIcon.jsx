import React from 'react';

const ChessKnightIcon = ({ size = 24, color = 'currentColor' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M19 22H5V20H19V22Z"
            fill={color}
        />
        <path
            d="M5 18C5 17 5.5 15.5 7 14C8 13 8.5 12 8.5 11V8C8.5 7.4 8.7 6.9 9 6.5L6 5L7 3L10.5 4.5C11 4.2 11.5 4 12 4C13.1 4 14 4.9 14 6V6.5C15 7 16 8 16 9.5C16 10.5 15.5 11.5 15 12C16 12.5 17 13.5 17 15V18H5Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="11" cy="8" r="1" fill={color} />
    </svg>
);

export default ChessKnightIcon;
