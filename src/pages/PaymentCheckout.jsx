import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import './PaymentCheckout.css';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { conversionService } from '../services/conversionService';

const PaymentCheckout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { plan, demoId } = location.state || {};

    const [formData, setFormData] = useState({
        studentName: '',
        studentAge: '',
        parentName: '',
        parentEmail: '',
        timezone: 'IST',
        paymentMethod: 'upi', // Default to UPI
        cardNumber: '',
        cardExpiry: '',
        cardCVV: '',
        billingAddress: ''
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [familyMembers, setFamilyMembers] = useState(1);
    const [upiConfirmed, setUpiConfirmed] = useState(false);

    // Mock UPI details
    const UPI_ID = 'indianchessacademy@upi';

    // Pre-fill form with user data if logged in
    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.uid) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setFormData(prev => ({
                            ...prev,
                            parentName: userData.fullName || userData.name || '',
                            parentEmail: userData.email || user.email || ''
                        }));
                    } else {
                        setFormData(prev => ({
                            ...prev,
                            parentEmail: user.email || ''
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };
        fetchUserData();
    }, [user]);

    if (!plan) {
        return (
            <div className="checkout-error">
                <h2>No plan selected</h2>
                <Button onClick={() => navigate('/pricing')}>Select a Plan</Button>
            </div>
        );
    }

    const calculateTotal = () => {
        const basePrice = plan.price * familyMembers;
        const discount = familyMembers >= 2 ? basePrice * 0.15 : 0;
        return {
            subtotal: basePrice,
            discount: discount,
            total: basePrice - discount
        };
    };

    const pricing = calculateTotal();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const parentId = user?.uid || null;
            const paymentData = {
                parentId,
                parentEmail: formData.parentEmail,
                parentName: formData.parentName,
                studentName: formData.studentName,
                studentAge: formData.studentAge,
                planId: plan.id || plan.planId,
                planName: plan.name,
                amount: pricing.total,
                subtotal: pricing.subtotal,
                discount: pricing.discount,
                familyMembers,
                paymentMethod: formData.paymentMethod,
                currency: 'USD',
                status: formData.paymentMethod === 'upi' ? 'PENDING' : 'COMPLETED',
                createdAt: serverTimestamp()
            };

            // Create payment record in Firestore
            const paymentRef = await addDoc(collection(db, 'payments'), paymentData);

            // Create or update subscription
            const subscriptionData = {
                parentId,
                parentEmail: formData.parentEmail,
                parentName: formData.parentName,
                studentName: formData.studentName,
                planId: plan.id || plan.planId,
                planName: plan.name,
                amount: pricing.total,
                billingCycle: plan.billingCycle || 'MONTHLY',
                status: formData.paymentMethod === 'upi' ? 'PENDING_APPROVAL' : 'ACTIVE',
                paymentId: paymentRef.id,
                nextDueAt: getNextDueDate(plan.billingCycle),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await addDoc(collection(db, 'subscriptions'), subscriptionData);

            if (formData.paymentMethod === 'upi') {
                // UPI Flow: Submit payment proof and wait for admin approval
                if (demoId) {
                    await conversionService.submitPaymentProof(demoId, plan, {
                        method: 'UPI',
                        upiId: UPI_ID,
                        ...formData,
                        amount: pricing.total
                    });
                }
                toast.success("Payment submitted! Waiting for admin approval.");
                navigate('/payment/success', { state: { plan, pricing, manualApproval: true, paymentId: paymentRef.id } });
            } else {
                // Card payment - simulate processing
                // Update payment status to completed
                await updateDoc(doc(db, 'payments', paymentRef.id), {
                    status: 'COMPLETED',
                    completedAt: serverTimestamp()
                });

                toast.success("Payment successful!");
                navigate('/payment/success', { state: { plan, pricing, manualApproval: false, paymentId: paymentRef.id } });
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Payment submission failed. Please try again.');
            setIsProcessing(false);
        }
    };

    const getNextDueDate = (billingCycle) => {
        const nextDue = new Date();
        switch (billingCycle?.toUpperCase()) {
            case 'YEARLY':
                nextDue.setFullYear(nextDue.getFullYear() + 1);
                break;
            case 'QUARTERLY':
                nextDue.setMonth(nextDue.getMonth() + 3);
                break;
            case 'MONTHLY':
            default:
                nextDue.setMonth(nextDue.getMonth() + 1);
                break;
        }
        return nextDue;
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                {/* Progress Indicator */}
                <div className="checkout-progress">
                    <div className="progress-step completed">
                        <div className="progress-circle">✓</div>
                        <div className="progress-label">Select Plan</div>
                    </div>
                    <div className="progress-line completed"></div>
                    <div className="progress-step active">
                        <div className="progress-circle">2</div>
                        <div className="progress-label">Payment</div>
                    </div>
                    <div className="progress-line"></div>
                    <div className="progress-step">
                        <div className="progress-circle">3</div>
                        <div className="progress-label">Confirmation</div>
                    </div>
                </div>

                <div className="checkout-content">
                    {/* Left Side - Form */}
                    <div className="checkout-form-section">
                        <h1 className="checkout-title">Complete Your Enrollment</h1>

                        <form onSubmit={handleSubmit}>
                            {/* Student Information */}
                            <div className="checkout-section">
                                <h3 className="section-title">Student Information</h3>
                                <div className="form-grid">
                                    <Input
                                        label="Student Name"
                                        name="studentName"
                                        value={formData.studentName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <Input
                                        label="Student Age"
                                        name="studentAge"
                                        type="number"
                                        value={formData.studentAge}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Parent Information */}
                            <div className="checkout-section">
                                <h3 className="section-title">Parent/Guardian Information</h3>
                                <div className="form-grid">
                                    <Input
                                        label="Parent Name"
                                        name="parentName"
                                        value={formData.parentName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <Input
                                        label="Parent Email"
                                        name="parentEmail"
                                        type="email"
                                        value={formData.parentEmail}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Family Plan */}
                            <div className="checkout-section">
                                <h3 className="section-title">Family Plan</h3>
                                <div className="family-selector">
                                    <label>Number of Students</label>
                                    <div className="family-buttons">
                                        {[1, 2, 3, 4].map(num => (
                                            <button
                                                key={num}
                                                type="button"
                                                className={`family-btn ${familyMembers === num ? 'active' : ''}`}
                                                onClick={() => setFamilyMembers(num)}
                                            >
                                                {num}
                                                {num >= 2 && <span className="discount-badge">-15%</span>}
                                            </button>
                                        ))}
                                    </div>
                                    {familyMembers >= 2 && (
                                        <div className="family-discount-message">
                                            🎉 Family discount applied! Save ${pricing.discount.toFixed(2)}/month
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="checkout-section">
                                <h3 className="section-title">Payment Method</h3>
                                <div className="payment-methods">
                                    <button
                                        type="button"
                                        className={`payment-method-btn ${formData.paymentMethod === 'card' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                                    >
                                        <span className="payment-icon">💳</span>
                                        <span>Credit/Debit Card</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`payment-method-btn ${formData.paymentMethod === 'upi' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, paymentMethod: 'upi' })}
                                    >
                                        <span className="payment-icon">📱</span>
                                        <span>UPI</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`payment-method-btn ${formData.paymentMethod === 'wallet' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, paymentMethod: 'wallet' })}
                                    >
                                        <span className="payment-icon">👛</span>
                                        <span>Wallet</span>
                                    </button>
                                </div>

                                {formData.paymentMethod === 'card' && (
                                    <div className="card-details">
                                        <Input
                                            label="Card Number"
                                            name="cardNumber"
                                            placeholder="1234 5678 9012 3456"
                                            value={formData.cardNumber}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <div className="form-grid">
                                            <Input
                                                label="Expiry Date"
                                                name="cardExpiry"
                                                placeholder="MM/YY"
                                                value={formData.cardExpiry}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            <Input
                                                label="CVV"
                                                name="cardCVV"
                                                placeholder="123"
                                                type="password"
                                                maxLength="3"
                                                value={formData.cardCVV}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {formData.paymentMethod === 'upi' && (
                                    <div className="upi-details" style={{ marginTop: '20px', padding: '24px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                                        <h4 style={{ margin: '0 0 16px', color: '#003366' }}>Pay via UPI</h4>

                                        {/* Mock QR Code */}
                                        <div style={{
                                            width: '180px',
                                            height: '180px',
                                            margin: '0 auto 16px',
                                            background: 'white',
                                            border: '2px solid #ddd',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '60px'
                                        }}>
                                            📱
                                        </div>

                                        <p style={{ fontSize: '14px', color: '#666', margin: '0 0 8px' }}>Scan QR code or pay to:</p>
                                        <div style={{
                                            padding: '12px 20px',
                                            background: 'white',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            display: 'inline-block',
                                            fontFamily: 'monospace',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#003366'
                                        }}>
                                            {UPI_ID}
                                        </div>

                                        <p style={{ fontSize: '13px', color: '#FC8A24', marginTop: '16px', fontWeight: '600' }}>
                                            Amount: ₹{(pricing.total * 83).toFixed(0)} (~${pricing.total.toFixed(2)})
                                        </p>

                                        {/* Confirmation Checkbox */}
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginTop: '20px',
                                            padding: '12px 16px',
                                            background: upiConfirmed ? '#dcfce7' : 'white',
                                            border: `2px solid ${upiConfirmed ? '#22c55e' : '#ddd'}`,
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            justifyContent: 'center'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={upiConfirmed}
                                                onChange={(e) => setUpiConfirmed(e.target.checked)}
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                            <span style={{ fontWeight: '500', color: upiConfirmed ? '#166534' : '#333' }}>
                                                I have completed the UPI payment
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={isProcessing}
                                style={{
                                    width: '100%',
                                    padding: '18px',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    backgroundColor: isProcessing ? '#ccc' : 'var(--color-warm-orange)'
                                }}
                            >
                                {isProcessing ? (
                                    <span className="processing-text">
                                        <span className="spinner"></span>
                                        Processing Payment...
                                    </span>
                                ) : (
                                    `Pay $${pricing.total.toFixed(2)}`
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Right Side - Order Summary */}
                    <div className="checkout-summary-section">
                        <div className="summary-card">
                            <h3 className="summary-title">Order Summary</h3>

                            <div className="summary-plan">
                                <div className="summary-plan-icon" style={{ color: plan.color || '#003366' }}>
                                    {plan.type === '1-on-1' || plan.classType === 'one-on-one' ? '♔' : '♟'}
                                </div>
                                <div className="summary-plan-info">
                                    <div className="summary-plan-name">{plan.name}</div>
                                    <div className="summary-plan-type">
                                        {plan.type || (plan.classType === 'one-on-one' ? '1-on-1' : 'Group')} • {plan.level?.charAt(0).toUpperCase() + plan.level?.slice(1) || plan.level}
                                    </div>
                                </div>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-breakdown">
                                <div className="summary-row">
                                    <span>Plan Price</span>
                                    <span>${plan.price}/{plan.billingCycle?.toLowerCase() || 'month'}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Number of Students</span>
                                    <span>× {familyMembers}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>${pricing.subtotal.toFixed(2)}</span>
                                </div>
                                {pricing.discount > 0 && (
                                    <div className="summary-row discount">
                                        <span>Family Discount (15%)</span>
                                        <span>-${pricing.discount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-total">
                                <span>Total Due Today</span>
                                <span className="summary-total-amount">${pricing.total.toFixed(2)}</span>
                            </div>

                            <div className="summary-features">
                                <h4>What's Included:</h4>
                                <ul>
                                    {(plan.features || []).slice(0, 4).map((feature, index) => (
                                        <li key={index}>
                                            <span className="feature-check">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="summary-guarantee">
                                <div className="guarantee-icon">🛡️</div>
                                <div className="guarantee-text">
                                    <strong>Money-Back Guarantee</strong>
                                    <p>Not satisfied? Get a full refund within 7 days.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCheckout;
