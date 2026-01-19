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

        // Validate currentUser exists
        if (!currentUser || !currentUser.uid) {
            setError('Authentication error. Please refresh the page and try again.');
            setLoading(false);
            return;
        }

        const result = await assignCoachToDemo(
            demo.id,
            selectedCoachId,
            currentUser.uid,
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
                const feedbackFormLink = 'https://forms.gle/YOUR_GOOGLE_FORM_ID'; // TODO: Replace with actual form link

                const emailResponse = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
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
