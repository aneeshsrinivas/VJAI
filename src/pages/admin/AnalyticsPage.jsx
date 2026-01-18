import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { TrendingUp, Users, Clock, Award, Filter, Download } from 'lucide-react';

const AnalyticsPage = () => {
    const [dateRange, setDateRange] = useState('This Month');

    // MOCK DATA: Funnel Metrics
    const funnelMany = [
        { stage: 'Booked', count: 120, color: 'var(--color-deep-blue)' },
        { stage: 'Attended', count: 95, color: '#3B82F6' },
        { stage: 'Interested', count: 45, color: '#F59E0B' },
        { stage: 'Paid', count: 28, color: 'var(--color-olive-green)' }
    ];

    const funnelOneToOne = [
        { stage: 'Booked', count: 40, color: 'var(--color-deep-blue)' },
        { stage: 'Attended', count: 38, color: '#3B82F6' },
        { stage: 'Interested', count: 25, color: '#F59E0B' },
        { stage: 'Paid', count: 15, color: 'var(--color-olive-green)' }
    ];

    // MOCK DATA: Coach Performance
    const coachMetrics = [
        { name: 'Ramesh Babu', demos: 45, attendance: '92%', conversion: '35%', noShow: '8%' },
        { name: 'Sarah Jones', demos: 38, attendance: '88%', conversion: '42%', noShow: '12%' },
        { name: 'Vikram Singh', demos: 52, attendance: '85%', conversion: '28%', noShow: '15%' },
        { name: 'Priya Mehta', demos: 40, attendance: '95%', conversion: '30%', noShow: '5%' },
    ];

    // MOCK DATA: Admin Efficiency
    const adminMetrics = [
        { label: 'Avg Follow-up Speed', value: '2.5 hrs', trend: '↓ 15%', trendColor: 'var(--color-olive-green)' },
        { label: 'Demos Owned', value: '156', trend: '↑ 8%', trendColor: 'var(--color-olive-green)' },
        { label: 'Global Drop-off Rate', value: '32%', trend: '↓ 2%', trendColor: 'var(--color-olive-green)' },
        { label: 'Demo Satisfaction', value: '4.8/5', trend: '-', trendColor: '#666' }
    ];

    const FunnelBar = ({ data, label }) => {
        const max = data[0].count; // Normalize to first step
        return (
            <div style={{ padding: '16px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '16px', backgroundColor: '#fff' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#555' }}>{label} Funnel</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.map((step, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 50px', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '13px', color: '#666', textAlign: 'right' }}>{step.stage}</span>
                            <div style={{ height: '24px', backgroundColor: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${(step.count / max) * 100}%`,
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
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, color: 'var(--color-deep-blue)' }}>Performance Analytics</h1>
                    <p style={{ margin: '4px 0 0', color: '#666' }}>Deep dive into funnel health, coach stats, and operational efficiency.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="outline" size="sm"><Filter size={14} style={{ marginRight: '6px' }} /> {dateRange}</Button>
                    <Button variant="secondary" size="sm"><Download size={14} style={{ marginRight: '6px' }} /> Export Report</Button>
                </div>
            </div>

            {/* Section 1: Admin Efficiency Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                {adminMetrics.map((metric, i) => (
                    <Card key={i}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}>{metric.label}</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-deep-blue)' }}>{metric.value}</span>
                                <span style={{ fontSize: '12px', color: metric.trendColor }}>{metric.trend}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Section 2: Funnel Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <FunnelBar data={funnelMany} label="Group Batch (1:Many)" />
                <FunnelBar data={funnelOneToOne} label="Premium (1:1)" />
            </div>

            {/* Section 3: Coach Performance Table */}
            <Card title="Coach Performance Matrix">
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
                                <td style={{ padding: '12px', textAlign: 'center', color: parseInt(coach.conversion) > 30 ? 'var(--color-olive-green)' : 'inherit', fontWeight: '600' }}>{coach.conversion}</td>
                                <td style={{ padding: '12px', textAlign: 'center', color: '#EF4444' }}>{coach.noShow}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{ padding: '4px 8px', backgroundColor: '#ECFDF5', color: '#047857', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>ACTIVE</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default AnalyticsPage;
