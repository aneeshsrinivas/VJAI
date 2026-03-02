import React, { useState, useEffect } from 'react';
import { getAllCoaches, assignCoachToDemo } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { X } from 'lucide-react';
import './AssignCoachModal.css';

/**
 * AssignCoachModal
 */
const AssignCoachModal = ({ demo, onClose, onSuccess }) => {
    const { isDark } = useTheme();

    // Guard against undefined demo
    if (!demo) {
        return null;
    }

    const { currentUser: contextUser } = useAuth();
    // Fallback: use Firebase auth directly if context doesn't have user
    const currentUser = contextUser || auth.currentUser;

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
                        to: demo.parentEmail,
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

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, fontFamily: "'Figtree', sans-serif"
        }}>
            <div style={{
                background: isDark ? '#1a1d27' : 'white',
                borderRadius: '16px',
                padding: '32px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '24px', color: isDark ? '#f0f0f0' : '#1e293b' }}>Assign Coach to Demo</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={28} color={isDark ? '#e2e8f0' : "#64748b"} />
                    </button>
                </div>

                <div data-lenis-prevent="true" style={{ overflowY: 'auto', paddingRight: '8px' }}>
                    <div style={{
                        background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#f0f9ff',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        border: isDark ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid #bae6fd',
                        color: isDark ? '#f0f0f0' : '#1e293b'
                    }}>
                        <p style={{ margin: '0 0 8px 0' }}><strong>Student:</strong> {demo.studentName}</p>
                        <p style={{ margin: '0 0 8px 0' }}><strong>Parent:</strong> {demo.parentName} ({demo.parentEmail})</p>
                        <p style={{ margin: '0 0 8px 0' }}><strong>Preferred Time:</strong> {demo.preferredDateTime}</p>
                        <p style={{ margin: '0 0 0 0' }}><strong>Experience:</strong> {demo.chessExperience}</p>
                    </div>

                    {error && <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: isDark ? '#c0c0c0' : '#334155' }}>Select Coach</label>
                            <select
                                value={selectedCoachId}
                                onChange={(e) => setSelectedCoachId(e.target.value)}
                                required
                                style={{
                                    width: '100%', padding: '12px',
                                    borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', outline: 'none',
                                    background: isDark ? '#0f1117' : 'white', fontFamily: 'inherit',
                                    color: isDark ? '#f0f0f0' : '#1e293b'
                                }}
                            >
                                <option value="">-- Select a Coach --</option>
                                {coaches.map(coach => (
                                    <option key={coach.id} value={coach.id}>
                                        {coach.coachName || coach.fullName} - {coach.chessTitle || 'Trainer'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: isDark ? '#c0c0c0' : '#334155' }}>Meeting Link (Zoom/Meet)</label>

                            {/* Quick Select Default Link */}
                            <div style={{ marginBottom: '10px', display: 'flex', gap: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMeetingLink('https://us06web.zoom.us/j/2884373632');
                                        if (error) setError('');
                                    }}
                                    style={{
                                        flex: 1, padding: '10px 12px', fontSize: '13px', fontWeight: '500',
                                        borderRadius: '8px',
                                        border: meetingLink === 'https://us06web.zoom.us/j/2884373632'
                                            ? '2px solid #10B981'
                                            : (isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1'),
                                        background: meetingLink === 'https://us06web.zoom.us/j/2884373632'
                                            ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5')
                                            : (isDark ? '#0f1117' : 'white'),
                                        color: isDark ? '#f0f0f0' : '#1e293b',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    📌 Default Zoom Link
                                </button>
                            </div>

                            {/* Manual Input */}
                            <input
                                type="url"
                                placeholder="https://zoom.us/j/..."
                                value={meetingLink}
                                onChange={(e) => {
                                    setMeetingLink(e.target.value);
                                    if (error) setError('');
                                }}
                                required
                                style={{
                                    width: '100%', padding: '12px',
                                    borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', outline: 'none',
                                    background: isDark ? '#0f1117' : 'white', fontFamily: 'inherit',
                                    color: isDark ? '#f0f0f0' : '#1e293b'
                                }}
                            />
                            <p style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '6px' }}>
                                ✓ Current: {meetingLink ? meetingLink.substring(0, 50) + (meetingLink.length > 50 ? '...' : '') : 'No link selected'}
                            </p>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: isDark ? '#c0c0c0' : '#334155' }}>Scheduled Date & Time</label>
                            <input
                                type="datetime-local"
                                value={scheduledStart}
                                onChange={(e) => {
                                    setScheduledStart(e.target.value);
                                    if (error) setError('');
                                }}
                                required
                                style={{
                                    width: '100%', padding: '12px',
                                    borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', outline: 'none',
                                    background: isDark ? '#0f1117' : 'white', fontFamily: 'inherit',
                                    color: isDark ? '#f0f0f0' : '#1e293b'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 'auto', paddingTop: '24px', borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Assigning...' : 'Assign Coach'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignCoachModal;
