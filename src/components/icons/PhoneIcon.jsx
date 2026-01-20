import React from 'react';

const PhoneIcon = ({ size = 36, color = '#D4AF37' }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Phone icon */}
            <path d="M 25 15 Q 20 15 20 20 L 20 80 Q 20 85 25 85 L 75 85 Q 80 85 80 80 L 80 20 Q 80 15 75 15 Z"
                stroke={color} strokeWidth="3" fill="none" />
            <rect x="30" y="25" width="40" height="45" rx="2" stroke={color} strokeWidth="2" fill="none" />
            <circle cx="50" cy="77" r="4" fill={color} />
        </svg>
    );
};

export default PhoneIcon;
