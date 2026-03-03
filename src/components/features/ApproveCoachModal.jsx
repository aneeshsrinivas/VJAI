import React, { useState } from 'react';
import { approveCoachApplication } from '../../services/firestoreService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import './DemoOutcomeModal.css';

import { createCoachAccount } from '../../services/adminAuthService';

const EMAIL_API_URL = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:3001';

const ApproveCoachModal = ({ application, onClose, onSuccess }) => {
    const { currentUser } = useAuth();
    const [coachEmail, setCoachEmail] = useState(application?.email || '');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!application) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Create Firebase Auth Account (Secondary App)
            const authResult = await createCoachAccount(coachEmail, password);

            if (!authResult.success) {
                // If account already exists (e.g. reused email), we might proceed or error.
                // For now, let's treat it as an error but maybe allow proceed if it's "email-already-in-use"
                if (authResult.error.includes('email-already-in-use')) {
                    // Optional: Allow approval linking to existing account? 
                    // For now, throw error to be safe
                    throw new Error('An account with this email already exists. Cannot create new credentials.');
                }
                throw new Error(authResult.error);
            }

            const newUid = authResult.uid;

            // 2. Approve in Firestore (Create Profile/Account Docs)
            const result = await approveCoachApplication(application.id, newUid, password, currentUser?.uid);

            if (result.success) {
                // Send welcome email with credentials via nodemailer
                try {
                    const emailResponse = await fetch(`${EMAIL_API_URL}/api/email/send`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: coachEmail,
                            subject: 'Welcome to Indian Chess Academy - Coach Account Approved! 🎉',
                            text: `Dear ${application.fullName},

Congratulations! Your application as a coach at Indian Chess Academy has been APPROVED! 🎉

🔑 Your Login Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Email: ${coachEmail}
• Temporary Password: ${password}
• Login URL: ${window.location.origin}/login

📋 Next Steps:
1. Login using the credentials above
2. Change your password in Settings (important!)
3. Complete your coach profile
4. Wait for batch assignments from the admin team

We're excited to have you on our team and look forward to working together to shape the next generation of chess champions!

Best regards,
Indian Chess Academy Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Support: indianchessacademy@chess.com
🌐 Website: www.indianchessacademy.com`
                        })
                    });

                    if (emailResponse.ok) {
                        console.log('✅ Coach credentials email sent to:', coachEmail);
                    } else {
                        console.error('⚠️ Email send failed, but coach was approved');
                    }
                } catch (emailError) {
                    console.error('Email sending error:', emailError);
                    // Don't fail the approval if email fails
                }

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
                        <label>Confirm/Edit Coach Email *</label>
                        <Input
                            name="coachEmail"
                            type="email"
                            required
                            value={coachEmail}
                            onChange={(e) => setCoachEmail(e.target.value)}
                        />
                    </div>

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
