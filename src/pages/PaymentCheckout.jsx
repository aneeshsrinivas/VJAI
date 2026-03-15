import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
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
    const { plan, demoId, prefillData } = location.state || {};
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState({
        studentName: '',
        studentAge: '',
        selectedStudentId: '',
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
    const [availableStudents, setAvailableStudents] = useState([]);
    const [isNewStudent, setIsNewStudent] = useState(false);
    const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);

    // Helper function to handle payment success and redirect
    const handlePaymentSuccess = (paymentDetails) => {
        setShowPaymentConfirmation(true);
        // Always return to parent dashboard – they came from there
        setTimeout(() => {
            navigate('/parent', { state: { paymentSuccess: true } });
        }, 2000);
    };

    // Mock UPI details
    const UPI_ID = 'indianchessacademy@upi';

    // Pre-load Razorpay SDK silently on mount
    useEffect(() => {
        loadRazorpayScript();
    }, []);

    // ── Single consolidated prefill effect ─────────────────────────────────
    // Priority: 1) Demo booking doc (most accurate), 2) routing state prefillData, 3) user DB doc
    useEffect(() => {
        const fillForm = async () => {
            try {
                // Start with whatever routing state gave us
                let merged = {
                    parentName: prefillData?.parentName || '',
                    parentEmail: prefillData?.parentEmail || '',
                    parentPhone: prefillData?.parentPhone || '',
                    studentName: prefillData?.studentName || '',
                    studentAge: prefillData?.studentAge || '',
                };

                // Layer 2: logged-in user doc (fills gaps in prefillData)
                if (currentUser?.uid) {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        const u = userDoc.data();
                        merged.parentName = merged.parentName || u.fullName || u.parentName || u.name || '';
                        merged.parentEmail = merged.parentEmail || u.email || currentUser.email || '';
                        merged.parentPhone = merged.parentPhone || u.phone || u.parentPhone || u.phoneNumber || '';
                        merged.studentName = merged.studentName || u.studentName || '';
                        merged.studentAge  = merged.studentAge  || u.studentAge  || '';

                        // Resolve effective demoId: from routing state OR user doc
                        if (!demoId && u.demoId) {
                            // fetch demo doc using user-stored demoId
                            const demoDoc = await getDoc(doc(db, 'demos', u.demoId));
                            if (demoDoc.exists()) {
                                const d = demoDoc.data();
                                merged.parentName  = d.parentName  || merged.parentName;
                                merged.parentEmail = d.parentEmail || d.email || merged.parentEmail;
                                merged.parentPhone = d.parentPhone || merged.parentPhone;
                                merged.studentName = d.studentName || merged.studentName;
                                merged.studentAge  = d.studentAge  || merged.studentAge;
                            }
                        }
                    } else {
                        merged.parentEmail = merged.parentEmail || currentUser.email || '';
                    }
                }

                // Layer 1 (highest priority): explicitly passed demoId from routing state
                if (demoId) {
                    const demoDoc = await getDoc(doc(db, 'demos', demoId));
                    if (demoDoc.exists()) {
                        const d = demoDoc.data();
                        // Demo data always wins over DB user fields
                        merged.parentName  = d.parentName  || merged.parentName;
                        merged.parentEmail = d.parentEmail || d.email || merged.parentEmail;
                        merged.parentPhone = d.parentPhone || merged.parentPhone;
                        merged.studentName = d.studentName || merged.studentName;
                        merged.studentAge  = d.studentAge  || merged.studentAge;
                    }
                }

                setFormData(prev => ({ ...prev, ...merged }));
            } catch (err) {
                console.error('Prefill error:', err);
                // Still fill what we have
                if (currentUser?.email) {
                    setFormData(prev => ({ ...prev, parentEmail: prev.parentEmail || currentUser.email }));
                }
            }
        };
        fillForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);  // Re-run only when auth user changes

    // Fetch students based on parent email
    useEffect(() => {
        const fetchStudents = async () => {
            if (!formData.parentEmail || formData.parentEmail.length < 5) {
                setAvailableStudents([]);
                return;
            }
            try {
                const students = [];
                const q1 = query(collection(db, 'users'), where('email', '==', formData.parentEmail));
                const snap1 = await getDocs(q1);
                snap1.forEach(doc => {
                    const data = doc.data();
                    if (data.studentName && !students.find(s => s.name === data.studentName)) {
                        students.push({ id: doc.id, name: data.studentName, age: data.studentAge || '' });
                    }
                });

                // Check students collection (legacy)
                const q2 = query(collection(db, 'students'), where('parentEmail', '==', formData.parentEmail));
                const snap2 = await getDocs(q2);
                snap2.forEach(doc => {
                    const data = doc.data();
                    if (data.name && !students.find(s => s.name === data.name)) {
                        students.push({ id: doc.id, name: data.name, age: data.age || '' });
                    }
                });

                setAvailableStudents(students);
                if (students.length === 1 && !formData.studentName) {
                    setFormData(prev => ({ ...prev, studentName: students[0].name, studentAge: students[0].age, selectedStudentId: students[0].id }));
                    setIsNewStudent(false);
                } else if (students.length > 0 && !formData.studentName) {
                    setIsNewStudent(false);
                } else if (students.length === 0) {
                    setIsNewStudent(true);
                }
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };

        const timer = setTimeout(() => {
            fetchStudents();
        }, 500);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.parentEmail]);

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

    // Convert USD → INR for Razorpay (1 USD ≈ 91.94 INR, test mode)
    const amountINR = Math.round(pricing.total * 91.94);

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
                `receipt_${new Date().getTime()}`,
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
            // Use auth.currentUser directly (bypasses context tab-isolation) with context as fallback
            const parentId = auth.currentUser?.uid || currentUser?.uid || null;
            if (!parentId) {
                toast.error('Session expired. Please refresh and try again.');
                setIsProcessing(false);
                return;
            }
            const paymentData = {
                parentId,
                parentEmail: formData.parentEmail,
                parentName: formData.parentName,
                studentName: formData.studentName,
                studentAge: formData.studentAge,
                planId: plan.id || plan.planId,
                planName: plan.name,
                amount: amountINR,
                subtotal: Math.round(pricing.subtotal * 91.94),
                discount: Math.round(pricing.discount * 91.94),
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

            // Update user document so StudentDatabase shows correct student name/age
            if (parentId) {
                await updateDoc(doc(db, 'users', parentId), {
                    studentName: formData.studentName,
                    studentAge: formData.studentAge,
                    learningLevel: plan.level || 'Beginner',
                    studentType: plan.type || (plan.classType === 'one-on-one' ? '1-on-1' : 'Group'),
                    status: 'PAYMENT_SUCCESSFUL',
                    updatedAt: serverTimestamp()
                });

                // Also update the student record status
                const q = query(collection(db, 'students'), where('accountId', '==', parentId));
                const studentDocs = await getDocs(q);
                const updatePromises = studentDocs.docs.map(docSnap => 
                    updateDoc(doc(db, 'students', docSnap.id), {
                        status: 'PAYMENT_SUCCESSFUL',
                        updatedAt: serverTimestamp()
                    })
                );
                await Promise.all(updatePromises);
                
                // Notify Admin
                try {
                    await addDoc(collection(db, 'admin_notifications'), {
                        type: 'PAYMENT_RECEIVED',
                        title: 'New Payment Received',
                        message: `${formData.parentName} has completed payment for ${formData.studentName}. Please assign a coach to activate the account.`,
                        parentId,
                        amount: amountINR,
                        status: 'unread',
                        createdAt: serverTimestamp()
                    });
                } catch (notiError) {
                    console.error('Failed to create admin notification:', notiError);
                }
            }

            if (demoId) {
                await conversionService.submitPaymentProof(demoId, plan, {
                    method: 'Razorpay',
                    razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                    ...formData,
                    amount: amountINR,
                });
                // Update demo status to PAYMENT_SUCCESSFUL
                try {
                    await updateDoc(doc(db, 'demos', demoId), {
                        status: 'PAYMENT_SUCCESSFUL',
                        updatedAt: serverTimestamp()
                    });
                } catch (e) { /* demo may not exist */ }
            }

            toast.success('🎉 Payment successful!');
            handlePaymentSuccess({
                plan,
                pricing: { ...pricing, amountINR },
                manualApproval: false,
                paymentId: paymentRef.id,
                razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                paymentMethod: 'razorpay',
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
        // Resolve parentId directly from Firebase auth (bypasses context tab-isolation)
        const parentId = auth.currentUser?.uid || currentUser?.uid || null;
        if (!parentId) {
            toast.error('Session expired. Please refresh and try again.');
            setIsProcessing(false);
            return;
        }
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

            // Update user document so StudentDatabase shows correct student name/age
            if (parentId) {
                await updateDoc(doc(db, 'users', parentId), {
                    studentName: formData.studentName,
                    studentAge: formData.studentAge,
                    learningLevel: plan.level || 'Beginner',
                    studentType: plan.type || (plan.classType === 'one-on-one' ? '1-on-1' : 'Group'),
                    status: 'PAYMENT_SUCCESSFUL',
                    updatedAt: serverTimestamp()
                });

                if (formData.paymentMethod !== 'upi') {
                    // Update student record for completed card payments
                    const q = query(collection(db, 'students'), where('accountId', '==', parentId));
                    const studentDocs = await getDocs(q);
                    const updatePromises = studentDocs.docs.map(docSnap => 
                        updateDoc(doc(db, 'students', docSnap.id), {
                            status: 'PAYMENT_SUCCESSFUL',
                            updatedAt: serverTimestamp()
                        })
                    );
                    await Promise.all(updatePromises);

                    // Notify Admin
                    await addDoc(collection(db, 'admin_notifications'), {
                        type: 'PAYMENT_RECEIVED',
                        title: 'New Payment Received',
                        message: `${formData.parentName} has completed payment for ${formData.studentName}. Please assign a coach to activate the account.`,
                        parentId,
                        amount: pricing.total,
                        status: 'unread',
                        createdAt: serverTimestamp()
                    });
                }
            }

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
                handlePaymentSuccess({ plan, pricing, manualApproval: true });
            } else {
                await updateDoc(doc(db, 'payments', paymentRef.id), {
                    status: 'COMPLETED',
                    completedAt: serverTimestamp()
                });
                toast.success('Payment successful!');
                handlePaymentSuccess({ plan, pricing, manualApproval: false, paymentId: paymentRef.id });
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Payment submission failed. Please try again.');
            setIsProcessing(false);
        }
    };

    // ── Simulate Payment (TEST ONLY) ───────────────────────────────────────────
    const handleSimulatePayment = async () => {
        if (!formData.studentName || !formData.parentName || !formData.parentEmail) {
            toast.error('Please fill in Student Name, Parent Name, and Email before simulating.');
            return;
        }
        setIsProcessing(true);
        try {
            // Resolve parentId directly from Firebase auth (bypasses context tab-isolation)
        const parentId = auth.currentUser?.uid || currentUser?.uid || null;
        if (!parentId) {
            toast.error('Session expired. Please refresh and try again.');
            setIsProcessing(false);
            return;
        }
            const paymentData = {
                parentId,
                parentEmail: formData.parentEmail,
                parentName: formData.parentName,
                studentName: formData.studentName,
                studentAge: formData.studentAge,
                planId: plan.id || plan.planId,
                planName: plan.name,
                amount: amountINR,
                subtotal: Math.round(pricing.subtotal * 91.94),
                discount: Math.round(pricing.discount * 91.94),
                familyMembers,
                paymentMethod: 'simulated',
                currency: 'INR',
                status: 'COMPLETED',
                simulated: true,
                createdAt: serverTimestamp(),
                completedAt: serverTimestamp(),
            };
            const paymentRef = await addDoc(collection(db, 'payments'), paymentData);

            await addDoc(collection(db, 'subscriptions'), {
                parentId,
                parentEmail: formData.parentEmail,
                parentName: formData.parentName,
                studentName: formData.studentName,
                planId: plan.id || plan.planId,
                planName: plan.name,
                amount: amountINR,
                billingCycle: plan.billingCycle || 'MONTHLY',
                status: 'ACTIVE',
                paymentMethod: 'simulated',
                paymentId: paymentRef.id,
                nextDueAt: getNextDueDate(plan.billingCycle),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            if (parentId) {
                await updateDoc(doc(db, 'users', parentId), {
                    studentName: formData.studentName,
                    studentAge: formData.studentAge,
                    learningLevel: plan.level || 'Beginner',
                    studentType: plan.type || (plan.classType === 'one-on-one' ? '1-on-1' : 'Group'),
                    status: 'PAYMENT_SUCCESSFUL',
                    updatedAt: serverTimestamp()
                });

                // Also update the student record status
                const q = query(collection(db, 'students'), where('accountId', '==', parentId));
                const studentDocs = await getDocs(q);
                const updatePromises = studentDocs.docs.map(docSnap => 
                    updateDoc(doc(db, 'students', docSnap.id), {
                        status: 'PAYMENT_SUCCESSFUL',
                        updatedAt: serverTimestamp()
                    })
                );
                await Promise.all(updatePromises);

                // Notify Admin
                await addDoc(collection(db, 'admin_notifications'), {
                    type: 'PAYMENT_RECEIVED',
                    title: 'New Payment Received (Simulated)',
                    message: `${formData.parentName} has completed payment for ${formData.studentName}. Please assign a coach to activate the account.`,
                    parentId,
                    amount: amountINR,
                    status: 'unread',
                    createdAt: serverTimestamp()
                });
            }

            if (demoId) {
                try {
                    await conversionService.submitPaymentProof(demoId, plan, {
                        method: 'simulated',
                        ...formData,
                        amount: amountINR,
                    });
                    // Update demo status to PAYMENT_SUCCESSFUL
                    await updateDoc(doc(db, 'demos', demoId), {
                        status: 'PAYMENT_SUCCESSFUL',
                        updatedAt: serverTimestamp()
                    });
                } catch (e) { /* demo may not exist */ }
            }

            toast.success('✅ Payment simulated! Redirecting...');
            handlePaymentSuccess({
                plan,
                pricing: { ...pricing, amountINR },
                manualApproval: false,
                paymentId: paymentRef.id,
                paymentMethod: 'simulated',
            });
        } catch (error) {
            console.error('Simulate payment error:', error);
            toast.error('Simulation failed: ' + error.message);
            setIsProcessing(false);
        }
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
                            {/* Parent Information - moved up to fetch students */}
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

                            {/* Student Information */}
                            <div className="checkout-section">
                                <h3 className="section-title">Student Information</h3>
                                {availableStudents.length > 0 && (
                                    <div className="checkout-input-group" style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#181818', fontWeight: '500' }}>Select Student</label>
                                        <select
                                            value={isNewStudent ? 'new' : formData.selectedStudentId || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === 'new') {
                                                    setIsNewStudent(true);
                                                    setFormData(prev => ({ ...prev, studentName: '', studentAge: '', selectedStudentId: '' }));
                                                } else {
                                                    setIsNewStudent(false);
                                                    const selected = availableStudents.find(s => s.id === val);
                                                    if (selected) {
                                                        setFormData(prev => ({ ...prev, studentName: selected.name, studentAge: selected.age, selectedStudentId: selected.id }));
                                                    }
                                                }
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #ddd',
                                                fontSize: '15px'
                                            }}
                                        >
                                            <option value="" disabled>-- Select a student --</option>
                                            {availableStudents.map(student => (
                                                <option key={student.id} value={student.id}>{student.name}</option>
                                            ))}
                                            <option value="new">+ Add New Student</option>
                                        </select>
                                    </div>
                                )}

                                {(isNewStudent || availableStudents.length === 0) && (
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
                                )}
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
                                            🎉 Family discount applied! Save ₹{Math.round(pricing.discount * 91.94).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Summary View */}
                            <div className="checkout-section">
                                <h3 className="section-title">Payment Details</h3>

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
                                        ⓘ Clicking "Proceed to Pay" will open the Razorpay modal. No real money is charged in test mode.
                                    </p>
                                </div>
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                id="checkout-submit-btn"
                                className="checkout-submit-btn"
                                disabled={isProcessing}
                                style={{
                                    background: 'linear-gradient(135deg, #072654 0%, #0f3460 50%, #1a5276 100%)',
                                    boxShadow: '0 8px 24px rgba(15,52,96,0.5)',
                                }}
                            >
                                {isProcessing ? (
                                    <span className="processing-text">
                                        <span className="spinner"></span>
                                        Opening Razorpay...
                                    </span>
                                ) : (
                                    `Proceed to Pay ₹${amountINR.toLocaleString()}`
                                )}
                            </button>

                            <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '12px' }}>
                                🔐 Secured by Razorpay. SSL encrypted & PCI DSS compliant.
                            </p>

                            {/* ── DEV ONLY Simulate Button ─── */}
                            <div style={{ marginTop: '24px', borderTop: '1px dashed #e2e8f0', paddingTop: '20px' }}>
                                <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    🧪 Dev / Testing Only
                                </p>
                                <button
                                    type="button"
                                    id="simulate-payment-btn"
                                    onClick={handleSimulatePayment}
                                    disabled={isProcessing}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        borderRadius: '10px',
                                        border: '2px dashed #f59e0b',
                                        background: 'rgba(245, 158, 11, 0.07)',
                                        color: '#b45309',
                                        fontWeight: '700',
                                        fontSize: '14px',
                                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                                        opacity: isProcessing ? 0.6 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { if (!isProcessing) e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.07)'; }}
                                >
                                    ⚡ Simulate Payment Success
                                </button>
                                <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
                                    Bypasses Razorpay for testing. Does not charge any real money.
                                </p>
                            </div>
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

                {/* Payment Confirmation Modal */}
                {showPaymentConfirmation && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                    }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '40px',
                            maxWidth: '400px',
                            textAlign: 'center',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                            animation: 'slideUp 0.3s ease-out',
                        }}>
                            <div style={{ fontSize: '60px', marginBottom: '16px' }}>✅</div>
                            <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                                Payment Received!
                            </h2>
                            <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '15px', lineHeight: '1.6' }}>
                                Thank you for your enrollment. Our admin team will review your payment and assign a coach to your account shortly.
                            </p>
                            <p style={{ margin: '0 0 24px 0', color: '#94a3b8', fontSize: '13px' }}>
                                Redirecting to your dashboard...
                            </p>
                            <button
                                onClick={() => navigate('/parent', { state: { paymentSuccess: true } })}
                                style={{
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                            >
                                Continue to Dashboard
                            </button>
                            <style>{`
                                @keyframes slideUp {
                                    from {
                                        opacity: 0;
                                        transform: translateY(20px);
                                    }
                                    to {
                                        opacity: 1;
                                        transform: translateY(0);
                                    }
                                }
                            `}</style>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentCheckout;
