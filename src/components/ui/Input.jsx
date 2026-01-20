import React from 'react';
import './Input.css';

const Input = ({
    label,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className={`input-group ${className}`}>
            {label && <label className="input-label">{label}</label>}
            <input
                className={`input-field ${error ? 'error' : ''}`}
                {...props}
            />
            {error && <span className="input-error-msg">{error}</span>}
        </div>
    );
};

export default Input;
