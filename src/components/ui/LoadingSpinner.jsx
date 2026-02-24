import React from 'react';
import './LoadingSpinner.css';

/**
 * LoadingSpinner - Reusable loading component
 * Supports different sizes and optional text
 */
const LoadingSpinner = ({ size = 'medium', text = '', fullPage = false }) => {
    const sizeClass = {
        small: 'spinner-sm',
        medium: 'spinner-md',
        large: 'spinner-lg'
    }[size] || 'spinner-md';

    if (fullPage) {
        return (
            <div className="loading-fullpage">
                <div className={`loading-spinner ${sizeClass}`}>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                {text && <p className="loading-text">{text}</p>}
            </div>
        );
    }

    return (
        <div className="loading-inline">
            <div className={`loading-spinner ${sizeClass}`}>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
            </div>
            {text && <span className="loading-text">{text}</span>}
        </div>
    );
};

export default LoadingSpinner;
