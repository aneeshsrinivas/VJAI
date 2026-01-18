import React from 'react';

const ClockIcon = ({ size = 36, color = '#D4AF37' }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Clock icon */}
            <circle cx="50" cy="50" r="35" stroke={color} strokeWidth="3" fill="none" />
            <line x1="50" y1="50" x2="50" y2="30" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="50" x2="65" y2="50" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="50" r="3" fill={color} />
        </svg>
    );
};

export default ClockIcon;
