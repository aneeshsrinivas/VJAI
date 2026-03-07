import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import './ConfirmDialog.css';

const ConfirmDialog = ({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', onConfirm, onCancel }) => {
    const { isDark } = useTheme();

    return (
        <div className={`cd-overlay ${isDark ? 'dark-mode' : ''}`} onClick={onCancel}>
            <div className="cd-box" onClick={(e) => e.stopPropagation()}>
                <div className={`cd-icon-wrap cd-icon-${variant}`}>
                    {variant === 'danger' ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    )}
                </div>

                {title && <h3 className="cd-title">{title}</h3>}
                <p className="cd-message">{message}</p>

                <div className="cd-actions">
                    <button className="cd-btn cd-btn-cancel" onClick={onCancel}>{cancelLabel}</button>
                    <button className={`cd-btn cd-btn-confirm cd-btn-${variant}`} onClick={onConfirm}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
