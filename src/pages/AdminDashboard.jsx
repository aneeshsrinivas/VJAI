import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DemoOutcomeModal from '../components/features/DemoOutcomeModal';
import DemoSuccessPredictor from '../components/features/hackathon/DemoSuccessPredictor';
import BatchOptimizer from '../components/features/hackathon/BatchOptimizer';
import EngagementMonitor from '../components/features/hackathon/EngagementMonitor';
import './Dashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [showDemoModal, setShowDemoModal] = useState(false);
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="welcome-text">Command Center</h1>
                <p className="sub-text">Academy Operations Overview</p>
            </div>

            <div className="dashboard-grid">
                {/* Column 1: Live Operations & Predictions */}
                <div className="col-4">
                    <DemoSuccessPredictor />
                    <div style={{ marginTop: '24px' }}>
                        <Card title="Funnel Analytics">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span>Demos Booked</span>
                                    <span style={{ fontWeight: 'bold' }}>12</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span>Demos Conversion</span>
                                    <span style={{ fontWeight: 'bold', color: 'var(--color-olive-green)' }}>25%</span>
                                </div>
                                <div style={{ height: '4px', backgroundColor: '#eee', borderRadius: '2px', marginTop: '8px' }}>
                                    <div style={{ height: '100%', width: '68%', backgroundColor: 'var(--color-deep-blue)', borderRadius: '2px' }}></div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Column 2: Deep Analytics & Optimization */}
                <div className="col-4">
                    <EngagementMonitor />
                    <div style={{ marginTop: '24px' }}>
                        <BatchOptimizer />
                    </div>
                </div>

                {/* Column 3: Quick Actions & Health */}
                <div className="col-4">
                    <Card title="Quick Actions">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                            <Button onClick={() => setShowDemoModal(true)}>Create New Demo</Button>
                            <Button variant="secondary" onClick={() => navigate('/admin/students')}>Broadcast Message UI</Button>
                            <Button variant="ghost" onClick={() => navigate('/admin/finances')}>Generate Finance Report</Button>
                        </div>
                    </Card>

                    <div style={{ marginTop: '24px' }}>
                        <Card title="System Health" className="bg-chess-pattern">
                            <div style={{ fontSize: '12px', color: 'var(--color-olive-green)', fontWeight: 'bold' }}>● All Systems Operational</div>
                            <p style={{ fontSize: '12px', color: '#666', margin: '8px 0 0 0' }}>Last backup: 2 mins ago</p>
                        </Card>
                    </div>
                </div>
            </div>

            <DemoOutcomeModal
                isOpen={showDemoModal}
                onClose={() => setShowDemoModal(false)}
                studentName="New Prospect"
            />
        </div>
    );
};

export default AdminDashboard;
