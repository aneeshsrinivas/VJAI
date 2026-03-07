import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Calendar, Video, Clock, MapPin } from 'lucide-react';
import Button from '../../components/ui/Button';
import { collection, query, orderBy, onSnapshot, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { COLLECTIONS } from '../../config/firestoreCollections';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const ParentSchedule = () => {
    const [classes, setClasses] = useState([]);
    const [demos, setDemos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const { currentUser, userData } = useAuth();
    const { isDark } = useTheme();

    const c = {
        pageBg: isDark ? '#0f1117' : 'linear-gradient(180deg, #f8f9fc 0%, #f0f2f5 100%)',
        cardBg: isDark ? '#141820' : 'white',
        heading: isDark ? '#f0f0f0' : '#181818',
        subtext: isDark ? 'rgba(255,255,255,0.5)' : '#666',
        border: isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0',
        rowBase: isDark ? '#141820' : 'white',
        rowHover: isDark ? 'rgba(255,255,255,0.04)' : '#fcfcfc',
        dateBg: isDark ? '#252b3b' : '#f8f9fc',
        dateText: isDark ? '#f0f0f0' : '#181818',
        metaText: isDark ? 'rgba(255,255,255,0.5)' : '#666',
        topicText: isDark ? 'rgba(255,255,255,0.7)' : '#444',
        topicLabel: isDark ? 'rgba(255,255,255,0.35)' : '#888',
        btnSecBg: isDark ? '#252b3b' : 'white',
        btnSecColor: isDark ? '#f0f0f0' : '#181818',
        btnSecBorder: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #181818',
        emptyText: isDark ? 'rgba(255,255,255,0.4)' : '#888',
    };

    useEffect(() => {
        if (!currentUser?.uid) return;

        // First fetch student data to get batchId
        const fetchStudentAndSchedule = async () => {
            try {
                // Fetch from 'students' collection (not USERS)
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    const student = userDoc.data();
                    setStudentData(student);

                    const batchId = student.assignedBatchId || student.assignedBatch;

                    if (batchId) {
                        // Fetch classes filtered by batchId and status SCHEDULED
                        const qClasses = query(
                            collection(db, COLLECTIONS.SCHEDULE),
                            where('batchId', '==', batchId),
                            where('status', '==', 'SCHEDULED')
                        );

                        console.log("Setting up classes listener for batchId:", batchId);

                        const unsubscribeClasses = onSnapshot(qClasses, (snapshot) => {
                            console.log("Fetched scheduled classes for batchId:", batchId, snapshot.docs.map(doc => doc.data()));
                            const list = snapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data(),
                                type: 'Live Class',
                                classType: 'Regular'
                            })).sort((a, b) => {
                                // Sort by scheduledAt client-side
                                const dateA = a.scheduledAt?.seconds ? a.scheduledAt.seconds : new Date(a.scheduledAt).getTime() / 1000;
                                const dateB = b.scheduledAt?.seconds ? b.scheduledAt.seconds : new Date(b.scheduledAt).getTime() / 1000;
                                return dateA - dateB;
                            });

                            setClasses(list);
                        }, (error) => {
                            // If composite index error, fetch without status filter and filter client-side
                            console.error("Query error, falling back to client-side filter:", error);
                            const qClassesFallback = query(
                                collection(db, COLLECTIONS.SCHEDULE),
                                where('batchId', '==', batchId)
                            );
                            onSnapshot(qClassesFallback, (snap) => {
                                const list = snap.docs.map(d => ({
                                    id: d.id,
                                    ...d.data(),
                                    type: 'Live Class',
                                    classType: 'Regular'
                                })).filter(c => c.status === 'SCHEDULED').sort((a, b) => {
                                    const dateA = a.scheduledAt?.seconds ? a.scheduledAt.seconds : new Date(a.scheduledAt).getTime() / 1000;
                                    const dateB = b.scheduledAt?.seconds ? b.scheduledAt.seconds : new Date(b.scheduledAt).getTime() / 1000;
                                    return dateA - dateB;
                                });
                                setClasses(list);
                            });
                        });



                        return () => unsubscribeClasses();
                    }
                } else {
                    console.log("No student document found for user:", currentUser.uid);
                }
            } catch (error) {
                console.error("Error fetching student data:", error);
            }
        };

        fetchStudentAndSchedule();

        // Fetch Demos filtered by user email
        const qDemos = query(collection(db, COLLECTIONS.DEMOS), orderBy('scheduledAt', 'asc'));
        const unsubscribeDemos = onSnapshot(qDemos, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'Demo Session',
                classType: 'Demo',
                topic: 'Assessment & Intro',
                meetLink: doc.data().meetingLink
            })).filter(d => d.parentEmail === currentUser?.email);
            setDemos(list);
        });

        setLoading(false);

        return () => {
            unsubscribeDemos();
        };
    }, [currentUser]);

    const allSessions = [...classes, ...demos].filter(session => {
        // If no user data, show nothing (or all? Safer to show nothing to avoid leak)
        if (!userData) return false;

        // Admin or Coach sees all (if they view this page, though usually they have their own)
        if (userData.role === 'admin' || userData.role === 'coach') return true;

        // Student Filtering Logic
        const userBatch = userData.assignedBatchName || userData.assignedBatch;
        const userLevel = userData.level || userData.learningLevel;

        // 1. If session has a specific batch name, match it
        if (session.batchName && userBatch) {
            return session.batchName.toLowerCase() === userBatch.toLowerCase();
        }

        // 2. If session has no batch name but has level, match level (Fallback)
        if (session.level && userLevel) {
            return session.level.toLowerCase() === userLevel.toLowerCase();
        }

        // 3. Global sessions (optional, e.g. "Global" batch)
        if (session.batchName === 'Global') return true;

        if (userBatch) return false;

        return true;
    }).sort((a, b) => {
        const dateA = a.scheduledAt?.seconds ? new Date(a.scheduledAt.seconds * 1000) : new Date(a.scheduledAt);
        const dateB = b.scheduledAt?.seconds ? new Date(b.scheduledAt.seconds * 1000) : new Date(b.scheduledAt);
        return dateA - dateB;
    });

    return (
        <div style={{
            minHeight: '100vh',
            background: c.pageBg,
            padding: '40px 24px',
            fontFamily: "'Figtree', sans-serif",
            transition: 'background 0.2s ease, color 0.2s ease'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '800',
                        color: c.heading,
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'color 0.2s ease'
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
                    <p style={{ color: c.subtext, fontSize: '16px', marginLeft: '54px', transition: 'color 0.2s ease' }}>
                        Track your child's upcoming classes and practice sessions.
                    </p>
                </header>

                <Card className="schedule-card" style={{
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                    background: c.cardBg,
                    transition: 'background 0.2s ease'
                }}>
                    <div className="schedule-list">
                        {allSessions.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: c.emptyText }}>
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
                                        borderBottom: i < allSessions.length - 1 ? `1px solid ${c.border}` : 'none',
                                        transition: 'background 0.2s ease',
                                        cursor: 'pointer',
                                        background: c.rowBase
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = c.rowHover}
                                        onMouseLeave={(e) => e.currentTarget.style.background = c.rowBase}
                                    >
                                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                minWidth: '80px',
                                                background: i === 0 ? 'linear-gradient(135deg, #FFF7ED, #FFF)' : c.dateBg,
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: i === 0 ? '1px solid #FC8A24' : `1px solid ${c.border}`
                                            }}>
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: i === 0 ? '#FC8A24' : c.metaText, textTransform: 'uppercase' }}>
                                                    {dayName.substring(0, 3)}
                                                </span>
                                                <span style={{ fontSize: '24px', fontWeight: '800', color: c.dateText }}>
                                                    {dateObj.getDate()}
                                                </span>
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: c.heading, margin: 0 }}>
                                                        {slot.batchName || slot.classType || 'Chess Class'}
                                                    </h3>
                                                    <span style={{
                                                        fontSize: '11px',
                                                        fontWeight: 'bold',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        background: slot.type === 'Live Class' ? (isDark ? 'rgba(2, 132, 199, 0.25)' : '#0284C7') : (isDark ? 'rgba(147, 51, 234, 0.25)' : '#9333EA'),
                                                        color: slot.type === 'Live Class' ? (isDark ? '#06B6D4' : 'white') : (isDark ? '#D8B4FE' : 'white'),
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {slot.type}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: c.metaText, marginBottom: '8px' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Clock size={14} /> {timeStr}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <MapPin size={14} /> Online
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '14px', color: c.topicText }}>
                                                    <span style={{ fontWeight: '600', color: c.topicLabel }}>Topic:</span> {slot.topic}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => slot.meetLink && window.open(slot.meetLink, '_blank')}
                                            style={{
                                                background: i === 0 ? 'linear-gradient(135deg, #FC8A24, #ff9d4d)' : c.btnSecBg,
                                                color: i === 0 ? 'white' : c.btnSecColor,
                                                border: i === 0 ? 'none' : c.btnSecBorder,
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
