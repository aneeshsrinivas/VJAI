import React, { useState } from 'react';
import { convertDemoToStudent, createParentAccount } from '../../services/firestoreService';
import { createParentAuthAccount } from '../../services/adminAuthService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './DemoOutcomeModal.css'; // Reuse styles

const EMAIL_API_URL = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:3001';

const ConvertStudentModal = ({ demo, onClose, onSuccess }) => {
    const { currentUser } = useAuth();
    const { isDark } = useTheme();

    // Auto-generate student email from student name
    const studentEmailPrefix = demo.studentName.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
    const studentEmail = `${studentEmailPrefix}@student.com`;

    const PLAN_PRICES = {
        'beginner-1m': '60', 'beginner-3m': '160', 'beginner-4m': '200',
        'advanced-beginner-1m': '60', 'advanced-beginner-3m': '160', 'advanced-beginner-4m': '200',
        'intermediate-I-1m': '70', 'intermediate-I-3m': '187', 'intermediate-I-4m': '233',
        'intermediate-II-1m': '70', 'intermediate-II-3m': '187', 'intermediate-II-4m': '233',
    };

    const [formData, setFormData] = useState({
        email: studentEmail,
        password: '',
        planId: 'beginner-1m',
        amount: '60',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!demo) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Create REAL Firebase Auth account using secondary app
            const authResult = await createParentAuthAccount(formData.email, formData.password);

            if (!authResult.success) {
                setError(authResult.error || 'Failed to create login account');
                setLoading(false);
                return;
            }

            const realUid = authResult.uid;

            // 2. Create Account Doc in Firestore with real UID
            await createParentAccount(realUid, formData.email, currentUser?.uid, formData.password);

            // 3. Convert Demo & Create Student/Subscription
            const paymentData = {
                planId: formData.planId,
                amount: Number(formData.amount),
                billingCycle: 'monthly',
                adminId: currentUser?.uid,
                nextDueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
                ...formData
            };

            const result = await convertDemoToStudent(demo.id, realUid, paymentData);

            if (result.success) {
                // Send emails via nodemailer
                try {
                    // 1. Notify Admin of Payment
                    const adminEmailResponse = await fetch(`${EMAIL_API_URL}/api/email/send`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: 'indianchessacademy@email.com',
                            subject: `🎉 New Payment Received - ${demo.studentName}`,
                            text: `New payment received!

💰 Payment Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Parent: ${demo.parentName} (${demo.parentEmail})
• Student: ${demo.studentName}
• Plan: ${formData.planId}
• Amount: $${formData.amount}
• Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

🔐 LMS Access Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Login Email: ${formData.email}
• Temp Password: ${formData.password}
• Portal: https://vjai.onrender.com/login

📋 Action Required:
• Assign coach to batch
• LMS access email sent to parent automatically

Student ID: ${result.studentId}`
                        })
                    });

                    if (adminEmailResponse.ok) {
                        console.log('✅ Admin notification sent');
                    }

                    // 2. Send LMS Access to Parent
                    const parentEmailResponse = await fetch(`${EMAIL_API_URL}/api/email/send`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: demo.parentEmail,
                            subject: `Welcome to Indian Chess Academy - Your LMS Access for ${demo.studentName}`,
                            text: `Dear ${demo.parentName},

Thank you for enrolling ${demo.studentName} at Indian Chess Academy! 🎉

🎓 Your LMS Access:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Student Name: ${demo.studentName}
• Parent Email: ${demo.parentEmail}
• Temporary Password: ${formData.password}
• Portal URL: https://vjai.onrender.com/login

📚 What's Next:
1. Login to your parent dashboard
2. View class schedule (will be updated once coach is assigned)
3. Access lesson materials & resources
4. Chat with coach in batch group chat
5. Track ${demo.studentName}'s progress

Your first class will be scheduled shortly by our admin team. You'll receive an email with the class details.

Important: Please change your password after first login in Settings.

Best regards,
Indian Chess Academy Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Support: indianchessacademy@email.com
🌐 Website: www.indianchessacademy.com`
                        })
                    });

                    if (parentEmailResponse.ok) {
                        console.log('✅ LMS access email sent to:', demo.parentEmail);
                    } else {
                        console.error('⚠️ Parent email failed, but account created');
                    }
                } catch (emailError) {
                    console.error('Email sending error:', emailError);
                    // Don't fail conversion if emails fail
                }

                onSuccess();
            } else {
                setError(result.error || 'Failed to convert student');
            }
        } catch (err) {
            console.error(err);
            setError('Conversion failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className={`modal-content demo-outcome-modal ${isDark ? 'dark-mode' : ''}`}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Convert to Student</h2>
                <p className="modal-subtitle">Create account for {demo.studentName}</p>

                <div className="demo-info">
                    <p><strong>Parent Email:</strong> {demo.parentEmail}</p>
                    <p><strong>Student Login Email:</strong> {studentEmail}</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <Input
                        label="Student Email (Login ID)"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="studentname@student.com"
                    />

                    <Input
                        label="Set Temporary Password"
                        name="password"
                        type="text"
                        required
                        placeholder="e.g. Welcome@123"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <div className="form-group">
                        <label>Select Plan</label>
                        <select
                            name="planId"
                            value={formData.planId}
                            onChange={(e) => {
                                const amount = PLAN_PRICES[e.target.value] || '60';
                                setFormData(prev => ({ ...prev, planId: e.target.value, amount }));
                            }}
                            style={{ padding: '10px', width: '100%', borderRadius: '6px', border: '1px solid #ddd' }}
                        >
                            <optgroup label="Beginner ($60/mo)">
                                <option value="beginner-1m">Beginner — 1 Month ($60)</option>
                                <option value="beginner-3m">Beginner — 3 Months ($160)</option>
                                <option value="beginner-4m">Beginner — 4 Months ($200)</option>
                            </optgroup>
                            <optgroup label="Advanced Beginner ($60/mo)">
                                <option value="advanced-beginner-1m">Advanced Beginner — 1 Month ($60)</option>
                                <option value="advanced-beginner-3m">Advanced Beginner — 3 Months ($160)</option>
                                <option value="advanced-beginner-4m">Advanced Beginner — 4 Months ($200)</option>
                            </optgroup>
                            <optgroup label="Intermediate-I ($70/mo)">
                                <option value="intermediate-I-1m">Intermediate-I — 1 Month ($70)</option>
                                <option value="intermediate-I-3m">Intermediate-I — 3 Months ($187)</option>
                                <option value="intermediate-I-4m">Intermediate-I — 4 Months ($233)</option>
                            </optgroup>
                            <optgroup label="Intermediate-II ($70/mo)">
                                <option value="intermediate-II-1m">Intermediate-II — 1 Month ($70)</option>
                                <option value="intermediate-II-3m">Intermediate-II — 3 Months ($187)</option>
                                <option value="intermediate-II-4m">Intermediate-II — 4 Months ($233)</option>
                            </optgroup>
                        </select>
                    </div>

                    <Input
                        label="Fee Amount ($)"
                        name="amount"
                        type="number"
                        required
                        value={formData.amount}
                        onChange={handleChange}
                    />

                    <div className="modal-actions">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account & Convert'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConvertStudentModal;
