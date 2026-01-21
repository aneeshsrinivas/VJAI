import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, serverTimestamp, addDoc, query, where, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AddCoachModal from '../../components/features/admin/AddCoachModal';
import ManageBatchesModal from '../../components/features/admin/ManageBatchesModal';
import { User, Mail, Phone, Star, Trash2, BookOpen } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import '../../pages/Dashboard.css';

import AdminCoachApplications from './AdminCoachApplications';

const CoachRoster = () => {
    const [activeTab, setActiveTab] = useState('roster');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [selectedCoachForBatches, setSelectedCoachForBatches] = useState(null);
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCoach, setEditingCoach] = useState(null);
    const [isEditOpen, setEditOpen] = useState(false);
    const [batches, setBatches] = useState([]);
    const [newBatchName, setNewBatchName] = useState('');
    const [batchSearch, setBatchSearch] = useState('');
    const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);
    const [batchFormData, setBatchFormData] = useState({
        name: '',
        level: 'beginner',
        daysOfWeek: [],
        time: '',
        duration: '1',
        description: ''
    });

    const fetchCoaches = async () => {
        setLoading(true);
        try {
            const coachSnapshot = await getDocs(collection(db, 'coaches'));
            let coachList = coachSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

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

    useEffect(() => {
        const fetchBatchesForEditingCoach = async () => {
            if (!editingCoach?.id) return;
            try {
                const snap = await getDocs(collection(db, 'coaches', editingCoach.id, 'batches'));
                const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setBatches(list);
            } catch (err) {
                console.error('Error loading batches:', err);
            }
        };
        fetchBatchesForEditingCoach();
    }, [editingCoach?.id]);

    const handleAddSuccess = () => {
        setAddModalOpen(false);
        fetchCoaches();
    };

    const handleDeleteCoach = async (coach) => {
        const confirmMsg = `Delete coach "${coach.name || coach.coachName || 'Unknown'}"?\n\nThis will remove them from the roster but NOT delete their Firebase Auth account.`;
        if (!window.confirm(confirmMsg)) return;

        try {
            // Delete from users collection
            await deleteDoc(doc(db, 'users', coach.id));

            // Also try to delete from coaches collection if exists
            try {
                await deleteDoc(doc(db, 'coaches', coach.id));
            } catch (e) {
                // May not exist in coaches collection
            }

            toast.success('Coach removed from roster');
            fetchCoaches();
        } catch (error) {
            console.error('Error deleting coach:', error);
            toast.error('Failed to delete coach');
        }
    };

    return (
        <div className="dashboard-container">
            <ToastContainer position="top-right" autoClose={3000} />
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
                        paddingBottom: '12px',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'roster' ? '2px solid #1E3A8A' : 'none',
                        color: activeTab === 'roster' ? '#1E3A8A' : '#666',
                        fontWeight: activeTab === 'roster' ? '600' : '500'
                    }}
                >
                    Active Roster
                </div>

                <div
                    onClick={() => setActiveTab('applications')}
                    style={{
                        paddingBottom: '12px',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'applications' ? '2px solid #1E3A8A' : 'none',
                        color: activeTab === 'applications' ? '#1E3A8A' : '#666',
                        fontWeight: activeTab === 'applications' ? '600' : '500'
                    }}
                >
                    Applications
                </div>
            </div>

            {activeTab === 'roster' ? (
                <>
                    {loading ? (
                        <div>Loading coaches...</div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                            gap: '20px',
                            maxHeight: 'calc(100vh - 220px)',
                            overflowY: 'auto',
                            paddingRight: '8px',
                            paddingBottom: '20px'
                        }}>
                            {coaches.map(coach => (
                                <Card key={coach.id} style={{ padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'all 0.3s ease', cursor: 'pointer' }}>
                                    {/* Header with Avatar */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: '700',
                                            fontSize: '22px',
                                            flexShrink: 0
                                        }}>
                                            {(coach.name || coach.fullName || coach.coachName || 'C').charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#1E3A8A' }}>
                                                {coach.name || coach.fullName || coach.coachName || 'Unknown'}
                                            </h3>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                                                {coach.title || 'Coach'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Rating and Email */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                                        {coach.rating && coach.rating !== '-' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#F59E0B', fontWeight: '600' }}>
                                                <Star size={14} />
                                                {coach.rating}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                            {coach.email || 'N/A'}
                                        </div>
                                    </div>

                                    {/* Assigned Batches Badge */}
                                    {coach.assignedBatchIds && coach.assignedBatchIds.length > 0 && (
                                        <div style={{ marginBottom: '14px' }}>
                                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '6px', textTransform: 'uppercase' }}>
                                                {coach.assignedBatchIds.length} Batch{coach.assignedBatchIds.length !== 1 ? 'es' : ''}
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {coach.assignedBatchIds.slice(0, 2).map(bid => {
                                                    const batch = batches.find(b => b.id === bid);
                                                    return (
                                                        <span key={bid} style={{
                                                            display: 'inline-block',
                                                            backgroundColor: '#E0F2FE',
                                                            color: '#0369A1',
                                                            padding: '4px 10px',
                                                            borderRadius: '6px',
                                                            fontSize: '12px',
                                                            fontWeight: '600'
                                                        }}>
                                                            {batch?.name || 'Batch'}
                                                        </span>
                                                    );
                                                })}
                                                {coach.assignedBatchIds.length > 2 && (
                                                    <span style={{
                                                        display: 'inline-block',
                                                        backgroundColor: '#F3F4F6',
                                                        color: '#666',
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: '600'
                                                    }}>
                                                        +{coach.assignedBatchIds.length - 2} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setEditingCoach({
                                                    ...coach,
                                                    assignedBatchIds:
                                                        coach.assignedBatchIds ||
                                                        (coach.assignedBatchId ? [coach.assignedBatchId] : []) ||
                                                        (coach.batchIds || [])
                                                });
                                                setEditOpen(true);
                                            }}
                                            style={{
                                                flex: 1,
                                                backgroundColor: '#1E3A8A',
                                                color: 'white',
                                                padding: '10px 14px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                fontWeight: '600',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}>
                                            ✎ Edit
                                        </Button>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                        <button
                                            onClick={() => setSelectedCoachForBatches(coach)}
                                            style={{
                                                padding: '8px 12px',
                                                background: '#E0F2FE',
                                                color: '#0284C7',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                flex: 1,
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <BookOpen size={14} />
                                            Batches
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCoach(coach)}
                                            style={{
                                                padding: '8px 12px',
                                                background: '#FEE2E2',
                                                color: '#DC2626',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                flex: 1,
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Trash2 size={14} />
                                            Remove
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <AdminCoachApplications />
            )}

            {/* ===== ENHANCED EDIT MODAL ===== */}
            {isEditOpen && editingCoach && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1200,
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '600px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: '90vh',
                        overflow: 'hidden'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1E3A8A' }}>
                                Edit Coach
                            </h2>
                            <button
                                onClick={() => {
                                    setEditOpen(false);
                                    setEditingCoach(null);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    color: '#999',
                                    cursor: 'pointer'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{
                            padding: '24px',
                            overflowY: 'auto',
                            flex: 1
                        }}>
                            {/* Name Input */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333', fontSize: '14px' }}>
                                    Full Name
                                </label>
                                <input
                                    value={editingCoach.name || editingCoach.fullName || ''}
                                    onChange={(e) =>
                                        setEditingCoach(prev => ({
                                            ...prev,
                                            name: e.target.value,
                                            fullName: e.target.value
                                        }))
                                    }
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="Coach name"
                                />
                            </div>

                            {/* Personal Email Input */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333', fontSize: '14px' }}>
                                    Personal Email (for notifications)
                                </label>
                                <input
                                    value={editingCoach.personalEmail || ''}
                                    onChange={(e) =>
                                        setEditingCoach(prev => ({
                                            ...prev,
                                            personalEmail: e.target.value
                                        }))
                                    }
                                    type="email"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="coach@gmail.com"
                                />
                            </div>

                            {/* Assigned Login Email Input */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333', fontSize: '14px' }}>
                                    Assigned Login Email
                                </label>
                                <input
                                    value={editingCoach.email || ''}
                                    onChange={(e) =>
                                        setEditingCoach(prev => ({
                                            ...prev,
                                            email: e.target.value
                                        }))
                                    }
                                    type="email"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="firstname.lastname@coach.com"
                                />
                            </div>

                            {/* Phone Input */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333', fontSize: '14px' }}>
                                    Phone Number
                                </label>
                                <input
                                    value={editingCoach.phone || ''}
                                    onChange={(e) =>
                                        setEditingCoach(prev => ({
                                            ...prev,
                                            phone: e.target.value
                                        }))
                                    }
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="Phone number"
                                />
                            </div>

                            {/* Professional Title */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333', fontSize: '14px' }}>
                                    Professional Title
                                </label>
                                <select
                                    value={editingCoach.title || 'Trainer'}
                                    onChange={(e) =>
                                        setEditingCoach(prev => ({
                                            ...prev,
                                            title: e.target.value
                                        }))
                                    }
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="Trainer">Trainer</option>
                                    <option value="FIDE Master (FM)">FIDE Master (FM)</option>
                                    <option value="International Master (IM)">International Master (IM)</option>
                                    <option value="Grandmaster (GM)">Grandmaster (GM)</option>
                                </select>
                            </div>

                            {/* FIDE Rating and Experience Row */}
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333', fontSize: '14px' }}>
                                        FIDE Rating
                                    </label>
                                    <input
                                        value={editingCoach.fideRating || editingCoach.rating || ''}
                                        onChange={(e) =>
                                            setEditingCoach(prev => ({
                                                ...prev,
                                                fideRating: e.target.value,
                                                rating: e.target.value
                                            }))
                                        }
                                        type="number"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333', fontSize: '14px' }}>
                                        Experience (Years)
                                    </label>
                                    <input
                                        value={editingCoach.experience || ''}
                                        onChange={(e) =>
                                            setEditingCoach(prev => ({
                                                ...prev,
                                                experience: e.target.value
                                            }))
                                        }
                                        type="number"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                        placeholder="Years"
                                    />
                                </div>
                            </div>

                            {/* Bio */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333', fontSize: '14px' }}>
                                    Professional Bio (Description)
                                </label>
                                <textarea
                                    value={editingCoach.bio || ''}
                                    onChange={(e) =>
                                        setEditingCoach(prev => ({
                                            ...prev,
                                            bio: e.target.value
                                        }))
                                    }
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                    placeholder="Brief description of experience and teaching style..."
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div
                            style={{
                                padding: '16px 24px',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '10px',
                                borderTop: '1px solid #f0f0f0',
                                backgroundColor: '#F9FAFB'
                            }}
                        >
                            <Button
                                onClick={() => {
                                    setEditOpen(false);
                                    setEditingCoach(null);
                                }}
                                style={{
                                    backgroundColor: '#F3F4F6',
                                    color: '#333',
                                    border: '1px solid #D1D5DB',
                                    padding: '10px 16px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={async () => {
                                    try {
                                        const coachRef = doc(db, 'coaches', editingCoach.id);
                                        const selectedBatchIds = editingCoach.assignedBatchIds || [];


                                        await updateDoc(coachRef, {
                                            fullName: editingCoach.name || editingCoach.fullName,
                                            email: editingCoach.email,
                                            personalEmail: editingCoach.personalEmail || '',
                                            phone: editingCoach.phone || '',
                                            title: editingCoach.title || 'Trainer',
                                            fideRating: editingCoach.fideRating || editingCoach.rating || '',
                                            rating: editingCoach.fideRating || editingCoach.rating || '',
                                            experience: editingCoach.experience || '',
                                            bio: editingCoach.bio || '',
                                            assignedBatchIds: selectedBatchIds,
                                            assignedBatchId: selectedBatchIds[0] || null,
                                            updatedAt: serverTimestamp()
                                        }, { merge: true });

                                        // Also update the users collection
                                        const userRef = doc(db, 'users', editingCoach.id);
                                        await updateDoc(userRef, {
                                            fullName: editingCoach.name || editingCoach.fullName,
                                            email: editingCoach.email,
                                            personalEmail: editingCoach.personalEmail || '',
                                            phone: editingCoach.phone || '',
                                            title: editingCoach.title || 'Trainer',
                                            fideRating: editingCoach.fideRating || editingCoach.rating || '',
                                            rating: editingCoach.fideRating || editingCoach.rating || '',
                                            experience: editingCoach.experience || '',
                                            bio: editingCoach.bio || '',
                                            updatedAt: serverTimestamp()
                                        }).catch(() => {
                                            // User doc might not exist, ignore error
                                        });

                                        setEditOpen(false);
                                        setEditingCoach(null);
                                        fetchCoaches();
                                        toast.success('Coach updated successfully!');

                                    } catch (err) {
                                        alert('Failed to save coach: ' + err.message);
                                    }
                                }}
                                style={{
                                    backgroundColor: '#10B981',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                💾 Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Batch Modal */}
            {isCreateBatchModalOpen && editingCoach && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1300,
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '500px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        overflow: 'hidden'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1E3A8A' }}>
                                Create New Batch
                            </h2>
                            <button
                                onClick={() => setIsCreateBatchModalOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    color: '#999',
                                    cursor: 'pointer'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{ padding: '24px' }}>
                            {/* Batch Name */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333', fontSize: '14px' }}>
                                    Batch Name *
                                </label>
                                <input
                                    value={batchFormData.name}
                                    onChange={(e) => setBatchFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Chess Basics Level 1"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Level */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333', fontSize: '14px' }}>
                                    Level *
                                </label>
                                <select
                                    value={batchFormData.level}
                                    onChange={(e) => setBatchFormData(prev => ({ ...prev, level: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        backgroundColor: '#fff'
                                    }}
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advance">Advance</option>
                                </select>
                            </div>

                            {/* Scheduled: Days of Week */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333', fontSize: '14px' }}>
                                    Days of Week *
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px' }}>
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                        <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={batchFormData.daysOfWeek.includes(day)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setBatchFormData(prev => ({
                                                            ...prev,
                                                            daysOfWeek: [...prev.daysOfWeek, day]
                                                        }));
                                                    } else {
                                                        setBatchFormData(prev => ({
                                                            ...prev,
                                                            daysOfWeek: prev.daysOfWeek.filter(d => d !== day)
                                                        }));
                                                    }
                                                }}
                                                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                            />
                                            <span style={{ fontSize: '13px', color: '#666' }}>{day}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Time and Duration */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                {/* Start Time */}
                                <div>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333', fontSize: '14px' }}>
                                        Start Time *
                                    </label>
                                    <input
                                        type="time"
                                        value={batchFormData.time}
                                        onChange={(e) => setBatchFormData(prev => ({ ...prev, time: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                {/* Duration */}
                                <div>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333', fontSize: '14px' }}>
                                        Duration (hours) *
                                    </label>
                                    <input
                                        type="number"
                                        min="0.5"
                                        step="0.5"
                                        value={batchFormData.duration}
                                        onChange={(e) => setBatchFormData(prev => ({ ...prev, duration: e.target.value }))}
                                        placeholder="e.g., 1.5"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333', fontSize: '14px' }}>
                                    Description
                                </label>
                                <textarea
                                    value={batchFormData.description}
                                    onChange={(e) => setBatchFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Enter batch description..."
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        minHeight: '80px',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '16px 24px',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '10px',
                            borderTop: '1px solid #f0f0f0',
                            backgroundColor: '#F9FAFB'
                        }}>
                            <Button
                                onClick={() => setIsCreateBatchModalOpen(false)}
                                style={{
                                    backgroundColor: '#F3F4F6',
                                    color: '#333',
                                    border: '1px solid #D1D5DB',
                                    padding: '10px 16px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={async () => {
                                    if (!batchFormData.name.trim()) {
                                        alert('Please enter batch name');
                                        return;
                                    }
                                    if (batchFormData.daysOfWeek.length === 0) {
                                        alert('Please select at least one day of week');
                                        return;
                                    }
                                    if (!batchFormData.time) {
                                        alert('Please select start time');
                                        return;
                                    }
                                    if (!batchFormData.duration || parseFloat(batchFormData.duration) <= 0) {
                                        alert('Please enter valid duration');
                                        return;
                                    }

                                    try {
                                        const payload = {
                                            name: batchFormData.name.trim(),
                                            level: batchFormData.level,
                                            daysOfWeek: batchFormData.daysOfWeek,
                                            time: batchFormData.time,
                                            duration: parseFloat(batchFormData.duration),
                                            description: batchFormData.description.trim(),
                                            studentsId: [],
                                            assignments: [],
                                            reports: [],
                                            createdAt: serverTimestamp()
                                        };
                                        const ref = await addDoc(collection(db, 'coaches', editingCoach.id, 'batches'), payload);
                                        const created = { id: ref.id, ...payload };
                                        setBatches(prev => [created, ...prev]);
                                        setEditingCoach(prev => ({
                                            ...prev,
                                            assignedBatchIds: [...(prev.assignedBatchIds || []), ref.id]
                                        }));
                                        setIsCreateBatchModalOpen(false);
                                        alert('Batch created successfully!');
                                    } catch (err) {
                                        console.error('Error creating batch:', err);
                                        alert('Failed to create batch: ' + err.message);
                                    }
                                }}
                                style={{
                                    backgroundColor: '#10B981',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                ✓ Create Batch
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <AddCoachModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />

            <ManageBatchesModal
                isOpen={!!selectedCoachForBatches}
                coach={selectedCoachForBatches}
                onClose={() => setSelectedCoachForBatches(null)}
            />
        </div>
    );
};

export default CoachRoster;
