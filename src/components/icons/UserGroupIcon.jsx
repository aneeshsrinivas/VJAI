import React from 'react';

const UserGroupIcon = ({ size = 24, color = 'currentColor' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
        <path
            d="M3 21V19C3 16.7909 4.79086 15 7 15H11C13.2091 15 15 16.7909 15 19V21"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
        <circle cx="17" cy="8" r="3" stroke={color} strokeWidth="2" />
        <path
            d="M17 14C19.2091 14 21 15.7909 21 18V21"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
    </svg>
);

export default UserGroupIcon;
