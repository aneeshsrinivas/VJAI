import React from 'react';

const OnlineClassesIcon = ({ size = 80, color = '#D4AF37' }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Chess piece (king) */}
            <path d="M 45 25 L 55 25 L 55 30 L 52 30 L 52 35 L 60 40 L 60 75 L 40 75 L 40 40 L 48 35 L 48 30 L 45 30 Z"
                stroke={color} strokeWidth="2.5" fill="none" />
            <circle cx="50" cy="22" r="3" fill={color} />
            <line x1="42" y1="75" x2="58" y2="75" stroke={color} strokeWidth="3" />

            {/* Document/paper */}
            <rect x="60" y="45" width="25" height="35" rx="2" stroke={color} strokeWidth="2" fill="none" />
            <line x1="65" y1="52" x2="80" y2="52" stroke={color} strokeWidth="1.5" />
            <line x1="65" y1="58" x2="80" y2="58" stroke={color} strokeWidth="1.5" />
            <line x1="65" y1="64" x2="80" y2="64" stroke={color} strokeWidth="1.5" />
            <line x1="65" y1="70" x2="75" y2="70" stroke={color} strokeWidth="1.5" />
        </svg>
    );
};

export default OnlineClassesIcon;
