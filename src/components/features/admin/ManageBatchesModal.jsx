import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import Button from '../../ui/Button';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { toast } from 'react-toastify';
import { Trash2, Plus, Calendar, Clock, BarChart } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const ManageBatchesModal = ({ isOpen, onClose, coach }) => {
    // ✅ All hooks FIRST (before any conditional returns)
    const { isDark } = useTheme();
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newBatch, setNewBatch] = useState({ name: '', schedule: '', level: 'Intermediate' });

    useEffect(() => {
        if (isOpen && coach?.id) {
            fetchBatches();
        }
    }, [isOpen, coach?.id]);

    // ✅ AFTER all hooks, do the early return
    if (!isOpen || !coach) return null;

    const fetchBatches = async () => {
        setLoading(true);
        try {
            // Fetch from coach's subcollection
            const snap = await getDocs(collection(db, 'coaches', coach.accountId || coach.id, 'batches'));
            setBatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error("Error fetching batches:", e);
        }
        setLoading(false);
    };

    const handleAdd = async () => {
        if (!newBatch.name) return;
        try {
            // Add to coach's subcollection
            await addDoc(collection(db, 'coaches', coach.accountId || coach.id, 'batches'), {
                name: newBatch.name,
                schedule: newBatch.schedule,
                level: newBatch.level.toLowerCase(),
                daysOfWeek: [],
                time: '',
                duration: 1,
                description: '',
                studentsId: [],
                assignments: [],
                reports: [],
                createdAt: serverTimestamp()
            });
            setNewBatch({ name: '', schedule: '', level: 'Intermediate' });
            fetchBatches();
        } catch (e) {
            console.error("Error adding batch:", e);
            toast.error("Failed to add batch");
        }
    };

    const handleDelete = (id) => {
        setConfirmDialog({
            title: 'Delete Batch',
            message: 'Are you sure you want to delete this batch? This cannot be undone.',
            confirmLabel: 'Delete',
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'coaches', coach.accountId || coach.id, 'batches', id));
                    fetchBatches();
                } catch (e) {
                    console.error("Error deleting batch:", e);
                    toast.error("Failed to delete batch");
                }
            }
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-content ${isDark ? 'dark-mode' : ''}`} style={{ maxWidth: '600px', width: '90%' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0 }}>Manage Batches for {coach.fullName || 'Coach'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: isDark ? '#aaa' : '#666' }}>&times;</button>
                </div>

                {/* List */}
                <div style={{ marginBottom: '24px', maxHeight: '300px', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ color: isDark ? '#aaa' : '#666', fontStyle: 'italic' }}>Loading batches...</div>
                    ) : batches.length === 0 ? (
                        <div style={{ color: isDark ? '#aaa' : '#666', fontStyle: 'italic' }}>No batches assigned yet.</div>
                    ) : (
                        batches.map(b => (
                            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: isDark ? '#2a2d3e' : '#f8fafc', borderRadius: '8px', marginBottom: '8px', border: `1px solid ${isDark ? '#3d3f55' : '#e2e8f0'}` }}>
                                <div>
                                    <div style={{ fontWeight: '700', color: isDark ? '#f0f0f0' : '#1e293b' }}>{b.name}</div>
                                    <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#64748b', display: 'flex', gap: '12px', marginTop: '4px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {b.schedule || 'Flexible'}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BarChart size={12} /> {b.level}</span>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(b.id)} style={{ color: '#ef4444', border: 'none', background: isDark ? '#3a2a2a' : 'white', padding: '8px', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Form */}
                <div style={{ padding: '20px', background: isDark ? '#1e2130' : '#f1f5f9', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 16px', color: isDark ? '#d1d5db' : '#334155' }}>Assign New Batch</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <input
                            placeholder="Batch Name (e.g. Intermediate Group A)"
                            value={newBatch.name}
                            onChange={e => setNewBatch({ ...newBatch, name: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${isDark ? '#4b5563' : '#cbd5e1'}`, background: isDark ? '#2a2d3e' : 'white', color: isDark ? '#f0f0f0' : '#333', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                            <input
                                placeholder="Schedule (e.g. Mon, Wed 6 PM)"
                                value={newBatch.schedule}
                                onChange={e => setNewBatch({ ...newBatch, schedule: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${isDark ? '#4b5563' : '#cbd5e1'}`, background: isDark ? '#2a2d3e' : 'white', color: isDark ? '#f0f0f0' : '#333', boxSizing: 'border-box' }}
                            />
                            <select
                                value={newBatch.level}
                                onChange={e => setNewBatch({ ...newBatch, level: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${isDark ? '#4b5563' : '#cbd5e1'}`, background: isDark ? '#2a2d3e' : 'white', color: isDark ? '#f0f0f0' : '#333' }}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Advanced Beginner">Advanced Beginner</option>
                                <option value="Intermediate-I">Intermediate-I</option>
                                <option value="Intermediate-II">Intermediate-II</option>
                            </select>
                        </div>
                        <Button onClick={handleAdd} disabled={!newBatch.name} style={{ width: '100%', justifyContent: 'center' }}>
                            <Plus size={16} /> Assign Batch
                        </Button>
                    </div>
                </div>

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <Button variant="secondary" onClick={onClose}>Done</Button>
                </div>
            </div>
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
export default ManageBatchesModal;
