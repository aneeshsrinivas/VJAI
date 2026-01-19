import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AccountDropdown from '../components/ui/AccountDropdown';
import DemoOutcomeModal from '../components/features/DemoOutcomeModal';
import DemoSuccessPredictor from '../components/features/hackathon/DemoSuccessPredictor';
import BatchOptimizer from '../components/features/hackathon/BatchOptimizer';
import EngagementMonitor from '../components/features/hackathon/EngagementMonitor';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { userData } = useAuth();
    const [showDemoModal, setShowDemoModal] = useState(false);
    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="welcome-text">Command Center</h1>
                    <p className="sub-text">Academy Operations Overview</p>
                </div>
                <AccountDropdown
                    userName={userData?.fullName || "System Admin"}
                    userRole="Administrator"
                    customIcon={<ShieldCheck size={20} color="white" />}
                />
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
                                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/analytics')} style={{ marginTop: '8px', width: '100%' }}>View Detailed Report →</Button>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Column 2: Deep Analytics & Optimization */}
                <div className="col-4">
                    <EngagementMonitor />
                    <div style={{ marginTop: '24px' }}>
                        <Card title="Coach Performance Leaderboard">
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                                    <span>Ramesh Babu</span>
                                    <span style={{ color: 'var(--color-olive-green)', fontWeight: 'bold' }}>4.9 ★</span>
                                </li>
                                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                                    <span>Sarah Jones</span>
                                    <span style={{ color: 'var(--color-olive-green)', fontWeight: 'bold' }}>4.8 ★</span>
                                </li>
                                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                    <span>Vikram Singh</span>
                                    <span style={{ color: '#EAB308', fontWeight: 'bold' }}>4.5 ★</span>
                                </li>
                            </ul>
                        </Card>
                    </div>
                </div>

                {/* Column 3: Quick Actions & Health */}
                <div className="col-4">
                    <Card title="Admin Efficiency">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                            <span>Avg Response Time</span>
                            <strong>14 mins</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span>Demo Conversion Rate</span>
                            <strong style={{ color: 'var(--color-olive-green)' }}>68%</strong>
                        </div>
                    </Card>

                    <div style={{ marginTop: '24px' }}>
                        <Card title="Quick Actions">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                                <Button onClick={() => setShowDemoModal(true)}>Create New Demo</Button>
                                <Button variant="secondary" onClick={() => navigate('/admin/broadcast')}>Broadcast Message</Button>
                                <Button variant="ghost" onClick={() => alert('Exporting Data to CSV...')}>Export All Data</Button>
                            </div>
                        </Card>
                    </div>

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
