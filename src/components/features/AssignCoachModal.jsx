import React, { useState, useEffect } from 'react';
import { getAllCoaches, assignCoachToDemo } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import './AssignCoachModal.css';

const AssignCoachModal = ({ demo, onClose, onSuccess }) => {
    // Guard against undefined demo
    if (!demo) {
        return null;
    }

    const { currentUser } = useAuth();
    const [coaches, setCoaches] = useState([]);
    const [selectedCoachId, setSelectedCoachId] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [scheduledStart, setScheduledStart] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCoaches();
    }, []);

    const fetchCoaches = async () => {
        const result = await getAllCoaches();
        if (result.success) {
            setCoaches(result.coaches);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCoachId) {
            setError('Please select a coach');
            return;
        }
        if (!meetingLink) {
            setError('Please provide a meeting link');
            return;
        }
        if (!scheduledStart) {
            setError('Please select a scheduled date/time');
            return;
        }

        setLoading(true);
        setError('');

        const result = await assignCoachToDemo(
            demo.id,
            selectedCoachId,
            currentUser.uid,
            meetingLink,
            scheduledStart
        );

        if (result.success) {
            onSuccess();
        } else {
            setError(result.error || 'Failed to assign coach');
        }

        setLoading(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content assign-coach-modal">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Assign Coach to Demo</h2>

                <div className="demo-info">
                    <p><strong>Student:</strong> {demo.studentName}</p>
                    <p><strong>Parent:</strong> {demo.parentName} ({demo.parentEmail})</p>
                    <p><strong>Preferred Time:</strong> {demo.preferredDateTime}</p>
                    <p><strong>Experience:</strong> {demo.chessExperience}</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Coach</label>
                        <select
                            value={selectedCoachId}
                            onChange={(e) => setSelectedCoachId(e.target.value)}
                            required
                        >
                            <option value="">-- Select a Coach --</option>
                            {coaches.map(coach => (
                                <option key={coach.id} value={coach.id}>
                                    {coach.coachName || coach.fullName} - {coach.chessTitle || 'Trainer'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Meeting Link (Zoom/Meet)</label>
                        <Input
                            type="url"
                            placeholder="https://zoom.us/j/..."
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Scheduled Date & Time</label>
                        <Input
                            type="datetime-local"
                            value={scheduledStart}
                            onChange={(e) => setScheduledStart(e.target.value)}
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Assigning...' : 'Assign Coach'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignCoachModal;
