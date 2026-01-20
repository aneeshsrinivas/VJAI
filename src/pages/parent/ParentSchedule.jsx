import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Calendar, Video, Clock, MapPin } from 'lucide-react';
import Button from '../../components/ui/Button';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { COLLECTIONS } from '../../config/firestoreCollections';
import { useAuth } from '../../context/AuthContext';

const ParentSchedule = () => {
    const [classes, setClasses] = useState([]);
    const [demos, setDemos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        // Fetch Regular Classes
        const qClasses = query(
            collection(db, COLLECTIONS.SCHEDULE),
            orderBy('scheduledAt', 'asc')
        );

        const unsubscribeClasses = onSnapshot(qClasses, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'Live Class',
                classType: 'Regular'
            }));
            setClasses(list);
        });

        // Fetch Demos (Optional: Merge if desired, useful for initial stages)
        // Using existing Demos collection query from Dashboard idea
        const qDemos = query(collection(db, COLLECTIONS.DEMOS), orderBy('scheduledAt', 'asc')); // Filter by user in real app
        const unsubscribeDemos = onSnapshot(qDemos, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'Demo Session',
                classType: 'Demo',
                topic: 'Assessment & Intro',
                meetLink: doc.data().meetingLink
            })).filter(d => d.parentEmail === currentUser?.email); // Client-side filter for MVP
            setDemos(list);
        });

        setLoading(false);

        return () => {
            unsubscribeClasses();
            unsubscribeDemos();
        };
    }, [currentUser]);

    const allSessions = [...classes, ...demos].sort((a, b) => {
        const dateA = a.scheduledAt?.seconds ? new Date(a.scheduledAt.seconds * 1000) : new Date(a.scheduledAt);
        const dateB = b.scheduledAt?.seconds ? new Date(b.scheduledAt.seconds * 1000) : new Date(b.scheduledAt);
        return dateA - dateB;
    });

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #f8f9fc 0%, #f0f2f5 100%)',
            padding: '40px 24px',
            fontFamily: "'Figtree', sans-serif"
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '800',
                        color: '#003366',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #FC8A24, #ff9d4d)',
                            borderRadius: '12px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Calendar size={24} color="white" />
                        </span>
                        Weekly Schedule
                    </h1>
                    <p style={{ color: '#666', fontSize: '16px', marginLeft: '54px' }}>
                        Track your child's upcoming classes and practice sessions.
                    </p>
                </header>

                <Card className="schedule-card" style={{
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    overflow: 'hidden'
                }}>
                    <div className="schedule-list">
                        {allSessions.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                No upcoming classes scheduled.
                            </div>
                        ) : (
                            allSessions.map((slot, i) => {
                                const dateObj = slot.scheduledAt?.seconds ? new Date(slot.scheduledAt.seconds * 1000) : new Date(slot.scheduledAt);
                                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                                const fullDay = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                                const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                                return (
                                    <div key={slot.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '24px',
                                        borderBottom: i < allSessions.length - 1 ? '1px solid #f0f0f0' : 'none',
                                        transition: 'background 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#fcfcfc'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                minWidth: '80px',
                                                background: i === 0 ? 'linear-gradient(135deg, #FFF7ED, #FFF)' : '#f8f9fc',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: i === 0 ? '1px solid #FC8A24' : '1px solid #eee'
                                            }}>
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: i === 0 ? '#FC8A24' : '#666', textTransform: 'uppercase' }}>
                                                    {dayName.substring(0, 3)}
                                                </span>
                                                <span style={{ fontSize: '24px', fontWeight: '800', color: '#003366' }}>
                                                    {dateObj.getDate()}
                                                </span>
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#003366', margin: 0 }}>
                                                        {slot.batchName || slot.classType || 'Chess Class'}
                                                    </h3>
                                                    <span style={{
                                                        fontSize: '11px',
                                                        fontWeight: 'bold',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        background: slot.type === 'Live Class' ? '#E0F2FE' : '#F3E8FF',
                                                        color: slot.type === 'Live Class' ? '#0284C7' : '#9333EA',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {slot.type}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Clock size={14} /> {timeStr}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <MapPin size={14} /> Online
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#444' }}>
                                                    <span style={{ fontWeight: '600', color: '#888' }}>Topic:</span> {slot.topic}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => slot.meetLink && window.open(slot.meetLink, '_blank')}
                                            style={{
                                                background: i === 0 ? 'linear-gradient(135deg, #FC8A24, #ff9d4d)' : 'white',
                                                color: i === 0 ? 'white' : '#003366',
                                                border: i === 0 ? 'none' : '1px solid #003366',
                                                padding: '10px 20px',
                                                borderRadius: '10px',
                                                fontWeight: '600',
                                                boxShadow: i === 0 ? '0 4px 12px rgba(252, 138, 36, 0.3)' : 'none',
                                                opacity: slot.meetLink ? 1 : 0.5,
                                                cursor: slot.meetLink ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            <Video size={16} style={{ marginRight: '8px' }} />
                                            {i === 0 ? 'Join Now' : 'Details'}
                                        </Button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ParentSchedule;
