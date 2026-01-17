import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PricingOptimizer from '../../components/features/hackathon/PricingOptimizer';
import '../../pages/Dashboard.css';

const FinanceReports = () => {
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="welcome-text">Financial Overview</h1>
                <p className="sub-text">Revenue Analysis - January 2026</p>
            </div>

            <div className="dashboard-grid">
                <div className="col-4">
                    <Card>
                        <div style={{ color: '#666', fontSize: '14px' }}>Total Revenue</div>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-deep-blue)', margin: '8px 0' }}>₹ 12,45,000</div>
                        <div style={{ color: 'var(--color-olive-green)', fontSize: '12px', fontWeight: '600' }}>+12% vs last month</div>
                    </Card>
                </div>
                <div className="col-4">
                    <Card>
                        <div style={{ color: '#666', fontSize: '14px' }}>Pending Payments</div>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-warm-orange)', margin: '8px 0' }}>₹ 85,000</div>
                        <div style={{ color: '#666', fontSize: '12px' }}>5 invoices overdue</div>
                    </Card>
                </div>
                <div className="col-4">
                    <Card variant="chess">
                        <div style={{ color: '#666', fontSize: '14px' }}>Avg. Student LTV</div>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-deep-blue)', margin: '8px 0' }}>₹ 45,000</div>
                    </Card>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="col-4">
                    <PricingOptimizer />
                </div>
                <div className="col-8">
                    <Card title="Revenue Growth">
                        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '24px' }}>
                            {[40, 55, 45, 70, 65, 85].map((h, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: `${h}%`,
                                        backgroundColor: i === 5 ? 'var(--color-warm-orange)' : 'var(--color-deep-blue)',
                                        borderRadius: '4px 4px 0 0',
                                        opacity: i === 5 ? 1 : 0.7
                                    }}></div>
                                    <span style={{ fontSize: '12px', color: '#999' }}>{['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'][i]}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
                <div className="col-4">
                    {/* Reclaiming space or adding another widget if needed, keeping layout balanced */}
                    <Card title="Recent Transactions">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                            {[
                                { name: 'Sharma Family', amount: '₹ 4,500', date: 'Today, 10:30 AM' },
                                { name: 'Vikram Singh', amount: '₹ 12,000', date: 'Yesterday' },
                                { name: 'Anjali D.', amount: '₹ 4,500', date: 'Yesterday' },
                            ].map((tx, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{tx.name}</div>
                                        <div style={{ fontSize: '12px', color: '#999' }}>Monthly Fee</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', color: 'var(--color-olive-green)' }}>{tx.amount}</div>
                                        <div style={{ fontSize: '10px', color: '#999' }}>{tx.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" style={{ width: '100%', marginTop: '12px' }}>View All Invoices</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default FinanceReports;
