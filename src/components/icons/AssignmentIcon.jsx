import React from 'react';

const AssignmentIcon = ({ size = 24, color = 'currentColor' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
        <rect x="9" y="3" width="6" height="4" rx="1" stroke={color} strokeWidth="2" />
        <line x1="9" y1="12" x2="15" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="9" y1="16" x2="13" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export default AssignmentIcon;
