import React from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

const PricingOptimizer = () => {
    return (
        <Card className="rangoli-border-top animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-deep-blue)' }}>💰 Revenue Maximization Assistant</h3>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#F3E5F5', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', color: '#6A1B9A' }}>Opportunity: Sharma Family</div>
                    <div style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#E1BEE7', color: '#4A148C', borderRadius: '12px' }}>Score: 82/100</div>
                </div>

                <div style={{ fontSize: '12px', color: '#4A148C', marginBottom: '12px' }}>
                    <div>✅ Always pays 5 days early</div>
                    <div>✅ Lives in premium locality (Indiranagar)</div>
                    <div>✅ High engagement (Daily chat)</div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #CE93D8' }}>
                    <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Suggested Action</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', margin: '4px 0' }}>Offer Advanced 1-1 Package (₹12,000)</div>
                    <div style={{ fontSize: '12px', color: '#2E7D32' }}>Potential Lift: +₹7,500/month</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <Button size="sm" style={{ width: '100%', backgroundColor: '#6A1B9A' }}>Send Offer</Button>
                <Button variant="ghost" size="sm" style={{ width: '100%' }}>Ignore</Button>
            </div>
        </Card>
    );
};

export default PricingOptimizer;
