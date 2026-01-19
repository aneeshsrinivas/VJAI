import React, { useState, useEffect } from 'react';
import { getAllCoaches, assignCoachToDemo } from '../../services/firestoreService';
import { getTopCoachRecommendations, getMatchLabel } from '../../services/matchingService';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Star, Zap, Check } from 'lucide-react';
import './AssignCoachModal.css';

/**
 * AssignCoachModal - Enhanced with AI-powered coach matching
 * Shows top 3 recommended coaches with match scores and reasoning
 */
const AssignCoachModal = ({ demo, onClose, onSuccess }) => {
    // Guard against undefined demo
    if (!demo) {
        return null;
    }

    const { currentUser } = useAuth();
    const [coaches, setCoaches] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [selectedCoachId, setSelectedCoachId] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [scheduledStart, setScheduledStart] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAllCoaches, setShowAllCoaches] = useState(false);

    useEffect(() => {
        fetchCoaches();
    }, []);

    const fetchCoaches = async () => {
        const result = await getAllCoaches();
        if (result.success) {
            setCoaches(result.coaches);

            // Build student profile from demo data
            const studentProfile = {
                timezone: demo.timezone || 'IST',
                learningStyle: demo.learningStyle || 'Visual',
                goal: demo.goal || demo.chessExperience || 'Casual learning',
                age: demo.studentAge || 10
            };

            // Get AI recommendations
            const recs = getTopCoachRecommendations(studentProfile, result.coaches, 3);
            setRecommendations(recs);

            // Auto-select top recommendation
            if (recs.length > 0) {
                setSelectedCoachId(recs[0].coachId);
            }
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

    const selectRecommendedCoach = (coachId) => {
        setSelectedCoachId(coachId);
        setShowAllCoaches(false);
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

                {/* AI Recommendations Section */}
                {recommendations.length > 0 && (
                    <div className="ai-recommendations">
                        <div className="ai-header">
                            <Zap size={18} color="#FC8A24" />
                            <h3>AI-Recommended Coaches</h3>
                        </div>
                        <div className="recommendations-list">
                            {recommendations.map((rec, index) => {
                                const matchInfo = getMatchLabel(rec.score);
                                const coach = coaches.find(c => c.id === rec.coachId);
                                const isSelected = selectedCoachId === rec.coachId;

                                return (
                                    <div
                                        key={rec.coachId}
                                        className={`recommendation-card ${isSelected ? 'selected' : ''}`}
                                        onClick={() => selectRecommendedCoach(rec.coachId)}
                                    >
                                        <div className="rec-header">
                                            <div className="rec-rank">#{index + 1}</div>
                                            <div className="rec-info">
                                                <div className="rec-name">
                                                    {rec.coachName}
                                                    {isSelected && <Check size={16} color="#10B981" />}
                                                </div>
                                                <div className="rec-title">
                                                    {coach?.chessTitle || 'Trainer'}
                                                </div>
                                            </div>
                                            <div className="rec-score" style={{ backgroundColor: matchInfo.color }}>
                                                {rec.score}%
                                            </div>
                                        </div>
                                        <div className="rec-match-label" style={{ color: matchInfo.color }}>
                                            <Star size={12} fill={matchInfo.color} />
                                            {matchInfo.label}
                                        </div>
                                        {rec.reasons.length > 0 && (
                                            <div className="rec-reasons">
                                                {rec.reasons.map((reason, i) => (
                                                    <span key={i} className="reason-tag">{reason}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            type="button"
                            className="show-all-btn"
                            onClick={() => setShowAllCoaches(!showAllCoaches)}
                        >
                            {showAllCoaches ? 'Hide other coaches' : 'Select a different coach'}
                        </button>
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Show dropdown only if user wants to see all coaches or no recommendations */}
                    {(showAllCoaches || recommendations.length === 0) && (
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
                    )}

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
