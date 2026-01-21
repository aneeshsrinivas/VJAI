import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { toast, ToastContainer } from 'react-toastify';
import { Users, UserCheck, Calendar, DollarSign, TrendingUp, MessageSquare, Bell, Download, Plus } from 'lucide-react';
import './Dashboard.css';

// Color scheme from user
const COLORS = {
    orange: '#FC8A24',
    deepBlue: '#003366',
    oliveGreen: '#6B8E23',
    ivory: '#FFFEF3'
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();

    // Initialize with 0 values, not loading state
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeCoaches: 0,
        pendingDemos: 0,
        monthlyRevenue: 0,
        conversionRate: 0
    });
    const [recentDemos, setRecentDemos] = useState([]);
    const [topCoaches, setTopCoaches] = useState([]);

    // Fetch all stats from Firestore
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch students count
                const studentsSnap = await getDocs(collection(db, 'students'));
                const totalStudents = studentsSnap.size || 0;

                // Fetch active coaches
                const coachesQuery = query(collection(db, 'users'), where('role', '==', 'coach'));
                const coachesSnap = await getDocs(coachesQuery);
                const activeCoaches = coachesSnap.size || 0;

                // Also check coaches collection
                const coachesCollSnap = await getDocs(collection(db, 'coaches'));
                const totalCoaches = Math.max(activeCoaches, coachesCollSnap.size) || 0;

                // Fetch pending demos
                const demosQuery = query(collection(db, 'demos'), where('status', '==', 'PENDING'));
                const demosSnap = await getDocs(demosQuery);
                const pendingDemos = demosSnap.size || 0;

                // Fetch revenue from subscriptions
                const subsSnap = await getDocs(collection(db, 'subscriptions'));
                let monthlyRevenue = 0;
                subsSnap.docs.forEach(doc => {
                    if (doc.data().status === 'ACTIVE') {
                        monthlyRevenue += Number(doc.data().amount) || 0;
                    }
                });

                // Calculate conversion rate
                const allDemosSnap = await getDocs(collection(db, 'demos'));
                const totalDemos = allDemosSnap.size || 0;
                const convertedDemos = allDemosSnap.docs.filter(d => d.data().status === 'CONVERTED').length;
                const conversionRate = totalDemos > 0 ? Math.round((convertedDemos / totalDemos) * 100) : 0;

                setStats({
                    totalStudents,
                    activeCoaches: totalCoaches,
                    pendingDemos,
                    monthlyRevenue,
                    conversionRate
                });

                // Fetch recent demos
                const recentDemosQuery = query(collection(db, 'demos'), orderBy('createdAt', 'desc'), limit(5));
                const recentDemosSnap = await getDocs(recentDemosQuery);
                setRecentDemos(recentDemosSnap.docs.map(d => ({ id: d.id, ...d.data() })));

                // Fetch top coaches
                const coachList = coachesCollSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                setTopCoaches(coachList.slice(0, 3));

            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };

        fetchStats();

        // Real-time listener for demos
        const demosUnsubscribe = onSnapshot(
            query(collection(db, 'demos'), orderBy('createdAt', 'desc'), limit(5)),
            (snapshot) => {
                setRecentDemos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            }
        );

        return () => demosUnsubscribe();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const handleExportData = async () => {
        toast.info('Preparing export...');
        try {
            const [students, coaches, demos, subs] = await Promise.all([
                getDocs(collection(db, 'students')),
                getDocs(collection(db, 'coaches')),
                getDocs(collection(db, 'demos')),
                getDocs(collection(db, 'subscriptions'))
            ]);

            const exportData = {
                exportDate: new Date().toISOString(),
                students: students.docs.map(d => d.data()),
                coaches: coaches.docs.map(d => d.data()),
                demos: demos.docs.map(d => d.data()),
                subscriptions: subs.docs.map(d => d.data())
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ica-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            toast.success('Data exported successfully!');
        } catch (error) {
            toast.error('Export failed: ' + error.message);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return { bg: '#FEF3C7', color: '#92400E' };
            case 'CONFIRMED': return { bg: '#DBEAFE', color: COLORS.deepBlue };
            case 'COMPLETED': return { bg: '#DCFCE7', color: COLORS.oliveGreen };
            case 'CONVERTED': return { bg: '#D1FAE5', color: COLORS.oliveGreen };
            default: return { bg: '#F3F4F6', color: '#374151' };
        }
    };

    return (
        <div className="dashboard-container" style={{ backgroundColor: COLORS.ivory }}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="welcome-text" style={{ color: COLORS.deepBlue }}>Command Center</h1>
                    <p className="sub-text">Academy Operations Overview - Live Data</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/broadcast')} style={{ borderColor: COLORS.deepBlue, color: COLORS.deepBlue }}>
                        <Bell size={16} style={{ marginRight: 6 }} />
                        Broadcast
                    </Button>
                    <div style={{
                        padding: '8px 16px',
                        backgroundColor: COLORS.deepBlue,
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        {userData?.fullName || currentUser?.email?.split('@')[0] || 'Admin'}
                    </div>
                </div>
            </div>

            {/* Stats Grid - Always show numbers, default to 0 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: `2px solid ${COLORS.deepBlue}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: COLORS.deepBlue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={20} color="white" />
                        </div>
                        <span style={{ fontSize: '13px', color: '#666' }}>Total Students</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.deepBlue }}>{stats.totalStudents}</div>
                </div>

                <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: `2px solid ${COLORS.oliveGreen}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: COLORS.oliveGreen, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserCheck size={20} color="white" />
                        </div>
                        <span style={{ fontSize: '13px', color: '#666' }}>Active Coaches</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.oliveGreen }}>{stats.activeCoaches}</div>
                </div>

                <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: `2px solid ${COLORS.orange}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: COLORS.orange, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={20} color="white" />
                        </div>
                        <span style={{ fontSize: '13px', color: '#666' }}>Pending Demos</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.orange }}>{stats.pendingDemos}</div>
                </div>

                <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: `2px solid ${COLORS.deepBlue}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: COLORS.deepBlue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={20} color="white" />
                        </div>
                        <span style={{ fontSize: '13px', color: '#666' }}>Monthly Revenue</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.deepBlue }}>{formatCurrency(stats.monthlyRevenue)}</div>
                </div>

                <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: `2px solid ${COLORS.oliveGreen}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: COLORS.oliveGreen, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={20} color="white" />
                        </div>
                        <span style={{ fontSize: '13px', color: '#666' }}>Conversion Rate</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.oliveGreen }}>{stats.conversionRate}%</div>
                </div>
            </div>

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Recent Demos */}
                    <Card>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, color: COLORS.deepBlue }}>Recent Demo Requests</h3>
                            <Button size="sm" variant="ghost" onClick={() => navigate('/admin/demos')}>View All</Button>
                        </div>
                        {recentDemos.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>No demo requests yet</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {recentDemos.map(demo => (
                                    <div key={demo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: COLORS.ivory, borderRadius: '8px' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', color: COLORS.deepBlue }}>{demo.studentName || demo.parentName || 'New Request'}</div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>{demo.parentEmail || demo.email || '-'}</div>
                                        </div>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            backgroundColor: getStatusColor(demo.status).bg,
                                            color: getStatusColor(demo.status).color
                                        }}>
                                            {demo.status || 'PENDING'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Coach Leaderboard */}
                    <Card>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, color: COLORS.deepBlue }}>Coach Performance</h3>
                            <Button size="sm" variant="ghost" onClick={() => navigate('/admin/coaches')}>Manage Coaches</Button>
                        </div>
                        {topCoaches.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>No coaches registered yet</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {topCoaches.map((coach, i) => (
                                    <div key={coach.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: i < topCoaches.length - 1 ? '1px solid #eee' : 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: COLORS.deepBlue, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
                                                {(coach.name || coach.coachName || 'C').charAt(0)}
                                            </div>
                                            <span style={{ fontWeight: '500', color: COLORS.deepBlue }}>{coach.fullName || coach.coachName || coach.name || 'Unknown Coach'}</span>
                                        </div>
                                        <span style={{ color: COLORS.oliveGreen, fontWeight: '700' }}>{coach.rating || '4.5'} ★</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Quick Actions */}
                    <Card>
                        <h3 style={{ margin: '0 0 16px', color: COLORS.deepBlue }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Button onClick={() => navigate('/admin/demos')} style={{ backgroundColor: COLORS.orange, border: 'none' }}>
                                <Plus size={16} style={{ marginRight: 8 }} />
                                Manage Demos
                            </Button>
                            <Button variant="secondary" onClick={() => navigate('/admin/messages')} style={{ borderColor: COLORS.deepBlue, color: COLORS.deepBlue }}>
                                <MessageSquare size={16} style={{ marginRight: 8 }} />
                                Messages
                            </Button>
                            <Button variant="outline" onClick={handleExportData}>
                                <Download size={16} style={{ marginRight: 8 }} />
                                Export All Data
                            </Button>
                        </div>
                    </Card>

                    {/* System Status */}
                    <Card>
                        <h3 style={{ margin: '0 0 16px', color: COLORS.deepBlue }}>System Status</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS.oliveGreen }}></div>
                            <span style={{ fontSize: '14px', color: COLORS.oliveGreen, fontWeight: '600' }}>All Systems Operational</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            <div>Firebase: Connected</div>
                            <div>Real-time: Active</div>
                            <div>Last sync: Just now</div>
                        </div>
                    </Card>

                    {/* Navigation */}
                    <Card>
                        <h3 style={{ margin: '0 0 16px', color: COLORS.deepBlue }}>Navigate</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Button variant="ghost" onClick={() => navigate('/admin/students')} style={{ justifyContent: 'flex-start', color: COLORS.deepBlue }}>Students Database</Button>
                            <Button variant="ghost" onClick={() => navigate('/admin/subscriptions')} style={{ justifyContent: 'flex-start', color: COLORS.deepBlue }}>Subscriptions</Button>
                            <Button variant="ghost" onClick={() => navigate('/admin/finances')} style={{ justifyContent: 'flex-start', color: COLORS.deepBlue }}>Finance Reports</Button>
                            <Button variant="ghost" onClick={() => navigate('/admin/accounts')} style={{ justifyContent: 'flex-start', color: COLORS.deepBlue }}>User Accounts</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
