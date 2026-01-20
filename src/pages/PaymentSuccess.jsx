import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';
import Button from '../components/ui/Button';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { plan, pricing, manualApproval } = location.state || {};

    const [showAnimation, setShowAnimation] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        // Trigger confetti after knight animation
        setTimeout(() => {
            setShowConfetti(true);
        }, 1500);

        // Hide knight animation after it completes
        setTimeout(() => {
            setShowAnimation(false);
        }, 3000);
    }, []);

    if (!plan) {
        return (
            <div className="success-error">
                <h2>No payment information found</h2>
                <Button onClick={() => navigate('/pricing')}>Return to Pricing</Button>
            </div>
        );
    }

    return (
        <div className="success-page">
            {/* Chess Knight Animation */}
            {showAnimation && (
                <div className="knight-animation-overlay">
                    <div className="knight-piece">♞</div>
                    <div className="knight-trail"></div>
                </div>
            )}

            {/* Confetti */}
            {showConfetti && (
                <div className="confetti-container">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                backgroundColor: ['#FC8A24', '#003366', '#6B8E23', '#FFFEF3'][Math.floor(Math.random() * 4)]
                            }}
                        ></div>
                    ))}
                </div>
            )}

            <div className="success-container">
                {/* Success Icon */}
                <div className="success-icon-wrapper">
                    <div className="success-checkmark">
                        <svg className="checkmark" viewBox="0 0 52 52">
                            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                        </svg>
                    </div>
                </div>

                {/* Success Message */}
                <h1 className="success-title">
                    {manualApproval ? 'Payment Submitted!' : 'Payment Successful!'}
                </h1>
                <p className="success-subtitle">
                    {manualApproval
                        ? 'Your payment is being verified. You will receive a confirmation email once approved.'
                        : 'Welcome to the Indian Chess Academy family'
                    }
                </p>

                {/* Order Details */}
                <div className="success-details-card">
                    <div className="success-details-header">
                        <h3>{manualApproval ? 'Payment Submitted' : 'Enrollment Confirmed'}</h3>
                        <div className="success-badge" style={manualApproval ? { backgroundColor: '#FEF3C7', color: '#92400E' } : {}}>
                            {manualApproval ? 'Pending Approval' : 'Paid'}
                        </div>
                    </div>

                    <div className="success-plan-info">
                        <div className="success-plan-icon" style={{ color: plan.color }}>
                            {plan.type === '1-on-1' ? '♔' : '♟'}
                        </div>
                        <div>
                            <div className="success-plan-name">{plan.name}</div>
                            <div className="success-plan-type">{plan.type} • {plan.level}</div>
                        </div>
                    </div>

                    <div className="success-divider"></div>

                    <div className="success-breakdown">
                        <div className="success-row">
                            <span>Amount Paid</span>
                            <span className="success-amount">${pricing?.total.toFixed(2)}</span>
                        </div>
                        <div className="success-row">
                            <span>Billing Cycle</span>
                            <span>Monthly</span>
                        </div>
                        <div className="success-row">
                            <span>Next Billing Date</span>
                            <span>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                        </div>
                        <div className="success-row">
                            <span>Order ID</span>
                            <span className="order-id">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="success-next-steps">
                    <h3>What Happens Next?</h3>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h4>Check Your Email</h4>
                                <p>You'll receive a confirmation email with your login credentials and class schedule.</p>
                            </div>
                        </div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h4>Meet Your Coach</h4>
                                <p>Your dedicated coach will reach out within 24 hours to schedule your first session.</p>
                            </div>
                        </div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h4>Start Learning</h4>
                                <p>Access your dashboard, join batch chats, and begin your chess mastery journey!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="success-actions">
                    <Button
                        onClick={() => navigate('/')}
                        style={{
                            backgroundColor: 'var(--color-warm-orange)',
                            padding: '16px 48px',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}
                    >
                        Return to Home
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => window.print()}
                        style={{
                            padding: '16px 48px',
                            fontSize: '16px'
                        }}
                    >
                        Download Receipt
                    </Button>
                </div>

                {/* Support */}
                <div className="success-support">
                    <p>Need help? Contact us at <a href="mailto:support@indianchessacad.com">support@indianchessacad.com</a></p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
