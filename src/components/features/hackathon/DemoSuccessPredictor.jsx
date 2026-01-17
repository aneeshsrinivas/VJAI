import React, { useState, useEffect } from 'react';
import Card from '../../ui/Card';

const DemoSuccessPredictor = () => {
    const [prob, setProb] = useState(78);
    const [signals, setSignals] = useState([
        { type: 'positive', text: 'Parent asked pricing (Strong)' },
        { type: 'positive', text: 'Student completed test puzzle (Strong)' },
        { type: 'warning', text: 'No questions about schedule (Weak)' }
    ]);

    // Mock live AI updates
    useEffect(() => {
        const interval = setInterval(() => {
            setProb(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                return Math.min(100, Math.max(0, prev + change));
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="rangoli-border-top animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-deep-blue)' }}>🤖 Live Demo Success Meter</h3>
                <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#E3F2FD', color: '#1565C0', borderRadius: '12px', fontWeight: 'bold' }}>AI ACTIVE</span>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', fontWeight: '600' }}>
                    <span>Conversion Probability</span>
                    <span style={{ color: prob > 70 ? 'var(--color-olive-green)' : 'var(--color-warm-orange)' }}>{prob}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${prob}%`, height: '100%', backgroundColor: prob > 70 ? 'var(--color-olive-green)' : 'var(--color-warm-orange)', transition: 'width 1s ease' }}></div>
                </div>
            </div>

            <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
                <p style={{ fontWeight: '600', marginBottom: '8px' }}>📡 Live Signals Detected:</p>
                {signals.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span>{s.type === 'positive' ? '✅' : '⚠️'}</span>
                        <span>{s.text}</span>
                    </div>
                ))}
            </div>

            <div style={{ padding: '12px', backgroundColor: '#FFF8E1', borderRadius: '8px', borderLeft: '4px solid var(--color-warm-orange)' }}>
                <div style={{ fontSize: '10px', color: '#8D6E63', fontWeight: 'bold', textTransform: 'uppercase' }}>AI Recommendation</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#5D4037' }}>"Offer flexible timing options now to boost scheduling confidence"</div>
            </div>
        </Card>
    );
};

export default DemoSuccessPredictor;
