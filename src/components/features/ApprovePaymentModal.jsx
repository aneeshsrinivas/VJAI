import React, { useState, useEffect } from 'react';
import { getAllCoaches } from '../../services/firestoreService';
import { conversionService } from '../../services/conversionService';
import { useAuth } from '../../context/AuthContext';
import { auth, db } from '../../lib/firebase';
import { useTheme } from '../../context/ThemeContext';
import { collection, query, getDocs } from 'firebase/firestore';
import Button from '../ui/Button';
import { X, CheckCircle, User, BookOpen } from 'lucide-react';

const ApprovePaymentModal = ({ demo, onClose, onSuccess }) => {
    const { isDark } = useTheme();
    const { currentUser: contextUser } = useAuth();
    const currentUser = contextUser || auth.currentUser;

    const [coaches, setCoaches] = useState([]);
    const [batches, setBatches] = useState([]);
    const [selectedCoachId, setSelectedCoachId] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
        if (demo.assignedCoachId) setSelectedCoachId(demo.assignedCoachId);
    }, []);

    const fetchData = async () => {
        try {
            const coachResult = await getAllCoaches();
            if (coachResult.success) {
                setCoaches(coachResult.coaches);
            }
            
            const batchSnap = await getDocs(collection(db, 'batches'));
            const batchList = batchSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBatches(batchList);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await conversionService.approvePayment(demo.id, {
                coachId: selectedCoachId,
                batchId: selectedBatchId
            });

            if (result.success) {
                onSuccess();
            } else {
                setError(result.error || 'Failed to approve payment');
            }
        } catch (err) {
            console.error('Approval Error:', err);
            setError(err.message || 'An unexpected error occurred during approval');
        } finally {
            setLoading(false);
        }
    };

    if (!demo) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: isDark ? '#1a1d27' : 'white',
                borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '550px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)', position: 'relative',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '20px', right: '20px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: isDark ? '#94a3b8' : '#64748b'
                }}>
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ 
                        width: '60px', height: '60px', borderRadius: '50%', 
                        background: '#f0f9ff', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', margin: '0 auto 16px', color: '#3b82f6'
                    }}>
                        <CheckCircle size={32} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '24px', color: isDark ? '#f8fafc' : '#1e293b' }}>
                        Approve Enrollment
                    </h2>
                    <p style={{ color: isDark ? '#94a3b8' : '#64748b', marginTop: '8px' }}>
                        Approve payment for <strong>{demo.studentName}</strong> and assign to a coach
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px', borderRadius: '8px', background: '#fef2f2',
                        color: '#b91c1c', border: '1px solid #fecaca', marginBottom: '20px',
                        fontSize: '14px'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block', fontSize: '14px', fontWeight: '600', 
                            marginBottom: '8px', color: isDark ? '#cbd5e1' : '#475569' 
                        }}>
                            <User size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                            Assign Coach
                        </label>
                        <select 
                            value={selectedCoachId}
                            onChange={(e) => setSelectedCoachId(e.target.value)}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px',
                                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                                background: isDark ? '#0f172a' : 'white',
                                color: isDark ? '#f8fafc' : '#1e293b', outline: 'none'
                            }}
                        >
                            <option value="">-- Select Coach (Optional) --</option>
                            {coaches.map(c => (
                                <option key={c.id} value={c.accountId || c.id}>
                                    {c.fullName || c.coachName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ 
                            display: 'block', fontSize: '14px', fontWeight: '600', 
                            marginBottom: '8px', color: isDark ? '#cbd5e1' : '#475569' 
                        }}>
                            <BookOpen size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                            Assign Batch
                        </label>
                        <select 
                            value={selectedBatchId}
                            onChange={(e) => setSelectedBatchId(e.target.value)}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px',
                                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                                background: isDark ? '#0f172a' : 'white',
                                color: isDark ? '#f8fafc' : '#1e293b', outline: 'none'
                            }}
                        >
                            <option value="">-- Select Batch (Optional) --</option>
                            {batches.map(b => (
                                <option key={b.id} value={b.id}>
                                    {b.name || b.batchName} ({b.level})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={onClose} 
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading} 
                            style={{ flex: 1, background: '#10b981' }}
                        >
                            {loading ? 'Approving...' : 'Approve & Activate'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApprovePaymentModal;
