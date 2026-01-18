import React from 'react';

const CoachIcon = ({ size = 64, color = '#D4AF37' }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Coach/Teacher icon with presentation board */}
            <circle cx="12" cy="7" r="3" stroke={color} strokeWidth="1.5" fill="none" />
            <path d="M7 20c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

            {/* Chess piece (knight) */}
            <path d="M16 4h4v4M18 2l2 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export default CoachIcon;
