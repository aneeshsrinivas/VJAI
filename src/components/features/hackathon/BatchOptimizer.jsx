import React from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

const BatchOptimizer = () => {
    return (
        <Card className="rangoli-border-top animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-deep-blue)' }}>⚡ Smart Batch Optimizer</h3>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#FFEBEE', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#D32F2F', marginBottom: '4px' }}>⚠️ Issue Detected</div>
                <p style={{ margin: 0, fontSize: '13px', color: '#B71C1C' }}>Intermediate B2 has high rating variance (1400 - 1800). 30% frustration risk.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ padding: '8px', border: '1px solid #C8E6C9', borderRadius: '6px', backgroundColor: '#F1F8E9' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#2E7D32' }}>Suggestion A: Split B2-Elite (1700+)</div>
                    <div style={{ fontSize: '11px', color: '#558B2F' }}>Coach: Ramesh • Students: Arjun, Priya +1</div>
                </div>
                <div style={{ padding: '8px', border: '1px solid #FFE0B2', borderRadius: '6px', backgroundColor: '#FFF3E0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#EF6C00' }}>Suggestion B: Standard B2 (1400-1600)</div>
                    <div style={{ fontSize: '11px', color: '#F57C00' }}>Coach: Suhani • Students: Ananya, Vihaan +3</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <Button size="sm" style={{ width: '100%', fontSize: '12px' }}>Apply Split</Button>
                <Button variant="ghost" size="sm" style={{ width: '100%', fontSize: '12px' }}>Dismiss</Button>
            </div>
        </Card>
    );
};

export default BatchOptimizer;
