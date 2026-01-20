import React from 'react';

const EmailIcon = ({ size = 36, color = '#D4AF37' }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Email/Envelope icon */}
            <rect x="15" y="25" width="70" height="50" rx="4" stroke={color} strokeWidth="3" fill="none" />
            <path d="M 15 25 L 50 55 L 85 25" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    );
};

export default EmailIcon;
