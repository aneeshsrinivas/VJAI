import React from 'react';

const WaveIcon = ({ size = 24, color = 'currentColor' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M7 11V7C7 5.34315 8.34315 4 10 4C11.6569 4 13 5.34315 13 7V11"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
        <path
            d="M10 11V5C10 3.34315 11.3431 2 13 2C14.6569 2 16 3.34315 16 5V11"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
        <path
            d="M13 10V6C13 4.34315 14.3431 3 16 3C17.6569 3 19 4.34315 19 6V15C19 18.866 15.866 22 12 22H10C6.13401 22 3 18.866 3 15V11C3 9.34315 4.34315 8 6 8C7.65685 8 9 9.34315 9 11"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
        <path
            d="M16 10V8C16 6.34315 17.3431 5 19 5C20.6569 5 22 6.34315 22 8V12"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
    </svg>
);

export default WaveIcon;
