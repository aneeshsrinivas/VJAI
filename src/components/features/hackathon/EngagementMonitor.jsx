import React from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

const EngagementMonitor = () => {
    return (
        <Card className="animate-fade-in" style={{ borderColor: '#D32F2F', borderWidth: '1px', borderStyle: 'solid' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#D32F2F' }}>🚨 High Risk Alert: Sharma Family</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ position: 'relative', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="#eee" strokeWidth="4" fill="none" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" stroke="#D32F2F" strokeWidth="4" fill="none" strokeDasharray="28, 100" />
                    </svg>
                    <div style={{ position: 'absolute', fontSize: '14px', fontWeight: 'bold', color: '#D32F2F' }}>28</div>
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Engagement Score</div>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#D32F2F' }}>CRITICAL LEVEL</div>
                </div>
            </div>

            <div style={{ fontSize: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: '#D32F2F' }}>
                    <span>🔴</span> Missed last 2 classes
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: '#D32F2F' }}>
                    <span>🔴</span> No chat activity (14d)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: '#F9A825' }}>
                    <span>🟡</span> Payment delayed (3d)
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Button size="sm" style={{ width: '100%', backgroundColor: '#D32F2F' }}>⚡ Schedule Coach Check-in</Button>
                <Button variant="secondary" size="sm" style={{ width: '100%' }}>Send "Missed You" Email</Button>
            </div>
        </Card>
    );
};

export default EngagementMonitor;
