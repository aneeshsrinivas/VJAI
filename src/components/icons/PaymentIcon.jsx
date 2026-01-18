import React from 'react';

const PaymentIcon = ({ size = 24, color = 'currentColor' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="2" />
        <line x1="2" y1="10" x2="22" y2="10" stroke={color} strokeWidth="2" />
        <circle cx="17" cy="15" r="2" fill={color} />
        <circle cx="14" cy="15" r="2" fill={color} opacity="0.5" />
    </svg>
);

export default PaymentIcon;
