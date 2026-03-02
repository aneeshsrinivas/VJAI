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
import { openRazorpayCheckout, loadRazorpayScript, createRazorpayOrder, verifyRazorpayPayment } from '../services/razorpayService';

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
        parentPhone: '',
        timezone: 'IST',
        paymentMethod: 'razorpay', // Default to Razorpay
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

    // Pre-load Razorpay SDK silently on mount
    useEffect(() => {
        loadRazorpayScript();
    }, []);

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
                            parentEmail: userData.email || user.email || '',
                            parentPhone: userData.phone || userData.phoneNumber || ''
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

    // Convert USD → INR for Razorpay (1 USD ≈ 83 INR, test mode)
    const amountINR = Math.round(pricing.total * 83);

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

    // ── Razorpay flow ──────────────────────────────────────────────────────────
    const handleRazorpayPayment = async () => {
        if (!formData.studentName || !formData.parentName || !formData.parentEmail) {
            toast.error('Please fill in Student Name, Parent Name, and Email before proceeding.');
            return;
        }
        setIsProcessing(true);
        try {
            // 1. Create Order on Backend
            const order = await createRazorpayOrder(
                amountINR,
                `receipt_${Date.now()}`,
                {
                    planName: plan.name,
                    parentEmail: formData.parentEmail
                }
            );

            // 2. Open Razorpay Modal with the real order ID
            const razorpayResponse = await openRazorpayCheckout({
                amountINR,
                orderId: order.id,
                planName: plan.name,
                parentName: formData.parentName,
                parentEmail: formData.parentEmail,
                parentPhone: formData.parentPhone,
                description: `${plan.name} - ${plan.billingCycle || 'Monthly'} Plan`,
            });

            // 3. Verify Payment Signature on Backend
            toast.info('Verifying payment securely...');
            await verifyRazorpayPayment(
                razorpayResponse.razorpay_order_id,
                razorpayResponse.razorpay_payment_id,
                razorpayResponse.razorpay_signature
            );

            // 4. Payment was successful format – save to Firestore
            const parentId = user?.uid || null;
            const paymentData = {
                parentId,
                parentEmail: formData.parentEmail,
                parentName: formData.parentName,
                studentName: formData.studentName,
                studentAge: formData.studentAge,
                planId: plan.id || plan.planId,
                planName: plan.name,
                amount: amountINR,
                subtotal: Math.round(pricing.subtotal * 83),
                discount: Math.round(pricing.discount * 83),
                familyMembers,
                paymentMethod: 'razorpay',
                currency: 'INR',
                status: 'COMPLETED',
                razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                razorpayOrderId: razorpayResponse.razorpay_order_id,
                razorpaySignature: razorpayResponse.razorpay_signature,
                createdAt: serverTimestamp(),
                completedAt: serverTimestamp(),
            };
            const paymentRef = await addDoc(collection(db, 'payments'), paymentData);

            // Create subscription record
            const subscriptionData = {
                parentId,
                parentEmail: formData.parentEmail,
                parentName: formData.parentName,
                studentName: formData.studentName,
                planId: plan.id || plan.planId,
                planName: plan.name,
                amount: amountINR,
                billingCycle: plan.billingCycle || 'MONTHLY',
                status: 'ACTIVE',
                paymentMethod: 'razorpay',
                paymentId: paymentRef.id,
                razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                nextDueAt: getNextDueDate(plan.billingCycle),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            await addDoc(collection(db, 'subscriptions'), subscriptionData);

            if (demoId) {
                await conversionService.submitPaymentProof(demoId, plan, {
                    method: 'Razorpay',
                    razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                    ...formData,
                    amount: amountINR,
                });
            }

            toast.success('🎉 Payment successful!');
            navigate('/payment/success', {
                state: {
                    plan,
                    pricing: { ...pricing, amountINR },
                    manualApproval: false,
                    paymentId: paymentRef.id,
                    razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                    paymentMethod: 'razorpay',
                }
            });
        } catch (error) {
            if (error.message === 'PAYMENT_CANCELLED') {
                toast.info('Payment cancelled.');
            } else {
                console.error('Razorpay error:', error);
                toast.error('Payment failed: ' + error.message);
            }
            setIsProcessing(false);
        }
    };

    // ── Standard form submit (UPI / Card) ──────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Intercept Razorpay click (button inside form)
        if (formData.paymentMethod === 'razorpay') {
            await handleRazorpayPayment();
            return;
        }

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

            const paymentRef = await addDoc(collection(db, 'payments'), paymentData);

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
                if (demoId) {
                    await conversionService.submitPaymentProof(demoId, plan, {
                        method: 'UPI',
                        upiId: UPI_ID,
                        ...formData,
                        amount: pricing.total
                    });
                    toast.success('Payment submitted! Waiting for admin approval.');
                }
                navigate('/payment/success', { state: { plan, pricing, manualApproval: true } });
            } else {
                await updateDoc(doc(db, 'payments', paymentRef.id), {
                    status: 'COMPLETED',
                    completedAt: serverTimestamp()
                });
                toast.success('Payment successful!');
                navigate('/payment/success', { state: { plan, pricing, manualApproval: false, paymentId: paymentRef.id } });
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Payment submission failed. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="checkout-page">
            <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />
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

                        {/* TEST MODE BANNER */}
                        <div style={{
                            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                            border: '1px solid #4facfe55',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}>
                            <span style={{ fontSize: '20px' }}>🧪</span>
                            <div>
                                <p style={{ margin: 0, fontWeight: '700', color: '#4facfe', fontSize: '13px' }}>
                                    RAZORPAY TEST MODE ACTIVE
                                </p>
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                                    Use test card <strong style={{ color: '#fff' }}>4111 1111 1111 1111</strong> · Expiry: any future date · CVV: any 3 digits
                                </p>
                            </div>
                        </div>

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
                                <Input
                                    label="Phone Number (for payment prefill)"
                                    name="parentPhone"
                                    type="tel"
                                    placeholder="+91 9876543210"
                                    value={formData.parentPhone}
                                    onChange={handleInputChange}
                                />
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
                                            🎉 Family discount applied! Save ₹{Math.round(pricing.discount * 83).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="checkout-section">
                                <h3 className="section-title">Payment Method</h3>
                                <div className="payment-methods">
                                    {/* Razorpay — Recommended */}
                                    <button
                                        type="button"
                                        id="pay-razorpay-btn"
                                        className={`payment-method-btn ${formData.paymentMethod === 'razorpay' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, paymentMethod: 'razorpay' })}
                                        style={{ position: 'relative' }}
                                    >
                                        <span className="payment-icon">
                                            <img
                                                src="https://razorpay.com/favicon.png"
                                                alt="Razorpay"
                                                style={{ width: '20px', height: '20px', borderRadius: '4px' }}
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline'; }}
                                            />
                                            <span style={{ display: 'none' }}>💳</span>
                                        </span>
                                        <span>Razorpay</span>
                                        <span style={{
                                            position: 'absolute', top: '-8px', right: '-8px',
                                            background: '#22c55e', color: 'white',
                                            fontSize: '9px', fontWeight: '700',
                                            padding: '2px 6px', borderRadius: '10px',
                                            letterSpacing: '0.5px'
                                        }}>RECOMMENDED</span>
                                    </button>

                                    <button
                                        type="button"
                                        className={`payment-method-btn ${formData.paymentMethod === 'upi' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, paymentMethod: 'upi' })}
                                    >
                                        <span className="payment-icon">📱</span>
                                        <span>Manual UPI</span>
                                    </button>

                                    <button
                                        type="button"
                                        className={`payment-method-btn ${formData.paymentMethod === 'card' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                                    >
                                        <span className="payment-icon">💳</span>
                                        <span>Card (Demo)</span>
                                    </button>
                                </div>

                                {/* Razorpay info panel */}
                                {formData.paymentMethod === 'razorpay' && (
                                    <div style={{
                                        background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
                                        borderRadius: '16px',
                                        padding: '24px',
                                        marginTop: '16px',
                                        color: 'white',
                                        border: '1px solid rgba(79,172,254,0.3)',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{
                                                background: 'rgba(79,172,254,0.15)',
                                                borderRadius: '12px', padding: '10px',
                                            }}>
                                                <span style={{ fontSize: '24px' }}>🔒</span>
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: '700', fontSize: '16px' }}>Secure Razorpay Checkout</p>
                                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                                                    Supports UPI, Cards, Net Banking & Wallets
                                                </p>
                                            </div>
                                        </div>

                                        {/* Amount display */}
                                        <div style={{
                                            background: 'rgba(255,255,255,0.07)',
                                            borderRadius: '12px', padding: '16px',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            marginBottom: '16px',
                                        }}>
                                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Amount to Pay</span>
                                            <span style={{ fontSize: '24px', fontWeight: '800', color: '#4facfe' }}>
                                                ₹{amountINR.toLocaleString()}
                                            </span>
                                        </div>

                                        {/* Test card chips */}
                                        <div style={{ marginBottom: '8px' }}>
                                            <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                🧪 Test Credentials
                                            </p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {[
                                                    { label: 'Card', value: '4111 1111 1111 1111' },
                                                    { label: 'Expiry', value: '12/26' },
                                                    { label: 'CVV', value: '123' },
                                                    { label: 'UPI', value: 'success@razorpay' },
                                                ].map(item => (
                                                    <div key={item.label} style={{
                                                        background: 'rgba(79,172,254,0.12)',
                                                        border: '1px solid rgba(79,172,254,0.3)',
                                                        borderRadius: '8px', padding: '6px 10px',
                                                        fontSize: '12px',
                                                    }}>
                                                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>{item.label}: </span>
                                                        <span style={{ color: '#fff', fontWeight: '600', fontFamily: 'monospace' }}>{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <p style={{ margin: '12px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                                            ⓘ Clicking "Pay with Razorpay" will open the Razorpay modal. No real money is charged in test mode.
                                        </p>
                                    </div>
                                )}

                                {/* Card details (demo) */}
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

                                {/* Manual UPI */}
                                {formData.paymentMethod === 'upi' && (
                                    <div className="upi-details">
                                        <h4>Pay via UPI</h4>
                                        <div className="upi-qr-box">📱</div>
                                        <p className="upi-hint">Scan QR code or pay to:</p>
                                        <div className="upi-id-display">{UPI_ID}</div>
                                        <p className="upi-amount">
                                            Amount: ₹{amountINR.toLocaleString()} (~${pricing.total.toFixed(2)})
                                        </p>
                                        <label className={`upi-confirm-label ${upiConfirmed ? 'confirmed' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={upiConfirmed}
                                                onChange={(e) => setUpiConfirmed(e.target.checked)}
                                                style={{ width: '18px', height: '18px', accentColor: '#22c55e' }}
                                            />
                                            <span>I have completed the UPI payment</span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                id="checkout-submit-btn"
                                className="checkout-submit-btn"
                                disabled={isProcessing || (formData.paymentMethod === 'upi' && !upiConfirmed)}
                                style={formData.paymentMethod === 'razorpay' ? {
                                    background: 'linear-gradient(135deg, #072654 0%, #0f3460 50%, #1a5276 100%)',
                                    boxShadow: '0 8px 24px rgba(15,52,96,0.5)',
                                } : {}}
                            >
                                {isProcessing ? (
                                    <span className="processing-text">
                                        <span className="spinner"></span>
                                        {formData.paymentMethod === 'razorpay' ? 'Opening Razorpay...' : 'Processing Payment...'}
                                    </span>
                                ) : (
                                    formData.paymentMethod === 'razorpay'
                                        ? `🔒 Pay ₹${amountINR.toLocaleString()} with Razorpay`
                                        : formData.paymentMethod === 'upi'
                                            ? `Submit Payment (₹${amountINR.toLocaleString()})`
                                            : `Pay $${pricing.total.toFixed(2)} (Demo)`
                                )}
                            </button>

                            {formData.paymentMethod === 'razorpay' && (
                                <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '12px' }}>
                                    🔐 Secured by Razorpay. SSL encrypted & PCI DSS compliant.
                                </p>
                            )}
                        </form>
                    </div>

                    {/* Right Side - Order Summary */}
                    <div className="checkout-summary-section">
                        <div className="summary-card">
                            <h3 className="summary-title">Order Summary</h3>

                            <div className="summary-plan">
                                <div className="summary-plan-icon" style={{ color: plan.color || '#181818' }}>
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
                                    <span>Subtotal (USD)</span>
                                    <span>${pricing.subtotal.toFixed(2)}</span>
                                </div>
                                {pricing.discount > 0 && (
                                    <div className="summary-row discount">
                                        <span>Family Discount (15%)</span>
                                        <span>-${pricing.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="summary-row" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                                    <span style={{ color: '#666', fontSize: '13px' }}>Amount in INR</span>
                                    <span style={{ color: '#0f3460', fontWeight: '700' }}>₹{amountINR.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-total">
                                <span>Total Due Today</span>
                                <span className="summary-total-amount">₹{amountINR.toLocaleString()}</span>
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

                            {/* Razorpay badge */}
                            <div style={{
                                marginTop: '16px', padding: '12px',
                                background: '#f8fafc', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            }}>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Payments powered by</span>
                                <span style={{ fontWeight: '800', color: '#072654', fontSize: '13px', letterSpacing: '-0.5px' }}>
                                    Razorpay
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCheckout;
