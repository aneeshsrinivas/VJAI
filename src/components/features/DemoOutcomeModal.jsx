import React, { useState } from 'react';
import Button from '../ui/Button';
import '../ui/Modal.css';

const DemoOutcomeModal = ({ isOpen, onClose, studentName, onConfirm }) => {
    const [outcome, setOutcome] = useState('');
    const [level, setLevel] = useState('');
    const [studentType, setStudentType] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!outcome || !level || !studentType) return;

        onConfirm({
            status: outcome,
            recommended_level: level,
            recommended_student_type: studentType,
            admin_notes: notes
        });
        onClose();

        // Reset form
        setOutcome('');
        setLevel('');
        setStudentType('');
        setNotes('');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">Demo Outcome Required</h2>
                    <p style={{ color: '#666' }}>Submit mandatory outcome details for <strong>{studentName}</strong>.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '13px' }}>Recommended Level <span style={{ color: 'red' }}>*</span></label>
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="contact-input"
                        >
                            <option value="" disabled>Select Level...</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '13px' }}>Student Type <span style={{ color: 'red' }}>*</span></label>
                        <select
                            value={studentType}
                            onChange={(e) => setStudentType(e.target.value)}
                            className="contact-input"
                        >
                            <option value="" disabled>Select Type...</option>
                            <option value="Group">Group</option>
                            <option value="1-1">1-on-1</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '13px' }}>Outcome Status <span style={{ color: 'red' }}>*</span></label>
                    <select
                        value={outcome}
                        onChange={(e) => setOutcome(e.target.value)}
                        className="contact-input"
                    >
                        <option value="" disabled>Select Result...</option>
                        <option value="INTERESTED">INTERESTED (Send Payment Link)</option>
                        <option value="NOT_INTERESTED">NOT INTERESTED (Close Lead)</option>
                        <option value="RESCHEDULED">RESCHEDULED</option>
                        <option value="NO_SHOW">NO SHOW</option>
                    </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '13px' }}>Coach Feedback / Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter performance summary..."
                        className="contact-input"
                        style={{ height: '80px', resize: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!outcome || !level || !studentType}
                    >
                        Submit Outcome
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DemoOutcomeModal;
