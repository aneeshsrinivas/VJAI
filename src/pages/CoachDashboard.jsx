import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import './Dashboard.css';

const CoachDashboard = () => {
    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="welcome-text">Coach Ramesh</h1>
                    <p className="sub-text">Senior Coach • Rating 2450</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Button variant="secondary">Block Schedule</Button>
                    <Button>Create Batch</Button>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Today's Schedule */}
                <div className="col-8">
                    <Card title="Today's Classes">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                            {[
                                { time: '5:00 PM', batch: 'Intermediate B2', type: 'Group', action: 'Join' },
                                { time: '6:30 PM', batch: 'Advanced A1', type: 'Group', action: 'Join' },
                                { time: '8:00 PM', batch: 'Aditya (Private)', type: '1:1', action: 'Join' }
                            ].map((cls, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px', borderLeft: '4px solid var(--color-warm-orange)' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', color: 'var(--color-deep-blue)' }}>{cls.time}</div>
                                        <div style={{ fontSize: '14px' }}>{cls.batch} <span style={{ color: '#999', fontSize: '12px' }}>• {cls.type}</span></div>
                                    </div>
                                    <Button size="sm">{cls.action}</Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Pending Actions / Demos */}
                <div className="col-4">
                    <Card title="Upcoming Demos">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                            <div style={{ padding: '12px', border: '1px solid #eee', borderRadius: '8px' }}>
                                <div style={{ fontWeight: '600' }}>Rohan Gupta</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Beginner • Tomorrow, 4 PM</div>
                            </div>
                            <div style={{ padding: '12px', border: '1px solid #eee', borderRadius: '8px' }}>
                                <div style={{ fontWeight: '600' }}>Sara K.</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Intermediate • Sat, 11 AM</div>
                            </div>
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <Button variant="ghost" style={{ width: '100%' }}>View Calendar</Button>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="col-12">
                    <Card title="My Batches">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
                            {['Intermediate B2', 'Beginner A4', 'Advanced C1'].map(batch => (
                                <div key={batch} style={{ padding: '16px', border: '1px solid #eee', borderRadius: '12px' }}>
                                    <h4 style={{ margin: '0 0 8px 0' }}>{batch}</h4>
                                    <p style={{ fontSize: '12px', margin: 0 }}>8 Students • 3 Active Chats</p>
                                    <div style={{ marginTop: '12px' }}>
                                        <Button variant="secondary" style={{ fontSize: '12px', padding: '8px 16px' }}>Batch Chat</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CoachDashboard;
