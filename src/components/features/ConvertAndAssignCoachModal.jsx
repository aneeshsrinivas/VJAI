import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { conversionService } from '../../services/conversionService';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';
import { toast } from 'react-toastify';

const ConvertAndAssignCoachModal = ({ demo, onClose, onSuccess }) => {
    const { isDark } = useTheme();
    const [coaches, setCoaches] = useState([]);
    const [batches, setBatches] = useState([]);
    const [selectedCoachId, setSelectedCoachId] = useState(demo?.assignedCoachId || '');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch coaches
    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                const coachQuery = query(collection(db, 'coaches'));
                const coachSnap = await getDocs(coachQuery);
                const coachList = coachSnap.docs.map(d => ({
                    id: d.id,
                    accountId: d.data().accountId,
                    fullName: d.data().fullName,
                    email: d.data().email
                }));
                setCoaches(coachList);
            } catch (err) {
                console.error('Error fetching coaches:', err);
                setError('Failed to load coaches');
            }
        };
        fetchCoaches();
    }, []);

    // Fetch batches for selected coach
    useEffect(() => {
        const fetchBatches = async () => {
            if (!selectedCoachId) {
                setBatches([]);
                return;
            }
            try {
                // Find the coach document that matches the selectedCoachId
                const coachQuery = query(collection(db, 'coaches'), where('accountId', '==', selectedCoachId));
                const coachSnap = await getDocs(coachQuery);

                if (!coachSnap.empty) {
                    const coachDocId = coachSnap.docs[0].id;
                    // Fetch batches from this coach's subcollection
                    const batchQuery = query(collection(db, 'coaches', coachDocId, 'batches'));
                    const batchSnap = await getDocs(batchQuery);
                    const batchList = batchSnap.docs.map(d => ({
                        id: d.id,
                        name: d.data().name,
                        level: d.data().level
                    }));
                    setBatches(batchList);
                    setSelectedBatchId('');
                } else {
                    setBatches([]);
                }
            } catch (err) {
                console.error('Error fetching batches:', err);
                setError('Failed to load batches');
            }
        };
        fetchBatches();
    }, [selectedCoachId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!selectedCoachId) {
                setError('Please select a coach');
                setLoading(false);
                return;
            }

            // First, update demo with assigned coach and batch
            await updateDoc(doc(db, 'demos', demo.id), {
                assignedCoachId: selectedCoachId,
                assignedBatchId: selectedBatchId || null
            });

            // Then approve payment (convert to student)
            const result = await conversionService.approvePayment(demo.id);

            if (result.success) {
                toast.success(`Student account created! Coach assigned: ${coaches.find(c => c.accountId === selectedCoachId)?.fullName}`);
                onSuccess();
            }
        } catch (err) {
            console.error('Conversion error:', err);
            setError(err.message || 'Failed to convert student');
        } finally {
            setLoading(false);
        }
    };

    if (!demo) return null;

    const selectedCoach = coaches.find(c => c.accountId === selectedCoachId);
    const selectedBatch = batches.find(b => b.id === selectedBatchId);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-content ${isDark ? 'dark-mode' : ''}`}
                style={{
                    maxWidth: '500px',
                    width: '90%',
                    background: isDark ? '#1a1d2e' : 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: isDark ? '#fff' : '#000' }}>Convert to Student</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: isDark ? '#aaa' : '#666'
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ marginBottom: '20px', padding: '12px', background: isDark ? '#2a2d3e' : '#f5f5f5', borderRadius: '8px' }}>
                    <p style={{ margin: '4px 0', color: isDark ? '#ccc' : '#666', fontSize: '13px' }}>
                        <strong>Student:</strong> {demo.studentName}
                    </p>
                    <p style={{ margin: '4px 0', color: isDark ? '#ccc' : '#666', fontSize: '13px' }}>
                        <strong>Parent:</strong> {demo.parentName} ({demo.parentEmail})
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px',
                        background: '#FEE2E2',
                        color: '#991B1B',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '13px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: isDark ? '#ddd' : '#333' }}>
                            Select Coach *
                        </label>
                        <select
                            value={selectedCoachId}
                            onChange={(e) => setSelectedCoachId(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: `1px solid ${isDark ? '#4b5563' : '#ddd'}`,
                                background: isDark ? '#2a2d3e' : 'white',
                                color: isDark ? '#f0f0f0' : '#000',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">-- Choose Coach --</option>
                            {coaches.map(coach => (
                                <option key={coach.id} value={coach.accountId}>
                                    {coach.fullName} ({coach.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {batches.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: isDark ? '#ddd' : '#333' }}>
                                Assign to Batch (Optional)
                            </label>
                            <select
                                value={selectedBatchId}
                                onChange={(e) => setSelectedBatchId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    border: `1px solid ${isDark ? '#4b5563' : '#ddd'}`,
                                    background: isDark ? '#2a2d3e' : 'white',
                                    color: isDark ? '#f0f0f0' : '#000',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">-- No Batch (Assign Later) --</option>
                                {batches.map(batch => (
                                    <option key={batch.id} value={batch.id}>
                                        {batch.name} ({batch.level})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {selectedCoach && (
                        <div style={{
                            padding: '12px',
                            background: isDark ? '#2a3a2a' : '#D1FAE5',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            color: isDark ? '#9ae69a' : '#065F46',
                            fontSize: '13px'
                        }}>
                            ✓ Coach selected: <strong>{selectedCoach.fullName}</strong>
                            {selectedBatch && ` | Batch: ${selectedBatch.name}`}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !selectedCoachId}>
                            {loading ? 'Converting...' : 'Convert to Student'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConvertAndAssignCoachModal;
