import React from 'react';

const TrophyIcon = ({ size = 48, color = '#D4AF37' }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9H4.5A1.5 1.5 0 013 7.5v-1A1.5 1.5 0 014.5 5H6m12 4h1.5A1.5 1.5 0 0021 7.5v-1A1.5 1.5 0 0019.5 5H18M12 15a6 6 0 01-6-6V5h12v4a6 6 0 01-6 6zm0 0v4m-3 2h6"
                stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export default TrophyIcon;
