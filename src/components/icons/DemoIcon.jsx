import React from 'react';

const DemoIcon = ({ size = 64, color = '#D4AF37' }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Calendar/Book demo icon */}
            <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
            <path d="M3 10h18M8 2v4M16 2v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="15" r="2" fill={color} />
        </svg>
    );
};

export default DemoIcon;
