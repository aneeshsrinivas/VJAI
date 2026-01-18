import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const SubscriptionPage = () => {
    // Mock Data based on Core Subscription Entity 2.4
    const subscriptions = [
        {
            subscription_id: 'SUB-001',
            account_id: 'ACC-101',
            student_name: 'Arjun Sharma',
            plan_id: 'Intermediate Batch',
            amount: 2500,
            billing_cycle: 'Monthly',
            status: 'ACTIVE',
            next_due_at: '2026-02-01'
        },
        {
            subscription_id: 'SUB-002',
            account_id: 'ACC-102',
            student_name: 'Priya Patel',
            plan_id: 'Beginner Batch',
            amount: 2000,
            billing_cycle: 'Monthly',
            status: 'PAST_DUE',
            next_due_at: '2026-01-28'
        },
        {
            subscription_id: 'SUB-003',
            account_id: 'ACC-103',
            student_name: 'Rohan Gupta',
            plan_id: 'Advanced 1:1',
            amount: 8000,
            billing_cycle: 'Monthly',
            status: 'ACTIVE',
            next_due_at: '2026-02-15'
        },
        {
            subscription_id: 'SUB-004',
            account_id: 'ACC-104',
            student_name: 'Vihaan Verma',
            plan_id: 'Beginner 1:1',
            amount: 6000,
            billing_cycle: 'Monthly',
            status: 'CANCELLED',
            next_due_at: '-'
        },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'ACTIVE': return { bg: '#DCFCE7', color: '#166534' };
            case 'PAST_DUE': return { bg: '#FEE2E2', color: '#991B1B' };
            case 'SUSPENDED': return { bg: '#FEF3C7', color: '#92400E' };
            case 'CANCELLED': return { bg: '#F3F4F6', color: '#374151' };
            default: return { bg: '#eee', color: '#333' };
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Subscription Management</h1>
                    <p style={{ color: '#666', margin: '4px 0 0' }}>Manage student plans, billing cycles, and payment statuses.</p>
                </div>
                <Button onClick={() => alert('ADD PLAN: Opening plan creator...')}>+ Add New Plan</Button>
            </div>

            <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', color: '#666', textTransform: 'uppercase', fontSize: '12px' }}>
                            <th style={{ padding: '16px' }}>Subscription ID / Account</th>
                            <th style={{ padding: '16px' }}>Plan Details</th>
                            <th style={{ padding: '16px' }}>Amount / Cycle</th>
                            <th style={{ padding: '16px' }}>Next Due</th>
                            <th style={{ padding: '16px' }}>Status</th>
                            <th style={{ padding: '16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscriptions.map((sub) => {
                            const statusStyle = getStatusStyle(sub.status);
                            return (
                                <tr key={sub.subscription_id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: 'bold', color: 'var(--color-deep-blue)' }}>{sub.student_name}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{sub.subscription_id} | {sub.account_id}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>{sub.plan_id}</td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: '600' }}>₹{sub.amount.toLocaleString()}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{sub.billing_cycle}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>{sub.next_due_at}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            backgroundColor: statusStyle.bg,
                                            color: statusStyle.color,
                                            letterSpacing: '0.5px'
                                        }}>
                                            {sub.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        {sub.status === 'PAST_DUE' ? (
                                            <Button size="sm" style={{ backgroundColor: '#EF4444' }} onClick={() => alert('Reminder sent!')}>Send Reminder</Button>
                                        ) : sub.status === 'ACTIVE' ? (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <Button size="sm" variant="outline" onClick={() => alert('Subscription PAUSED. Access suspended.')}>Pause</Button>
                                                <Button size="sm" variant="ghost" style={{ color: '#EF4444' }} onClick={() => { if (window.confirm('Are you sure you want to CANCEL this subscription?')) alert('Subscription CANCELLED.'); }}>Cancel</Button>
                                            </div>
                                        ) : sub.status === 'SUSPENDED' ? (
                                            <Button size="sm" onClick={() => alert('Subscription RESUMED.')}>Resume</Button>
                                        ) : (
                                            <span style={{ color: '#999', fontSize: '12px' }}>No Actions (Inactive)</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default SubscriptionPage;
