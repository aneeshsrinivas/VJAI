import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Download, CreditCard, CheckCircle } from 'lucide-react';

const ParentPayments = () => {
    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '24px', color: 'var(--color-deep-blue)' }}>Payment & Subscription History</h1>

            <Card style={{ marginBottom: '32px' }}>
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F0F9FF', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Subscription Status</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-deep-blue)' }}>Intermediate Batch</span>
                            <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>ACTIVE</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Next Bill: <strong>Feb 01, 2026</strong></div>
                    </div>
                    <Button>Pay ₹2,500 Now</Button>
                </div>

                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Transaction History</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', color: '#666', borderBottom: '2px solid #eee' }}>
                            <th style={{ padding: '12px' }}>Date</th>
                            <th style={{ padding: '12px' }}>Description</th>
                            <th style={{ padding: '12px' }}>Amount</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Receipt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { date: 'Jan 01, 2026', desc: 'Monthly Fee - Intermediate', amount: '₹2,500', status: 'COMPLETED' },
                            { date: 'Dec 01, 2025', desc: 'Monthly Fee - Intermediate', amount: '₹2,500', status: 'COMPLETED' },
                        ].map((tx, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '12px' }}>{tx.date}</td>
                                <td style={{ padding: '12px' }}>{tx.desc}</td>
                                <td style={{ padding: '12px', fontWeight: 'bold' }}>{tx.amount}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-olive-green)', fontSize: '14px' }}>
                                        <CheckCircle size={14} /> {tx.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <Button variant="ghost" size="sm" onClick={() => alert('Download Receipt Logic Triggered')}>
                                        <Download size={16} /> PDF
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default ParentPayments;
