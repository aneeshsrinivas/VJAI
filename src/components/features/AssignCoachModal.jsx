import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

const AssignCoachModal = ({ isOpen, onClose, demo, onConfirm }) => {
    const [selectedCoach, setSelectedCoach] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [scheduledTime, setScheduledTime] = useState(demo?.preferredTime || '');

    const handleConfirm = () => {
        onConfirm({
            ...demo,
            coach: selectedCoach,
            meetingLink,
            scheduledTime,
            status: 'SCHEDULED'
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Assign Coach for ${demo?.studentName}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Select Coach</label>
                    <select
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                        value={selectedCoach}
                        onChange={(e) => setSelectedCoach(e.target.value)}
                    >
                        <option value="">-- Choose a Coach --</option>
                        <option value="Ramesh Babu">Ramesh Babu (IM) - 5:00 PM Available</option>
                        <option value="Suresh Kumar">Suresh Kumar (FM) - 6:00 PM Available</option>
                        <option value="Priya Sharma">Priya Sharma (WGM) - Flexible</option>
                    </select>
                </div>

                <Input
                    label="Meeting Link (Zoom/Meet)"
                    placeholder="https://meet.google.com/..."
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                />

                <Input
                    label="Confirm Time"
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                />

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={!selectedCoach || !meetingLink}>Confirm & Schedule</Button>
                </div>
            </div>
        </Modal>
    );
};

export default AssignCoachModal;
