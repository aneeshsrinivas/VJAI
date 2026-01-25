import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import Input from '../../ui/Input';
import Button from '../../ui/Button';

// Re-initialize Firebase App for Admin creation
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp_Coach");
const secondaryAuth = getAuth(secondaryApp);

// Email API URL
const EMAIL_API_URL = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:3001';

const AddCoachModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        personalEmail: '', // For sending account details
        assignedEmail: '', // @coach.com email for login
        phone: '',
        title: 'Trainer',
        fideRating: '',
        experience: '',
        password: 'CoachPassword123'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sendEmail, setSendEmail] = useState(true); // Option to send welcome email

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate assigned email ends with @coach.com
            if (!formData.assignedEmail.endsWith('@coach.com')) {
                setError('Assigned email must end with @coach.com');
                setLoading(false);
                return;
            }

            // 1. Create User in Firebase Auth (Secondary) with assigned email
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.assignedEmail, formData.password);
            const user = userCredential.user;

            // 2. Create User Document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: formData.assignedEmail, // Login email
                personalEmail: formData.personalEmail, // For sending notifications
                role: 'coach',
                fullName: formData.fullName,
                createdAt: new Date(),
                // Coach Profile Data
                phone: formData.phone,
                title: formData.title,
                fideRating: formData.fideRating,
                experience: formData.experience,
                bio: formData.bio || '',
                createdBy: 'ADMIN',
                status: 'ACTIVE'
            });

            // 3. Send Welcome Email with credentials
            if (sendEmail && formData.personalEmail) {
                try {
                    const emailResponse = await fetch(`${EMAIL_API_URL}/api/email/coach-welcome`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            personalEmail: formData.personalEmail,
                            fullName: formData.fullName,
                            assignedEmail: formData.assignedEmail,
                            password: formData.password
                        })
                    });
                    const emailResult = await emailResponse.json();
                    if (emailResult.success) {
                        console.log('✅ Coach welcome email sent successfully');
                    } else {
                        console.warn('⚠️ Email sent but with warning:', emailResult.error);
                    }
                } catch (emailError) {
                    console.error('⚠️ Failed to send welcome email:', emailError);
                    // Don't fail the whole operation if email fails
                }
            }

            // 4. Success
            setLoading(false);
            onSuccess();
            onClose();

        } catch (err) {
            console.error(err);
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '600px', maxWidth: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2 className="modal-title">Add New Coach</h2>

                {error && <div className="error-message" style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="evaluation-form" style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
                    <div className="form-row">
                        <Input
                            label="Full Name"
                            name="fullName"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                        <Input
                            label="Personal Email (for notifications)"
                            name="personalEmail"
                            type="email"
                            required
                            placeholder="coach@gmail.com"
                            value={formData.personalEmail}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <Input
                            label="Assigned Login Email"
                            name="assignedEmail"
                            type="email"
                            required
                            placeholder="firstname.lastname@coach.com"
                            value={formData.assignedEmail}
                            onChange={handleChange}
                        />
                        <Input
                            label="Phone Number"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Professional Title</label>
                            <select name="title" value={formData.title} onChange={handleChange}>
                                <option>Trainer</option>
                                <option>FIDE Master (FM)</option>
                                <option>International Master (IM)</option>
                                <option>Grandmaster (GM)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <Input
                            label="FIDE Rating"
                            name="fideRating"
                            type="number"
                            placeholder="Optional"
                            value={formData.fideRating}
                            onChange={handleChange}
                        />
                        <Input
                            label="Experience (Years)"
                            name="experience"
                            type="number"
                            required
                            value={formData.experience}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>Professional Bio (Description)</label>
                        <textarea
                            name="bio"
                            value={formData.bio || ''}
                            onChange={handleChange}
                            rows="3"
                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
                            placeholder="Brief description of experience and teaching style..."
                        />
                    </div>

                    <Input
                        label="Temporary Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            id="sendCoachEmail"
                            checked={sendEmail}
                            onChange={(e) => setSendEmail(e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="sendCoachEmail" style={{ cursor: 'pointer', fontSize: '14px' }}>
                            📧 Send welcome email with login credentials to personal email
                        </label>
                    </div>

                    <Button type="submit" disabled={loading} className="submit-evaluation-btn">
                        {loading ? 'Registering...' : 'Register Coach'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AddCoachModal;
