import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast, ToastContainer } from 'react-toastify';
import { Plus, X, Users, CreditCard } from 'lucide-react';

const SubscriptionPage = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        studentName: '',
        parentEmail: '',
        planId: 'GROUP_MONTHLY',
        amount: 4500,
        billingCycle: 'MONTHLY',
        status: 'ACTIVE'
    });

    // Real-time listener for subscriptions
    useEffect(() => {
        const q = query(collection(db, 'subscriptions'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const subs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                nextDueAt: doc.data().nextDueAt?.toDate?.().toLocaleDateString() || '-'
            }));
            setSubscriptions(subs);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching subscriptions:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Fetch students for dropdown
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'students'));
                const studentList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setStudents(studentList);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };
        fetchStudents();
    }, []);

    const handleStatusChange = async (subId, newStatus) => {
        try {
            const subRef = doc(db, 'subscriptions', subId);
            await updateDoc(subRef, { status: newStatus, updatedAt: serverTimestamp() });
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleAddSubscription = async (e) => {
        e.preventDefault();

        if (!formData.studentName || !formData.parentEmail) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const nextDue = new Date();
            nextDue.setMonth(nextDue.getMonth() + 1);

            await addDoc(collection(db, 'subscriptions'), {
                studentName: formData.studentName,
                parentEmail: formData.parentEmail,
                planId: formData.planId,
                amount: parseFloat(formData.amount),
                billingCycle: formData.billingCycle,
                status: formData.status,
                nextDueAt: nextDue,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            toast.success('Subscription created successfully');
            setShowAddModal(false);
            setFormData({
                studentName: '',
                parentEmail: '',
                planId: 'GROUP_MONTHLY',
                amount: 4500,
                billingCycle: 'MONTHLY',
                status: 'ACTIVE'
            });
        } catch (error) {
            toast.error('Failed to create subscription: ' + error.message);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'ACTIVE': return { bg: '#DCFCE7', color: '#166534' };
            case 'PAST_DUE': return { bg: '#FEE2E2', color: '#991B1B' };
            case 'SUSPENDED': return { bg: '#FEF3C7', color: '#92400E' };
            case 'CANCELLED': return { bg: '#F3F4F6', color: '#374151' };
            default: return { bg: '#eee', color: '#333' };
        }
    };

    const planOptions = [
        { id: 'GROUP_MONTHLY', name: 'Group Class - Monthly', amount: 4500 },
        { id: 'GROUP_QUARTERLY', name: 'Group Class - Quarterly', amount: 12000 },
        { id: 'ONE_ON_ONE_MONTHLY', name: '1:1 Coaching - Monthly', amount: 8000 },
        { id: 'ONE_ON_ONE_QUARTERLY', name: '1:1 Coaching - Quarterly', amount: 21000 },
        { id: 'PREMIUM_MONTHLY', name: 'Premium Package - Monthly', amount: 15000 },
    ];

    const handlePlanChange = (planId) => {
        const plan = planOptions.find(p => p.id === planId);
        setFormData({
            ...formData,
            planId: planId,
            amount: plan?.amount || 4500,
            billingCycle: planId.includes('QUARTERLY') ? 'QUARTERLY' : 'MONTHLY'
        });
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CreditCard size={28} />
                        Subscription Management
                    </h1>
                    <p style={{ color: '#666', margin: '4px 0 0' }}>Manage student plans, billing cycles, and payment statuses.</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus size={16} style={{ marginRight: 8 }} />
                    Add New Plan
                </Button>
            </div>

            <Card>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading subscriptions...</div>
                ) : subscriptions.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                        <Users size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
                        <h3 style={{ margin: '0 0 8px' }}>No Subscriptions Yet</h3>
                        <p style={{ margin: '0 0 16px' }}>Add your first subscription to start managing student plans.</p>
                        <Button onClick={() => setShowAddModal(true)}>
                            <Plus size={16} style={{ marginRight: 8 }} />
                            Add First Subscription
                        </Button>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', color: '#666', textTransform: 'uppercase', fontSize: '12px' }}>
                                <th style={{ padding: '16px' }}>Student</th>
                                <th style={{ padding: '16px' }}>Plan</th>
                                <th style={{ padding: '16px' }}>Amount / Cycle</th>
                                <th style={{ padding: '16px' }}>Next Due</th>
                                <th style={{ padding: '16px' }}>Status</th>
                                <th style={{ padding: '16px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.map(sub => (
                                <tr key={sub.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: '600' }}>{sub.studentName || sub.studentId || 'N/A'}</div>
                                        <div style={{ fontSize: '12px', color: '#888' }}>{sub.parentEmail || ''}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>{sub.planId || '-'}</td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: '600' }}>Rs. {sub.amount || 0}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{sub.billingCycle || '-'}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>{sub.nextDueAt}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            backgroundColor: getStatusStyle(sub.status).bg,
                                            color: getStatusStyle(sub.status).color
                                        }}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {sub.status === 'ACTIVE' && (
                                                <Button size="sm" variant="outline" onClick={() => handleStatusChange(sub.id, 'SUSPENDED')}>Pause</Button>
                                            )}
                                            {sub.status === 'SUSPENDED' && (
                                                <Button size="sm" onClick={() => handleStatusChange(sub.id, 'ACTIVE')}>Resume</Button>
                                            )}
                                            {sub.status !== 'CANCELLED' && (
                                                <Button size="sm" variant="secondary" onClick={() => handleStatusChange(sub.id, 'CANCELLED')}>Cancel</Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>

            {/* Add Subscription Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowAddModal(false)}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '500px', maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Add New Subscription</h3>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleAddSubscription}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Student Name *</label>
                                <Input
                                    value={formData.studentName}
                                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                    placeholder="Enter student name"
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Parent Email *</label>
                                <Input
                                    type="email"
                                    value={formData.parentEmail}
                                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                                    placeholder="parent@email.com"
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Plan *</label>
                                <select
                                    value={formData.planId}
                                    onChange={(e) => handlePlanChange(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                >
                                    {planOptions.map(plan => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name} - Rs. {plan.amount}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Amount (Rs.)</label>
                                    <Input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="SUSPENDED">Suspended</option>
                                        <option value="PAST_DUE">Past Due</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                                <Button type="submit">Create Subscription</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPage;
