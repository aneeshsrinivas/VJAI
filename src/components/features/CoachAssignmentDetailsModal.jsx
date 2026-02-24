import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { X, ChevronLeft, PlayCircle, Trash2 } from 'lucide-react';
import ChessReplay from '../chess/ChessReplay';

const CoachAssignmentDetailsModal = ({ isOpen, onClose, assignment }) => {
    if (!isOpen || !assignment) return null;

    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!assignment.id) return;

        const q = query(
            collection(db, 'chessAssignment', assignment.id, 'submissions'),
            orderBy('submittedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            console.log("list:", list);
            setSubmissions(list);
            setLoading(false);
        });
        console.log("submissions:", submissions);
        return () => unsubscribe();
    }, [assignment.id]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
            setDeleting(true);
            try {
                await deleteDoc(doc(db, 'chessAssignment', assignment.id));
                onClose();
            } catch (error) {
                console.error("Error deleting assignment:", error);
                alert("Failed to delete assignment.");
            } finally {
                setDeleting(false);
            }
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, fontFamily: "'Figtree', sans-serif"
        }}>
            <div style={{
                background: 'white', borderRadius: '16px', padding: '24px',
                width: '100%', maxWidth: '800px',
                height: '80vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {selectedSubmission && (
                            <button onClick={() => setSelectedSubmission(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                <ChevronLeft size={24} color="#334155" />
                            </button>
                        )}
                        <div>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>
                                {selectedSubmission ? `Submission: ${selectedSubmission.studentName}` : assignment.title}
                            </h2>
                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
                                {selectedSubmission ? `Submitted: ${selectedSubmission.submittedAt?.toDate().toLocaleString()}` : 'Student Submissions'}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!selectedSubmission && (
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                style={{
                                    background: '#fee2e2',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#ef4444'
                                }}
                                title="Delete Assignment"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} color="#64748b" />
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {selectedSubmission ? (
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <ChessReplay
                                pgn={selectedSubmission.pgn}
                                initialFen={assignment.fen}
                            />
                        </div>
                    ) : (
                        loading ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading submissions...</div>
                        ) : submissions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
                                <p>No students have submitted solutions yet.</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <tr>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Student</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Date</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Status</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', color: '#64748b' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map((sub) => (
                                        <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: '500', color: '#334155' }}>{sub.studentName}</td>
                                            <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '14px' }}>
                                                {sub.submittedAt?.toDate ? sub.submittedAt.toDate().toLocaleDateString() : 'Unknown'}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                                    Submitted
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                <Button size="sm" variant="ghost" onClick={() => setSelectedSubmission(sub)}>
                                                    <PlayCircle size={16} style={{ marginRight: '4px' }} /> Replay
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoachAssignmentDetailsModal;
