import React from 'react';

const AdminIcon = ({ size = 64, color = '#D4AF37' }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Admin/Settings icon */}
            <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" fill="none" />
            <path d="M12 1v3m0 14v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m14 0h3M4.22 19.78l2.12-2.12m11.32-11.32l2.12-2.12"
                stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
};

export default AdminIcon;
