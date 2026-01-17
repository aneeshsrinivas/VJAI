import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import './Dashboard.css';

const ParentDashboard = () => {
    const navigate = useNavigate();
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="welcome-text">Welcome, Sharma Family</h1>
                <p className="sub-text">Your child's progress is on track. Next milestone: Bishop Rank (85%)</p>
            </div>

            <div className="dashboard-grid">
                <div className="col-4">
                    <Card title="Your Coach">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                            <div style={{ fontSize: '48px', color: 'var(--color-deep-blue)' }}>♞</div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>Coach Ramesh</h3>
                                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>FIDE Master • 4.9/5</p>
                            </div>
                        </div>
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
                            <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Contact details are hidden for privacy.</p>
                        </div>
                    </Card>
                </div>

                <div className="col-4">
                    <Card title="Batch Info">
                        <div style={{ marginTop: '16px' }}>
                            <h3 style={{ margin: '0 0 8px 0' }}>Intermediate B2</h3>
                            <p className="stat-label">8 Students • Tue/Thu/Sat</p>
                            <div style={{ marginTop: '16px' }}>
                                <Button
                                    variant="secondary"
                                    style={{ width: '100%' }}
                                    onClick={() => navigate('/parent/assignments')} // Using Assignments as proxy for now or create a Chat placeholder
                                >
                                    View Batch Chat
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-4">
                    <Card variant="chess" title="Next Class">
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-deep-blue)' }}>Today, 5:00 PM</div>
                            <p style={{ color: 'var(--color-olive-green)', fontWeight: '600' }}>Starting in 45 mins</p>
                            <Button
                                className="btn-primary"
                                style={{ width: '100%', marginTop: '8px' }}
                                onClick={() => window.open('https://meet.google.com', '_blank')}
                            >
                                Join Class
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="col-8">
                    <Card title="Weekly Schedule">
                        <div className="schedule-row">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                <div key={day} className="day-slot">
                                    <span className="day-name">{day}</span>
                                    <div className={`chess-dot ${[1, 3, 5].includes(i) ? 'active' : ''}`}></div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
                <div className="col-4">
                    <Card title="Monthly Review">
                        <p style={{ fontSize: '14px', marginBottom: '16px' }}>Request a 1:1 progress review with Coach Ramesh.</p>
                        <Button disabled style={{ width: '100%' }}>Next Available: Feb 1</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
