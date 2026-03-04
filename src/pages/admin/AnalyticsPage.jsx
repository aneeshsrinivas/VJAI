import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { TrendingUp, Users, Clock, Award, Filter, Download } from 'lucide-react';

const DEMO_STATUSES = {
    BOOKED: ['PENDING', 'SCHEDULED', 'ATTENDED', 'NO_SHOW', 'INTERESTED', 'CONVERTED', 'REJECTED'],
    ATTENDED: ['ATTENDED', 'INTERESTED', 'CONVERTED'],
    INTERESTED: ['INTERESTED', 'CONVERTED'],
    PAID: ['CONVERTED'],
};

const AnalyticsPage = () => {
    const [dateRange, setDateRange] = useState('All Time');
    const [loading, setLoading] = useState(true);

    // Real Firestore data
    const [funnelData, setFunnelData] = useState([]);
    const [coachMetrics, setCoachMetrics] = useState([]);
    const [adminMetrics, setAdminMetrics] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);

                // ── 1. Fetch all demos ──────────────────────────────────────────
                const demosSnap = await getDocs(collection(db, 'demos'));
                const demos = demosSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                const booked = demos.length;
                const attended = demos.filter(d => DEMO_STATUSES.ATTENDED.includes(d.status)).length;
                const interested = demos.filter(d => DEMO_STATUSES.INTERESTED.includes(d.status)).length;
                const paid = demos.filter(d => DEMO_STATUSES.PAID.includes(d.status)).length;
                const noShow = demos.filter(d => d.status === 'NO_SHOW').length;

                setFunnelData([
                    { stage: 'Booked', count: booked, color: 'var(--color-deep-blue)' },
                    { stage: 'Attended', count: attended, color: '#3B82F6' },
                    { stage: 'Interested', count: interested, color: '#F59E0B' },
                    { stage: 'Paid', count: paid, color: 'var(--color-olive-green)' },
                ]);

                // ── 2. Admin efficiency metrics ─────────────────────────────────
                const dropOffRate = booked > 0 ? Math.round(((booked - paid) / booked) * 100) : 0;
                const conversionRate = booked > 0 ? Math.round((paid / booked) * 100) : 0;

                setAdminMetrics([
                    { label: 'Total Demos', value: booked.toString(), trend: '', trendColor: 'inherit' },
                    { label: 'No-Show Count', value: noShow.toString(), trend: `${booked > 0 ? Math.round((noShow / booked) * 100) : 0}% of demos`, trendColor: noShow > 0 ? '#EF4444' : 'var(--color-olive-green)' },
                    { label: 'Global Drop-off Rate', value: `${dropOffRate}%`, trend: `${conversionRate}% converted`, trendColor: dropOffRate < 50 ? 'var(--color-olive-green)' : '#EF4444' },
                    { label: 'Conversion Rate', value: `${conversionRate}%`, trend: `${paid} paid`, trendColor: conversionRate >= 30 ? 'var(--color-olive-green)' : '#F59E0B' },
                ]);

                // ── 3. Coach performance ────────────────────────────────────────
                const coachesSnap = await getDocs(
                    query(collection(db, 'coaches'), where('status', '==', 'ACTIVE'))
                );
                const coaches = coachesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                const coachRows = coaches.map(coach => {
                    const coachDemos = demos.filter(d => d.assignedCoachId === coach.id);
                    const total = coachDemos.length;
                    const attendedCount = coachDemos.filter(d => DEMO_STATUSES.ATTENDED.includes(d.status)).length;
                    const convertedCount = coachDemos.filter(d => d.status === 'CONVERTED').length;
                    const noShowCount = coachDemos.filter(d => d.status === 'NO_SHOW').length;

                    return {
                        name: coach.fullName || coach.name || coach.email?.split('@')[0] || coach.id,
                        demos: total,
                        attendance: total > 0 ? `${Math.round((attendedCount / total) * 100)}%` : 'N/A',
                        conversion: total > 0 ? `${Math.round((convertedCount / total) * 100)}%` : 'N/A',
                        noShow: total > 0 ? `${Math.round((noShowCount / total) * 100)}%` : 'N/A',
                    };
                }).sort((a, b) => b.demos - a.demos); // sort by most demos

                setCoachMetrics(coachRows);
            } catch (err) {
                console.error('Analytics fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const FunnelBar = ({ data }) => {
        const max = data[0]?.count || 1;
        return (
            <div className="admin-panel-card" style={{ padding: '16px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 16px 0' }}>Group Batch Conversion Funnel</h4>
                {data.length === 0 ? (
                    <p className="sub-text" style={{ textAlign: 'center', padding: '16px' }}>No demo data yet</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {data.map((step, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 50px', alignItems: 'center', gap: '12px' }}>
                                <span className="sub-text" style={{ fontSize: '13px', textAlign: 'right' }}>{step.stage}</span>
                                <div className="admin-panel-list-item" style={{ height: '24px', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${max > 0 ? (step.count / max) * 100 : 0}%`,
                                        height: '100%',
                                        backgroundColor: step.color,
                                        borderRadius: '4px',
                                        transition: 'width 1s ease-in-out'
                                    }}></div>
                                </div>
                                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{step.count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, color: 'var(--color-deep-blue)' }}>Performance Analytics</h1>
                    <p className="sub-text" style={{ margin: '4px 0 0' }}>
                        {loading ? 'Loading live data...' : 'Live data from Firestore — funnel health, coach stats, and conversion metrics.'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="outline" size="sm"><Filter size={14} style={{ marginRight: '6px' }} /> {dateRange}</Button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-deep-blue)' }}>
                    Loading analytics...
                </div>
            ) : (
                <>
                    {/* Section 1: Admin Efficiency Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                        {adminMetrics.map((metric, i) => (
                            <Card key={i}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span className="sub-text" style={{ fontSize: '13px' }}>{metric.label}</span>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{metric.value}</span>
                                        <span style={{ fontSize: '12px', color: metric.trendColor }}>{metric.trend}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Section 2: Conversion Funnel */}
                    <div style={{ marginBottom: '32px' }}>
                        <FunnelBar data={funnelData} />
                    </div>

                    {/* Section 3: Coach Performance Table */}
                    <Card title="Coach Performance Matrix">
                        {coachMetrics.length === 0 ? (
                            <p className="sub-text" style={{ textAlign: 'center', padding: '24px' }}>No active coaches found</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                        <th style={{ padding: '12px' }}>Coach Name</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Demos Assigned</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Attendance Rate</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Conversion Rate</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>No-Show Rate</th>
                                        <th style={{ padding: '12px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coachMetrics.map((coach, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{coach.name}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{coach.demos}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{coach.attendance}</td>
                                            <td style={{ padding: '12px', textAlign: 'center', color: parseInt(coach.conversion) >= 30 ? 'var(--color-olive-green)' : 'inherit', fontWeight: '600' }}>{coach.conversion}</td>
                                            <td style={{ padding: '12px', textAlign: 'center', color: '#EF4444' }}>{coach.noShow}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ padding: '4px 8px', backgroundColor: '#ECFDF5', color: '#047857', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>ACTIVE</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
};

export default AnalyticsPage;
