import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Check, X, ExternalLink, Activity, Target as TargetIcon, Clock, Swords, Link2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast, ToastContainer } from 'react-toastify';
import LichessPendingRequests from '../../components/features/LichessPendingRequests';

const COLORS = {
    orange: '#FC8A24',
    deepBlue: '#181818',
    oliveGreen: '#6B8E23',
    ivory: '#FFFEF3'
};

const CoachLichess = () => {
    const { currentUser } = useAuth();
    const { isDark } = useTheme();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const c = {
        pageBg: isDark ? '#0f1117' : 'linear-gradient(180deg, #f8f9fc 0%, #f0f2f5 100%)',
        heading: isDark ? '#f0f0f0' : '#181818',
        subtext: isDark ? 'rgba(255,255,255,0.5)' : '#666',
        cardBg: isDark ? '#141820' : 'white',
        cardBorder: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e8eaed',
    };

    useEffect(() => {
        if (!currentUser?.uid) return;

        // Resolve coachDocId
        const resolveCoachAndFetch = async () => {
             setLoading(true);
             try {
                const coachesRef = collection(db, 'coaches');
                const qCoach = query(coachesRef, where('accountId', '==', currentUser.uid));
                const coachSnap = await getDocs(qCoach);
                
                let coachDocId = currentUser.uid;
                if (!coachSnap.empty) {
                    coachDocId = coachSnap.docs[0].id;
                }

                // Fetch assigned students for Lichess dashboard
                const usersRef = collection(db, 'users');
                const qStudents = query(usersRef, where('role', 'in', ['student', 'customer']), where('assignedCoachId', '==', coachDocId));
                
                const unsub = onSnapshot(qStudents, (snapshot) => {
                    const studentData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                    setStudents(studentData);
                    setLoading(false);
                });

                return () => unsub();
             } catch (err) {
                 console.error("Error fetching lichess details:", err);
                 setLoading(false);
             }
        };

        resolveCoachAndFetch();
    }, [currentUser?.uid]);

    return (
        <div style={{
            minHeight: '100vh',
            background: c.pageBg,
            padding: '40px 24px',
            fontFamily: "'Figtree', sans-serif",
            transition: 'background 0.2s ease',
        }}>
            <ToastContainer />
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
                        transition: 'color 0.2s ease',
                    }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #FC8A24 100%)',
                            borderRadius: '12px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <TargetIcon size={24} color="white" />
                        </span>
                        Lichess Integration Center
                    </h1>
                    <p style={{ color: c.subtext, fontSize: '15px', marginLeft: '56px' }}>
                        Manage student profiles, approve requests, and monitor rating progress.
                    </p>
                </header>

                {/* Pending Requests Section */}
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ marginBottom: '16px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: c.heading }}>
                        <Clock size={20} color={COLORS.orange} /> Pending Fast-Track Approvals
                    </h2>
                    <div style={{
                        background: c.cardBg,
                        border: c.cardBorder,
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)'
                    }}>
                        <LichessPendingRequests currentUser={currentUser} />
                    </div>
                </div>

                {/* Configured Students Analytics */}
                <div>
                    <h2 style={{ marginBottom: '16px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: c.heading }}>
                        <Activity size={20} color={COLORS.oliveGreen} /> Class Progress Board
                    </h2>
                    {loading ? (
                        <div style={{ color: c.subtext, fontStyle: 'italic', padding: '24px', textAlign: 'center', background: c.cardBg, borderRadius: '16px' }}>Fetching latest student ratings...</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {students.filter(s => s.lichessUsername && s.lichessStatus === 'approved').length === 0 ? (
                                <div style={{ 
                                    gridColumn: '1 / -1', 
                                    padding: '40px', 
                                    textAlign: 'center', 
                                    color: c.subtext, 
                                    background: c.cardBg, 
                                    borderRadius: '16px',
                                    border: c.cardBorder 
                                }}>
                                    No students with approved Lichess accounts yet. Approve some requests above!
                                </div>
                            ) : (
                                students.filter(s => s.lichessUsername && s.lichessStatus === 'approved').map(student => (
                                    <div key={student.id} style={{
                                        background: c.cardBg,
                                        borderRadius: '16px',
                                        padding: '24px',
                                        border: c.cardBorder,
                                        boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                        transition: 'transform 0.2s ease',
                                        cursor: 'default'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: c.heading, fontWeight: '700' }}>
                                                    {student.fullName || student.studentName || student.email?.split('@')[0]}
                                                </h3>
                                                <a 
                                                    href={`https://lichess.org/@/${student.lichessUsername}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{ 
                                                        color: COLORS.orange, 
                                                        textDecoration: 'none', 
                                                        fontSize: '14px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontWeight: '600',
                                                        background: `${COLORS.orange}15`,
                                                        padding: '4px 10px',
                                                        borderRadius: '20px'
                                                    }}
                                                >
                                                    @{student.lichessUsername} <ExternalLink size={12} />
                                                </a>
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div style={{ background: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                                                <div style={{ color: c.subtext, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', justifyItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                    <Swords size={14} /> Rapid
                                                </div>
                                                <div style={{ fontSize: '28px', fontWeight: '800', color: c.heading, fontFamily: "'Figtree', sans-serif" }}>
                                                    {student.lichessStats?.rapid?.rating || '---'}
                                                </div>
                                            </div>
                                            <div style={{ background: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                                                <div style={{ color: c.subtext, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', justifyItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                    <TargetIcon size={14} /> Puzzle
                                                </div>
                                                <div style={{ fontSize: '28px', fontWeight: '800', color: c.heading, fontFamily: "'Figtree', sans-serif" }}>
                                                    {student.lichessStats?.puzzle?.rating || '---'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoachLichess;
