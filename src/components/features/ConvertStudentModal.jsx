import React, { useState } from 'react';
import { convertDemoToStudent, createParentAccount } from '../../services/firestoreService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import './DemoOutcomeModal.css'; // Reuse styles

const ConvertStudentModal = ({ demo, onClose, onSuccess }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        password: '',
        planId: 'monthly-group',
        amount: '2000',
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
            // 1. Simulate Auth UID (In real app, create Auth user via Admin SDK)
            const simulatedUid = `user_${Date.now()}`;

            // 2. Create Account Doc
            // Note: Saving password in plain text is for MVP flow demonstration only as requested
            // In production, this would be handled by Firebase Auth
            await createParentAccount(simulatedUid, demo.parentEmail, currentUser?.uid, formData.password);

            // 3. Convert Demo & Create Student/Subscription
            const paymentData = {
                planId: formData.planId,
                amount: Number(formData.amount),
                billingCycle: 'monthly',
                adminId: currentUser?.uid,
                nextDueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
                ...formData
            };

            const result = await convertDemoToStudent(demo.id, simulatedUid, paymentData);

            if (result.success) {
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
            <div className="modal-content demo-outcome-modal">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Convert to Student</h2>
                <p className="modal-subtitle">Create account for {demo.studentName}</p>

                <div className="demo-info">
                    <p><strong>Email:</strong> {demo.parentEmail}</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
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
                                const amount = e.target.value.includes('group') ? '2000' : '5000';
                                setFormData(prev => ({ ...prev, planId: e.target.value, amount }));
                            }}
                            style={{ padding: '10px', width: '100%', borderRadius: '6px', border: '1px solid #ddd' }}
                        >
                            <option value="monthly-group">Monthly Group Class (₹2000)</option>
                            <option value="monthly-1on1">Monthly 1-on-1 (₹5000)</option>
                            <option value="quarterly-group">Quarterly Group Class (₹5500)</option>
                        </select>
                    </div>

                    <Input
                        label="Fee Amount (₹)"
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
