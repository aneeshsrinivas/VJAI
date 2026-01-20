import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast, ToastContainer } from 'react-toastify';
import { TrendingUp, TrendingDown, DollarSign, Users, AlertCircle, CheckCircle, Calendar, X } from 'lucide-react';
import './FinanceReports.css';

const FinanceReports = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingPayments: 0,
        activeStudents: 0,
        avgLTV: 0,
        overdueCount: 0
    });

    // Modal states
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [discountModalOpen, setDiscountModalOpen] = useState(false);
    const [reminderModalOpen, setReminderModalOpen] = useState(false);

    // Form states
    const [invoiceForm, setInvoiceForm] = useState({ studentName: '', amount: '', description: '' });
    const [paymentForm, setPaymentForm] = useState({ subscriptionId: '', amount: '', method: 'UPI' });
    const [discountForm, setDiscountForm] = useState({ subscriptionId: '', discountPercent: '', reason: '' });

    const fetchFinanceData = async () => {
        setLoading(true);
        try {
            const subsSnapshot = await getDocs(collection(db, 'subscriptions'));
            const subs = subsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            let totalRev = 0;
            let pending = 0;
            let overdue = 0;
            let activeCount = 0;

            subs.forEach(sub => {
                if (sub.status === 'ACTIVE') {
                    totalRev += (sub.amount || 0);
                    activeCount++;
                } else if (sub.status === 'PAST_DUE') {
                    pending += (sub.amount || 0);
                    overdue++;
                }
            });

            setStats({
                totalRevenue: totalRev,
                pendingPayments: pending,
                activeStudents: activeCount,
                avgLTV: activeCount > 0 ? Math.round(totalRev / activeCount * 12) : 0,
                overdueCount: overdue
            });

            setSubscriptions(subs);

            // Fetch invoices/transactions
            const invoicesSnapshot = await getDocs(collection(db, 'invoices'));
            const invoicesList = invoicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransactions(invoicesList);

        } catch (error) {
            console.error('Error fetching finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinanceData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (date) => {
        const d = date?.toDate ? date.toDate() : date;
        if (!d) return '-';
        return d?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Generate Invoice Handler
    const handleGenerateInvoice = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'invoices'), {
                studentName: invoiceForm.studentName,
                amount: parseFloat(invoiceForm.amount),
                description: invoiceForm.description,
                status: 'PENDING',
                createdAt: serverTimestamp()
            });
            toast.success('Invoice generated successfully');
            setInvoiceModalOpen(false);
            setInvoiceForm({ studentName: '', amount: '', description: '' });
            fetchFinanceData();
        } catch (error) {
            toast.error('Failed to generate invoice: ' + error.message);
        }
    };

    // Record Payment Handler
    const handleRecordPayment = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'payments'), {
                subscriptionId: paymentForm.subscriptionId,
                amount: parseFloat(paymentForm.amount),
                method: paymentForm.method,
                status: 'COMPLETED',
                paidAt: serverTimestamp(),
                createdAt: serverTimestamp()
            });

            // Update subscription if provided
            if (paymentForm.subscriptionId) {
                const subRef = doc(db, 'subscriptions', paymentForm.subscriptionId);
                await updateDoc(subRef, { status: 'ACTIVE', updatedAt: serverTimestamp() });
            }

            toast.success('Payment recorded successfully');
            setPaymentModalOpen(false);
            setPaymentForm({ subscriptionId: '', amount: '', method: 'UPI' });
            fetchFinanceData();
        } catch (error) {
            toast.error('Failed to record payment: ' + error.message);
        }
    };

    // Apply Discount Handler
    const handleApplyDiscount = async (e) => {
        e.preventDefault();
        try {
            if (!discountForm.subscriptionId) {
                toast.error('Please select a subscription');
                return;
            }

            const subRef = doc(db, 'subscriptions', discountForm.subscriptionId);
            const sub = subscriptions.find(s => s.id === discountForm.subscriptionId);
            const discountAmount = (sub?.amount || 0) * (parseFloat(discountForm.discountPercent) / 100);
            const newAmount = (sub?.amount || 0) - discountAmount;

            await updateDoc(subRef, {
                amount: newAmount,
                discountApplied: parseFloat(discountForm.discountPercent),
                discountReason: discountForm.reason,
                updatedAt: serverTimestamp()
            });

            toast.success(`Discount of ${discountForm.discountPercent}% applied`);
            setDiscountModalOpen(false);
            setDiscountForm({ subscriptionId: '', discountPercent: '', reason: '' });
            fetchFinanceData();
        } catch (error) {
            toast.error('Failed to apply discount: ' + error.message);
        }
    };

    // Send Reminders Handler
    const handleSendReminders = async () => {
        try {
            const overdueList = subscriptions.filter(s => s.status === 'PAST_DUE');

            for (const sub of overdueList) {
                await addDoc(collection(db, 'notifications'), {
                    type: 'PAYMENT_REMINDER',
                    subscriptionId: sub.id,
                    accountId: sub.accountId,
                    message: `Payment reminder for subscription. Amount due: Rs. ${sub.amount}`,
                    status: 'SENT',
                    sentAt: serverTimestamp(),
                    createdAt: serverTimestamp()
                });
            }

            toast.success(`Sent ${overdueList.length} payment reminders`);
            setReminderModalOpen(false);
        } catch (error) {
            toast.error('Failed to send reminders: ' + error.message);
        }
    };

    return (
        <div className="finance-dashboard">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="finance-header">
                <div>
                    <h1 className="finance-title">Financial Overview</h1>
                    <p className="finance-subtitle">Revenue Analytics and Payment Tracking</p>
                </div>
                <div className="finance-header-actions">
                    <Button variant="outline">
                        <Calendar size={16} style={{ marginRight: 8 }} />
                        Current Period
                    </Button>
                    <Button onClick={() => setInvoiceModalOpen(true)}>
                        Generate Invoice
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card stat-primary">
                    <div className="stat-icon-wrapper primary">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Revenue</span>
                        <span className="stat-value">{formatCurrency(stats.totalRevenue)}</span>
                        <div className="stat-trend neutral">
                            <span>From active subscriptions</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card stat-warning">
                    <div className="stat-icon-wrapper warning">
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Pending Payments</span>
                        <span className="stat-value">{formatCurrency(stats.pendingPayments)}</span>
                        <div className="stat-trend warning">
                            <span>{stats.overdueCount} invoices overdue</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper success">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Active Students</span>
                        <span className="stat-value">{stats.activeStudents}</span>
                        <div className="stat-trend neutral">
                            <span>Currently enrolled</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper info">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Avg. Student LTV</span>
                        <span className="stat-value">{formatCurrency(stats.avgLTV)}</span>
                        <div className="stat-trend neutral">
                            <span>12 month projection</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="transactions-section" style={{ marginTop: '24px' }}>
                <div className="section-header">
                    <h3>Recent Invoices</h3>
                    <span style={{ fontSize: '14px', color: '#666' }}>{transactions.length} total</span>
                </div>
                <div className="transactions-list">
                    {loading ? (
                        <div className="loading-state">Loading financial data...</div>
                    ) : transactions.length === 0 ? (
                        <div className="loading-state">No invoices yet. Generate your first invoice to get started.</div>
                    ) : (
                        transactions.slice(0, 10).map((tx) => (
                            <div key={tx.id} className="transaction-item">
                                <div className="transaction-avatar">
                                    {tx.studentName?.charAt(0)?.toUpperCase() || 'I'}
                                </div>
                                <div className="transaction-details">
                                    <div className="transaction-name">{tx.studentName}</div>
                                    <div className="transaction-type">{tx.description || 'Invoice'}</div>
                                </div>
                                <div className="transaction-meta">
                                    <div className={`transaction-amount ${tx.status === 'PAID' ? 'paid' : tx.status === 'OVERDUE' ? 'overdue' : 'pending'}`}>
                                        {formatCurrency(tx.amount)}
                                    </div>
                                    <div className="transaction-date">{formatDate(tx.createdAt)}</div>
                                </div>
                                <div className={`transaction-status ${(tx.status || 'pending').toLowerCase()}`}>
                                    {tx.status === 'PAID' && <CheckCircle size={14} />}
                                    {tx.status === 'PENDING' && <AlertCircle size={14} />}
                                    {tx.status || 'PENDING'}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="finance-actions">
                <button className="action-tile" onClick={() => setInvoiceModalOpen(true)}>
                    <div className="action-tile-icon">
                        <DollarSign size={20} />
                    </div>
                    <span>Generate Invoice</span>
                </button>
                <button className="action-tile" onClick={() => setReminderModalOpen(true)}>
                    <div className="action-tile-icon">
                        <AlertCircle size={20} />
                    </div>
                    <span>Send Reminders</span>
                </button>
                <button className="action-tile" onClick={() => setDiscountModalOpen(true)}>
                    <div className="action-tile-icon">
                        <TrendingDown size={20} />
                    </div>
                    <span>Apply Discount</span>
                </button>
                <button className="action-tile" onClick={() => setPaymentModalOpen(true)}>
                    <div className="action-tile-icon">
                        <CheckCircle size={20} />
                    </div>
                    <span>Record Payment</span>
                </button>
            </div>

            {/* Generate Invoice Modal */}
            {invoiceModalOpen && (
                <div className="modal-overlay" onClick={() => setInvoiceModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <button className="modal-close" onClick={() => setInvoiceModalOpen(false)}><X size={20} /></button>
                        <h2 style={{ marginBottom: '20px' }}>Generate Invoice</h2>
                        <form onSubmit={handleGenerateInvoice}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Student Name</label>
                                <Input
                                    value={invoiceForm.studentName}
                                    onChange={e => setInvoiceForm({ ...invoiceForm, studentName: e.target.value })}
                                    placeholder="Enter student name"
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Amount (Rs.)</label>
                                <Input
                                    type="number"
                                    value={invoiceForm.amount}
                                    onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                                    placeholder="Enter amount"
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Description</label>
                                <Input
                                    value={invoiceForm.description}
                                    onChange={e => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                                    placeholder="Monthly Fee, Tournament Fee, etc."
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <Button type="button" variant="secondary" onClick={() => setInvoiceModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Generate Invoice</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Record Payment Modal */}
            {paymentModalOpen && (
                <div className="modal-overlay" onClick={() => setPaymentModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <button className="modal-close" onClick={() => setPaymentModalOpen(false)}><X size={20} /></button>
                        <h2 style={{ marginBottom: '20px' }}>Record Payment</h2>
                        <form onSubmit={handleRecordPayment}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Subscription (Optional)</label>
                                <select
                                    value={paymentForm.subscriptionId}
                                    onChange={e => setPaymentForm({ ...paymentForm, subscriptionId: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                >
                                    <option value="">-- Select Subscription --</option>
                                    {subscriptions.map(sub => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.studentId || sub.accountId} - Rs. {sub.amount}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Amount (Rs.)</label>
                                <Input
                                    type="number"
                                    value={paymentForm.amount}
                                    onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    placeholder="Enter payment amount"
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Payment Method</label>
                                <select
                                    value={paymentForm.method}
                                    onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                >
                                    <option value="UPI">UPI</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Card">Card</option>
                                    <option value="Cash">Cash</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <Button type="button" variant="secondary" onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Record Payment</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Apply Discount Modal */}
            {discountModalOpen && (
                <div className="modal-overlay" onClick={() => setDiscountModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <button className="modal-close" onClick={() => setDiscountModalOpen(false)}><X size={20} /></button>
                        <h2 style={{ marginBottom: '20px' }}>Apply Discount</h2>
                        <form onSubmit={handleApplyDiscount}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Select Subscription</label>
                                <select
                                    value={discountForm.subscriptionId}
                                    onChange={e => setDiscountForm({ ...discountForm, subscriptionId: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    required
                                >
                                    <option value="">-- Select Subscription --</option>
                                    {subscriptions.map(sub => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.studentId || sub.accountId} - Rs. {sub.amount}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Discount Percentage (%)</label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={discountForm.discountPercent}
                                    onChange={e => setDiscountForm({ ...discountForm, discountPercent: e.target.value })}
                                    placeholder="e.g., 10"
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Reason</label>
                                <Input
                                    value={discountForm.reason}
                                    onChange={e => setDiscountForm({ ...discountForm, reason: e.target.value })}
                                    placeholder="Early bird, referral, loyalty, etc."
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <Button type="button" variant="secondary" onClick={() => setDiscountModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Apply Discount</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Send Reminders Modal */}
            {reminderModalOpen && (
                <div className="modal-overlay" onClick={() => setReminderModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <button className="modal-close" onClick={() => setReminderModalOpen(false)}><X size={20} /></button>
                        <h2 style={{ marginBottom: '20px' }}>Send Payment Reminders</h2>
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#666' }}>
                                This will send payment reminders to all accounts with overdue payments.
                            </p>
                            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#FEF3C7', borderRadius: '8px' }}>
                                <strong>{stats.overdueCount}</strong> overdue subscriptions will receive reminders.
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <Button type="button" variant="secondary" onClick={() => setReminderModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSendReminders}>Send {stats.overdueCount} Reminders</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceReports;
