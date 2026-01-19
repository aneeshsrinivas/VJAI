import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AddCoachModal from '../../components/features/admin/AddCoachModal';
import { User, Mail, Phone, Star } from 'lucide-react';
import '../../pages/Dashboard.css';

const CoachRoster = () => {
    const [isAddModalOpen, setAddModalOpen] = useState(false);
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
        fetchCoaches();
    }, []);

    const handleAddSuccess = () => {
        setAddModalOpen(false);
        fetchCoaches();
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="welcome-text">Coach Roster</h1>
                    <p className="sub-text">Manage and view all coaching staff.</p>
                </div>
                <Button onClick={() => setAddModalOpen(true)}>+ Add New Coach</Button>
            </div>

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
                        </Card>
                    ))}
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
