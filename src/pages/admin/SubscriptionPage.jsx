import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { toast, ToastContainer } from 'react-toastify';
import { Plus, X, Users, CreditCard, Trash2 } from 'lucide-react';


const SubscriptionPage = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        studentName: '',
        parentEmail: '',
        planId: 'ONE_ON_ONE_BEGINNER',
        amount: 60,
        billingCycle: 'MONTHLY',
        status: 'ACTIVE'
    });
    const [confirmDialog, setConfirmDialog] = useState(null);


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
                const snapshot = await getDocs(collection(db, 'users'));
                const studentList = snapshot.docs
                    .filter(d => ['customer', 'CUSTOMER'].includes(d.data().role))
                    .map(doc => ({ id: doc.id, ...doc.data() }));
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

    const handleDeleteSubscription = (subscription) => {
        setConfirmDialog({
            title: 'Delete Subscription',
            message: `Are you sure you want to delete the subscription for ${subscription.studentName}? This will reset associated analytics.`,
            confirmLabel: 'Delete',
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'subscriptions', subscription.id));
                    toast.success('Subscription deleted successfully');
                } catch (error) {
                    console.error('Error deleting subscription:', error);
                    toast.error('Failed to delete subscription');
                }
                setConfirmDialog(null);
            }
        });
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
                planId: 'ONE_ON_ONE_BEGINNER',
                amount: 60,
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
        { id: 'ONE_ON_ONE_BEGINNER', name: 'Group Beginner Training - Monthly', amount: 60 },
        { id: 'ONE_ON_ONE_INTERMEDIATE', name: 'Group Intermediate Training - Monthly', amount: 70 },
    ];

    const handlePlanChange = (planId) => {
        const plan = planOptions.find(p => p.id === planId);
        setFormData({
            ...formData,
            planId: planId,
            amount: plan?.amount || 60,
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
                    <p className="sub-text" style={{ margin: '4px 0 0' }}>Manage student plans, billing cycles, and payment statuses.</p>
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
                    <div className="sub-text" style={{ padding: '40px', textAlign: 'center' }}>
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
                                        <div className="sub-text" style={{ fontSize: '12px' }}>{sub.parentEmail || ''}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>{sub.planId || '-'}</td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: '600' }}>${sub.amount || 0}</div>
                                        <div className="sub-text" style={{ fontSize: '12px' }}>{sub.billingCycle || '-'}</div>
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
                                            {sub.status === 'CANCELLED' && (
                                                <Button size="sm" variant="ghost" onClick={() => handleDeleteSubscription(sub)} style={{ color: '#DC2626' }}>
                                                    <Trash2 size={16} />
                                                </Button>
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
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" style={{ borderRadius: '12px', padding: '24px', width: '500px', maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
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
                                            {plan.name} - ${plan.amount}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Amount ($)</label>
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
            {/* Confirmation Dialog */}
            {confirmDialog && (
                <ConfirmDialog
                    isOpen={!!confirmDialog}
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    confirmLabel={confirmDialog.confirmLabel}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}
        </div>
    );
};

export default SubscriptionPage;
