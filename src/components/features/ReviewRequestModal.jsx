import React, { useState } from 'react';
import Button from '../ui/Button';
import '../ui/Modal.css';

const ReviewRequestModal = ({ isOpen, onClose }) => {
    const [requestSent, setRequestSent] = useState(false);

    // Mock check: In real app, check backend if used this month
    const [isEligible, setIsEligible] = useState(true);

    if (!isOpen) return null;

    const handleRequest = () => {
        // Mock API call
        setTimeout(() => {
            setRequestSent(true);
        }, 500);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">Request Review Session</h2>
                </div>

                {!requestSent ? (
                    <>
                        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>
                            You are eligible for <strong>one free 15-minute review session</strong> per month with a Senior Coach or Admin to discuss progress and goals.
                        </p>

                        <div style={{ backgroundColor: '#FFF7ED', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '13px', color: '#9A3412', border: '1px solid #FFEDD5' }}>
                            <strong>Note:</strong> Sessions are subject to admin approval and availability.
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button onClick={handleRequest}>Request Session</Button>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                        <h3 style={{ color: 'var(--color-deep-blue)', marginBottom: '8px' }}>Request Sent!</h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>
                            Admin has been notified. You will receive a schedule confirmation shortly via the Batch Chat.
                        </p>
                        <Button onClick={onClose} style={{ marginTop: '16px' }}>Close</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewRequestModal;
