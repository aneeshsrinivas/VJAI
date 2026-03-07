import React, { useState, useEffect } from 'react';
import { getAllDemos, getDemosByStatus, deleteDemo } from '../../services/firestoreService';
import { conversionService } from '../../services/conversionService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AssignCoachModal from '../../components/features/AssignCoachModal';
import DemoOutcomeModal from '../../components/features/DemoOutcomeModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Trash2, Edit, Link, CheckCircle } from 'lucide-react';
import './DemosPage.css';

const DemosPage = () => {
    const { currentUser } = useAuth();
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);
    const [selectedDemo, setSelectedDemo] = useState(null);
    const [demos, setDemos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDialog, setConfirmDialog] = useState(null);

    useEffect(() => {
        fetchDemos();
    }, [filter]);

    const fetchDemos = async () => {
        setLoading(true);
        try {
            const result = await getAllDemos();

            if (result.success) {
                setDemos(result.demos);
            } else {
                setDemos([]);
                toast.error('Failed to load demos from server.');
            }
        } catch (error) {
            console.error('Failed to fetch demos:', error);
            toast.error('Failed to fetch demos. Please check your connection.');
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
            PAYMENT_PENDING: { bg: '#FEF3C7', color: '#B45309' },
            PAYMENT_COMPLETED: { bg: '#FCA5A5', color: '#7F1D1D' },
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

    const handleDeleteClick = (demoId) => {
        setConfirmDialog({
            title: 'Delete Demo Request',
            message: 'Are you sure you want to delete this demo request? This action cannot be undone.',
            confirmLabel: 'Delete',
            onConfirm: async () => {
                setLoading(true);
                const result = await deleteDemo(demoId);
                if (result.success) {
                    toast.success('Demo request deleted successfully');
                    fetchDemos();
                } else {
                    toast.error('Failed to delete demo: ' + result.error);
                }
                setLoading(false);
            }
        });
    };

    const handleApprovePayment = (demo) => {
        setConfirmDialog({
            title: 'Confirm Payment & Assign Coach',
            message: `Approve account for ${demo.studentName}? You will need to assign a coach to fully activate their account.`,
            confirmLabel: 'Approve',
            variant: 'warning',
            onConfirm: async () => {
                setLoading(true);
                try {
                    if (demo._fromUsersCollection && demo._userId) {
                        // User-sourced entry: update user status directly
                        const { updateDoc, doc, addDoc, collection, serverTimestamp } = await import('firebase/firestore');
                        const { db } = await import('../../lib/firebase');
                        await updateDoc(doc(db, 'users', demo._userId), {
                            status: 'ACTIVE',
                            updatedAt: serverTimestamp()
                        });
                        // Optionally create a demo record for proper tracking
                        await addDoc(collection(db, 'demos'), {
                            studentName: demo.studentName,
                            parentName: demo.parentName,
                            parentEmail: demo.parentEmail,
                            status: 'CONVERTED',
                            _autoCreatedFromUser: true,
                            userId: demo._userId,
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp()
                        });
                    } else {
                        await conversionService.approvePayment(demo.id);
                    }
                    toast.success('Payment Approved! Student account is now active.');
                    fetchDemos();
                } catch (error) {
                    console.error(error);
                    toast.error('Approval Failed: ' + error.message);
                }
                setLoading(false);
            }
        });
    };


    const copyPaymentLink = (demoId) => {
        const link = `${window.location.origin}/pricing?demoId=${demoId}`;
        navigator.clipboard.writeText(link);
        toast.success('Payment link copied!');
    };

    const filteredDemos = demos.filter(demo => {
        const matchesSearch = (demo.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (demo.parentEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'ALL' || demo.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="demos-page-container" style={{ padding: '24px' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 className="page-title" style={{ margin: 0 }}>Demo Classes</h1>
                    <p className="page-subtitle" style={{ color: '#666', margin: '4px 0 0' }}>Manage demo requests, scheduling, and conversion outcomes.</p>
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
                {['ALL', 'PENDING', 'SCHEDULED', 'ATTENDED', 'INTERESTED', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'CONVERTED'].map(f => (
                    <button
                        key={f}
                        className={`filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '12px',
                            border: filter === f ? 'none' : '1px solid #ddd',
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
                    <table className="demos-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Parent Contact</th>
                                <th>Status</th>
                                <th>Preferred Time</th>
                                <th>Assigned Coach</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDemos.map(demo => (
                                <tr key={demo.id}>
                                    <td className="table-cell">
                                        <div className="student-name" style={{ fontWeight: '600' }}>{demo.studentName}</div>
                                        <div className="student-exp" style={{ fontSize: '12px', color: '#888' }}>{demo.chessExperience}</div>
                                    </td>
                                    <td className="table-cell">
                                        <div className="parent-name" style={{ fontSize: '14px' }}>{demo.parentName}</div>
                                        <a className="parent-email" href={`mailto:${demo.parentEmail}`} style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }}>{demo.parentEmail}</a>
                                    </td>
                                    <td className="table-cell">{getStatusBadge(demo.status)}</td>
                                    <td className="table-cell" style={{ fontSize: '14px' }}>
                                        <div className="preferred-time">
                                            {demo.scheduledStart ?
                                                new Date(demo.scheduledStart).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) :
                                                (demo.preferredDateTime || (demo.preferredDate && demo.preferredTime ? `${demo.preferredDate} ${demo.preferredTime}` : '-'))
                                            }
                                        </div>
                                        <div className="timezone-text" style={{ fontSize: '11px', color: '#666' }}>{demo.timezone}</div>
                                    </td>
                                    <td className="table-cell" style={{ fontSize: '14px' }}>
                                        {demo.assignedCoachId ? (
                                            <span style={{ fontWeight: '500', color: '#059669' }}>Assigned</span>
                                        ) : (
                                            <span className="unassigned-text" style={{ color: '#999', fontStyle: 'italic' }}>Unassigned</span>
                                        )}
                                    </td>
                                    <td className="table-cell">
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {/* Action: Assign or Reassign */}
                                            {(demo.status === 'PENDING' || demo.status === 'SCHEDULED') && (
                                                <Button
                                                    size="sm"
                                                    variant={demo.status === 'SCHEDULED' ? 'outline' : 'primary'}
                                                    onClick={() => handleAssignClick(demo)}
                                                    title={demo.status === 'SCHEDULED' ? "Reassign Coach" : "Assign Coach"}
                                                >
                                                    {demo.status === 'SCHEDULED' ? <Edit size={14} /> : 'Assign'}
                                                </Button>
                                            )}

                                            {/* Action: Record Outcome */}
                                            {demo.status === 'SCHEDULED' && (
                                                <Button size="sm" variant="secondary" onClick={() => handleOutcomeClick(demo)}>
                                                    Outcome
                                                </Button>
                                            )}

                                            {/* Action: Copy Payment Link (for online payment) */}
                                            {(demo.status === 'INTERESTED' || demo.status === 'ATTENDED') && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => copyPaymentLink(demo.id)}
                                                        title="Copy payment link to send to parent"
                                                    >
                                                        <Link size={14} style={{ marginRight: '4px' }} /> Copy Payment Link
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Action: Approve Payment */}
                                            {demo.status === 'PAYMENT_PENDING' && (
                                                <Button
                                                    size="sm"
                                                    style={{ backgroundColor: '#166534' }}
                                                    onClick={() => handleApprovePayment(demo)}
                                                >
                                                    <CheckCircle size={14} style={{ marginRight: '4px' }} />
                                                    Approve
                                                </Button>
                                            )}

                                            {/* Action: Convert (for Payment Completed) */}
                                            {demo.status === 'PAYMENT_COMPLETED' && (
                                                <Button
                                                    size="sm"
                                                    style={{ backgroundColor: '#DC2626' }}
                                                    onClick={() => handleApprovePayment(demo)}
                                                    title="Convert to Student Account"
                                                >
                                                    <CheckCircle size={14} style={{ marginRight: '4px' }} />
                                                    Convert
                                                </Button>
                                            )}

                                            {/* Action: Delete */}
                                            <button
                                                onClick={() => handleDeleteClick(demo.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#ef4444',
                                                    padding: '6px',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                                title="Delete Demo Request"
                                            >
                                                <Trash2 size={16} />
                                            </button>
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

            {confirmDialog && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    confirmLabel={confirmDialog.confirmLabel || 'Confirm'}
                    variant={confirmDialog.variant || 'danger'}
                    onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}
        </div>
    );
};

export default DemosPage;

