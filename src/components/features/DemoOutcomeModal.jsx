import React, { useState, useEffect } from 'react';
import { submitDemoOutcome } from '../../services/firestoreService';
import { DEMO_STATUS } from '../../config/firestoreCollections';
import Button from '../ui/Button';
import { AlertTriangle, CheckCircle, XCircle, Clock, Star } from 'lucide-react';
import './DemoOutcomeModal.css';

/**
 * DemoOutcomeModal - MANDATORY enforcement
 * Cannot be closed without completing all required fields
 * Shows confetti animation on successful submission
 */
const DemoOutcomeModal = ({ demo, onClose, onSuccess, mandatory = false }) => {
    // Guard against undefined demo
    if (!demo) {
        return null;
    }

    const [formData, setFormData] = useState({
        demoOutcome: '',
        recommendedLevel: '',
        recommendedStudentType: '',
        parentInterest: '',
        adminNotes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);
    const [attemptedClose, setAttemptedClose] = useState(false);

    // Calculate form completion percentage
    const getCompletionPercentage = () => {
        let completed = 0;
        let total = 2; // Minimum: outcome + interest

        if (formData.demoOutcome) completed++;

        if (formData.demoOutcome === 'ATTENDED' || formData.demoOutcome === 'INTERESTED') {
            total = 4; // outcome + level + type + interest
            if (formData.recommendedLevel) completed++;
            if (formData.recommendedStudentType) completed++;
        }

        if (formData.parentInterest || formData.demoOutcome === 'NO_SHOW') {
            completed++;
        }

        return Math.round((completed / total) * 100);
    };

    const isFormComplete = () => {
        if (!formData.demoOutcome) return false;

        if (formData.demoOutcome === 'ATTENDED' || formData.demoOutcome === 'INTERESTED') {
            if (!formData.recommendedLevel || !formData.recommendedStudentType || !formData.parentInterest) {
                return false;
            }
        }

        if (formData.demoOutcome === 'NO_SHOW') {
            return true;
        }

        if (!formData.parentInterest && formData.demoOutcome !== 'NO_SHOW') {
            return false;
        }

        return true;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setAttemptedClose(false);
    };

    const handleClose = () => {
        if (mandatory) {
            setAttemptedClose(true);
            setTimeout(() => setAttemptedClose(false), 1000);
            return; // Cannot close if mandatory
        }
        onClose();
    };

    // Prevent escape key if mandatory
    useEffect(() => {
        if (!mandatory) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setAttemptedClose(true);
                setTimeout(() => setAttemptedClose(false), 1000);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [mandatory]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormComplete()) {
            setError('Please complete all required fields before submitting.');
            return;
        }

        setLoading(true);
        setError('');

        const result = await submitDemoOutcome(demo.id, {
            ...formData,
            demoOutcome: formData.demoOutcome === 'ATTENDED' ? DEMO_STATUS.ATTENDED :
                formData.demoOutcome === 'NO_SHOW' ? DEMO_STATUS.NO_SHOW :
                    formData.demoOutcome === 'INTERESTED' ? DEMO_STATUS.INTERESTED :
                        DEMO_STATUS.REJECTED
        });

        if (result.success) {
            setShowConfetti(true);
            setTimeout(() => {
                setShowConfetti(false);
                onSuccess();
            }, 2000);
        } else {
            setError(result.error || 'Failed to submit outcome');
        }

        setLoading(false);
    };

    const completionPct = getCompletionPercentage();

    return (
        <div className={`modal-overlay ${mandatory ? 'mandatory' : ''}`} onClick={(e) => e.target === e.currentTarget && handleClose()}>
            {showConfetti && (
                <div className="confetti-container">
                    {[...Array(50)].map((_, i) => (
                        <div key={i} className="confetti" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 0.5}s`,
                            backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#2AB7CA'][i % 5]
                        }} />
                    ))}
                </div>
            )}

            <div
                className={`modal-content demo-outcome-modal ${attemptedClose ? 'shake-error' : ''}`}
                style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
                {/* Only show close button if not mandatory */}
                {!mandatory && (
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                )}

                {/* Mandatory warning */}
                {mandatory && (
                    <div className="mandatory-warning">
                        <AlertTriangle size={16} />
                        This form is required and cannot be skipped
                    </div>
                )}

                <h2>
                    <Star size={20} color="#FC8A24" />
                    Demo Outcome - {demo.studentName || 'Unknown'}
                </h2>

                <div className="demo-info">
                    <p><strong>Parent:</strong> {demo.parentName || 'N/A'}</p>
                    <p><strong>Scheduled:</strong> {demo.scheduledStart || demo.preferredDateTime || 'N/A'}</p>
                    <p><strong>Coach:</strong> {demo.assignedCoachId ? 'Assigned' : 'N/A'}</p>
                </div>

                {/* Progress indicator */}
                <div className="progress-indicator">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${completionPct}%` }}
                        />
                    </div>
                    <span className="progress-text">{completionPct}% Complete</span>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Demo Outcome - REQUIRED */}
                    <div className="form-group required">
                        <label>
                            <span className="label-icon">
                                {formData.demoOutcome === 'ATTENDED' && <CheckCircle size={16} color="#10B981" />}
                                {formData.demoOutcome === 'NO_SHOW' && <XCircle size={16} color="#EF4444" />}
                                {formData.demoOutcome === 'INTERESTED' && <Star size={16} color="#F59E0B" />}
                                {!formData.demoOutcome && <Clock size={16} color="#6B7280" />}
                            </span>
                            Demo Outcome *
                        </label>
                        <div className="outcome-options">
                            <label className={`outcome-option ${formData.demoOutcome === 'ATTENDED' ? 'selected attended' : ''}`}>
                                <input
                                    type="radio"
                                    name="demoOutcome"
                                    value="ATTENDED"
                                    checked={formData.demoOutcome === 'ATTENDED'}
                                    onChange={handleChange}
                                />
                                <CheckCircle size={18} />
                                <span>Attended</span>
                            </label>
                            <label className={`outcome-option ${formData.demoOutcome === 'NO_SHOW' ? 'selected no-show' : ''}`}>
                                <input
                                    type="radio"
                                    name="demoOutcome"
                                    value="NO_SHOW"
                                    checked={formData.demoOutcome === 'NO_SHOW'}
                                    onChange={handleChange}
                                />
                                <XCircle size={18} />
                                <span>No Show</span>
                            </label>
                            <label className={`outcome-option ${formData.demoOutcome === 'INTERESTED' ? 'selected interested' : ''}`}>
                                <input
                                    type="radio"
                                    name="demoOutcome"
                                    value="INTERESTED"
                                    checked={formData.demoOutcome === 'INTERESTED'}
                                    onChange={handleChange}
                                />
                                <Star size={18} />
                                <span>Highly Interested</span>
                            </label>
                        </div>
                    </div>

                    {/* Conditional fields for attended/interested */}
                    {(formData.demoOutcome === 'ATTENDED' || formData.demoOutcome === 'INTERESTED') && (
                        <>
                            <div className="form-group required">
                                <label>Recommended Level *</label>
                                <select
                                    name="recommendedLevel"
                                    value={formData.recommendedLevel}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">-- Select Level --</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>

                            <div className="form-group required">
                                <label>Recommended Student Type *</label>
                                <select
                                    name="recommendedStudentType"
                                    value={formData.recommendedStudentType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">-- Select Type --</option>
                                    <option value="group">Group Classes</option>
                                    <option value="1-1">1-on-1 Sessions</option>
                                </select>
                            </div>

                            <div className="form-group required">
                                <label>Parent Interest Level *</label>
                                <select
                                    name="parentInterest"
                                    value={formData.parentInterest}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">-- Select Interest --</option>
                                    <option value="INTERESTED">Interested - Send Payment Link</option>
                                    <option value="FOLLOW_UP">Follow-up Required</option>
                                    <option value="NOT_INTERESTED">Not Interested</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Admin Notes (Optional)</label>
                        <textarea
                            name="adminNotes"
                            value={formData.adminNotes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Any observations, parent feedback, next steps..."
                        />
                    </div>

                    <div className="modal-actions">
                        {!mandatory && (
                            <Button type="button" variant="secondary" onClick={handleClose}>
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={loading} // Only disable while loading
                            style={{ flex: mandatory ? 1 : 'initial' }}
                        >
                            {loading ? 'Submitting...' : 'Submit Outcome'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DemoOutcomeModal;
