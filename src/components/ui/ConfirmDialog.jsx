import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import './ConfirmDialog.css';

const ConfirmDialog = ({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', onConfirm, onCancel }) => {
    const { isDark } = useTheme();

    return (
        <div className="cd-overlay" onClick={onCancel} style={{ zIndex: 999999 }}>
            <div className={`cd-box ${isDark ? 'dark-mode' : ''}`} onClick={(e) => e.stopPropagation()} style={{
                background: isDark ? '#1a1d27' : '#fff',
                color: isDark ? '#f0f0f0' : '#111827',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none'
            }}>
                <div className={`cd-icon-wrap cd-icon-${variant}`} style={{
                    background: variant === 'danger' ? (isDark ? 'rgba(220, 38, 38, 0.15)' : '#fef2f2') : (isDark ? 'rgba(217, 119, 6, 0.15)' : '#fffbeb'),
                    color: variant === 'danger' ? (isDark ? '#ff6b6b' : '#dc2626') : (isDark ? '#fbbf24' : '#d97706')
                }}>
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

                {title && <h3 className="cd-title" style={{ color: isDark ? '#f0f0f0' : '#111827' }}>{title}</h3>}
                <p className="cd-message" style={{ color: isDark ? '#cbd5e1' : '#6b7280' }}>{message}</p>

                <div className="cd-actions">
                    <button className="cd-btn cd-btn-cancel" onClick={onCancel} style={{
                        background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f3f4f6',
                        color: isDark ? '#e2e8f0' : '#374151'
                    }}>{cancelLabel}</button>
                    <button className={`cd-btn cd-btn-confirm cd-btn-${variant}`} onClick={onConfirm} style={{
                        background: variant === 'danger' ? '#dc2626' : '#d97706'
                    }}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
