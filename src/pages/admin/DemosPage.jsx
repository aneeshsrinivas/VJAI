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

    // Mock Data
    const [demos, setDemos] = useState([
        { id: 'D001', studentName: 'Rohan Gupta', parentEmail: 'rohan.g@gmail.com', status: 'BOOKED', preferredTime: '2026-01-20T17:00', coach: null },
        { id: 'D002', studentName: 'Aarav Patel', parentEmail: 'aarav.p@yahoo.com', status: 'SCHEDULED', preferredTime: '2026-01-18T10:00', coach: 'Ramesh Babu' },
        { id: 'D003', studentName: 'Ishaan Reddy', parentEmail: 'ishaan.r@gmail.com', status: 'ATTENDED', preferredTime: '2026-01-15T16:00', coach: 'Suresh Kumar' },
        { id: 'D004', studentName: 'Meera Singh', parentEmail: 'meera.s@outlook.com', status: 'CONVERTED', preferredTime: '2026-01-10T11:00', coach: 'Priya Sharma' },
        { id: 'D005', studentName: 'Vihaan Shah', parentEmail: 'vihaan.s@gmail.com', status: 'NO_SHOW', preferredTime: '2026-01-12T14:00', coach: 'Ramesh Babu' },
    ]);

    const getStatusBadge = (status) => {
        const styles = {
            BOOKED: { bg: '#FEF3C7', color: '#92400E' }, // Orange
            SCHEDULED: { bg: '#DBEAFE', color: '#1E40AF' }, // Blue
            ATTENDED: { bg: '#D1FAE5', color: '#065F46' }, // Green
            CONVERTED: { bg: '#065F46', color: '#fff' }, // Dark Green
            NO_SHOW: { bg: '#FEE2E2', color: '#991B1B' }, // Red
        };
        const style = styles[status] || { bg: '#eee', color: '#333' };
        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: style.bg,
                color: style.color
            }}>
                {status}
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

    const handleAssignConfirm = (updatedDemo) => {
        setDemos(demos.map(d => d.id === updatedDemo.id ? updatedDemo : d));
    };

    const filteredDemos = demos.filter(demo => {
        const matchesFilter = filter === 'ALL' || demo.status === filter;
        const matchesSearch = demo.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || demo.parentEmail.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Demo Management</h1>
                    <p style={{ color: '#666', margin: '4px 0 0' }}>Track and manage demo classes pipeline.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                        type="text"
                        placeholder="Search student or email..."
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', width: '300px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {['ALL', 'BOOKED', 'SCHEDULED', 'ATTENDED', 'CONVERTED'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: filter === f ? 'var(--color-deep-blue)' : '#e0e0e0',
                            color: filter === f ? '#fff' : '#333',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #eee' }}>
                        <tr>
                            <th style={{ padding: '16px', fontSize: '14px', color: '#555' }}>Student Details</th>
                            <th style={{ padding: '16px', fontSize: '14px', color: '#555' }}>Status</th>
                            <th style={{ padding: '16px', fontSize: '14px', color: '#555' }}>Predicted Time</th>
                            <th style={{ padding: '16px', fontSize: '14px', color: '#555' }}>Assigned Coach</th>
                            <th style={{ padding: '16px', fontSize: '14px', color: '#555' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDemos.map(demo => (
                            <tr key={demo.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: '600', color: 'var(--color-deep-blue)' }}>{demo.studentName}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>{demo.parentEmail}</div>
                                </td>
                                <td style={{ padding: '16px' }}>{getStatusBadge(demo.status)}</td>
                                <td style={{ padding: '16px', fontSize: '14px' }}>
                                    {new Date(demo.preferredTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px' }}>
                                    {demo.coach ? demo.coach : <span style={{ color: '#999', fontStyle: 'italic' }}>Unassigned</span>}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    {demo.status === 'BOOKED' && (
                                        <Button size="sm" onClick={() => handleAssignClick(demo)}>Assign Coach</Button>
                                    )}
                                    {demo.status === 'SCHEDULED' && (
                                        <Button size="sm" variant="secondary" onClick={() => handleOutcomeClick(demo)}>Mark Attended</Button>
                                    )}
                                    {demo.status === 'ATTENDED' && (
                                        <Button size="sm" style={{ backgroundColor: 'var(--color-warm-orange)' }}>Send Payment Link</Button>
                                    )}
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
                studentName={selectedDemo?.studentName}
            />
        </div>
    );
};

export default DemosPage;
