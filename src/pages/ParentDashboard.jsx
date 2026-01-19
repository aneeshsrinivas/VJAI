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
        // Assuming 'accountId' links the student to the parent auth user
        const qStudent = query(
            collection(db, COLLECTIONS.STUDENTS),
            where('accountId', '==', currentUser.uid)
        );

        const unsubscribeStudent = onSnapshot(qStudent, async (snapshot) => {
            if (!snapshot.empty) {
                const studentData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
                setStudent(studentData);

                // If coach is assigned, fetch/listen to coach details
                if (studentData.assignedCoachId) {
                    // One-time fetch is usually enough for coach name/photo unless we want their status
                    const coachDoc = await getDoc(doc(db, COLLECTIONS.COACHES, studentData.assignedCoachId));
                    if (coachDoc.exists()) {
                        setCoach(coachDoc.data());
                    }
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
                    link: data.meetLink // Assuming meetLink is stored
                };
            });
            setScheduleItems(items);
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
        });

        return () => {
            unsubscribeStudent();
            unsubscribeDemos();
            unsubscribeBroadcasts();
        };
    }, [currentUser]);

    // Dynamic Progress Calculation
    useEffect(() => {
        // Prefer real student data, fall back to auth userData
        const lvl = student?.level || userData?.learningLevel || 'Beginner';
        let p = 15; // Beginner
        const lvlLower = typeof lvl === 'string' ? lvl.toLowerCase() : '';

        if (lvlLower.includes('intermediate') || lvlLower.includes('rated 1000')) p = 50;
        if (lvlLower.includes('advanced') || lvlLower.includes('rated 1400')) p = 85;

        const timer = setTimeout(() => setProgress(p), 500);
        return () => clearTimeout(timer);
    }, [student, userData]);

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
                                    <span className="progress-label">Current Rank</span>
                                    <span className="milestone-name">{student?.level || 'Beginner'}</span>
                                </div>
                                <div className="progress-percentage">{progress}%</div>
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="progress-next">
                                Next milestone: <strong>Intermediate</strong>
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

                        {/* Weekly Schedule Card - Dynamic from Demos */}
                        <div className={`content-card schedule-card ${cardsVisible ? 'visible' : ''}`}>
                            <div className="card-header-row">
                                <div className="card-title-group">
                                    <CalendarIcon size={22} color="#003366" />
                                    <h3>Weekly Schedule</h3>
                                </div>
                                <a href="/parent/schedule" className="view-all-link">View All</a>
                            </div>
                            {scheduleItems.length === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                    No scheduled classes yet.
                                </div>
                            ) : (
                                <div className="schedule-list">
                                    {scheduleItems.map((slot) => (
                                        <div
                                            key={slot.id}
                                            className={`schedule-item ${slot.isToday ? 'today' : ''}`}
                                        >
                                            <div className="schedule-left">
                                                <div className="day-indicator">
                                                    <span className="day-abbr">{slot.day.substring(0, 3)}</span>
                                                    {slot.isToday && <span className="today-dot"></span>}
                                                </div>
                                                <div className="schedule-details">
                                                    <span className="day-name">
                                                        {slot.day}
                                                        {slot.isToday && <span className="today-badge">TODAY</span>}
                                                    </span>
                                                    <span className="schedule-time">{slot.time}</span>
                                                </div>
                                            </div>
                                            <div className="schedule-right">
                                                {slot.isToday ? (
                                                    <button
                                                        className="join-class-btn-sm"
                                                        onClick={() => window.open(slot.link || 'https://meet.google.com', '_blank')}
                                                    >
                                                        <VideoIcon size={14} color="white" />
                                                        Join Now
                                                    </button>
                                                ) : (
                                                    <span className={`status-badge ${slot.status === 'SCHEDULED' ? 'upcoming' : slot.status.toLowerCase()}`}>
                                                        {slot.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

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
                                    <h4 className="coach-name">{coach?.fullName || 'Assigning soon...'}</h4>
                                    <div className="coach-badges">
                                        <span className="badge fide">{coach?.title || 'Coach'}</span>
                                        <span className="badge rating">
                                            <StarIcon size={12} color="#D4AF37" filled />
                                            {coach?.rating || '5.0'}
                                        </span>
                                    </div>
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
