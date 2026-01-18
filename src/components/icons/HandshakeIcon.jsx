import React from 'react';

const HandshakeIcon = ({ size = 48, color = '#D4AF37' }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Three people icon representing community */}
            {/* Person 1 - Left */}
            <circle cx="7" cy="8" r="2.5" stroke={color} strokeWidth="1.5" fill="none" />
            <path d="M3 18c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

            {/* Person 2 - Center (slightly larger) */}
            <circle cx="12" cy="7" r="3" stroke={color} strokeWidth="1.5" fill="none" />
            <path d="M7 19c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

            {/* Person 3 - Right */}
            <circle cx="17" cy="8" r="2.5" stroke={color} strokeWidth="1.5" fill="none" />
            <path d="M13 18c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
};

export default HandshakeIcon;
