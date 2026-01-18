import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const SubscriptionPage = () => {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ margin: 0 }}>Subscription Management</h1>
                <Button>+ Add New Plan</Button>
            </div>

            <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', color: '#666' }}>
                            <th style={{ padding: '16px' }}>Student</th>
                            <th style={{ padding: '16px' }}>Plan</th>
                            <th style={{ padding: '16px' }}>Amount</th>
                            <th style={{ padding: '16px' }}>Next Billing</th>
                            <th style={{ padding: '16px' }}>Status</th>
                            <th style={{ padding: '16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { name: 'Arjun Sharma', plan: 'Intermediate Batch', amount: '₹2,500', next: 'Feb 01, 2024', status: 'ACTIVE' },
                            { name: 'Priya Patel', plan: 'Beginner Batch', amount: '₹2,000', next: 'Jan 28, 2024', status: 'OVERDUE' },
                            { name: 'Rohan Gupta', plan: 'Advanced 1:1', amount: '₹8,000', next: 'Feb 15, 2024', status: 'ACTIVE' },
                        ].map((sub, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '16px', fontWeight: 'bold' }}>{sub.name}</td>
                                <td style={{ padding: '16px' }}>{sub.plan}</td>
                                <td style={{ padding: '16px' }}>{sub.amount}/mo</td>
                                <td style={{ padding: '16px' }}>{sub.next}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: sub.status === 'ACTIVE' ? '#DCFCE7' : '#FEE2E2',
                                        color: sub.status === 'ACTIVE' ? '#166534' : '#991B1B'
                                    }}>
                                        {sub.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    {sub.status === 'OVERDUE' ? (
                                        <Button size="sm" style={{ backgroundColor: '#EF4444' }}>Send Reminder</Button>
                                    ) : (
                                        <Button size="sm" variant="outline">Edit</Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default SubscriptionPage;
