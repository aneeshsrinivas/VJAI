import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Download, CreditCard, CheckCircle, Shield, AlertCircle } from 'lucide-react';

const ParentPayments = () => {
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
                        background: 'linear-gradient(135deg, #003366 0%, #0f3460 100%)',
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
                                    CURRENT PLAN
                                </span>
                                <span style={{ color: '#4facfe' }}><Shield size={20} /></span>
                            </div>
                            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Intermediate Batch</h2>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '24px' }}>
                                Next billing date: <strong style={{ color: 'white' }}>Feb 01, 2026</strong>
                            </p>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                                <span style={{ fontSize: '32px', fontWeight: 'bold' }}>₹2,500</span>
                                <span style={{ color: 'rgba(255,255,255,0.6)' }}>/month</span>
                            </div>

                            <Button style={{
                                width: '100%',
                                background: 'white',
                                color: '#003366',
                                fontWeight: '700',
                                border: 'none',
                                padding: '12px'
                            }}>
                                Make Payment Now
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
                                <p style={{ color: '#666', fontSize: '14px', margin: '4px 0 0' }}>Visa ending in 4242</p>
                            </div>
                            <Button variant="ghost" size="sm" style={{ marginLeft: 'auto', color: '#003366' }}>Edit</Button>
                        </div>
                        <div style={{ height: '1px', background: '#f0f0f0', width: '100%', marginBottom: '20px' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ background: '#F0FDF4', padding: '12px', borderRadius: '12px' }}>
                                <CheckCircle size={24} color="#166534" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#003366', margin: 0 }}>Auto-Renewal</h3>
                                <p style={{ color: '#666', fontSize: '14px', margin: '4px 0 0' }}>Enabled</p>
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
                            {[
                                { date: 'Jan 01, 2026', desc: 'Group Intermediate Course Subscription', amount: '₹2,500', status: 'COMPLETED' },
                            ].map((tx, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#fcfcfc'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                                    <td style={{ padding: '16px 24px', color: '#334155', fontWeight: '500' }}>{tx.date}</td>
                                    <td style={{ padding: '16px 24px', color: '#334155' }}>{tx.desc}</td>
                                    <td style={{ padding: '16px 24px', fontWeight: '700', color: '#003366' }}>{tx.amount}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            color: '#166534',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            background: '#DCFCE7',
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
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>
        </div>
    );
};

export default ParentPayments;
