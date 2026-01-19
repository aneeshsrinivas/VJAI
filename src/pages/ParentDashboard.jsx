import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudentByAccountId, getSubscriptionByAccountId } from '../services/firestoreService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AccountDropdown from '../components/ui/AccountDropdown';
import ReviewRequestModal from '../components/features/ReviewRequestModal';
// Icons from friend's UI
import CalendarIcon from '../components/icons/CalendarIcon';
import AssignmentIcon from '../components/icons/AssignmentIcon';
import PaymentIcon from '../components/icons/PaymentIcon';
import StarIcon from '../components/icons/StarIcon';
import ChatIcon from '../components/icons/ChatIcon';
import LockIcon from '../components/icons/LockIcon';
import VideoIcon from '../components/icons/VideoIcon';
import GreetingIcon from '../components/icons/GreetingIcon';
import ChessBishopIcon from '../components/icons/ChessBishopIcon';
import UserGroupIcon from '../components/icons/UserGroupIcon';
import ClockIcon from '../components/icons/ClockIcon';
import './ParentDashboard.css';

const ParentDashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [student, setStudent] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cardsVisible, setCardsVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    // Fetch real data from Firestore
    // Fetch real data from Firestore
    useEffect(() => {
        if (currentUser) {
            fetchStudentData();
        } else {
            setLoading(false);
        }
        setTimeout(() => setCardsVisible(true), 100);
    }, [currentUser]);

    // Dynamic Progress Calculation
    useEffect(() => {
        const lvl = student?.level || userData?.learningLevel || 'Beginner';
        let p = 15; // Beginner
        const lvlLower = typeof lvl === 'string' ? lvl.toLowerCase() : '';

        if (lvlLower.includes('intermediate') || lvlLower.includes('rated 1000')) p = 50;
        if (lvlLower.includes('advanced') || lvlLower.includes('rated 1400')) p = 85;

        const timer = setTimeout(() => setProgress(p), 300);
        return () => clearTimeout(timer);
    }, [student, userData]);

    const fetchStudentData = async () => {
        setLoading(true);
        try {
            const studentResult = await getStudentByAccountId(currentUser.uid);
            if (studentResult.success) {
                setStudent(studentResult.student);
            }

            const subResult = await getSubscriptionByAccountId(currentUser.uid);
            if (subResult.success) {
                setSubscription(subResult.subscription);
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDisplayName = () => {
        if (student?.parentName) return student.parentName;
        if (currentUser?.displayName) return currentUser.displayName;
        if (currentUser?.email) return currentUser.email.split('@')[0];
        return 'Parent';
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const scheduleItems = [
        { day: 'Monday', time: '5:00 PM IST', status: 'UPCOMING', isToday: true },
        { day: 'Wednesday', time: '5:00 PM IST', status: 'COMPLETED', isToday: false },
        { day: 'Friday', time: '5:00 PM IST', status: 'PENDING', isToday: false }
    ];

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

    return (
        <div className="parent-dashboard">
            {/* Hero Welcome Section with Unsplash Background */}
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
                            {(student?.studentName || userData?.studentName)
                                ? `${student?.studentName || userData?.studentName}'s chess journey is progressing excellently.`
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
                                    <span className="milestone-name">{student?.level || userData?.learningLevel || 'Beginner'}</span>
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
                        {/* Weekly Schedule Card */}
                        <div className={`content-card schedule-card ${cardsVisible ? 'visible' : ''}`}>
                            <div className="card-header-row">
                                <div className="card-title-group">
                                    <CalendarIcon size={22} color="#003366" />
                                    <h3>Weekly Schedule</h3>
                                </div>
                                <a href="/parent/schedule" className="view-all-link">View All</a>
                            </div>
                            <div className="schedule-list">
                                {scheduleItems.map((slot, i) => (
                                    <div
                                        key={i}
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
                                                    onClick={() => window.open('https://meet.google.com', '_blank')}
                                                >
                                                    <VideoIcon size={14} color="white" />
                                                    Join Now
                                                </button>
                                            ) : (
                                                <span className={`status-badge ${slot.status.toLowerCase()}`}>
                                                    {slot.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                        {/* Coach Card */}
                        <div className={`content-card coach-card ${cardsVisible ? 'visible' : ''}`}>
                            <div className="card-header-row">
                                <h3>Your Coach</h3>
                            </div>
                            <div className="coach-profile">
                                <div className="coach-avatar-large">
                                    <ChessBishopIcon size={40} color="#003366" />
                                </div>
                                <div className="coach-info">
                                    <h4 className="coach-name">{student?.assignedCoachId ? 'Coach Assigned' : 'Coach Ramesh Kumar'}</h4>
                                    <div className="coach-badges">
                                        <span className="badge fide">FIDE Master</span>
                                        <span className="badge rating">
                                            <StarIcon size={12} color="#D4AF37" filled />
                                            4.9
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="coach-stats-row">
                                <div className="coach-stat">
                                    <span className="stat-value">12</span>
                                    <span className="stat-label">Sessions</span>
                                </div>
                                <div className="coach-stat">
                                    <span className="stat-value">5+</span>
                                    <span className="stat-label">Years Exp</span>
                                </div>
                                <div className="coach-stat">
                                    <span className="stat-value">50+</span>
                                    <span className="stat-label">Students</span>
                                </div>
                            </div>
                            <div className="privacy-notice">
                                <LockIcon size={14} color="#999" />
                                <span>Contact info kept private for safety</span>
                            </div>
                        </div>

                        {/* Next Class Card */}
                        <div className={`content-card next-class-card ${cardsVisible ? 'visible' : ''}`}>
                            <div className="live-badge">
                                <span className="live-dot"></span>
                                LIVE SOON
                            </div>
                            <div className="next-class-content">
                                <div className="class-time-big">
                                    <span className="time-prefix">Today at</span>
                                    <span className="time-main">5:00 PM</span>
                                </div>
                                <div className="countdown-pill">
                                    <ClockIcon size={14} color="#6B8E23" />
                                    Starting in 45 mins
                                </div>
                                <div className="class-topic-box">
                                    <span className="topic-pre">Topic:</span>
                                    <span className="topic-main">Sicilian Defense</span>
                                </div>
                                <button
                                    className="join-now-btn"
                                    onClick={() => window.open('https://meet.google.com', '_blank')}
                                >
                                    <VideoIcon size={20} color="white" />
                                    Join Class Now
                                </button>
                            </div>
                        </div>

                        {/* Motivational Card with Image */}
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
