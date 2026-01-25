import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import Button from '../../ui/Button';
import { Trash2, Plus, Calendar, Clock, BarChart } from 'lucide-react';

const ManageBatchesModal = ({ isOpen, onClose, coach }) => {
    if (!isOpen || !coach) return null;

    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newBatch, setNewBatch] = useState({ name: '', schedule: '', level: 'Intermediate' });

    useEffect(() => {
        if (isOpen && coach?.id) {
            fetchBatches();
        }
    }, [isOpen, coach?.id]);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            // Fetch from coach's subcollection
            const snap = await getDocs(collection(db, 'coaches', coach.id, 'batches'));
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
            await addDoc(collection(db, 'coaches', coach.id, 'batches'), {
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
            alert("Failed to add batch");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this batch?')) return;
        try {
            // Delete from coach's subcollection
            await deleteDoc(doc(db, 'coaches', coach.id, 'batches', id));
            fetchBatches();
        } catch (e) {
            console.error("Error deleting batch:", e);
            alert("Failed to delete batch");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0 }}>Manage Batches for {coach.name || coach.coachName}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                </div>

                {/* List */}
                <div style={{ marginBottom: '24px', maxHeight: '300px', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ color: '#666', fontStyle: 'italic' }}>Loading batches...</div>
                    ) : batches.length === 0 ? (
                        <div style={{ color: '#666', fontStyle: 'italic' }}>No batches assigned yet.</div>
                    ) : (
                        batches.map(b => (
                            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '8px', border: '1px solid #e2e8f0' }}>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{b.name}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '12px', marginTop: '4px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {b.schedule || 'Flexible'}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BarChart size={12} /> {b.level}</span>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(b.id)} style={{ color: '#ef4444', border: 'none', background: 'white', padding: '8px', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Form */}
                <div style={{ padding: '20px', background: '#f1f5f9', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 16px', color: '#334155' }}>Assign New Batch</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <input
                            placeholder="Batch Name (e.g. Intermediate Group A)"
                            value={newBatch.name}
                            onChange={e => setNewBatch({ ...newBatch, name: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                            <input
                                placeholder="Schedule (e.g. Mon, Wed 6 PM)"
                                value={newBatch.schedule}
                                onChange={e => setNewBatch({ ...newBatch, schedule: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                            <select
                                value={newBatch.level}
                                onChange={e => setNewBatch({ ...newBatch, level: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            >
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
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
        </div>
    );
};
export default ManageBatchesModal;
