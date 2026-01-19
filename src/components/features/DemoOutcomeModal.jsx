import React, { useState } from 'react';
import { submitDemoOutcome } from '../../services/firestoreService';
import { DEMO_STATUS } from '../../config/firestoreCollections';
import Button from '../ui/Button';
import './DemoOutcomeModal.css';

const DemoOutcomeModal = ({ demo, onClose, onSuccess }) => {
    // Guard against undefined demo
    if (!demo) {
        return null;
    }

    const [formData, setFormData] = useState({
        demoOutcome: DEMO_STATUS.ATTENDED,
        recommendedLevel: 'beginner',
        recommendedStudentType: 'group',
        adminNotes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await submitDemoOutcome(demo.id, formData);

        if (result.success) {
            onSuccess();
        } else {
            setError(result.error || 'Failed to submit outcome');
        }

        setLoading(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content demo-outcome-modal">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Demo Outcome - {demo.studentName || 'Unknown'}</h2>

                <div className="demo-info">
                    <p><strong>Parent:</strong> {demo.parentName || 'N/A'}</p>
                    <p><strong>Scheduled:</strong> {demo.scheduledStart || demo.preferredDateTime || 'N/A'}</p>
                    <p><strong>Coach:</strong> {demo.assignedCoachId ? 'Assigned' : 'N/A'}</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Demo Outcome *</label>
                        <select
                            name="demoOutcome"
                            value={formData.demoOutcome}
                            onChange={handleChange}
                            required
                        >
                            <option value={DEMO_STATUS.ATTENDED}>Attended - Interested</option>
                            <option value={DEMO_STATUS.NO_SHOW}>No Show</option>
                            <option value={DEMO_STATUS.INTERESTED}>Highly Interested (Ready to Convert)</option>
                            <option value={DEMO_STATUS.REJECTED}>Not Interested / Rejected</option>
                        </select>
                    </div>

                    {(formData.demoOutcome === DEMO_STATUS.ATTENDED || formData.demoOutcome === DEMO_STATUS.INTERESTED) && (
                        <>
                            <div className="form-group">
                                <label>Recommended Level</label>
                                <select
                                    name="recommendedLevel"
                                    value={formData.recommendedLevel}
                                    onChange={handleChange}
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Recommended Student Type</label>
                                <select
                                    name="recommendedStudentType"
                                    value={formData.recommendedStudentType}
                                    onChange={handleChange}
                                >
                                    <option value="group">Group Classes</option>
                                    <option value="1-1">1-on-1 Sessions</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Admin Notes</label>
                        <textarea
                            name="adminNotes"
                            value={formData.adminNotes}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Any observations, parent feedback, next steps..."
                        />
                    </div>

                    <div className="modal-actions">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Outcome'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DemoOutcomeModal;
