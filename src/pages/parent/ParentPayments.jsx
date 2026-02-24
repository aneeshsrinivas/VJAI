import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Download, CreditCard, CheckCircle, Shield, AlertCircle, Loader } from 'lucide-react';

const ParentPayments = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState(null);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("user payment page with email: ", currentUser); 
        const fetchData = async () => {
            if (!currentUser?.email) {
                setLoading(false);
                return;
            }

            try {
                console.log('Fetching data for user email:', currentUser.email);

                // Step 1: Fetch ALL subscriptions and filter by parentEmail matching user's email
                const allSubsSnapshot = await getDocs(collection(db, 'subscriptions'));
                const allSubs = allSubsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    nextDueAt: doc.data().nextDueAt?.toDate?.() || null
                }));
                
                console.log('All subscriptions:', allSubs);
                
                // Find subscription matching user's email
                const userSubscription = allSubs.find(sub => 
                    sub.parentEmail?.toLowerCase() === currentUser.email?.toLowerCase()
                );
                
                console.log('Found user subscription:', userSubscription);

                if (userSubscription) {
                    setSubscription(userSubscription);

                    // Step 2: Fetch the plan details using planId
                    if (userSubscription.planId) {
                        // Try to fetch from subscriptionPlans collection
                        const planDoc = await getDoc(doc(db, 'subscriptionPlans', userSubscription.planId));
                        if (planDoc.exists()) {
                            setCurrentPlan({
                                id: planDoc.id,
                                ...planDoc.data()
                            });
                            console.log('Found plan:', planDoc.data());
                        } else {
                            // Plan might be stored by planId field, search for it
                            const plansSnapshot = await getDocs(collection(db, 'subscriptionPlans'));
                            const matchingPlan = plansSnapshot.docs.find(d => 
                                d.data().planId === userSubscription.planId || d.id === userSubscription.planId
                            );
                            if (matchingPlan) {
                                setCurrentPlan({
                                    id: matchingPlan.id,
                                    ...matchingPlan.data()
                                });
                            }
                        }
                    }
                }

                // Step 3: Fetch ALL payments and filter by parentEmail
                const allPaymentsSnapshot = await getDocs(collection(db, 'payments'));
                const allPayments = allPaymentsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().createdAt?.toDate?.()
                }));
                
                // Filter payments matching user's email
                const userPayments = allPayments.filter(payment => 
                    payment.parentEmail?.toLowerCase() === currentUser.email?.toLowerCase()
                );
                
                console.log('User payments:', userPayments);
                setTransactions(userPayments);

            } catch (error) {
                console.error('Error fetching payment data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser?.uid]);

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fc' }}>
                <Loader size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #f8f9fc 0%, #f0f2f5 100%)',
            padding: '40px 24px',
            fontFamily: "'Figtree', sans-serif"
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '800',
                        color: '#003366',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            borderRadius: '12px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <CreditCard size={24} color="white" />
                        </span>
                        Payments & Subscription
                    </h1>
                    <p style={{ color: '#666', fontSize: '16px', marginLeft: '54px' }}>
                        Manage your subscription plan, billing details, and view payment history.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px', marginBottom: '32px' }}>
                    {/* Subscription Status Card */}
                    <Card style={{
                        border: 'none',
                        borderRadius: '20px',
                        padding: '0',
                        overflow: 'hidden',
                        background: subscription ? 'linear-gradient(135deg, #003366 0%, #0f3460 100%)' : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                        color: 'white',
                        boxShadow: '0 10px 30px rgba(0, 51, 102, 0.3)'
                    }}>
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <span style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}>
                                    {subscription ? 'CURRENT PLAN' : 'NO ACTIVE PLAN'}
                                </span>
                                <span style={{ color: '#4facfe' }}><Shield size={20} /></span>
                            </div>
                            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
                                {currentPlan?.name || subscription?.planName || subscription?.planId || 'No Subscription'}
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '24px' }}>
                                {subscription?.nextDueAt ? (
                                    <>Next billing date: <strong style={{ color: 'white' }}>{formatDate(subscription.nextDueAt)}</strong></>
                                ) : subscription ? (
                                    <>Student: <strong style={{ color: 'white' }}>{subscription.studentName}</strong></>
                                ) : (
                                    'Subscribe to a plan to get started'
                                )}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                                <span style={{ fontSize: '32px', fontWeight: 'bold' }}>
                                    {currentPlan?.price 
                                        ? `$${currentPlan.price.toLocaleString()}` 
                                        : subscription?.amount 
                                        ? `₹${subscription.amount.toLocaleString()}` 
                                        : '—'}
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                                    /{currentPlan?.billingCycle?.toLowerCase() || subscription?.billingCycle?.toLowerCase() || 'month'}
                                </span>
                            </div>

                            {/* Show plan features if available */}
                            {currentPlan?.features && currentPlan.features.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    {currentPlan.features.slice(0, 3).map((feature, idx) => (
                                        <div key={idx} style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '8px', 
                                            fontSize: '13px',
                                            color: 'rgba(255,255,255,0.8)',
                                            marginBottom: '6px'
                                        }}>
                                            <CheckCircle size={14} color="#4ade80" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Button style={{
                                width: '100%',
                                background: 'white',
                                color: '#003366',
                                fontWeight: '700',
                                border: 'none',
                                padding: '12px'
                            }}>
                                {subscription ? 'Make Payment Now' : 'Browse Plans'}
                            </Button>
                        </div>
                    </Card>

                    {/* Quick Stats or Promo */}
                    <Card style={{
                        border: 'none',
                        borderRadius: '20px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        background: 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ background: '#FFF7ED', padding: '12px', borderRadius: '12px' }}>
                                <AlertCircle size={24} color="#FC8A24" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#003366', margin: 0 }}>Payment Method</h3>
                                <p style={{ color: '#666', fontSize: '14px', margin: '4px 0 0' }}>
                                    {subscription?.paymentMethod === 'card' 
                                        ? `Card ending in ${subscription?.cardLast4 || '****'}`
                                        : subscription?.paymentMethod === 'upi'
                                        ? 'UPI Payment'
                                        : 'No payment method saved'}
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" style={{ marginLeft: 'auto', color: '#003366' }}>Edit</Button>
                        </div>
                        <div style={{ height: '1px', background: '#f0f0f0', width: '100%', marginBottom: '20px' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ background: subscription?.autoRenewal !== false ? '#F0FDF4' : '#FEF3C7', padding: '12px', borderRadius: '12px' }}>
                                <CheckCircle size={24} color={subscription?.autoRenewal !== false ? '#166534' : '#92400E'} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#003366', margin: 0 }}>Auto-Renewal</h3>
                                <p style={{ color: '#666', fontSize: '14px', margin: '4px 0 0' }}>
                                    {subscription?.autoRenewal !== false ? 'Enabled' : 'Disabled'}
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" style={{ marginLeft: 'auto', color: '#003366' }}>Manage</Button>
                        </div>
                    </Card>
                </div>

                <Card className="transaction-history" style={{
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    padding: '0',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #f0f0f0' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#003366', margin: 0 }}>Transaction History</h3>
                    </div>
                    {transactions.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                            <p>No transactions yet</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8f9fc' }}>
                                <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Date</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Description</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Amount</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Status</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => {
                                    const statusStyles = {
                                        'COMPLETED': { bg: '#DCFCE7', color: '#166534' },
                                        'PENDING': { bg: '#FEF3C7', color: '#92400E' },
                                        'FAILED': { bg: '#FEE2E2', color: '#991B1B' },
                                        'REFUNDED': { bg: '#F3F4F6', color: '#374151' }
                                    };
                                    const style = statusStyles[tx.status] || statusStyles['PENDING'];
                                    
                                    return (
                                        <tr key={tx.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#fcfcfc'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                                            <td style={{ padding: '16px 24px', color: '#334155', fontWeight: '500' }}>{formatDate(tx.date)}</td>
                                            <td style={{ padding: '16px 24px', color: '#334155' }}>{tx.description || tx.planName || 'Subscription Payment'}</td>
                                            <td style={{ padding: '16px 24px', fontWeight: '700', color: '#003366' }}>₹{tx.amount?.toLocaleString() || '0'}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    color: style.color,
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    background: style.bg,
                                                    padding: '4px 10px',
                                                    borderRadius: '20px'
                                                }}>
                                                    <CheckCircle size={12} /> {tx.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <Button variant="ghost" size="sm" style={{ color: '#64748b' }} onClick={() => alert('Download Receipt Logic Triggered')}>
                                                    <Download size={16} style={{ marginRight: '6px' }} /> PDF
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ParentPayments;
