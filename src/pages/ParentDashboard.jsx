import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS } from '../config/firestoreCollections';
import Button from '../components/ui/Button';
import ReviewRequestModal from '../components/features/ReviewRequestModal';
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
import { Bell, Megaphone } from 'lucide-react';
import './ParentDashboard.css';

const ParentDashboard = () => {
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);

    // Real-time Data
    const [student, setStudent] = useState(null);
    const [coach, setCoach] = useState(null);
    const [broadcasts, setBroadcasts] = useState([]);
    const [scheduleItems, setScheduleItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [cardsVisible, setCardsVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    // 1. Listen to Student Data (for realtime Level & Coach assignment)
    useEffect(() => {
        if (!currentUser?.uid) return;

        setLoading(true);
        // Correctly listen to the 'users' document (Source of Truth)
        // Admin updates 'users' collection, NOT 'students'
        const userDocRef = doc(db, 'users', currentUser.uid);

        const unsubscribeStudent = onSnapshot(userDocRef, async (snapshot) => {
            if (snapshot.exists()) {
                const studentData = { id: snapshot.id, ...snapshot.data() };
                setStudent(studentData);

                // If coach is assigned, fetch/listen to coach details
                // 1. Direct Assignment
                if (studentData.assignedCoachId) {
                    getDoc(doc(db, COLLECTIONS.COACHES, studentData.assignedCoachId)).then(coachDoc => {
                        if (coachDoc.exists()) setCoach(coachDoc.data());
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
        });

        // 2b. Listen to Class Schedule (Regular Batches)
        // We need the student's batchId to fetch specific classes
        // If student is null, we can't fetch batch classes yet, but we can rely on the demo listener above.
        let unsubscribeSchedule = () => { };

        if (student?.batchId || student?.batchName) { // Only fetch if assigned to a batch
            // Broaden query to catch mismatched batch names (e.g. "Group Batch" vs "Intermediate Group Batch")
            const batchNames = [
                student.batchName,
                'Intermediate Group Batch',
                'Group Batch',
                'Intermediate 1:1'
            ].filter(Boolean); // Remove null/undefined

            // Use 'in' query to match any variation
            const qSchedule = query(
                collection(db, COLLECTIONS.SCHEDULE),
                where('batchName', 'in', [...new Set(batchNames)]), // Unique values
                // orderBy('date', 'asc'), 
            );

            unsubscribeSchedule = onSnapshot(qSchedule, (snapshot) => {
                const classes = snapshot.docs.map(doc => {
                    const data = doc.data();
                    // Handle different date formats (Timestamp or ISO string)
                    let dateObj = new Date();
                    if (data.start?.toDate) dateObj = data.start.toDate();
                    else if (data.date?.toDate) dateObj = data.date.toDate();
                    else if (data.start) dateObj = new Date(data.start);

                    const isToday = new Date().toDateString() === dateObj.toDateString();

                    return {
                        id: doc.id,
                        day: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
                        time: dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                        status: 'SCHEDULED', // Regular classes are usually scheduled
                        isToday: isToday,
                        topic: data.title || 'Regular Class',
                        link: data.meetLink,
                        type: 'class',
                        coachId: data.coachId // IMPORTANT: Capture coachId from class
                    };
                });

                // Fallback: If still no coach assigned, try to grab it from the first class found
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

                // Merge with existing demos (scheduleItems currently only has demos)
                // We need to be careful not to overwrite demos blindly. 
                // Let's use a functional update to merge carefully or just maintain two state variables.
                // Simpler: Update scheduleItems to include both. 
                // For now, let's just use a separate state or merge logic inside the effect?
                // Better: Let's move setScheduleItems to a combiner function or effect.
                // Actually, let's just append to the state.
                setScheduleItems(prev => {
                    // Filter out old class items to avoid duplicates on re-render
                    const demos = prev.filter(i => i.type !== 'class');
                    const all = [...demos, ...classes].sort((a, b) => {
                        // Simple sort helper if needed, or rely on render order
                        return 0;
                    });
                    return all;
                });
            });
        }

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
        });

        return () => {
            unsubscribeStudent();
            unsubscribeDemos();
            if (unsubscribeSchedule) unsubscribeSchedule();
            unsubscribeBroadcasts();
        };
    }, [currentUser]);

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
        return <div className="p-8 text-center text-white">Loading Parent Portal...</div>;
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
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="dashboard-content">
                <div className="content-grid">
                    {/* Left Column */}
                    <div className="main-column">

                        {/* Announcements Section (Dynamic) */}
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
                        {/* Coach Card - Dynamic */}
                        <div className={`content-card coach-card ${cardsVisible ? 'visible' : ''}`}>
                            <div className="card-header-row">
                                <h3>Your Coach</h3>
                            </div>
                            <div className="coach-profile">
                                <div className="coach-avatar-large" style={{ overflow: 'hidden' }}>
                                    {coach?.photoURL ? (
                                        <img src={coach.photoURL} alt="Coach" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <ChessBishopIcon size={40} color="#003366" />
                                    )}
                                </div>
                                <div className="coach-info">
                                    <h4 className="coach-name">{coach ? (coach.fullName || coach.studentName || 'Abhiram Bhat') : 'Abhiram Bhat'}</h4>
                                    <div className="coach-badges">
                                        <span className="badge fide">{coach?.title || 'Coach'}</span>
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
                            <div className="privacy-notice">
                                <LockIcon size={14} color="#999" />
                                <span>Contact info kept private for safety</span>
                            </div>
                        </div>

                        {/* Next Class Card */}
                        {scheduleItems.filter(i => i.status === 'SCHEDULED' || i.status === 'upcoming').length > 0 && (
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
                                        <span className="topic-main">Demo/Intro</span>
                                    </div>
                                    <button
                                        className="join-now-btn"
                                        onClick={() => window.open(scheduleItems[0].link || 'https://meet.google.com', '_blank')}
                                    >
                                        <VideoIcon size={20} color="white" />
                                        Join Class Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Motivational Card */}
                        <div className={`content-card motivation-card ${cardsVisible ? 'visible' : ''}`}>
                            <img
                                src="https://images.unsplash.com/photo-1560174038-da43ac74f01b?w=400&q=80"
                                alt="Chess"
                                className="motivation-img"
                            />
                            <div className="motivation-overlay">
                                <p className="motivation-quote">"Every chess master was once a beginner."</p>
                                <span className="motivation-author">— Irving Chernev</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ReviewRequestModal
                isOpen={isReviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
            />
        </div>
    );
};

export default ParentDashboard;
