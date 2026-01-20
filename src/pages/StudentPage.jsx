import { Calendar, Clock, Video, X, AlignLeft, Mail, MessageSquare, ChevronRight, User } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS } from '../config/firestoreCollections';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import React, { useState, useEffect } from 'react';

const StudentPage = () => {
    const { currentUser } = useAuth();
    const [student, setStudent] = useState(null);
    const [coach, setCoach] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [batchDetails, setBatchDetails] = useState(null);

    // Fetch Student Data (Real-time from 'users' collection)
    useEffect(() => {
        if (!currentUser?.uid) return;

        const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setStudent({ id: docSnap.id, ...data });
            } else {
                setStudent(null);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching student:", err);
            setError("Failed to load profile.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Fetch Coach Data when student changes
    useEffect(() => {
        const fetchCoach = async () => {
            if (student?.assignedCoachId) {
                try {
                    const coachRef = doc(db, 'users', student.assignedCoachId);
                    const coachSnap = await getDoc(coachRef);
                    if (coachSnap.exists()) {
                        setCoach(coachSnap.data());
                    }
                } catch (err) {
                    console.error("Error fetching coach:", err);
                }
            } else {
                setCoach(null);
            }
        };

        if (student) {
            fetchCoach();
        }
    }, [student?.assignedCoachId]);

    // Fetch Assignments/Resources (Strict Filtering)
    useEffect(() => {
        if (!student?.assignedCoachId) return;

        const q = query(
            collection(db, COLLECTIONS.ASSIGNMENTS),
            where('coachId', '==', student.assignedCoachId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(d => d.data());
            // STRICT FILTERING: Only show resources for the student's batch
            const sBatch = student.batchName?.trim().toLowerCase();
            if (sBatch) {
                setAssignments(list.filter(a => {
                    const aBatch = a.batchName?.trim().toLowerCase();
                    return aBatch === sBatch || a.batchName === 'Global';
                }));
            } else {
                setAssignments([]); // Show nothing if no batch assigned (prevent leak)
            }
        });

        return () => unsubscribe();
    }, [student?.assignedCoachId, student?.batchName]); // Run when batchName changes

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading your dashboard...</div>;
    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;

    if (!student) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <h1>Welcome to VJAI Chess! ♟️</h1>
                <p>We couldn't find a student profile linked to {currentUser?.email}.</p>
                <p>If you just registered, your account setup might be in progress. Please contact support if this persists.</p>
                <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            </div>
        );
    }

    // Calculate Progress based on Skills Mastered
    const totalSkills = 7; // Based on SkillMapModal curriculum
    const skillsMastered = student.skillsMastered?.length || 0;
    const progressPercentage = Math.min(100, Math.round((skillsMastered / totalSkills) * 100));

    // Determine Level Badge Color
    const getLevelColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'beginner': return '#10B981'; // Green
            case 'intermediate': return '#F59E0B'; // Orange
            case 'advanced': return '#EF4444'; // Red
            default: return '#3B82F6'; // Blue
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, color: 'var(--color-deep-blue)' }}>Hi {student.studentName?.split(' ')[0]}! 👋</h1>
                    <p style={{ margin: '4px 0 0', color: '#666' }}>Ready to conquer the chessboard today?</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ padding: '8px 16px', backgroundColor: '#FFF7ED', borderRadius: '20px', color: '#C2410C', fontWeight: 'bold' }}>
                        🔥 12 Day Streak
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Progress Tracker - LINKED TO FIRESTORE */}
                    <Card title="Your Journey">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Current Rating</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-deep-blue)' }}>
                                    {student.eloRating || 1000}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '12px', color: '#666' }}>Level</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: getLevelColor(student.level) }}>
                                    {student.level || 'Beginner'}
                                </div>
                            </div>
                        </div>
                        <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${progressPercentage}%`, height: '100%', backgroundColor: 'var(--color-warm-orange)', transition: 'width 0.5s ease' }}></div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', textAlign: 'center' }}>
                            Skills Mastered: {skillsMastered} / {totalSkills} ({progressPercentage}%)
                        </div>
                    </Card>

                    {/* SCHEDULE REMOVED PER USER REQUEST */}

                    {/* Homework */}
                    <Card title="Homework">
                        {student.homework ? (
                            <>
                                <p style={{ margin: '0 0 16px', color: '#555', fontSize: '14px' }}>
                                    {student.homework.title || 'Complete your assigned tasks'}
                                </p>
                                <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#333', marginBottom: '16px' }}>
                                    {student.homework.tasks?.map((task, i) => (
                                        <li key={i} style={{ marginBottom: '8px' }}>{task}</li>
                                    )) || <li>No specific tasks assigned.</li>}
                                </ul>
                            </>
                        ) : (
                            <p style={{ color: '#666', fontStyle: 'italic' }}>No homework assigned yet.</p>
                        )}
                        <Button variant="outline" style={{ borderStyle: 'dashed', width: '100%', marginTop: '10px' }}>
                            📤 Upload Solution
                        </Button>
                    </Card>

                    {/* Learning Resources */}
                    <Card title="Class Resources">
                        {assignments.length === 0 ? (
                            <p style={{ color: '#666', fontStyle: 'italic', padding: '10px', textAlign: 'center' }}>
                                No resources posted by your coach yet.
                            </p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                {assignments.map((res, i) => (
                                    <a key={i} href={res.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #E2E8F0', transition: 'all 0.2s', cursor: 'pointer' }}>
                                            <div style={{ fontSize: '20px' }}>{res.type === 'PGN' ? '♟️' : '📄'}</div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#1E293B' }}>{res.title}</div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                    {res.type} • {res.batchName}
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Coach Profile - Revamped & Hardcoded Fallback */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e2e8f0',
                        textAlign: 'center'
                    }}>
                        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                            <div style={{
                                width: '96px',
                                height: '96px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '4px solid white',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                <User size={40} color="#0ea5e9" />
                            </div>
                            <div style={{
                                position: 'absolute',
                                bottom: '4px',
                                right: '4px',
                                width: '20px',
                                height: '20px',
                                background: '#10b981',
                                borderRadius: '50%',
                                border: '2px solid white'
                            }} title="Online"></div>
                        </div>

                        <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#1e293b' }}>
                            {coach ? (coach.fullName || coach.studentName || 'Abhiram Bhat') : 'Abhiram Bhat'}
                        </h3>
                        <div style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            background: '#eff6ff',
                            color: '#3b82f6',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            marginBottom: '16px'
                        }}>
                            {coach?.title || 'Chess Master'}
                        </div>

                        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                            "{coach?.bio || 'Ready to take your chess game to the next level? Start practicing today!'}"
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                            <Button variant="outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                                <MessageSquare size={16} />
                                Chat with Coach
                            </Button>
                        </div>
                    </div>

                    {/* Batch Chat Link */}
                    <Card style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                        <h4 style={{ margin: '0 0 8px' }}>Batch Chat is Active</h4>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>Discuss strategies with your classmates.</p>
                        <Button variant="secondary" style={{ width: '100%' }}>Open Chat</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentPage;
