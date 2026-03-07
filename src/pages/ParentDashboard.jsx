import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS } from '../config/firestoreCollections';
import Button from '../components/ui/Button';
import ReviewRequestModal from '../components/features/ReviewRequestModal';
import StudentChessAssignmentModal from '../components/features/StudentChessAssignmentModal';
// Icons
import CalendarIcon from '../components/icons/CalendarIcon';
import AssignmentIcon from '../components/icons/AssignmentIcon';
import PaymentIcon from '../components/icons/PaymentIcon';
import StarIcon from '../components/icons/StarIcon';
import ChatIcon from '../components/icons/ChatIcon';
import LockIcon from '../components/icons/LockIcon';
import VideoIcon from '../components/icons/VideoIcon';
import GreetingIcon from '../components/icons/GreetingIcon';
import ChessBishopIcon from '../components/icons/ChessBishopIcon';
import ClockIcon from '../components/icons/ClockIcon';
import { Bell, Megaphone, AlertTriangle } from 'lucide-react';
import './ParentDashboard.css';

const ParentDashboard = () => {
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();
    const { isDark } = useTheme();
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);

    // Real-time Data
    const [student, setStudent] = useState(null);
    const [coach, setCoach] = useState(null);
    const [broadcasts, setBroadcasts] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [chessAssignments, setChessAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [attendanceStats, setAttendanceStats] = useState({ present: 0, total: 0 });

    // UI State
    const [cardsVisible, setCardsVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const [scheduleItems, setScheduleItems] = useState([]);

    // 1. Listen to Student Data (for realtime Level & Coach assignment)
    useEffect(() => {
        if (!currentUser?.uid) {
            setLoading(false);
            return;
        }

        setLoading(true);

        // Mock data for dev mode
        if (!db) {
            setStudent({
                id: currentUser.uid,
                email: currentUser.email,
                fullName: 'Student User',
                level: 'Intermediate',
                rating: 1450,
                assignedCoachId: 'coach-123'
            });
            setCoach({
                id: 'coach-123',
                fullName: 'Coach Name',
                email: 'coach@coach.com'
            });
            setLoading(false);
            setTimeout(() => setCardsVisible(true), 100);
            return;
        }

        try {
            // Correctly listen to the 'users' document (Source of Truth)
            // Admin updates 'users' collection, NOT 'students'
            const userDocRef = doc(db, 'users', currentUser.uid);

            const unsubStudent = onSnapshot(userDocRef, async (snapshot) => {
                if (snapshot.exists()) {
                    const studentData = { id: snapshot.id, ...snapshot.data() };
                    setStudent(studentData);

                    // If coach is assigned, fetch coach details
                    // assignedCoachId is the coach's Firebase Auth UID (not the coaches doc ID)
                    if (studentData.assignedCoachId) {
                        const coachQ = query(
                            collection(db, COLLECTIONS.COACHES),
                            where('accountId', '==', studentData.assignedCoachId)
                        );
                        getDocs(coachQ).then(coachSnap => {
                            if (!coachSnap.empty) {
                                setCoach({ id: coachSnap.docs[0].id, ...coachSnap.docs[0].data() });
                            } else {
                                // Fallback 1: coach may only have a users doc (added via AddCoachModal)
                                getDoc(doc(db, 'users', studentData.assignedCoachId)).then(userDoc => {
                                    if (userDoc.exists()) {
                                        setCoach({ id: userDoc.id, ...userDoc.data() });
                                    } else {
                                        // Fallback 2: legacy data — assignedCoachId may be the coaches doc ID directly
                                        getDoc(doc(db, COLLECTIONS.COACHES, studentData.assignedCoachId)).then(legacyDoc => {
                                            if (legacyDoc.exists()) setCoach({ id: legacyDoc.id, ...legacyDoc.data() });
                                        });
                                    }
                                });
                            }
                        });
                    }
                    // 2. Batch Assignment
                    else if (studentData.batchId || studentData.assignedBatch || studentData.batchName) {
                        // Logic remains same, but now we have correct data
                    }
                } else {
                    // Fallback if no student doc found (maybe just registered)
                    setStudent(null);
                }
                setLoading(false);
                // Trigger animation
                setTimeout(() => setCardsVisible(true), 100);
            }, (error) => {
                console.error('Error fetching student data:', error);
                // Use mock data on error
                setStudent({
                    fullName: 'Test Student',
                    level: 'Beginner'
                });
                setLoading(false);
                setTimeout(() => setCardsVisible(true), 100);
            });

            // 2. Listen to Schedule (Demos for now, later Batches/Classes)
            // Query Demos where parent email matches
            const qDemos = query(
                collection(db, COLLECTIONS.DEMOS),
                where('email', '==', currentUser.email), // Assuming demo is linked by email
                orderBy('scheduledAt', 'desc'),
                limit(5)
            );

            const unsubscribeDemos = onSnapshot(qDemos, (snapshot) => {
                const items = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const date = data.scheduledAt?.toDate ? data.scheduledAt.toDate() : new Date();
                    const isToday = new Date().toDateString() === date.toDateString();

                return {
                    id: doc.id,
                    day: date.toLocaleDateString('en-US', { weekday: 'long' }),
                    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                    status: data.status,
                    isToday: isToday,
                    topic: 'Demo Class',
                    link: data.meetLink, // Assuming meetLink is stored
                    assignedCoachId: data.assignedCoachId, // Needed for fallback coach display
                    type: 'demo'
                };
            });
            setScheduleItems(items);

            // Fallback: If no coach is set yet, try to find one from scheduled demos
            // This handles the "Pre-Student" phase or sync issues
            const scheduledDemo = snapshot.docs.map(d => d.data()).find(d => d.status === 'SCHEDULED' && d.assignedCoachId);

            if (scheduledDemo && scheduledDemo.assignedCoachId) {
                // Only set if we don't already have a coach from student profile
                // We check 'student' state, but inside this callback 'student' might be stale due to closure.
                // Better to check if 'coach' is null.
                setCoach(prevCoach => {
                    if (!prevCoach) {
                        getDoc(doc(db, COLLECTIONS.COACHES, scheduledDemo.assignedCoachId)).then(coachDoc => {
                            if (coachDoc.exists()) {
                                setCoach(coachDoc.data());
                            }
                        });
                    }
                    return prevCoach;
                });
            }
        }, (error) => {
            console.error('Demos listener error:', error);
            setScheduleItems([]);
        });

        // 3. Listen to Broadcasts (Announcements)
        const qBroadcasts = query(
            collection(db, 'broadcasts'), // Hardcoded as per BroadcastPage.jsx usage
            orderBy('createdAt', 'desc'),
            limit(3)
        );


            const unsubscribeBroadcasts = onSnapshot(qBroadcasts, (snapshot) => {
                const list = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // In a real app, filter by student level/batch here if needed
                setBroadcasts(list);
            }, (error) => {
                console.error('Error fetching broadcasts:', error);
                // Use mock broadcasts on error
                setBroadcasts([]);
            });

            return () => {
                unsubStudent();
                unsubscribeDemos();
                unsubscribeBroadcasts();
            };
        } catch (error) {
            console.error('Error setting up dashboard listeners:', error);
            // Set mock data on error
            setStudent({
                fullName: currentUser?.email?.split('@')[0] || 'Student',
                level: 'Beginner',
                rating: 1200
            });
            setScheduleItems([]);
            setBroadcasts([]);
            setLoading(false);
            setTimeout(() => setCardsVisible(true), 100);
            return () => { };
        }
    }, [currentUser]);

    // 2b. Listen to Class Schedule (Regular Batches)
    // Separate useEffect because it depends on student state which is populated asynchronously
    useEffect(() => {
        if (!student?.batchId && !student?.batchName && !student?.assignedBatchName) return;
        if (!db) return;

        const batchNames = new Set([
            student.batchName,
            student.assignedBatchName
        ].filter(Boolean));

        const qSchedule = query(collection(db, COLLECTIONS.SCHEDULE));

        const unsubscribeSchedule = onSnapshot(qSchedule, (snapshot) => {
            const classes = snapshot.docs
                .filter(d => batchNames.has(d.data().batchName))
                .map(d => {
                    const data = d.data();
                    let dateObj = new Date();
                    if (data.start?.toDate) dateObj = data.start.toDate();
                    else if (data.date?.toDate) dateObj = data.date.toDate();
                    else if (data.start) dateObj = new Date(data.start);
                    else if (data.date && typeof data.date === 'string') {
                        dateObj = new Date(`${data.date}T${data.time || '00:00'}`);
                    }

                    const isToday = new Date().toDateString() === dateObj.toDateString();

                    return {
                        id: d.id,
                        day: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
                        time: dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                        status: 'SCHEDULED',
                        isToday: isToday,
                        topic: data.title || 'Regular Class',
                        link: data.meetLink,
                        type: 'class',
                        coachId: data.coachId
                    };
                });

            // Fallback: If still no coach assigned, try to grab it from the first class
            setCoach(prev => {
                if (!prev && classes.length > 0) {
                    const firstClass = classes.find(c => c.coachId);
                    if (firstClass) {
                        getDoc(doc(db, COLLECTIONS.COACHES, firstClass.coachId)).then(snap => {
                            if (snap.exists()) setCoach(snap.data());
                        });
                    }
                }
                return prev;
            });

            // Merge classes with existing demo schedule items
            setScheduleItems(prev => {
                const demos = prev.filter(i => i.type !== 'class');
                return [...demos, ...classes];
            });
        }, (error) => {
            console.error('Schedule listener error:', error);
        });

        return () => unsubscribeSchedule();
    }, [student?.batchId, student?.batchName, student?.assignedBatchName]);

    // Fetch Chess Assignments
    useEffect(() => {
        console.log('Setting up chess assignments listener for student:', student);
        if (!student) return;

        try {
            console.log('Fetching chess assignments for student:', {
                assignedCoachId: student.assignedCoachId,
                assignedBatch: student.assignedBatch,
                assignedBatchName: student.assignedBatchName,
                batchName: student.batchName
            });

            // Check if db is available
            if (!db) {
                setChessAssignments([]);
                return;
            }

            // Query all chess assignments (we'll filter client-side)
            const q = query(collection(db, 'chessAssignment'));

            const unsubscribe = onSnapshot(q, async (snapshot) => {
                const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                console.log('All chess assignments:', list);

                const studentBatchId = student.assignedBatch;
                const studentBatchName = student.assignedBatchName || student.batchName;
                const coachId = student.assignedCoachId;

                // Filter by coach, then by batch (ID or Name) or Global
                const filtered = list.filter(a => {
                    const matchesCoach = !coachId || a.coachId === coachId;
                    const matchesBatchId = !studentBatchId || a.batchId === studentBatchId;
                    const matchesBatchName = !studentBatchName || a.batchName === studentBatchName;
                    const isGlobal = a.batchName === 'Global';

                    return matchesCoach && (matchesBatchId || matchesBatchName || isGlobal);
                });

                // Check submission status for each assignment
                try {
                    const assignmentsWithStatus = await Promise.all(filtered.map(async (a) => {
                        if (!currentUser?.uid) return { ...a, isSubmitted: false };
                        try {
                            const subRef = doc(db, 'chessAssignment', a.id, 'submissions', currentUser.uid);
                            const subSnap = await getDoc(subRef);
                            return { ...a, isSubmitted: subSnap.exists() };
                        } catch (e) {
                            console.error("Error checking submission:", e);
                            return { ...a, isSubmitted: false };
                        }
                    }));

                    console.log('Filtered chess assignments with status:', assignmentsWithStatus);
                    setChessAssignments(assignmentsWithStatus);
                } catch (e) {
                    console.error('Error processing assignments:', e);
                    setChessAssignments(filtered.map(a => ({ ...a, isSubmitted: false })));
                }
            }, (error) => {
                console.error('Error fetching assignments:', error);
                setChessAssignments([]);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error('Error in chess assignments setup:', error);
            setChessAssignments([]);
            return () => { };
        }
    }, [student?.assignedCoachId, student?.assignedBatch, student?.assignedBatchName, student?.batchName, currentUser?.uid]);

    // Fetch attendance stats for student
    useEffect(() => {
        if (!currentUser?.uid || !db) return;

        const q = query(
            collection(db, 'attendance'),
            where('studentId', '==', currentUser.uid)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            let present = 0;
            let total = 0;
            snapshot.docs.forEach(d => {
                total++;
                if (d.data().status === 'present') present++;
            });
            setAttendanceStats({ present, total });
        }, (error) => {
            console.error('Attendance listener error:', error);
        });

        return () => unsub();
    }, [currentUser?.uid]);

    // Dynamic Progress Calculation based on skills mastered
    const TOTAL_SKILLS = 7; // Total curriculum skills
    useEffect(() => {
        // Calculate progress from skillsMastered array
        const skillsMastered = student?.skillsMastered || [];
        const completedCount = Array.isArray(skillsMastered) ? skillsMastered.length : 0;
        const p = Math.round((completedCount / TOTAL_SKILLS) * 100);

        const timer = setTimeout(() => setProgress(p), 500);
        return () => clearTimeout(timer);
    }, [student]);

    const getDisplayName = () => {
        // Debug log to see what userData contains
        console.log('userData:', userData);
        console.log('currentUser:', currentUser?.email);

        // Priority: userData.fullName > userData.studentName > student.parentName > email
        if (userData?.fullName && userData.fullName.trim()) return userData.fullName;
        if (userData?.studentName && userData.studentName.trim()) return userData.studentName;
        if (student?.parentName && student.parentName.trim()) return student.parentName;
        if (currentUser?.displayName && currentUser.displayName.trim()) return currentUser.displayName;

        // Extract from email as last resort
        if (currentUser?.email) {
            const emailName = currentUser.email.split('@')[0];
            // If email name has numbers at end (like user123), just return it as is
            // Otherwise capitalize first letter
            return emailName;
        }
        return 'Student';
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const quickActions = [
        {
            icon: CalendarIcon,
            label: 'Schedule',
            description: 'View your classes',
            path: '/parent/schedule',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            icon: AssignmentIcon,
            label: 'Assignments',
            description: 'Check homework',
            path: '/parent/assignments',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
            icon: PaymentIcon,
            label: 'Payments',
            description: 'Billing & invoices',
            path: '/parent/payments',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
            icon: StarIcon,
            label: 'Upgrade',
            description: 'Premium plans',
            path: '/pricing',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        }
    ];

    if (loading && !student) {
        return null;
    }

    return (
        <div className="parent-dashboard">
            {/* Hero Welcome Section */}
            <section className="welcome-hero">
                <div className="welcome-hero-bg">
                    <img
                        src="https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1200&q=80"
                        alt=""
                        className="hero-bg-image"
                    />
                    <div className="hero-overlay"></div>
                </div>
                <div className="welcome-hero-content">
                    <div className="welcome-left">
                        <div className="greeting-badge">
                            <GreetingIcon size={20} color="#FC8A24" />
                            <span>{getGreeting()}</span>
                        </div>
                        <h1 className="welcome-title">Welcome back, {getDisplayName()}!</h1>
                        <p className="welcome-subtitle">
                            {(student?.name || student?.studentName)
                                ? `${student.name || student.studentName}'s chess journey is progressing excellently.`
                                : 'Your chess journey awaits!'}
                        </p>
                        <div className="welcome-actions">
                            <Button
                                onClick={() => navigate('/parent/chat')}
                                className="action-btn primary-btn"
                            >
                                <ChatIcon size={18} color="white" />
                                <span>Batch Chat</span>
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setReviewModalOpen(true)}
                                className="action-btn secondary-btn"
                            >
                                <ClockIcon size={18} color="#1361afff" />
                                <span>Request Review</span>
                            </Button>
                        </div>
                    </div>
                    <div className="welcome-right">
                        {/* Progress Card */}
                        <div className="progress-card-floating">
                            <div className="progress-header">
                                <div className="progress-info">
                                    <span className="progress-label">Skills Mastered</span>
                                    <span className="milestone-name">{(student?.skillsMastered || []).length} / 7</span>
                                </div>
                                <div className="progress-percentage">{progress}%</div>
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="progress-next" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Level: <strong>{student?.level || 'Beginner'}</strong></span>
                                <span>Batch: <strong style={{ color: '#fbbf24' }}>{student?.assignedBatchName || student?.batchName || 'No Batch'}</strong></span>
                            </div>
                        </div>
                        {/* Attendance Card */}
                        {attendanceStats.total > 0 && (
                            <div className="progress-card-floating" style={{ marginTop: '16px' }}>
                                <div className="progress-header">
                                    <div className="progress-info">
                                        <span className="progress-label">Attendance</span>
                                        <span className="milestone-name">{attendanceStats.present} / {attendanceStats.total}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '12px 0' }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: `conic-gradient(${(attendanceStats.present / attendanceStats.total) >= 0.75 ? '#10b981' : '#f59e0b'} ${(attendanceStats.present / attendanceStats.total) * 360}deg, rgba(0,0,0,0.05) 0deg)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: `0 0 0 3px ${(attendanceStats.present / attendanceStats.total) >= 0.75 ? '#d1fae5' : '#fef3c7'}`
                                    }}>
                                        <div style={{
                                            fontSize: '24px',
                                            fontWeight: '800',
                                            color: (attendanceStats.present / attendanceStats.total) >= 0.75 ? '#059669' : '#d97706'
                                        }}>
                                            {Math.round((attendanceStats.present / attendanceStats.total) * 100)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', color: '#666', fontWeight: '600' }}>
                                            Classes Attended
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                                            {(attendanceStats.present / attendanceStats.total) >= 0.85 ? '✓ Excellent!' : (attendanceStats.present / attendanceStats.total) >= 0.75 ? '✓ Good!' : '⚠ Keep improving'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {/* Main Content Grid */}
            <div className="dashboard-content">
                {student?.status === 'PAYMENT_PENDING' && (
                    <div className="payment-pending-banner" style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                        color: 'white',
                        padding: '20px 24px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2), 0 2px 4px -1px rgba(239, 68, 68, 0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '50%' }}>
                                <AlertTriangle size={28} color="white" />
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: 'white' }}>Action Required: Complete Your Enrollment</h3>
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                                    Your account is currently pending payment. Please select a plan to activate your account and start scheduling classes.
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => navigate('/pricing', {
                                state: {
                                    recommendedLevel: student?.level || student?.learningLevel || 'beginner',
                                    recommendedType: student?.studentType || 'group',
                                    prefillData: {
                                        parentName: student?.parentName || '',
                                        parentEmail: student?.email || student?.parentEmail || '',
                                        parentPhone: student?.phone || '',
                                        studentName: student?.name || student?.studentName || '',
                                        studentAge: student?.age || student?.studentAge || '',
                                    }
                                }
                            })}
                            style={{
                                background: 'white',
                                color: '#b91c1c',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                border: 'none'
                            }}
                        >
                            Select Plan & Pay
                        </Button>
                    </div>
                )}

                {/* Coach assignment pending banner */}
                {student?.status === 'PENDING_COACH' && (
                    <div style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        padding: '20px 24px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.2)'
                    }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '50%', flexShrink: 0 }}>
                            <Bell size={28} color="white" />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: 'white' }}>Payment Received — Coach Being Assigned</h3>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                                Thank you for your payment! Our admin team will assign a coach to your account shortly. You will receive an email notification once this is done.
                            </p>
                        </div>
                    </div>
                )}

                {/* Render main content only if fully active */}
                {student?.status !== 'PAYMENT_PENDING' && (
                    <div className="content-grid">
                        {/* Left Column */}
                        <div className="main-column">
                            {/* Announcements Section */}
                            {broadcasts.length > 0 && (
                                <div className={`content-card announcement-card ${cardsVisible ? 'visible' : ''}`}>
                                    <div className="card-header-row">
                                        <div className="card-title-group">
                                            <Megaphone size={22} color="#f59e0b" />
                                            <h3>Announcements</h3>
                                        </div>
                                    </div>
                                    <div className="announcement-list">
                                        {broadcasts.map(broadcast => (
                                            <div key={broadcast.id} className="announcement-item">
                                                <div className="ann-icon">
                                                    <Bell size={16} />
                                                </div>
                                                <div className="ann-content">
                                                    <div className="ann-header">
                                                        <span className="ann-subject">{broadcast.subject}</span>
                                                        <span className="ann-date">{formatDate(broadcast.createdAt)}</span>
                                                    </div>
                                                    <p className="ann-message">{broadcast.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Chess Assignments Section */}
                            {chessAssignments.length > 0 && (
                                <div className={`content-card ${cardsVisible ? 'visible' : ''}`}>
                                    <div className="card-header-row">
                                        <div className="card-title-group">
                                            <ChessBishopIcon size={22} color="#181818" />
                                            <h3>Chess Assignments</h3>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {chessAssignments.map((assignment) => (
                                            <div
                                                key={assignment.id}
                                                onClick={() => setSelectedAssignment(assignment)}
                                                style={{
                                                    padding: '16px',
                                                    background: '#f8fafc',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#eff6ff';
                                                    e.currentTarget.style.borderColor = '#3b82f6';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = '#f8fafc';
                                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                                    <div>
                                                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>
                                                            {assignment.title}
                                                        </h4>
                                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                                                            {assignment.type} • {assignment.batchName}
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        background: assignment.isSubmitted ? '#dcfce7' : '#dbeafe',
                                                        color: assignment.isSubmitted ? '#166534' : '#1e40af',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {assignment.isSubmitted ? 'Submitted' : 'View'}
                                                    </span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
                                                    {assignment.description?.substring(0, 80)}{assignment.description?.length > 80 ? '...' : ''}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Actions Grid */}
                            <div className={`quick-actions-grid ${cardsVisible ? 'visible' : ''}`}>
                                {quickActions.map((action, index) => {
                                    const IconComponent = action.icon;
                                    return (
                                        <button
                                            key={index}
                                            className="quick-action-card"
                                            onClick={() => navigate(action.path)}
                                            style={{ '--card-gradient': action.gradient }}
                                        >
                                            <div className="action-icon-circle">
                                                <IconComponent size={24} color="white" />
                                            </div>
                                            <div className="action-text">
                                                <span className="action-title">{action.label}</span>
                                                <span className="action-desc">{action.description}</span>
                                            </div>
                                            <span className="action-arrow">→</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="sidebar-column">
                            {/* Coach Card */}
                            <div className={`content-card coach-card ${cardsVisible ? 'visible' : ''}`}>
                                <div className="card-header-row">
                                    <h3>Your Coach</h3>
                                </div>
                                <div className="coach-profile">
                                    <div className="coach-avatar-large" style={{ overflow: 'hidden' }}>
                                        {coach?.photoURL ? (
                                            <img src={coach.photoURL} alt="Coach" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <ChessBishopIcon size={40} color="#181818" />
                                        )}
                                    </div>
                                    <div className="coach-info">
                                        <h4 className="coach-name">{coach ? (coach.fullName || coach.studentName || 'Coach Assigned') : 'Assigning Coach...'}</h4>
                                        <div className="coach-badges">
                                            <span className="badge fide">{coach?.title || 'Instructor'}</span>
                                            <span className="badge rating">
                                                <StarIcon size={12} color="#D4AF37" filled />
                                                {coach?.rating || '5.0'}
                                            </span>
                                        </div>
                                        {student?.assignedBatchName && (
                                            <p className="assigned-batch" style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
                                                <strong>Batch:</strong> {student.assignedBatchName}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="coach-stats-row">
                                    <div className="coach-stat">
                                        <span className="stat-value">{coach?.sessions || '0'}</span>
                                        <span className="stat-label">Sessions</span>
                                    </div>
                                    <div className="coach-stat">
                                        <span className="stat-value">{coach?.experience || '5+'}</span>
                                        <span className="stat-label">Years Exp</span>
                                    </div>
                                    <div className="coach-stat">
                                        <span className="stat-value">{coach?.studentCount || '50+'}</span>
                                        <span className="stat-label">Students</span>
                                    </div>
                                </div>
                            </div>

                            {/* Subscription Card */}
                            {subscription && (
                                <div className={`content-card ${cardsVisible ? 'visible' : ''}`} style={{ borderLeft: '4px solid #FC8A24' }}>
                                    <div className="card-header-row">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <StarIcon size={18} color="#FC8A24" filled />
                                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Active Plan</h4>
                                        </div>
                                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: '#fef3c7', color: '#92400e', fontWeight: 'bold' }}>
                                            {subscription.status}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '12px' }}>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>
                                            {subscription.planName || 'Chess Pro Plan'}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '13px', color: '#64748b' }}>
                                            <span>Next Billing:</span>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                                {subscription.nextDueAt?.toDate ? subscription.nextDueAt.toDate().toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/parent/payments')}
                                        style={{ width: '100%', marginTop: '16px', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        Manage Subscription
                                    </button>
                                </div>
                            )}

                            {/* Next Class Card */}
                            {scheduleItems.some(i => i.status === 'SCHEDULED' || i.status === 'upcoming') && (
                                <div className={`content-card next-class-card ${cardsVisible ? 'visible' : ''}`}>
                                    <div className="live-badge">
                                        <span className="live-dot"></span>
                                        UPCOMING
                                    </div>
                                    <div className="next-class-content">
                                        <div className="class-time-big">
                                            <span className="time-prefix">Next Class</span>
                                            <span className="time-main">
                                                {scheduleItems.find(i => i.status === 'SCHEDULED' || i.status === 'upcoming').time}
                                            </span>
                                        </div>
                                        <div className="countdown-pill">
                                            <ClockIcon size={14} color="#6B8E23" />
                                            {scheduleItems.find(i => i.status === 'SCHEDULED' || i.status === 'upcoming').day}
                                        </div>
                                        <div className="class-topic-box">
                                            <span className="topic-pre">Topic:</span>
                                            <span className="topic-main">Regular Class</span>
                                        </div>
                                        <button
                                            className="join-now-btn"
                                            onClick={() => window.open(scheduleItems.find(i => i.status === 'SCHEDULED' || i.status === 'upcoming').link || student?.meetingLink || 'https://us06web.zoom.us/j/2884373632', '_blank')}
                                        >
                                            <VideoIcon size={20} color="white" />
                                            Join Class Now
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Contact Admin Button */}
            <button
                className="floating-contact-admin"
                onClick={() => navigate('/parent/chat')}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: isDark ? 'rgba(252, 138, 36, 0.2)' : '#FC8A24',
                    color: 'white',
                    border: isDark ? '2px solid rgba(252, 138, 36, 0.5)' : 'none',
                    boxShadow: isDark ? '0 4px 15px rgba(252, 138, 36, 0.2)' : '0 4px 15px rgba(252, 138, 36, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    if (isDark) {
                        e.currentTarget.style.background = 'rgba(252, 138, 36, 0.35)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(252, 138, 36, 0.35)';
                    } else {
                        e.currentTarget.style.background = '#e07c1a';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(252, 138, 36, 0.5)';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = isDark ? 'rgba(252, 138, 36, 0.2)' : '#FC8A24';
                    e.currentTarget.style.boxShadow = isDark ? '0 4px 15px rgba(252, 138, 36, 0.2)' : '0 4px 15px rgba(252, 138, 36, 0.4)';
                }}
                title="Contact Admin Support"
            >
                <ChatIcon size={28} color={isDark ? '#FC8A24' : 'white'} />
            </button>

            <ReviewRequestModal
                isOpen={isReviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                studentName={student?.studentName || student?.fullName || 'Student'}
            />

            <StudentChessAssignmentModal
                isOpen={!!selectedAssignment}
                onClose={() => setSelectedAssignment(null)}
                assignment={selectedAssignment}
                studentId={currentUser?.uid}
            />
        </div>
    );
};

export default ParentDashboard;
