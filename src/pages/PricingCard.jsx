import React, { useState } from 'react';
import './PricingCard.css';
import Button from './Button';

const PricingCard = ({
    plan,
    onSelect,
    isSelected = false,
    showComparison = false
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`pricing-card ${plan.recommended ? 'pricing-card-recommended' : ''} ${isSelected ? 'pricing-card-selected' : ''} ${isHovered ? 'pricing-card-hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {plan.recommended && (
                <div className="pricing-badge">
                    <span className="pricing-badge-icon">⭐</span>
                    <span>Most Popular</span>
                </div>
            )}

            <div className="pricing-card-header">
                <div className="pricing-card-icon" style={{ color: plan.color }}>
                    {plan.type === '1-on-1' ? '♔' : '♟'}
                </div>
                <h3 className="pricing-card-title">{plan.name}</h3>
                <div className="pricing-card-type-badge" style={{ backgroundColor: `${plan.color}20`, color: plan.color }}>
                    {plan.type} • {plan.level}
                </div>
            </div>

            <div className="pricing-card-price">
                <span className="pricing-currency">$</span>
                <span className="pricing-amount">{plan.price}</span>
                <span className="pricing-period">/{plan.billingCycle}</span>
            </div>

            <div className="pricing-card-features">
                {plan.features.map((feature, index) => (
                    <div key={index} className="pricing-feature" style={{ animationDelay: `${index * 0.05}s` }}>
                        <span className="pricing-feature-icon" style={{ color: plan.color }}>✓</span>
                        <span className="pricing-feature-text">{feature}</span>
                    </div>
                ))}
            </div>

            <Button
                onClick={() => onSelect(plan)}
                style={{
                    width: '100%',
                    backgroundColor: isSelected ? 'var(--color-olive-green)' : plan.color,
                    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.3s ease'
                }}
            >
                {isSelected ? '✓ Selected' : 'Choose Plan'}
            </Button>

            {showComparison && (
                <div className="pricing-card-comparison">
                    <div className="pricing-comparison-stat">
                        <span className="pricing-comparison-label">Students choose this</span>
                        <span className="pricing-comparison-value">{plan.type === '1-on-1' ? '35%' : '65%'}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PricingCard;
