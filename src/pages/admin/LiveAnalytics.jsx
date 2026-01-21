import React, { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast, ToastContainer } from 'react-toastify';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    TrendingUp, Users, DollarSign, UserCheck, Calendar,
    Download, RefreshCw, Target, Zap
} from 'lucide-react';
import './LiveAnalytics.css';

/**
 * Live Analytics Dashboard - Real-time hackathon feature
 * Shows conversion funnel, revenue metrics, coach performance
 */
const LiveAnalytics = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Core metrics
    const [metrics, setMetrics] = useState({
        totalDemos: 0,
        pendingDemos: 0,
        scheduledDemos: 0,
        attendedDemos: 0,
        convertedDemos: 0,
        totalStudents: 0,
        activeCoaches: 0,
        monthlyRevenue: 0,
        avgRevenuePerUser: 0,
        conversionRate: 0
    });

    // Chart data
    const [funnelData, setFunnelData] = useState([]);
    const [coachData, setCoachData] = useState([]);
    const [levelData, setLevelData] = useState([]);
    const [trendData, setTrendData] = useState([]);

    // Colors
    const COLORS = ['#1E3A8A', '#FC8A24', '#10B981', '#8B5CF6', '#EC4899'];

    // Real-time listeners
    useEffect(() => {
        // Listen to demos
        const demosUnsubscribe = onSnapshot(collection(db, 'demos'), (snapshot) => {
            const demos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            const pending = demos.filter(d => d.status === 'PENDING').length;
            const scheduled = demos.filter(d => d.status === 'SCHEDULED').length;
            const attended = demos.filter(d => d.status === 'ATTENDED' || d.status === 'INTERESTED').length;
            const converted = demos.filter(d => d.status === 'CONVERTED').length;

            setMetrics(prev => ({
                ...prev,
                totalDemos: demos.length,
                pendingDemos: pending,
                scheduledDemos: scheduled,
                attendedDemos: attended,
                convertedDemos: converted,
                conversionRate: demos.length > 0 ? Math.round((converted / demos.length) * 100) : 0
            }));

            // Funnel data
            setFunnelData([
                { name: 'Booked', value: demos.length, fill: '#1E3A8A' },
                { name: 'Scheduled', value: scheduled + attended + converted, fill: '#3B82F6' },
                { name: 'Attended', value: attended + converted, fill: '#FC8A24' },
                { name: 'Converted', value: converted, fill: '#10B981' }
            ]);

            setLastUpdated(new Date());
        });

        // Listen to students
        const studentsUnsubscribe = onSnapshot(collection(db, 'students'), (snapshot) => {
            const students = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            setMetrics(prev => ({
                ...prev,
                totalStudents: students.length
            }));

            // Level distribution
            const beginners = students.filter(s => s.level === 'beginner' || !s.level).length;
            const intermediate = students.filter(s => s.level === 'intermediate').length;
            const advanced = students.filter(s => s.level === 'advanced').length;

            setLevelData([
                { name: 'Beginner', value: beginners || 1, fill: '#3B82F6' },
                { name: 'Intermediate', value: intermediate || 1, fill: '#FC8A24' },
                { name: 'Advanced', value: advanced || 1, fill: '#10B981' }
            ]);

            setLastUpdated(new Date());
        });

        // Listen to subscriptions for revenue
        const subsUnsubscribe = onSnapshot(collection(db, 'subscriptions'), (snapshot) => {
            const subs = snapshot.docs.map(d => d.data());

            const activeSubs = subs.filter(s => s.status === 'ACTIVE');

            // Normalize revenue to monthly equivalent based on billing cycle
            const monthlyRevenue = activeSubs.reduce((sum, s) => {
                const amount = Number(s.amount) || 0;
                const cycle = (s.billingCycle || s.planType || 'monthly').toLowerCase();

                // Convert to monthly equivalent
                if (cycle.includes('annual') || cycle.includes('yearly')) {
                    return sum + (amount / 12);
                } else if (cycle.includes('quarter')) {
                    return sum + (amount / 3);
                } else if (cycle.includes('semi') || cycle.includes('6')) {
                    return sum + (amount / 6);
                } else {
                    // Monthly or unknown - treat as monthly
                    return sum + amount;
                }
            }, 0);

            const arpu = activeSubs.length > 0 ? Math.round(monthlyRevenue / activeSubs.length) : 0;

            setMetrics(prev => ({
                ...prev,
                monthlyRevenue: Math.round(monthlyRevenue),
                avgRevenuePerUser: arpu
            }));

            setLastUpdated(new Date());
        });

        // Listen to coaches
        const coachesUnsubscribe = onSnapshot(collection(db, 'coaches'), (snapshot) => {
            const coaches = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            setMetrics(prev => ({
                ...prev,
                activeCoaches: coaches.length
            }));

            // Coach performance (random for demo)
            setCoachData(coaches.slice(0, 5).map(c => ({
                name: (c.name || c.coachName || 'Coach').split(' ')[0],
                conversions: Math.floor(Math.random() * 10) + 1,
                rating: c.rating || (4 + Math.random()).toFixed(1)
            })));

            setLastUpdated(new Date());
        });

        // Generate trend data (mockup for demo)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push({
                name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                demos: Math.floor(Math.random() * 5) + 1,
                conversions: Math.floor(Math.random() * 3)
            });
        }
        setTrendData(last7Days);

        setLoading(false);

        return () => {
            demosUnsubscribe();
            studentsUnsubscribe();
            subsUnsubscribe();
            coachesUnsubscribe();
        };
    }, []);

    // Export to CSV
    const handleExportCSV = () => {
        const rows = [
            ['Metric', 'Value'],
            ['Total Demos', metrics.totalDemos],
            ['Pending Demos', metrics.pendingDemos],
            ['Scheduled Demos', metrics.scheduledDemos],
            ['Attended Demos', metrics.attendedDemos],
            ['Converted Demos', metrics.convertedDemos],
            ['Conversion Rate', metrics.conversionRate + '%'],
            ['Total Students', metrics.totalStudents],
            ['Active Coaches', metrics.activeCoaches],
            ['Monthly Revenue (INR)', metrics.monthlyRevenue],
            ['Avg Revenue Per User', metrics.avgRevenuePerUser]
        ];

        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ica-analytics-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success('Analytics exported to CSV!');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getTimeSinceUpdate = () => {
        const seconds = Math.floor((new Date() - lastUpdated) / 1000);
        if (seconds < 5) return 'Just now';
        if (seconds < 60) return `${seconds}s ago`;
        return `${Math.floor(seconds / 60)}m ago`;
    };

    if (loading) {
        return (
            <div className="analytics-loading">
                <RefreshCw className="spin" size={32} />
                <p>Loading analytics...</p>
            </div>
        );
    }

    return (
        <div className="live-analytics">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="analytics-header">
                <div>
                    <h1>Live Analytics</h1>
                    <p className="last-updated">
                        <span className="live-dot"></span>
                        Last updated: {getTimeSinceUpdate()}
                    </p>
                </div>
                <Button onClick={handleExportCSV}>
                    <Download size={16} style={{ marginRight: 8 }} />
                    Export CSV
                </Button>
            </div>

            {/* Key Metrics Grid */}
            <div className="metrics-grid">
                <div className="metric-card gradient-blue">
                    <div className="metric-icon"><Target size={24} /></div>
                    <div className="metric-content">
                        <span className="metric-value animate-count">{metrics.totalDemos}</span>
                        <span className="metric-label">Total Demos</span>
                    </div>
                </div>
                <div className="metric-card gradient-green">
                    <div className="metric-icon"><TrendingUp size={24} /></div>
                    <div className="metric-content">
                        <span className="metric-value animate-count">{metrics.conversionRate}%</span>
                        <span className="metric-label">Conversion Rate</span>
                    </div>
                </div>
                <div className="metric-card gradient-orange">
                    <div className="metric-icon"><Users size={24} /></div>
                    <div className="metric-content">
                        <span className="metric-value animate-count">{metrics.totalStudents}</span>
                        <span className="metric-label">Total Students</span>
                    </div>
                </div>
                <div className="metric-card gradient-purple">
                    <div className="metric-icon"><DollarSign size={24} /></div>
                    <div className="metric-content">
                        <span className="metric-value animate-count">{formatCurrency(metrics.monthlyRevenue)}</span>
                        <span className="metric-label">Monthly Revenue</span>
                    </div>
                </div>
                <div className="metric-card gradient-pink">
                    <div className="metric-icon"><Zap size={24} /></div>
                    <div className="metric-content">
                        <span className="metric-value animate-count">{formatCurrency(metrics.avgRevenuePerUser)}</span>
                        <span className="metric-label">Avg Revenue/User</span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                {/* Conversion Funnel */}
                <Card className="chart-card">
                    <h3>Conversion Funnel</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={funnelData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={80} />
                            <Tooltip />
                            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                {funnelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Demo Trend */}
                <Card className="chart-card">
                    <h3>Demo Trend (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="demos" stroke="#1E3A8A" strokeWidth={2} dot={{ fill: '#1E3A8A' }} />
                            <Line type="monotone" dataKey="conversions" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Student Levels */}
                <Card className="chart-card">
                    <h3>Student Levels</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={levelData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {levelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                {/* Coach Performance */}
                <Card className="chart-card">
                    <h3>Coach Performance</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={coachData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="conversions" fill="#FC8A24" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Demo Status Breakdown */}
            <div className="status-grid">
                <Card className="status-card pending">
                    <Calendar size={20} />
                    <div>
                        <span className="status-value">{metrics.pendingDemos}</span>
                        <span className="status-label">Pending</span>
                    </div>
                </Card>
                <Card className="status-card scheduled">
                    <Calendar size={20} />
                    <div>
                        <span className="status-value">{metrics.scheduledDemos}</span>
                        <span className="status-label">Scheduled</span>
                    </div>
                </Card>
                <Card className="status-card attended">
                    <UserCheck size={20} />
                    <div>
                        <span className="status-value">{metrics.attendedDemos}</span>
                        <span className="status-label">Attended</span>
                    </div>
                </Card>
                <Card className="status-card converted">
                    <TrendingUp size={20} />
                    <div>
                        <span className="status-value">{metrics.convertedDemos}</span>
                        <span className="status-label">Converted</span>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LiveAnalytics;
