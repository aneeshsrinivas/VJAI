import React from 'react';
import './Button.css';

const Button = ({
    children,
    variant = 'primary', // primary, secondary, ghost
    className = '',
    ...props
}) => {
    return (
        <button
            className={`btn btn-${variant} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
