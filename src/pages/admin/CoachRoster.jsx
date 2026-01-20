import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
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
    const [activeTab, setActiveTab] = useState('roster'); // 'roster' or 'applications'
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [selectedCoachForBatches, setSelectedCoachForBatches] = useState(null);
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);

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
