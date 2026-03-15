import React, { useState, useEffect } from 'react';
import { submitDemoOutcome, convertDemoToPendingStudent } from '../../services/firestoreService';
import { createParentAuthAccount } from '../../services/adminAuthService';
import { DEMO_STATUS } from '../../config/firestoreCollections';
import { emailService } from '../../services/emailService';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';
import Button from '../ui/Button';
import { AlertTriangle, CheckCircle, XCircle, Clock, Star } from 'lucide-react';
import './DemoOutcomeModal.css';

/**
 * DemoOutcomeModal - MANDATORY enforcement
 * Cannot be closed without completing all required fields
 * Shows confetti animation on successful submission
 */
const DemoOutcomeModal = ({ demo, onClose, onSuccess, mandatory = false }) => {
    const { isDark } = useTheme();
    const { currentUser } = useAuth();

    // Guard against undefined demo
    if (!demo) {
        return null;
    }

    const [formData, setFormData] = useState({
        demoOutcome: '',
        recommendedLevel: '',
        recommendedStudentType: '',
        parentInterest: '',
        adminNotes: '',
        loginEmail: demo ? demo.parentEmail : '',
        temporaryPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);
    const [attemptedClose, setAttemptedClose] = useState(false);
    const [batches, setBatches] = useState([]);

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

        if (formData.parentInterest === 'INTERESTED' || formData.demoOutcome === 'INTERESTED') {
            if (!formData.loginEmail || !formData.temporaryPassword) {
                return false;
            }
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

    // Fetch batches for assigned coach
    useEffect(() => {
        const fetchBatches = async () => {
            if (!demo?.assignedCoachId) {
                setBatches([]);
                return;
            }

            try {
                // Find the coach document that matches the assignedCoachId
                const coachQuery = query(collection(db, 'coaches'), where('accountId', '==', demo.assignedCoachId));
                const coachSnap = await getDocs(coachQuery);

                let coachDocId = demo.assignedCoachId; // Fallback if it's already a Document ID
                if (!coachSnap.empty) {
                    coachDocId = coachSnap.docs[0].id;
                }

                // Fetch batches from this coach's subcollection
                const batchQuery = query(collection(db, 'coaches', coachDocId, 'batches'));
                const batchSnap = await getDocs(batchQuery);
                const batchList = batchSnap.docs.map(d => ({
                    id: d.id,
                    name: d.data().name,
                    level: d.data().level
                }));
                setBatches(batchList);
            } catch (err) {
                console.error('Error fetching batches:', err);
                setBatches([]);
            }
        };

        fetchBatches();
    }, [demo?.assignedCoachId]);

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
            // Trigger pre-payment dashboard automation if Interested
            if (formData.parentInterest === 'INTERESTED' || formData.demoOutcome === 'INTERESTED') {
                try {
                    // 1. Create firebase auth account
                    const authResult = await createParentAuthAccount(formData.loginEmail, formData.temporaryPassword);
                    if (!authResult.success) {
                        setError('Failed to create parent auth account: ' + authResult.error);
                        setLoading(false);
                        return; // Halt if auth fails
                    }
                    
                    // 2. Convert demo to pending student
                    const convertResult = await convertDemoToPendingStudent(demo.id, authResult.uid, {
                        ...formData,
                        loginEmail: formData.loginEmail,
                        adminId: currentUser?.uid || 'SYSTEM'
                    });
                    
                    if (!convertResult.success) {
                        setError('Failed to convert demo to pending student: ' + convertResult.error);
                        setLoading(false);
                        return; // Halt if conversion fails
                    }

                    // 3. Send email with login credentials
                    await emailService.sendPrePaymentDashboardEmail({
                        parentEmail: demo.parentEmail,
                        parentName: demo.parentName,
                        studentName: demo.studentName,
                        loginEmail: formData.loginEmail,
                        password: formData.temporaryPassword
                    });
                } catch (flowError) {
                    console.error('Failed in conversion flow:', flowError);
                    setError('An error occurred during account creation.');
                    setLoading(false);
                    return;
                }
            }

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
        <div className={`modal-overlay ${mandatory ? 'mandatory' : ''}`}>
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
                className={`modal-content demo-outcome-modal ${attemptedClose ? 'shake-error' : ''} ${isDark ? 'dark-mode' : ''}`}
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

                <div 
                    style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
                    data-lenis-prevent="true"
                    onWheel={(e) => e.stopPropagation()}
                >
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

                    <form id="outcome-form" onSubmit={handleSubmit}>
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
                                    <option value="advanced-beginner">Advanced Beginner</option>
                                    <option value="intermediate-I">Intermediate-I</option>
                                    <option value="intermediate-II">Intermediate-II</option>
                                </select>
                            </div>

                            <div className="form-group required">
                                <label>Recommended Batch *</label>
                                <select
                                    name="recommendedStudentType"
                                    value={formData.recommendedStudentType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">-- Select Batch --</option>
                                    {batches.length > 0 ? (
                                        batches.map(batch => (
                                            <option key={batch.id} value={batch.id}>
                                                {batch.name} ({batch.level})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No batches available</option>
                                    )}
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
                                    <option value="INTERESTED">Interested - Generate Dashboard Credentials</option>
                                    <option value="FOLLOW_UP">Follow-up Required</option>
                                    <option value="NOT_INTERESTED">Not Interested</option>
                                </select>
                            </div>

                            {(formData.parentInterest === 'INTERESTED' || formData.demoOutcome === 'INTERESTED') && (
                                <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-primary)' }}>Dashboard Credentials Setup</h4>
                                    <div className="form-group required" style={{ marginBottom: '12px' }}>
                                        <label>Login Email *</label>
                                        <input
                                            type="email"
                                            name="loginEmail"
                                            value={formData.loginEmail}
                                            onChange={handleChange}
                                            placeholder="e.g. parent@email.com"
                                            required
                                        />
                                    </div>
                                    <div className="form-group required" style={{ marginBottom: '0' }}>
                                        <label>Temporary Password *</label>
                                        <input
                                            type="text"
                                            name="temporaryPassword"
                                            value={formData.temporaryPassword}
                                            onChange={handleChange}
                                            placeholder="e.g. Chess123!"
                                            required
                                        />
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>
                                            These credentials will be emailed to the parent to complete payment.
                                        </p>
                                    </div>
                                </div>
                            )}
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
                </form>
                </div>

                <div className="modal-actions">
                    {!mandatory && (
                        <Button type="button" variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        form="outcome-form"
                        disabled={loading} // Only disable while loading
                        style={{ flex: mandatory ? 1 : 'initial' }}
                    >
                        {loading ? 'Submitting...' : 'Submit Outcome'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DemoOutcomeModal;
