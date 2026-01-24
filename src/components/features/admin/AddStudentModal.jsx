import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase'; // We use the MAIN db connection for writing data
import Input from '../../ui/Input';
import Button from '../../ui/Button';

// Re-initialize Firebase App to create a secondary Auth instance
// This prevents the Admin from being logged out when creating a new user
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Only initialize if we need to (scoped to this component usage really, but safe here)
const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
const secondaryAuth = getAuth(secondaryApp);

// Email API URL
const EMAIL_API_URL = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:3001';

const AddStudentModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        studentName: '',
        parentName: '',
        parentEmail: '',
        password: 'ChangeMe123', // Default temporary password
        studentAge: '',
        studentType: 'Group',
        timezone: 'IST',
        country: 'India',
        level: 'Beginner'
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

        if (Number(formData.studentAge) <= 5) {
            setLoading(false);
            return setError('Student Age must be above 5 years.');
        }

        try {
            // 1. Create User in Firebase Authentication (Secondary App)
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.parentEmail, formData.password);
            const user = userCredential.user;

            // 2. Create User Document in Firestore (Main DB)
            // We use the UID from the new user, but write to the main DB
            await setDoc(doc(db, 'users', user.uid), {
                email: formData.parentEmail,
                role: 'customer',
                fullName: formData.parentName,
                createdAt: new Date(),
                // Student Profile Data
                studentName: formData.studentName,
                studentAge: formData.studentAge,
                studentType: formData.studentType,
                timezone: formData.timezone,
                country: formData.country,
                learningLevel: formData.level,
                createdBy: 'ADMIN',
                status: 'ACTIVE'
            });

            // 3. Send Welcome Email with credentials
            if (sendEmail) {
                try {
                    const emailResponse = await fetch(`${EMAIL_API_URL}/api/email/student-welcome`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            parentEmail: formData.parentEmail,
                            parentName: formData.parentName,
                            studentName: formData.studentName,
                            password: formData.password
                        })
                    });
                    const emailResult = await emailResponse.json();
                    if (emailResult.success) {
                        console.log('✅ Welcome email sent successfully');
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
            onSuccess(); // Refresh parent list
            onClose();

        } catch (err) {
            console.error(err);
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2 className="modal-title">Add New Student</h2>

                {error && <div className="error-message" style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="evaluation-form">
                    <div className="form-row">
                        <Input
                            label="Student Name"
                            name="studentName"
                            required
                            value={formData.studentName}
                            onChange={handleChange}
                        />
                        <Input
                            label="Student Age"
                            name="studentAge"
                            type="number"
                            required
                            min="6"
                            value={formData.studentAge}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <Input
                            label="Parent Name"
                            name="parentName"
                            required
                            value={formData.parentName}
                            onChange={handleChange}
                        />
                        <Input
                            label="Parent Email"
                            name="parentEmail"
                            type="email"
                            required
                            value={formData.parentEmail}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Learning Level</label>
                            <select name="level" value={formData.level} onChange={handleChange}>
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Class Type</label>
                            <select name="studentType" value={formData.studentType} onChange={handleChange}>
                                <option>Group</option>
                                <option>1-1</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <Input
                            label="Country"
                            name="country"
                            required
                            value={formData.country}
                            onChange={handleChange}
                        />
                        <div className="form-group">
                            <label>Timezone</label>
                            <select name="timezone" value={formData.timezone} onChange={handleChange}>
                                <option>IST</option>
                                <option>EST</option>
                                <option>PST</option>
                                <option>GMT</option>
                                <option>AEST</option>
                            </select>
                        </div>
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
                            id="sendEmail"
                            checked={sendEmail}
                            onChange={(e) => setSendEmail(e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="sendEmail" style={{ cursor: 'pointer', fontSize: '14px' }}>
                            📧 Send welcome email with login credentials
                        </label>
                    </div>

                    <Button type="submit" disabled={loading} className="submit-evaluation-btn">
                        {loading ? 'Registering...' : 'Register Student'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AddStudentModal;
