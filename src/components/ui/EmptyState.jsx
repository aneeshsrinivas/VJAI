import React from 'react';
import { FileQuestion, PlusCircle } from 'lucide-react';
import Button from './Button';
import './EmptyState.css';

/**
 * EmptyState - Reusable component for empty data states
 * Shows illustration with helpful message and CTA
 */
const EmptyState = ({
    icon: Icon = FileQuestion,
    title = 'No data yet',
    message = 'Get started by adding your first item.',
    actionLabel,
    onAction,
    variant = 'default'
}) => {
    const variants = {
        default: { iconBg: '#E0E7FF', iconColor: '#4F46E5' },
        success: { iconBg: '#D1FAE5', iconColor: '#10B981' },
        warning: { iconBg: '#FEF3C7', iconColor: '#F59E0B' },
        primary: { iconBg: '#EFF6FF', iconColor: '#1E3A8A' }
    };

    const style = variants[variant] || variants.default;

    return (
        <div className="empty-state">
            <div
                className="empty-state-icon"
                style={{ backgroundColor: style.iconBg }}
            >
                <Icon size={32} color={style.iconColor} />
            </div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-message">{message}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction}>
                    <PlusCircle size={16} style={{ marginRight: 8 }} />
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
