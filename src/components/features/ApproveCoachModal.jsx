import React, { useState } from 'react';
import { approveCoachApplication } from '../../services/firestoreService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import './DemoOutcomeModal.css';

const ApproveCoachModal = ({ application, onClose, onSuccess }) => {
    const { currentUser } = useAuth();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!application) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const simulatedUid = `coach_${Date.now()}`;
            const result = await approveCoachApplication(application.id, simulatedUid, password, currentUser?.uid);

            if (result.success) {
                onSuccess();
            } else {
                setError(result.error);
            }
        } catch (err) {
            console.error(err);
            setError('Approval failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content demo-outcome-modal">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Approve Coach Application</h2>
                <div className="demo-info">
                    <p><strong>Name:</strong> {application.fullName}</p>
                    <p><strong>Email:</strong> {application.email}</p>
                    <p><strong>Experience:</strong> {application.experience} years</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Set Temporary Password *</label>
                        <p className="description-text" style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                            Share this password with the coach securely. They will use their email and this password to login.
                        </p>
                        <Input
                            name="password"
                            type="text"
                            required
                            placeholder="e.g. CoachPass@2024"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="modal-actions">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Approving...' : 'Approve & Create Account'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApproveCoachModal;
