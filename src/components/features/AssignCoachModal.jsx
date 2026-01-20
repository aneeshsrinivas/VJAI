import React, { useState, useEffect } from 'react';
import { getAllCoaches, assignCoachToDemo } from '../../services/firestoreService';
import { getTopCoachRecommendations, getMatchLabel } from '../../services/matchingService';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';
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

    const { currentUser: contextUser } = useAuth();
    // Fallback: use Firebase auth directly if context doesn't have user
    const currentUser = contextUser || auth.currentUser;

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

        // Use fallback user
        const activeUser = currentUser || auth.currentUser;
        if (!activeUser || !activeUser.uid) {
            setError('Session expired. Please log in again.');
            setLoading(false);
            return;
        }

        // Get the coach's Firebase Auth UID (userId field), not the Firestore doc ID
        const selectedCoach = coaches.find(c => c.id === selectedCoachId);
        const coachUserId = selectedCoach?.userId || selectedCoachId;

        // Debug log to verify what's being assigned
        console.log('🎯 Assigning demo:', {
            demoId: demo.id,
            selectedCoachDocId: selectedCoachId,
            coachObject: selectedCoach,
            coachUserId: coachUserId,
            hasUserId: !!selectedCoach?.userId
        });

        const result = await assignCoachToDemo(
            demo.id,
            coachUserId,  // Use the coach's Firebase Auth UID
            activeUser.uid,
            meetingLink,
            scheduledStart
        );

        if (result.success) {
            // Generate and send confirmation email to parent
            const selectedCoach = coaches.find(c => c.id === selectedCoachId);
            const coachName = selectedCoach?.coachName || selectedCoach?.fullName || 'Your Coach';

            const formattedDate = new Date(scheduledStart).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: demo.timezone || 'UTC'
            });

            const emailSubject = encodeURIComponent(
                `Demo Class Scheduled - ${demo.studentName} | Indian Chess Academy`
            );

            const emailBody = encodeURIComponent(
                `Dear ${demo.parentName},

We are excited to confirm your demo class for ${demo.studentName}!

📅 Class Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Student Name: ${demo.studentName}
• Date & Time: ${formattedDate} (${demo.timezone})
• Coach: ${coachName}
• Duration: 45 minutes

🔗 Join Meeting:
${meetingLink}

📋 What to Prepare:
• Ensure stable internet connection
• Have a chessboard ready (physical or digital)
• Test your camera and microphone before the session
• Join 5 minutes early

We look forward to an engaging session! If you have any questions or need to reschedule, please reply to this email.

Best regards,
Indian Chess Academy Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Contact: indianchessacademy@gmail.com
🌐 Website: www.indianchessacademy.com
`
            );

            // Send email via Web3Forms (single recipient for MVP)
            try {
                const feedbackFormLink = 'https://docs.google.com/forms/d/e/1FAIpQLScR2G8atEgIgfws4sTKaPlgR7sjSbGowWd8yhdZvwy0mwkVHw/viewform?usp=publish-editor';

                const emailResponse = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
                        email: 'abhirambhat2210@gmail.com',
                        subject: `Demo Class Scheduled - ${demo.studentName} | Indian Chess Academy`,
                        from_name: 'Indian Chess Academy',
                        message: `Dear ${demo.parentName},

We are excited to confirm your demo class for ${demo.studentName}!

📅 Class Details:
• Student: ${demo.studentName}
• Date & Time: ${formattedDate} (${demo.timezone})
• Coach: ${coachName}
• Duration: 45 minutes

🔗 Join Meeting:
${meetingLink}

📋 What to Prepare:
• Ensure stable internet connection
• Have a chessboard ready (physical or digital)
• Test your camera and microphone
• Join 5 minutes early

📝 After the Demo Class:
Please share your feedback:
${feedbackFormLink}

Best regards,
Indian Chess Academy Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Contact: indianchessacademy@chess.com`
                    })
                });

                if (emailResponse.ok) {
                    console.log('✅ Demo confirmation email sent');
                }
            } catch (emailError) {
                console.error('Email sending error:', emailError);
            }

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
            <div className="modal-content assign-coach-modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
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
                                                <div className="rec-email" style={{ fontSize: '11px', color: '#64748b' }}>
                                                    {coach?.email || 'No email'}
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
                                    </div>
                                );
                            })}
                        </div>
                        {/* Always show this button to switch modes */}
                        <div style={{ marginTop: '12px', textAlign: 'center' }}>
                            <button
                                type="button"
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                                onClick={() => setShowAllCoaches(!showAllCoaches)}
                            >
                                {showAllCoaches ? 'Hide full list' : 'View all coaches manually'}
                            </button>
                        </div>
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
                            onChange={(e) => {
                                setMeetingLink(e.target.value);
                                if (error) setError('');
                            }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Scheduled Date & Time</label>
                        <Input
                            type="datetime-local"
                            value={scheduledStart}
                            onChange={(e) => {
                                setScheduledStart(e.target.value);
                                if (error) setError('');
                            }}
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
