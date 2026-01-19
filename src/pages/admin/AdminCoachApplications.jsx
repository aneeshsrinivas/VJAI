import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast, ToastContainer } from 'react-toastify';
import { FileText, CheckCircle, XCircle, Clock, User, Mail, Phone, Award, Calendar } from 'lucide-react';
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
    const [modalOpen, setModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);

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

    const handleApprove = async () => {
        if (!selectedApp || !password.trim()) {
            toast.error('Please enter a temporary password');
            return;
        }

        setProcessing(true);
        try {
            // Update coach status to ACTIVE
            await updateDoc(doc(db, 'coaches', selectedApp.id), {
                status: 'ACTIVE',
                approvedBy: currentUser?.uid || 'admin',
                approvedAt: serverTimestamp(),
                tempPassword: password,
                updatedAt: serverTimestamp()
            });

            // Create user account record
            await addDoc(collection(db, 'users'), {
                email: selectedApp.email,
                fullName: selectedApp.fullName,
                role: 'coach',
                coachId: selectedApp.id,
                createdAt: serverTimestamp()
            });

            toast.success(`${selectedApp.fullName} approved as coach!`);
            setModalOpen(false);
            setSelectedApp(null);
            setPassword('');
        } catch (error) {
            console.error('Error approving coach:', error);
            toast.error('Failed to approve: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (app) => {
        if (!window.confirm(`Are you sure you want to reject ${app.fullName}'s application?`)) return;

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
        <div style={{ padding: '24px', backgroundColor: COLORS.ivory, minHeight: '100vh' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: 0, color: COLORS.deepBlue, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileText size={28} />
                    Coach Applications
                </h1>
                <p style={{ color: '#666', margin: '8px 0 0' }}>
                    Review and approve incoming coach registration requests
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <Card style={{ padding: '20px', borderLeft: `4px solid ${COLORS.orange}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Clock size={24} color={COLORS.orange} />
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.deepBlue }}>
                                {applications.length}
                            </div>
                            <div style={{ fontSize: '13px', color: '#666' }}>Pending Applications</div>
                        </div>
                    </div>
                </Card>
                <Card style={{ padding: '20px', borderLeft: `4px solid ${COLORS.oliveGreen}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CheckCircle size={24} color={COLORS.oliveGreen} />
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.deepBlue }}>0</div>
                            <div style={{ fontSize: '13px', color: '#666' }}>Approved This Week</div>
                        </div>
                    </div>
                </Card>
                <Card style={{ padding: '20px', borderLeft: `4px solid ${COLORS.deepBlue}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Award size={24} color={COLORS.deepBlue} />
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.deepBlue }}>
                                {applications.filter(a => a.fideRating > 1500).length}
                            </div>
                            <div style={{ fontSize: '13px', color: '#666' }}>FIDE Rated (1500+)</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Applications List */}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid #eee', borderTopColor: COLORS.deepBlue, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                        Loading applications...
                    </div>
                ) : applications.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <FileText size={48} color="#ddd" style={{ marginBottom: '16px' }} />
                        <h3 style={{ color: COLORS.deepBlue, margin: '0 0 8px' }}>No Pending Applications</h3>
                        <p style={{ color: '#666', margin: 0 }}>All caught up! New applications will appear here.</p>
                    </div>
                ) : (
                    <div>
                        {/* Table Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '16px', padding: '16px 24px', backgroundColor: COLORS.ivory, borderBottom: `2px solid ${COLORS.deepBlue}`, fontWeight: '600', color: COLORS.deepBlue, fontSize: '13px' }}>
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
                                    <div style={{ fontWeight: '600', color: COLORS.deepBlue, marginBottom: '4px' }}>
                                        {app.fullName || 'Unknown'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666' }}>
                                        <Mail size={12} /> {app.email}
                                    </div>
                                    {app.phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666', marginTop: '2px' }}>
                                            <Phone size={12} /> {app.phone}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '500', color: COLORS.deepBlue }}>{app.title || 'N/A'}</div>
                                    <div style={{ fontSize: '12px', color: COLORS.oliveGreen, fontWeight: '600' }}>
                                        FIDE: {app.fideRating || 'Unrated'}
                                    </div>
                                </div>
                                <div>
                                    <span style={{ padding: '4px 10px', backgroundColor: '#E0E7FF', color: COLORS.deepBlue, borderRadius: '12px', fontSize: '13px', fontWeight: '600' }}>
                                        {app.experience || 0} Years
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666' }}>
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
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', width: '450px', maxWidth: '95%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ margin: '0 0 20px', color: COLORS.deepBlue, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckCircle size={24} color={COLORS.oliveGreen} />
                            Approve Coach Application
                        </h2>

                        <div style={{ padding: '16px', backgroundColor: COLORS.ivory, borderRadius: '10px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: COLORS.deepBlue, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>
                                    {selectedApp.fullName?.charAt(0) || 'C'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', color: COLORS.deepBlue }}>{selectedApp.fullName}</div>
                                    <div style={{ fontSize: '13px', color: '#666' }}>{selectedApp.email}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#666' }}>
                                <span>Experience: {selectedApp.experience} years</span>
                                <span>FIDE: {selectedApp.fideRating || 'Unrated'}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: COLORS.deepBlue }}>
                                Set Temporary Password *
                            </label>
                            <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                Share this password securely with the coach. They will use their email and this password to login.
                            </p>
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="e.g. CoachPass@2024"
                                style={{ width: '100%', padding: '12px', border: `2px solid ${COLORS.deepBlue}`, borderRadius: '8px', fontSize: '14px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <Button variant="secondary" onClick={() => { setModalOpen(false); setSelectedApp(null); setPassword(''); }}>
                                Cancel
                            </Button>
                            <Button onClick={handleApprove} disabled={processing} style={{ backgroundColor: COLORS.oliveGreen, border: 'none' }}>
                                {processing ? 'Approving...' : 'Approve & Create Account'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AdminCoachApplications;
