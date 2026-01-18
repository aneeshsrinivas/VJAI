import React from 'react';

const CoursewareIcon = ({ size = 80, color = '#D4AF37' }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Grid/Calendar icon */}
            <rect x="15" y="20" width="70" height="65" rx="4" stroke={color} strokeWidth="3" fill="none" />
            <line x1="15" y1="35" x2="85" y2="35" stroke={color} strokeWidth="3" />
            <line x1="35" y1="35" x2="35" y2="85" stroke={color} strokeWidth="2" />
            <line x1="50" y1="35" x2="50" y2="85" stroke={color} strokeWidth="2" />
            <line x1="65" y1="35" x2="65" y2="85" stroke={color} strokeWidth="2" />
            <line x1="15" y1="50" x2="85" y2="50" stroke={color} strokeWidth="2" />
            <line x1="15" y1="65" x2="85" y2="65" stroke={color} strokeWidth="2" />
        </svg>
    );
};

export default CoursewareIcon;
