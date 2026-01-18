import React from 'react';

const ParentIcon = ({ size = 64, color = '#D4AF37' }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Parent and child icon */}
            {/* Adult */}
            <circle cx="9" cy="6" r="3" stroke={color} strokeWidth="1.5" fill="none" />
            <path d="M4 20c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

            {/* Child */}
            <circle cx="16" cy="8" r="2" stroke={color} strokeWidth="1.5" fill="none" />
            <path d="M13 18c0-1.7 1.3-3 3-3s3 1.3 3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
};

export default ParentIcon;
