import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AssignCoachModal from '../../components/features/AssignCoachModal';
import DemoOutcomeModal from '../../components/features/DemoOutcomeModal';

const DemosPage = () => {
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);
    const [selectedDemo, setSelectedDemo] = useState(null);

    // Mock Data based on Core Demo Entity 2.3
    const [demos, setDemos] = useState([
        {
            demo_id: 'D-1001',
            student_name: 'Rohan Gupta',
            parent_name: 'Vikram Gupta',
            parent_email: 'rohan.g@gmail.com',
            timezone: 'IST',
            status: 'BOOKED',
            scheduled_start: '2026-01-20T17:00:00',
            scheduled_end: '2026-01-20T17:45:00',
            coach_id: null,
            admin_id: 'ADM-001',
            meeting_link: 'https://meet.google.com/abc-defg-hij'
        },
        {
            demo_id: 'D-1002',
            student_name: 'Aarav Patel',
            parent_name: 'Sonia Patel',
            parent_email: 'aarav.p@yahoo.com',
            timezone: 'EST',
            status: 'PAYMENT_PENDING',
            scheduled_start: '2026-01-18T10:00:00',
            scheduled_end: '2026-01-18T10:45:00',
            coach_id: 'Coach Ramesh',
            admin_id: 'ADM-002',
            meeting_link: 'https://zoom.us/j/123456789',
            recommended_level: 'Beginner',
            recommended_student_type: 'Group'
        },
        {
            demo_id: 'D-1003',
            student_name: 'Ishaan Reddy',
            parent_name: 'Anil Reddy',
            parent_email: 'ishaan.r@gmail.com',
            timezone: 'IST',
            status: 'INTERESTED',
            scheduled_start: '2026-01-15T16:00:00',
            scheduled_end: '2026-01-15T16:45:00',
            coach_id: 'Coach Suresh',
            admin_id: 'ADM-001',
            meeting_link: 'https://meet.google.com/xyz-uvw-lmn',
            admin_notes: 'Parent asked for weekend batch options.'
        },
        {
            demo_id: 'D-1004',
            student_name: 'Meera Singh',
            parent_name: 'Kabir Singh',
            parent_email: 'meera.s@outlook.com',
            timezone: 'GMT',
            status: 'CONVERTED',
            scheduled_start: '2026-01-10T11:00:00',
            scheduled_end: '2026-01-10T11:45:00',
            coach_id: 'Coach Priya',
            admin_id: 'ADM-003',
            meeting_link: 'https://teams.microsoft.com/l/meetup/...'
        },
        {
            demo_id: 'D-1005',
            student_name: 'Vihaan Shah',
            parent_name: 'Nita Shah',
            parent_email: 'vihaan.s@gmail.com',
            timezone: 'IST',
            status: 'NO_SHOW',
            scheduled_start: '2026-01-12T14:00:00',
            scheduled_end: '2026-01-12T14:45:00',
            coach_id: 'Coach Ramesh',
            admin_id: 'ADM-001',
            meeting_link: 'https://meet.google.com/no-show-link'
        },
    ]);

    const getStatusBadge = (status) => {
        const styles = {
            BOOKED: { bg: '#FEF3C7', color: '#92400E' }, // Amber
            ATTENDED: { bg: '#D1FAE5', color: '#065F46' }, // Emerald
            NO_SHOW: { bg: '#FEE2E2', color: '#991B1B' }, // Red
            RESCHEDULED: { bg: '#E0F2FE', color: '#075985' }, // Sky
            CANCELLED: { bg: '#F3F4F6', color: '#374151' }, // Gray

            INTERESTED: { bg: '#E0E7FF', color: '#3730A3' }, // Indigo
            NOT_INTERESTED: { bg: '#F3F4F6', color: '#6B7280' }, // Gray
            PAYMENT_PENDING: { bg: '#FEF9C3', color: '#854D0E' }, // Yellow
            CONVERTED: { bg: '#DCFCE7', color: '#166534' }, // Green (Success)
            DROPPED: { bg: '#1F2937', color: '#F9FAFB' }, // Dark
        };
        const style = styles[status] || { bg: '#eee', color: '#333' };
        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase',
                backgroundColor: style.bg,
                color: style.color,
                letterSpacing: '0.5px'
            }}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    const handleAssignClick = (demo) => {
        setSelectedDemo(demo);
        setAssignModalOpen(true);
    };

    const handleOutcomeClick = (demo) => {
        setSelectedDemo(demo);
        setOutcomeModalOpen(true);
    };

    // State Transition 1: Mark Attendance
    const handleMarkAttended = (demo) => {
        const updatedDemos = demos.map(d =>
            d.demo_id === demo.demo_id ? { ...d, status: 'ATTENDED' } : d
        );
        setDemos(updatedDemos);
        // Optionally open outcome modal immediately or let them click outcome later
    };

    // State Transition 2: Outcome Submitted -> INTERESTED or other
    const handleOutcomeSubmit = (data) => {
        // data contains { status, recommended_level, ... }
        setDemos(demos.map(d =>
            d.demo_id === selectedDemo.demo_id ? { ...d, ...data } : d
        ));
        setOutcomeModalOpen(false);
    };

    // State Transition 3: Payment Success -> CONVERTED
    const handleSendPayment = (demo) => {
        // Simulate sending link (In real app, backend trigger)
        // Then assume success for demo purpose or move to PAYMENT_PENDING
        const confirmPayment = window.confirm(`Simulate Payment Success for ${demo.student_name}? \n\nOK = Success (CONVERTED)\nCancel = Just Send Link (PAYMENT_PENDING)`);

        const newStatus = confirmPayment ? 'CONVERTED' : 'PAYMENT_PENDING';

        setDemos(demos.map(d =>
            d.demo_id === demo.demo_id ? { ...d, status: newStatus } : d
        ));
    };

    const handleAssignConfirm = (updatedDemo) => {
        setDemos(demos.map(d => d.demo_id === updatedDemo.demo_id ? updatedDemo : d));
    };

    const filteredDemos = demos.filter(demo => {
        const matchesFilter = filter === 'ALL' || demo.status === filter;
        const matchesSearch = demo.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || demo.parent_email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Demo Classes</h1>
                    <p style={{ color: '#666', margin: '4px 0 0' }}>Manage demo requests, scheduling, and conversion outcomes.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                        type="text"
                        placeholder="Search student or email..."
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', width: '300px', fontFamily: 'var(--font-primary)' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {['ALL', 'BOOKED', 'ATTENDED', 'PAYMENT_PENDING', 'INTERESTED', 'CONVERTED'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: filter === f ? 'var(--color-deep-blue)' : '#FFFFFF',
                            color: filter === f ? '#fff' : '#666',
                            border: filter === f ? 'none' : '1px solid #ddd',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '12px'
                        }}
                    >
                        {f.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #eee' }}>
                        <tr>
                            <th style={{ padding: '16px', fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Demo ID / Student</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Parent Contact</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Time (Timezone)</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Assigned Coach</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDemos.map(demo => (
                            <tr key={demo.demo_id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: '600', color: 'var(--color-deep-blue)' }}>{demo.student_name}</div>
                                    <div style={{ fontSize: '12px', color: '#888' }}>{demo.demo_id}</div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontSize: '14px' }}>{demo.parent_name}</div>
                                    <a href={`mailto:${demo.parent_email}`} style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }}>{demo.parent_email}</a>
                                </td>
                                <td style={{ padding: '16px' }}>{getStatusBadge(demo.status)}</td>
                                <td style={{ padding: '16px', fontSize: '14px' }}>
                                    <div>{new Date(demo.scheduled_start).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                                    <div style={{ fontSize: '11px', color: '#666' }}>{demo.timezone}</div>
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px' }}>
                                    {demo.coach_id ? (
                                        <span style={{ fontWeight: '500' }}>{demo.coach_id}</span>
                                    ) : (
                                        <span style={{ color: '#999', fontStyle: 'italic' }}>Unassigned</span>
                                    )}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {demo.status === 'BOOKED' && demo.coach_id && (
                                            <Button size="sm" variant="outline" onClick={() => handleMarkAttended(demo)}>Mark Attended</Button>
                                        )}
                                        {demo.status === 'BOOKED' && !demo.coach_id && (
                                            <Button size="sm" onClick={() => handleAssignClick(demo)}>Assign</Button>
                                        )}
                                        {['ATTENDED', 'SCHEDULED'].includes(demo.status) && (
                                            <Button size="sm" variant="secondary" onClick={() => handleOutcomeClick(demo)}>Outcome</Button>
                                        )}
                                        {['INTERESTED', 'PAYMENT_PENDING'].includes(demo.status) && (
                                            <Button size="sm" style={{ backgroundColor: 'var(--color-warm-orange)' }} onClick={() => handleSendPayment(demo)}>
                                                {demo.status === 'INTERESTED' ? 'Send Link' : 'Resend Link'}
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <AssignCoachModal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                demo={selectedDemo}
                onConfirm={handleAssignConfirm}
            />

            <DemoOutcomeModal
                isOpen={outcomeModalOpen}
                onClose={() => setOutcomeModalOpen(false)}
                studentName={selectedDemo?.student_name}
                onConfirm={handleOutcomeSubmit}
            />
        </div>
    );
};

export default DemosPage;
