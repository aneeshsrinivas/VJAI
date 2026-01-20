import React from 'react';
import './Card.css';

const Card = ({
    children,
    variant = 'default', // default, chess
    className = '',
    title,
    ...props
}) => {
    return (
        <div
            className={`card ${variant === 'chess' ? 'card-chess' : ''} ${className}`}
            {...props}
        >
            {title && (
                <div className="card-header">
                    <h4 className="card-title">{title}</h4>
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
