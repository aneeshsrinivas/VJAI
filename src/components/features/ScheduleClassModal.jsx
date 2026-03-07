import React, { useState } from 'react';
import Button from '../ui/Button';
import { createClass } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Calendar, Clock, Video, X, AlignLeft } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const ScheduleClassModal = ({ isOpen, onClose, batchId, batchName, onSuccess }) => {
    const { isDark } = useTheme();
    if (!isOpen) return null;

    const { currentUser, userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [batches, setBatches] = useState([]);
    const [formData, setFormData] = useState({
        topic: '',
        date: '',
        time: '',
        meetLink: '',
        description: '',
        selectedBatchId: ''
    });

    // Fetch Coach's Batches from subcollection
    React.useEffect(() => {
        const fetchBatches = async () => {
            if (!currentUser?.uid) return;
            try {
                // First resolve coachDocId
                const coachesRef = collection(db, 'coaches');
                const qCoach = window.firebaseQuery(coachesRef, window.firebaseWhere('accountId', '==', currentUser.uid));
                const coachSnap = await getDocs(qCoach);
                
                let coachDocId = currentUser.uid; // fallback
                if (!coachSnap.empty) {
                    coachDocId = coachSnap.docs[0].id;
                }

                // Fetch from coaches/{coachDocId}/batches subcollection
                const batchesRef = collection(db, 'coaches', coachDocId, 'batches');
                const snap = await getDocs(batchesRef);
                const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setBatches(list);

                // Default to first batch if available and no batch pre-selected
                if (list.length > 0 && !formData.selectedBatchId && !batchId) {
                    setFormData(prev => ({ ...prev, selectedBatchId: list[0].id }));
                } else if (batchId && batchId !== 'global') {
                    setFormData(prev => ({ ...prev, selectedBatchId: batchId }));
                }
            } catch (e) {
                console.error("Error fetching batches:", e);
            }
        };
        if (isOpen) {
            import('firebase/firestore').then(mod => {
                 window.firebaseQuery = mod.query;
                 window.firebaseWhere = mod.where;
                 fetchBatches();
            });
        }
    }, [isOpen, currentUser, batchId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const selectedBatch = batches.find(b => b.id === formData.selectedBatchId);
        if (!selectedBatch) {
            alert('Please select a valid batch');
            setLoading(false);
            return;
        }

        const result = await createClass({
            ...formData,
            coachId: currentUser.uid,
            coachName: userData?.fullName || currentUser.email?.split('@')[0] || 'Coach',
            batchId: selectedBatch.id,
            batchName: selectedBatch.name,
            status: 'SCHEDULED',
            scheduledAt: new Date(`${formData.date}T${formData.time}`)
        });

        setLoading(false);

        if (result.success) {
            if (onSuccess) onSuccess();
            onClose();
        } else {
            alert('Failed to schedule class');
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
                background: isDark ? '#1a1d27' : 'white', borderRadius: '16px', padding: '24px',
                width: '100%', maxWidth: '500px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', color: isDark ? '#f0f0f0' : '#1e293b' }}>Schedule New Class</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color={isDark ? '#e2e8f0' : "#64748b"} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: isDark ? '#c0c0c0' : '#334155' }}>Topic</label>
                        <input
                            type="text"
                            name="topic"
                            required
                            placeholder="e.g. Ruy Lopez Strategy"
                            value={formData.topic}
                            onChange={handleChange}
                            style={{
                                width: '100%', padding: '10px',
                                borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', outline: 'none',
                                background: isDark ? '#0f1117' : 'white',
                                color: isDark ? '#f0f0f0' : '#1e293b'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: isDark ? '#c0c0c0' : '#334155' }}>Date</label>
                            <input
                                type="date"
                                name="date"
                                required
                                value={formData.date}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '10px',
                                    borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', outline: 'none',
                                    background: isDark ? '#0f1117' : 'white',
                                    color: isDark ? '#f0f0f0' : '#1e293b'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: isDark ? '#c0c0c0' : '#334155' }}>Time</label>
                            <input
                                type="time"
                                name="time"
                                required
                                value={formData.time}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '10px',
                                    borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', outline: 'none',
                                    background: isDark ? '#0f1117' : 'white',
                                    color: isDark ? '#f0f0f0' : '#1e293b'
                                }}
                            />
                        </div>
                    </div>

                    {/* Meet link removed as it is now handled by profile URLs */}


                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: isDark ? '#c0c0c0' : '#334155' }}>Select Batch</label>
                        <select
                            name="selectedBatchId"
                            value={formData.selectedBatchId}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%', padding: '10px',
                                borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', outline: 'none',
                                background: isDark ? '#0f1117' : 'white', fontFamily: 'inherit',
                                color: isDark ? '#f0f0f0' : '#1e293b'
                            }}
                        >
                            <option value="">-- Select a Batch --</option>
                            {batches.map(batch => (
                                <option key={batch.id} value={batch.id}>{batch.name} ({batch.schedule || 'No schedule'})</option>
                            ))}
                        </select>
                        {batches.length === 0 && (
                            <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                                You have no batches assigned. Please contact Admin.
                            </p>
                        )}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: isDark ? '#c0c0c0' : '#334155' }}>Description (Optional)</label>
                        <textarea
                            name="description"
                            placeholder="Class notes or prep..."
                            rows="2"
                            value={formData.description}
                            onChange={handleChange}
                            style={{
                                width: '100%', padding: '12px',
                                borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', outline: 'none', resize: 'none',
                                background: isDark ? '#0f1117' : 'white',
                                color: isDark ? '#f0f0f0' : '#1e293b'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Scheduling...' : 'Schedule Class'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleClassModal;
