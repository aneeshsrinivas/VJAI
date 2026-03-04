import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ApproveCoachModal from '../../components/features/ApproveCoachModal';
import { toast, ToastContainer } from 'react-toastify';
import { FileText, CheckCircle, XCircle, Clock, Mail, Phone, Award, Calendar } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

// Color scheme
const COLORS = {
    orange: '#FC8A24',
    deepBlue: '#003366',
    oliveGreen: '#6B8E23',
    ivory: '#FFFEF3'
};

const AdminCoachApplications = () => {
    const { currentUser } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Real-time listener for pending coach applications
    useEffect(() => {
        const q = query(collection(db, 'coaches'), where('status', '==', 'PENDING'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setApplications(apps);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching applications:', error);
            toast.error('Failed to fetch applications');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleReject = async (app) => {
        setConfirmDialog({
            title: 'Reject Application',
            message: `Reject ${app.fullName}'s coach application? This action cannot be undone.`,
            confirmLabel: 'Reject',
            onConfirm: async () => {
                try {
                    await updateDoc(doc(db, 'coaches', app.id), {
                        status: 'REJECTED',
                        rejectedBy: currentUser?.uid || 'admin',
                        rejectedAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                    toast.info('Application rejected');
                } catch (error) {
                    toast.error('Failed to reject: ' + error.message);
                }
            }
        });
    };

    const formatDate = (timestamp) => {
        if (!timestamp?.toDate) return 'N/A';
        return timestamp.toDate().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div style={{ padding: '24px', minHeight: '100vh' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: 0, color: COLORS.deepBlue, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileText size={28} />
                    Coach Applications
                </h1>
                <p className="sub-text" style={{ margin: '8px 0 0' }}>
                    Review and approve incoming coach registration requests
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <Card style={{ padding: '20px', borderLeft: `4px solid ${COLORS.orange}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Clock size={24} color={COLORS.orange} />
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: '700' }}>
                                {applications.length}
                            </div>
                            <div className="sub-text" style={{ fontSize: '13px' }}>Pending Applications</div>
                        </div>
                    </div>
                </Card>
                <Card style={{ padding: '20px', borderLeft: `4px solid ${COLORS.oliveGreen}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CheckCircle size={24} color={COLORS.oliveGreen} />
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: '700' }}>0</div>
                            <div className="sub-text" style={{ fontSize: '13px' }}>Approved This Week</div>
                        </div>
                    </div>
                </Card>
                <Card style={{ padding: '20px', borderLeft: `4px solid ${COLORS.deepBlue}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Award size={24} color={COLORS.deepBlue} />
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: '700' }}>
                                {applications.filter(a => a.fideRating > 1500).length}
                            </div>
                            <div className="sub-text" style={{ fontSize: '13px' }}>FIDE Rated (1500+)</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Applications List */}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div className="sub-text" style={{ padding: '60px', textAlign: 'center' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid #eee', borderTopColor: COLORS.deepBlue, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                        Loading applications...
                    </div>
                ) : applications.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <FileText size={48} color="#ddd" style={{ marginBottom: '16px' }} />
                        <h3 style={{ margin: '0 0 8px' }}>No Pending Applications</h3>
                        <p className="sub-text" style={{ margin: 0 }}>All caught up! New applications will appear here.</p>
                    </div>
                ) : (
                    <div>
                        {/* Table Header */}
                        <div className="admin-panel-list-item" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '16px', padding: '16px 24px', borderBottom: '2px solid currentColor', fontWeight: '600', fontSize: '13px' }}>
                            <div>Applicant</div>
                            <div>Credentials</div>
                            <div>Experience</div>
                            <div>Applied On</div>
                            <div>Actions</div>
                        </div>

                        {/* Table Body */}
                        {applications.map(app => (
                            <div key={app.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '16px', padding: '20px 24px', borderBottom: '1px solid #eee', alignItems: 'center', transition: 'background 0.2s' }}>
                                <div>
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                        {app.fullName || 'Unknown'}
                                    </div>
                                    <div className="sub-text" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                        <Mail size={12} /> {app.email}
                                    </div>
                                    {app.phone && (
                                        <div className="sub-text" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginTop: '2px' }}>
                                            <Phone size={12} /> {app.phone}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '500' }}>{app.title || 'N/A'}</div>
                                    <div style={{ fontSize: '12px', color: COLORS.oliveGreen, fontWeight: '600' }}>
                                        FIDE: {app.fideRating || 'Unrated'}
                                    </div>
                                </div>
                                <div>
                                    <span style={{ padding: '4px 10px', backgroundColor: '#E0E7FF', color: COLORS.deepBlue, borderRadius: '12px', fontSize: '13px', fontWeight: '600' }}>
                                        {app.experience || 0} Years
                                    </span>
                                </div>
                                <div className="sub-text" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                    <Calendar size={12} /> {formatDate(app.createdAt)}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button
                                        size="sm"
                                        onClick={() => { setSelectedApp(app); setModalOpen(true); }}
                                        style={{ backgroundColor: COLORS.oliveGreen, border: 'none' }}
                                    >
                                        <CheckCircle size={14} style={{ marginRight: 4 }} />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleReject(app)}
                                        style={{ borderColor: '#EF4444', color: '#EF4444' }}
                                    >
                                        <XCircle size={14} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Approve Modal */}
            {modalOpen && selectedApp && (
                <ApproveCoachModal
                    application={selectedApp}
                    onClose={() => { setModalOpen(false); setSelectedApp(null); }}
                    onSuccess={() => {
                        setModalOpen(false);
                        setSelectedApp(null);
                        toast.success(`${selectedApp?.fullName || 'Coach'} approved & credentials sent!`);
                    }}
                />
            )}

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
            {confirmDialog && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    confirmLabel={confirmDialog.confirmLabel || 'Confirm'}
                    onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}
        </div>
    );
};

export default AdminCoachApplications;
