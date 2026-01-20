import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AddCoachModal from '../../components/features/admin/AddCoachModal';
import { User, Mail, Phone, Star } from 'lucide-react';
import '../../pages/Dashboard.css';

import AdminCoachApplications from './AdminCoachApplications';

const CoachRoster = () => {
    const [activeTab, setActiveTab] = useState('roster'); // 'roster' or 'applications'
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCoach, setEditingCoach] = useState(null);
    const [isEditOpen, setEditOpen] = useState(false);
    const [batches, setBatches] = useState([]);
    const [newBatchName, setNewBatchName] = useState('');

    const fetchCoaches = async () => {
        setLoading(true);
        try {
            // Fetch from coaches collection
            const coachSnapshot = await getDocs(collection(db, 'coaches'));
            let coachList = coachSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Also fetch users with role 'coach'
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const coachUsers = usersSnapshot.docs
                .filter(doc => doc.data().role === 'coach')
                .map(doc => ({
                    id: doc.id,
                    name: doc.data().fullName || doc.data().email?.split('@')[0] || 'Coach',
                    email: doc.data().email,
                    title: doc.data().chessTitle || 'Chess Trainer',
                    rating: doc.data().rating || '-',
                    bio: doc.data().bio || 'No bio provided',
                    phone: doc.data().phone || '-'
                }));

            // Combine both sources, avoiding duplicates
            const existingIds = coachList.map(c => c.id);
            coachUsers.forEach(u => {
                if (!existingIds.includes(u.id)) {
                    coachList.push(u);
                }
            });

            setCoaches(coachList);
        } catch (error) {
            console.error('Error fetching coaches:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'roster') {
            fetchCoaches();
        }
    }, [activeTab]);

    // fetch batches for assigning
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const snap = await getDocs(collection(db, 'batches'));
                const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setBatches(list);
            } catch (err) {
                console.error('Error loading batches:', err);
            }
        };
        fetchBatches();
    }, []);

    const handleAddSuccess = () => {
        setAddModalOpen(false);
        fetchCoaches();
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="welcome-text">Coach Management</h1>
                    <p className="sub-text">Overview of coaching staff and applications.</p>
                </div>
                {activeTab === 'roster' && (
                    <Button onClick={() => setAddModalOpen(true)}>+ Add New Coach</Button>
                )}
            </div>

            <div className="tabs" style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '1px solid #eee' }}>
                <div
                    onClick={() => setActiveTab('roster')}
                    style={{
                        padding: '12px 0',
                        cursor: 'pointer',
                        color: activeTab === 'roster' ? '#1E3A8A' : '#666',
                        borderBottom: activeTab === 'roster' ? '2px solid #1E3A8A' : 'none',
                        fontWeight: activeTab === 'roster' ? '600' : '400'
                    }}
                >
                    Active Roster
                </div>
                <div
                    onClick={() => setActiveTab('applications')}
                    style={{
                        padding: '12px 0',
                        cursor: 'pointer',
                        color: activeTab === 'applications' ? '#1E3A8A' : '#666',
                        borderBottom: activeTab === 'applications' ? '2px solid #1E3A8A' : 'none',
                        fontWeight: activeTab === 'applications' ? '600' : '400'
                    }}
                >
                    Applications
                </div>
            </div>

            {activeTab === 'roster' ? (
                <>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>Loading coaches...</div>
                    ) : coaches.length === 0 ? (
                        <Card>
                            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                <User size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
                                <h3 style={{ margin: '0 0 8px' }}>No Coaches Found</h3>
                                <p style={{ margin: '0 0 16px' }}>Add your first coach to get started.</p>
                                <Button onClick={() => setAddModalOpen(true)}>+ Add Coach</Button>
                            </div>
                        </Card>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {coaches.map(coach => (
                                <Card key={coach.id} style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: '700',
                                            fontSize: '20px',
                                            flexShrink: 0
                                        }}>
                                            {(coach.name || coach.coachName || 'C').charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600' }}>
                                                {coach.name || coach.coachName || 'Unknown Coach'}
                                            </h3>
                                            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                                                {coach.title || coach.chessTitle || 'Chess Trainer'}
                                            </div>
                                            {coach.rating && coach.rating !== '-' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#1E3A8A', fontWeight: '600' }}>
                                                    <Star size={12} />
                                                    Rating: {coach.rating}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {coach.bio && (
                                        <p style={{ fontSize: '13px', color: '#666', margin: '12px 0', lineHeight: '1.5' }}>
                                            {coach.bio.length > 120 ? coach.bio.substring(0, 120) + '...' : coach.bio}
                                        </p>
                                    )}

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#666' }}>
                                            <Mail size={14} />
                                            {coach.email || '-'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#666' }}>
                                            <Phone size={14} />
                                            {coach.phone || '-'}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                        <Button size="sm" onClick={() => { setEditingCoach({ ...coach, assignedBatchId: coach.assignedBatchId || coach.batchId || '' }); setEditOpen(true); }} style={{ backgroundColor: '#F3F4F6', color: '#111' }}>Edit</Button>
                                        <Button size="sm" onClick={() => { setEditingCoach({ ...coach, assignedBatchId: coach.assignedBatchId || coach.batchId || '' }); setEditOpen(true); }} style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>Assign / Change Batch</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <AdminCoachApplications />
            )}

            {/* Edit Coach Modal */}
            {isEditOpen && editingCoach && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
                    <div style={{ background: '#fff', borderRadius: 12, width: 560, maxWidth: '95%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Edit Coach</h3>
                            <button onClick={() => { setEditOpen(false); setEditingCoach(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>

                        <div style={{ padding: 20, display: 'grid', gap: 12 }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Name</label>
                                <input value={editingCoach.name || editingCoach.coachName || ''} onChange={(e) => setEditingCoach(prev => ({ ...prev, name: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Email</label>
                                <input value={editingCoach.email || ''} onChange={(e) => setEditingCoach(prev => ({ ...prev, email: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Title</label>
                                    <input value={editingCoach.title || editingCoach.chessTitle || ''} onChange={(e) => setEditingCoach(prev => ({ ...prev, title: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Phone</label>
                                    <input value={editingCoach.phone || ''} onChange={(e) => setEditingCoach(prev => ({ ...prev, phone: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Bio</label>
                                <textarea value={editingCoach.bio || ''} onChange={(e) => setEditingCoach(prev => ({ ...prev, bio: e.target.value }))} rows={4} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Rating</label>
                                    <input value={editingCoach.rating || ''} onChange={(e) => setEditingCoach(prev => ({ ...prev, rating: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Assign Batch</label>
                                    <select value={editingCoach.assignedBatchId || ''} onChange={(e) => setEditingCoach(prev => ({ ...prev, assignedBatchId: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
                                        <option value="">-- No Batch --</option>
                                        {batches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name || b.id}</option>
                                        ))}
                                    </select>
                                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                                <input placeholder="New batch name" value={newBatchName} onChange={e => setNewBatchName(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #ddd' }} />
                                                <Button size="sm" onClick={async () => {
                                                    const name = (newBatchName || '').trim();
                                                    if (!name) return alert('Please enter a batch name');
                                                    try {
                                                        const payload = {
                                                            name,
                                                            createdAt: serverTimestamp(),
                                                            assignedCoachId: editingCoach?.id || null
                                                        };
                                                        const ref = await addDoc(collection(db, 'batches'), payload);
                                                        const created = { id: ref.id, ...payload };
                                                        setBatches(prev => [created, ...prev]);
                                                        setEditingCoach(prev => ({ ...prev, assignedBatchId: ref.id }));
                                                        setNewBatchName('');
                                                    } catch (err) {
                                                        console.error('Error creating batch:', err);
                                                        alert('Failed to create batch: ' + err.message);
                                                    }
                                                }} style={{ backgroundColor: '#3B82F6', color: 'white' }}>Create</Button>
                                            </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid #eee' }}>
                            <Button variant="secondary" onClick={() => { setEditOpen(false); setEditingCoach(null); }}>Cancel</Button>
                            <Button onClick={async () => {
                                // save changes
                                try {
                                    const coachRef = doc(db, 'coaches', editingCoach.id);
                                    const updateData = {
                                        fullName: editingCoach.name,
                                        email: editingCoach.email,
                                        chessTitle: editingCoach.title,
                                        phone: editingCoach.phone,
                                        bio: editingCoach.bio,
                                        rating: editingCoach.rating,
                                        assignedBatchId: editingCoach.assignedBatchId || null,
                                        updatedAt: serverTimestamp()
                                    };
                                    await updateDoc(coachRef, updateData);

                                    // try update users collection for coach profile if exists
                                    try {
                                        const userRef = doc(db, 'users', editingCoach.id);
                                        await updateDoc(userRef, {
                                            fullName: editingCoach.name,
                                            email: editingCoach.email
                                        });
                                    } catch (uErr) {
                                        // ignore if user doc not found
                                    }

                                    setEditOpen(false);
                                    setEditingCoach(null);
                                    fetchCoaches();
                                } catch (err) {
                                    console.error('Error updating coach:', err);
                                    alert('Failed to save coach: ' + err.message);
                                }
                            }} style={{ backgroundColor: '#10B981', color: 'white' }}>Save</Button>
                        </div>
                    </div>
                </div>
            )}
            <AddCoachModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />
        </div>
    );
};

export default CoachRoster;
