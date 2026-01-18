import React from 'react';

const LightbulbIcon = ({ size = 48, color = '#D4AF37' }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21h6M12 3v1m0 0a5 5 0 015 5c0 1.5-.5 2.5-1.5 4-.5.75-1 1.5-1.5 2.5V18a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2.5c-.5-1-1-1.75-1.5-2.5-1-1.5-1.5-2.5-1.5-4a5 5 0 015-5z"
                stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export default LightbulbIcon;
