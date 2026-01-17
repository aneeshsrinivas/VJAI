import React, { useState } from 'react';
import Button from '../ui/Button';
import '../ui/Modal.css';

const DemoOutcomeModal = ({ isOpen, onClose, studentName = "Arjun" }) => {
    const [outcome, setOutcome] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!outcome) return;
        // logic to submit
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">Demo Outcome Required</h2>
                    <p style={{ color: '#666' }}>Please submit the outcome for <strong>{studentName}</strong>'s demo class.</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Outcome</label>
                    <select
                        value={outcome}
                        onChange={(e) => setOutcome(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #BDBDBD',
                            fontFamily: 'var(--font-primary)',
                            fontSize: '14px'
                        }}
                    >
                        <option value="" disabled>Select outcome...</option>
                        <option value="ATTENDED">Attended</option>
                        <option value="NO_SHOW">No Show</option>
                        <option value="RESCHEDULED">Rescheduled</option>
                        <option value="INTERESTED">Interested (Lead)</option>
                        <option value="PAYMENT_PENDING">Payment Pending</option>
                        <option value="CONVERTED">Converted (Paid)</option>
                        <option value="NOT_INTERESTED">Not Interested</option>
                        <option value="DROPPED">Dropped</option>
                    </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter detailed feedback..."
                        style={{
                            width: '100%',
                            height: '100px',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #BDBDBD',
                            fontFamily: 'var(--font-primary)',
                            fontSize: '14px',
                            resize: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                    {/* No Cancel Button usually for forced flows, but for UX maybe? Brief says "No closing demo without outcome selection" */}
                    <Button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={!outcome}
                    >
                        Submit Outcome
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DemoOutcomeModal;
