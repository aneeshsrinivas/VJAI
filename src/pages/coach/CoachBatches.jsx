import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Users, Clock, Calendar, Upload, FileText, BookOpen } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { COLLECTIONS } from '../../config/firestoreCollections';
import CreateAssignmentModal from '../../components/features/CreateAssignmentModal';
import UploadMaterialModal from '../../components/features/UploadMaterialModal';
import CreateChessPuzzleModal from '../../components/features/CreateChessPuzzleModal';
import CoachAssignmentDetailsModal from '../../components/features/CoachAssignmentDetailsModal';

const CoachBatches = () => {
    const [selectedBatchForUpload, setSelectedBatchForUpload] = useState(null);
    const [createAssignmentBatch, setCreateAssignmentBatch] = useState(null);
    const [createPuzzleBatch, setCreatePuzzleBatch] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [uploadLog, setUploadLog] = useState([]);
    const { currentUser } = useAuth();

    const getColorForLevel = (level) => {
        const colors = {
            'beginner': '#3b82f6',
            'intermediate': '#8b5cf6',
            'advance': '#ec4899'
        };
        return colors[level?.toLowerCase()] || '#3b82f6';
    };

    const formatSchedule = (daysOfWeek, time) => {
        if (!daysOfWeek || !time) return 'No schedule';
        const dayShortcuts = {
            'Monday': 'Mon',
            'Tuesday': 'Tue',
            'Wednesday': 'Wed',
            'Thursday': 'Thu',
            'Friday': 'Fri',
            'Saturday': 'Sat',
            'Sunday': 'Sun'
        };
        const shortDays = daysOfWeek.map(d => dayShortcuts[d]).join(', ');
        return `${shortDays} • ${time}`;
    };

    // Fetch batches from coach's subcollection
    useEffect(() => {
        if (!currentUser?.uid) {
            setLoading(false);
            return;
        }

        const batchesRef = collection(db, 'coaches', currentUser.uid, 'batches');

        const unsubscribe = onSnapshot(batchesRef, (snapshot) => {
            const batchList = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                color: getColorForLevel(d.data().level),
                students: (d.data().studentsId || []).length
            }));
            setBatches(batchList);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching batches:', error);
            setBatches([]);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Fetch Upload Log (Assignments uploaded by this coach)
    useEffect(() => {
        if (!currentUser?.uid) return;

        const qAssignments = query(
            collection(db, COLLECTIONS.ASSIGNMENTS),
            where('coachId', '==', currentUser.uid)
        );

        const unsubscribeAssignments = onSnapshot(qAssignments, (snapshot) => {
            const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setUploadLog(logs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        });

        return () => unsubscribeAssignments();
    }, [currentUser]);

    // Fetch Chess Assignments
    useEffect(() => {
        if (!currentUser?.uid) return;

        const q = query(
            collection(db, 'chessAssignment'),
            where('coachId', '==', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setAssignments(list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        });

        return () => unsubscribe();
    }, [currentUser]);

    if (loading) {
        return (
            <div style={{
                minHeight: 'calc(100vh - 70px)',
                background: 'linear-gradient(180deg, #f8f9fc 0%, #f0f2f5 100%)',
                padding: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Figtree', sans-serif"
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>📚</div>
                    <p style={{ color: '#64748b', fontSize: '16px' }}>Loading your batches...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: 'calc(100vh - 70px)',
            background: 'linear-gradient(180deg, #f8f9fc 0%, #f0f2f5 100%)',
            padding: '32px',
            fontFamily: "'Figtree', sans-serif"
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}>
                            <BookOpen size={28} color="white" />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#003366' }}>
                                My Batches
                            </h1>
                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '15px' }}>
                                Manage your classes and share resources
                            </p>
                        </div>
                    </div>
                </div>

                {/* Batches Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                    {loading ? (
                        <div>Loading batches...</div>
                    ) : batches.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                            <h3>No batches assigned yet</h3>
                            <p>Contact the administrator to assign batches to your profile.</p>
                        </div>
                    ) : (
                        batches.map(batch => (
                            <Card key={batch.id} style={{
                                border: 'none',
                                borderRadius: '20px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                padding: '24px',
                                borderTop: `4px solid ${batch.color || '#3b82f6'}`,
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <h3 style={{
                                        margin: '0 0 16px',
                                        fontSize: '20px',
                                        fontWeight: '800',
                                        color: '#1e293b'
                                    }}>
                                        {batch.name}
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px' }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                background: `${batch.color || '#3b82f6'}15`,
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Clock size={16} color={batch.color || '#3b82f6'} />
                                            </div>
                                            <span>{batch.schedule || 'Flexible'}</span>
                                        </div>
                                        <span>{formatSchedule(batch.daysOfWeek, batch.time)}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            background: `${batch.color}15`,
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Users size={16} color={batch.color} />
                                        </div>
                                        <span>{batch.students} students</span>
                                    </div>
                                </div>

                                <div style={{
                                    borderTop: '1px solid #f1f5f9',
                                    paddingTop: '16px',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr',
                                    gap: '8px'
                                }}>
                                    <Button
                                        size="sm"
                                        onClick={() => setCreatePuzzleBatch(batch)}
                                        style={{
                                            background: '#f0fdf4',
                                            border: '1px solid #bbf7d0',
                                            color: '#15803d',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px',
                                            fontSize: '12px'
                                        }}
                                    >
                                        <div style={{ fontSize: '16px' }}>♟️</div> Create Puzzle
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => setSelectedBatchForUpload(batch)}
                                        style={{
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            color: '#475569',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px',
                                            fontSize: '12px'
                                        }}
                                    >
                                        <Upload size={14} /> Upload Material (PDF/PGN)
                                    </Button>
                                </div>
                            </Card>
                        )))}
                </div>

                {/* Chess Assignments Section */}
                <div style={{ marginTop: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{
                            background: '#f0fdf4', borderRadius: '12px', padding: '10px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}>
                            <div style={{ fontSize: '24px' }}>♟️</div>
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Active Puzzles</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {assignments.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                <p>No puzzles created yet.</p>
                            </div>
                        ) : (
                            assignments.map(assign => (
                                <Card key={assign.id} style={{ padding: '24px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #e2e8f0' }} onClick={() => setSelectedAssignment(assign)}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{assign.title}</h3>
                                        <p style={{ margin: '0', fontSize: '13px', color: '#64748b' }}>
                                            To: {assign.batchName}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                                        <span>{assign.createdAt?.toDate ? assign.createdAt.toDate().toLocaleDateString() : 'Just now'}</span>
                                        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>View Submissions →</span>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Upload Log Section */}
                <div style={{ marginTop: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{
                            background: '#e0f2fe', borderRadius: '12px', padding: '10px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}>
                            <FileText size={24} color="#0284c7" />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Upload History</h2>
                    </div>

                    <Card style={{ padding: '0', overflow: 'hidden', border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <tr>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Document Name</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Batch</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Type</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Date Uploaded</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {uploadLog.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No uploads found yet.</td>
                                        </tr>
                                    ) : (
                                        uploadLog.map(item => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '16px 20px', fontWeight: '600', color: '#334155' }}>{item.title}</td>
                                                <td style={{ padding: '16px 20px', color: '#64748b' }}>
                                                    <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                                                        {item.batchName || 'General'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <span style={{
                                                        color: item.type === 'PGN' ? '#84cc16' : '#f43f5e',
                                                        background: item.type === 'PGN' ? '#ecfccb' : '#ffe4e6',
                                                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700'
                                                    }}>
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '14px' }}>
                                                    {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                                </td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <Button variant="ghost" size="sm" onClick={() => window.open(item.url, '_blank')} style={{ fontSize: '12px' }}>
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <UploadMaterialModal
                    isOpen={!!selectedBatchForUpload}
                    batch={selectedBatchForUpload}
                    onClose={() => setSelectedBatchForUpload(null)}
                />

                <CreateAssignmentModal
                    isOpen={!!createAssignmentBatch}
                    batchId={createAssignmentBatch?.id}
                    batchName={createAssignmentBatch?.name}
                    onClose={() => setCreateAssignmentBatch(null)}
                    onSuccess={() => alert('Assignment Created Successfully!')}
                />

                <CreateChessPuzzleModal
                    isOpen={!!createPuzzleBatch}
                    batchId={createPuzzleBatch?.id}
                    batchName={createPuzzleBatch?.name}
                    onClose={() => setCreatePuzzleBatch(null)}
                    onSuccess={() => alert('Puzzle Created Successfully!')}
                />

                <CoachAssignmentDetailsModal
                    isOpen={!!selectedAssignment}
                    assignment={selectedAssignment || {}}
                    onClose={() => setSelectedAssignment(null)}
                />
            </div>
        </div>
    );
};

export default CoachBatches;
