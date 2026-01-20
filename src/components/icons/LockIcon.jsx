import React from 'react';

const LockIcon = ({ size = 24, color = 'currentColor' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="2" />
        <path
            d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
        <circle cx="12" cy="16" r="1.5" fill={color} />
    </svg>
);

export default LockIcon;
