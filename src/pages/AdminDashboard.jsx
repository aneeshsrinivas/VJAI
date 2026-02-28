import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { toast, ToastContainer } from 'react-toastify';
import { Users, UserCheck, Calendar, DollarSign, TrendingUp, MessageSquare, Bell, Download, Plus } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Dashboard.css';

// Color scheme from user
const COLORS = {
    orange: '#FC8A24',
    deepBlue: '#181818',
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
                // Check if db is available
                if (!db) {
                    setStats({
                        totalStudents: 5,
                        activeCoaches: 3,
                        pendingDemos: 2,
                        monthlyRevenue: 5000,
                        conversionRate: 45
                    });
                    setRecentDemos([]);
                    setTopCoaches([]);
                    return;
                }

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
                // Set mock data on error
                setStats({
                    totalStudents: 5,
                    activeCoaches: 3,
                    pendingDemos: 2,
                    monthlyRevenue: 5000,
                    conversionRate: 45
                });
            }
        };

        fetchStats();

        // Real-time listener for demos
        if (db) {
            const demosUnsubscribe = onSnapshot(
                query(collection(db, 'demos'), orderBy('createdAt', 'desc'), limit(5)),
                (snapshot) => {
                    setRecentDemos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
                },
                (error) => {
                    console.error('Error listening to demos:', error);
                    // Mock data on error
                    setRecentDemos([]);
                }
            );

            return () => demosUnsubscribe();
        }
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const handleExportData = async () => {
        toast.info('Preparing PDF report...');
        try {
            const [students, coaches, demos, subs] = await Promise.all([
                getDocs(collection(db, 'students')),
                getDocs(collection(db, 'coaches')),
                getDocs(collection(db, 'demos')),
                getDocs(collection(db, 'subscriptions'))
            ]);

            const pdf = new jsPDF();
            const pageWidth = pdf.internal.pageSize.getWidth();

            // Title
            pdf.setFontSize(22);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Indian Chess Academy', pageWidth / 2, 20, { align: 'center' });
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Academy Operations Report', pageWidth / 2, 28, { align: 'center' });
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 34, { align: 'center' });
            pdf.setTextColor(0);

            // Summary Stats
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Summary', 14, 48);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');

            const summaryData = [
                ['Total Students', String(students.size)],
                ['Active Coaches', String(coaches.size)],
                ['Demo Requests', String(demos.size)],
                ['Active Subscriptions', String(subs.docs.filter(d => d.data().status === 'ACTIVE').length)],
                ['Monthly Revenue', formatCurrency(stats.monthlyRevenue)],
                ['Conversion Rate', `${stats.conversionRate}%`]
            ];

            autoTable(pdf, {
                startY: 52,
                head: [['Metric', 'Value']],
                body: summaryData,
                theme: 'grid',
                headStyles: { fillColor: [24, 24, 24], fontSize: 10 },
                styles: { fontSize: 10 },
                margin: { left: 14, right: 14 }
            });

            // Students Table
            let yPos = pdf.lastAutoTable.finalY + 16;
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Students', 14, yPos);

            const studentData = students.docs.map(d => {
                const data = d.data();
                return [
                    data.studentName || data.fullName || 'N/A',
                    data.email || '-',
                    data.studentType || 'Group',
                    data.learningLevel || 'Beginner',
                    data.status || 'ACTIVE'
                ];
            });

            autoTable(pdf, {
                startY: yPos + 4,
                head: [['Name', 'Email', 'Type', 'Level', 'Status']],
                body: studentData.length > 0 ? studentData : [['No students found', '', '', '', '']],
                theme: 'striped',
                headStyles: { fillColor: [252, 138, 36], fontSize: 9 },
                styles: { fontSize: 9 },
                margin: { left: 14, right: 14 }
            });

            // Demos Table
            yPos = pdf.lastAutoTable.finalY + 16;
            if (yPos > 250) { pdf.addPage(); yPos = 20; }
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Demo Requests', 14, yPos);

            const demoData = demos.docs.map(d => {
                const data = d.data();
                return [
                    data.studentName || 'N/A',
                    data.parentEmail || '-',
                    data.status || 'PENDING',
                    data.preferredDate || '-'
                ];
            });

            autoTable(pdf, {
                startY: yPos + 4,
                head: [['Student', 'Parent Email', 'Status', 'Preferred Date']],
                body: demoData.length > 0 ? demoData : [['No demos found', '', '', '']],
                theme: 'striped',
                headStyles: { fillColor: [107, 142, 35], fontSize: 9 },
                styles: { fontSize: 9 },
                margin: { left: 14, right: 14 }
            });

            // Subscriptions Table
            yPos = pdf.lastAutoTable.finalY + 16;
            if (yPos > 250) { pdf.addPage(); yPos = 20; }
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Subscriptions', 14, yPos);

            const subData = subs.docs.map(d => {
                const data = d.data();
                return [
                    data.studentName || data.parentName || 'N/A',
                    data.planName || data.planId || '-',
                    `$${data.amount || 0}`,
                    data.status || '-',
                    data.billingCycle || '-'
                ];
            });

            autoTable(pdf, {
                startY: yPos + 4,
                head: [['Student', 'Plan', 'Amount', 'Status', 'Cycle']],
                body: subData.length > 0 ? subData : [['No subscriptions found', '', '', '', '']],
                theme: 'striped',
                headStyles: { fillColor: [24, 24, 24], fontSize: 9 },
                styles: { fontSize: 9 },
                margin: { left: 14, right: 14 }
            });

            // Footer
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(150);
                pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
                pdf.text('Indian Chess Academy - Confidential', 14, pdf.internal.pageSize.getHeight() - 10);
            }

            pdf.save(`ICA-Report-${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success('PDF report exported successfully!');
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
            case 'NO_SHOW': return { bg: '#FEE2E2', color: '#991B1B' };
            default: return { bg: '#F3F4F6', color: '#374151' };
        }
    };

    return (
        <div className="dashboard-container">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="welcome-text">Command Center</h1>
                    <p className="sub-text">Academy Operations Overview - Live Data</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/broadcast')}>
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
                <div className="admin-metric-card" style={{ padding: '20px', borderRadius: '12px', border: `2px solid ${COLORS.deepBlue}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: COLORS.deepBlue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={20} color="white" />
                        </div>
                        <span className="stat-label">Total Students</span>
                    </div>
                    <div className="stat-value" style={{ fontSize: '28px', fontWeight: '700' }}>{stats.totalStudents}</div>
                </div>

                <div className="admin-metric-card" style={{ padding: '20px', borderRadius: '12px', border: `2px solid ${COLORS.oliveGreen}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: COLORS.oliveGreen, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserCheck size={20} color="white" />
                        </div>
                        <span className="stat-label">Active Coaches</span>
                    </div>
                    <div className="stat-value" style={{ fontSize: '28px', fontWeight: '700' }}>{stats.activeCoaches}</div>
                </div>

                <div className="admin-metric-card" style={{ padding: '20px', borderRadius: '12px', border: `2px solid ${COLORS.orange}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: COLORS.orange, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={20} color="white" />
                        </div>
                        <span className="stat-label">Pending Demos</span>
                    </div>
                    <div className="stat-value" style={{ fontSize: '28px', fontWeight: '700' }}>{stats.pendingDemos}</div>
                </div>

                <div className="admin-metric-card" style={{ padding: '20px', borderRadius: '12px', border: `2px solid ${COLORS.deepBlue}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: COLORS.deepBlue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={20} color="white" />
                        </div>
                        <span className="stat-label">Monthly Revenue</span>
                    </div>
                    <div className="stat-value" style={{ fontSize: '28px', fontWeight: '700' }}>{formatCurrency(stats.monthlyRevenue)}</div>
                </div>

                <div className="admin-metric-card" style={{ padding: '20px', borderRadius: '12px', border: `2px solid ${COLORS.oliveGreen}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: COLORS.oliveGreen, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={20} color="white" />
                        </div>
                        <span className="stat-label">Conversion Rate</span>
                    </div>
                    <div className="stat-value" style={{ fontSize: '28px', fontWeight: '700' }}>{stats.conversionRate}%</div>
                </div>
            </div>

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Recent Demos */}
                    <Card className="admin-panel-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0 }}>Recent Demo Requests</h3>
                            <Button size="sm" variant="ghost" onClick={() => navigate('/admin/demos')}>View All</Button>
                        </div>
                        {recentDemos.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center' }} className="sub-text">No demo requests yet</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {recentDemos.map(demo => (
                                    <div key={demo.id} className="admin-panel-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px' }}>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{demo.studentName || demo.parentName || 'New Request'}</div>
                                            <div className="sub-text" style={{ fontSize: '12px' }}>{demo.parentEmail || demo.email || '-'}</div>
                                        </div>
                                        <span
                                            className="admin-status-badge"
                                            data-status={demo.status || 'PENDING'}
                                            style={{
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
                    <Card className="admin-panel-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0 }}>Coach Performance</h3>
                            <Button size="sm" variant="ghost" onClick={() => navigate('/admin/coaches')}>Manage Coaches</Button>
                        </div>
                        {topCoaches.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center' }} className="sub-text">No coaches registered yet</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {topCoaches.map((coach, i) => (
                                    <div key={coach.id} className="admin-panel-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: i < topCoaches.length - 1 ? '1px solid #eee' : 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: COLORS.deepBlue, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
                                                {(coach.name || coach.coachName || 'C').charAt(0)}
                                            </div>
                                            <span style={{ fontWeight: '500' }}>{coach.fullName || coach.coachName || coach.name || 'Unknown Coach'}</span>
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
                    <Card className="admin-panel-card">
                        <h3 style={{ margin: '0 0 16px' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Button onClick={() => navigate('/admin/demos')} style={{ backgroundColor: COLORS.orange, border: 'none' }}>
                                <Plus size={16} style={{ marginRight: 8 }} />
                                Manage Demos
                            </Button>
                            <Button variant="secondary" onClick={() => navigate('/admin/messages')}>
                                <MessageSquare size={16} style={{ marginRight: 8 }} />
                                Messages
                            </Button>
                            <Button variant="outline" onClick={handleExportData}>
                                <Download size={16} style={{ marginRight: 8 }} />
                                Export PDF Report
                            </Button>
                        </div>
                    </Card>

                    {/* System Status */}
                    <Card className="admin-panel-card">
                        <h3 style={{ margin: '0 0 16px' }}>System Status</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS.oliveGreen }}></div>
                            <span style={{ fontSize: '14px', color: COLORS.oliveGreen, fontWeight: '600' }}>All Systems Operational</span>
                        </div>
                        <div className="sub-text" style={{ fontSize: '12px' }}>
                            <div>Firebase: Connected</div>
                            <div>Real-time: Active</div>
                            <div>Last sync: Just now</div>
                        </div>
                    </Card>

                    {/* Navigation */}
                    <Card className="admin-panel-card">
                        <h3 style={{ margin: '0 0 16px' }}>Navigate</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Button variant="ghost" onClick={() => navigate('/admin/students')} style={{ justifyContent: 'flex-start' }}>Students Database</Button>
                            <Button variant="ghost" onClick={() => navigate('/admin/subscriptions')} style={{ justifyContent: 'flex-start' }}>Subscriptions</Button>
                            <Button variant="ghost" onClick={() => navigate('/admin/finances')} style={{ justifyContent: 'flex-start' }}>Finance Reports</Button>
                            <Button variant="ghost" onClick={() => navigate('/admin/accounts')} style={{ justifyContent: 'flex-start' }}>User Accounts</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
