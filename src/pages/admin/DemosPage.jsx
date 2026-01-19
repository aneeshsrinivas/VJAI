import React, { useState, useEffect } from 'react';
import { getAllDemos, getDemosByStatus } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AssignCoachModal from '../../components/features/AssignCoachModal';
import DemoOutcomeModal from '../../components/features/DemoOutcomeModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DemosPage = () => {
    const { currentUser } = useAuth();
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);
    const [selectedDemo, setSelectedDemo] = useState(null);
    const [demos, setDemos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDemos();
    }, [filter]);

    const fetchDemos = async () => {
        setLoading(true);
        let result;

        if (filter === 'ALL') {
            result = await getAllDemos();
        } else {
            result = await getDemosByStatus(filter);
        }

        if (result.success) {
            setDemos(result.demos);
        } else {
            toast.error('Failed to fetch demos');
        }
        setLoading(false);
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: { bg: '#FEF3C7', color: '#92400E' },
            SCHEDULED: { bg: '#DBEAFE', color: '#1E40AF' },
            ATTENDED: { bg: '#D1FAE5', color: '#065F46' },
            NO_SHOW: { bg: '#FEE2E2', color: '#991B1B' },
            INTERESTED: { bg: '#E0E7FF', color: '#3730A3' },
            CONVERTED: { bg: '#DCFCE7', color: '#166534' },
            REJECTED: { bg: '#F3F4F6', color: '#6B7280' },
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
                {status?.replace('_', ' ')}
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

    const filteredDemos = demos.filter(demo => {
        const matchesSearch = (demo.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (demo.parentEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div style={{ padding: '24px' }}>
            <ToastContainer position="top-right" autoClose={3000} />

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
                {['ALL', 'PENDING', 'SCHEDULED', 'ATTENDED', 'INTERESTED', 'CONVERTED'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: filter === f ? 'none' : '1px solid #ddd',
                            backgroundColor: filter === f ? 'var(--color-deep-blue)' : '#FFFFFF',
                            color: filter === f ? '#fff' : '#666',
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
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading demos...</div>
                ) : filteredDemos.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                        No demo requests found. Demo bookings from the landing page will appear here.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #eee' }}>
                            <tr>
                                <th style={{ padding: '16px', fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Student</th>
                                <th style={{ padding: '16px', fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Parent Contact</th>
                                <th style={{ padding: '16px', fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '16px', fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Preferred Time</th>
                                <th style={{ padding: '16px', fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Assigned Coach</th>
                                <th style={{ padding: '16px', fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDemos.map(demo => (
                                <tr key={demo.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--color-deep-blue)' }}>{demo.studentName}</div>
                                        <div style={{ fontSize: '12px', color: '#888' }}>{demo.chessExperience}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontSize: '14px' }}>{demo.parentName}</div>
                                        <a href={`mailto:${demo.parentEmail}`} style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }}>{demo.parentEmail}</a>
                                    </td>
                                    <td style={{ padding: '16px' }}>{getStatusBadge(demo.status)}</td>
                                    <td style={{ padding: '16px', fontSize: '14px' }}>
                                        <div>{demo.preferredDateTime ? new Date(demo.preferredDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}</div>
                                        <div style={{ fontSize: '11px', color: '#666' }}>{demo.timezone}</div>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '14px' }}>
                                        {demo.assignedCoachId ? (
                                            <span style={{ fontWeight: '500', color: '#059669' }}>Assigned</span>
                                        ) : (
                                            <span style={{ color: '#999', fontStyle: 'italic' }}>Unassigned</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {demo.status === 'PENDING' && (
                                                <Button size="sm" onClick={() => handleAssignClick(demo)}>Assign Coach</Button>
                                            )}
                                            {demo.status === 'SCHEDULED' && (
                                                <Button size="sm" variant="secondary" onClick={() => handleOutcomeClick(demo)}>Record Outcome</Button>
                                            )}
                                            {demo.status === 'INTERESTED' && (
                                                <Button size="sm" style={{ backgroundColor: 'var(--color-warm-orange)' }}>
                                                    Send Payment
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>

            {assignModalOpen && selectedDemo && (
                <AssignCoachModal
                    demo={selectedDemo}
                    onClose={() => setAssignModalOpen(false)}
                    onSuccess={() => {
                        fetchDemos();
                        setAssignModalOpen(false);
                        toast.success('Coach assigned successfully!');
                    }}
                />
            )}

            {outcomeModalOpen && selectedDemo && (
                <DemoOutcomeModal
                    demo={selectedDemo}
                    onClose={() => setOutcomeModalOpen(false)}
                    onSuccess={() => {
                        fetchDemos();
                        setOutcomeModalOpen(false);
                        toast.success('Demo outcome submitted!');
                    }}
                />
            )}
        </div>
    );
};

export default DemosPage;

