import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { COLLECTIONS, DEMO_STATUS } from '../config/firestoreCollections';
import Button from '../components/ui/Button';
import {
    Clock, Users, Calendar, TrendingUp, BookOpen, Award, Lightbulb,
    Video, ChevronRight, Star, Activity, Zap, GraduationCap, MessageSquare,
    Sun, Moon, Sunset, Trophy, Target
} from 'lucide-react';
import './CoachPage.css';

const CoachPage = () => {
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();
    const [loading, setLoading] = useState(true);
    const [cardsVisible, setCardsVisible] = useState(false);

    // Real-time State
    const [demos, setDemos] = useState([]);
    const [students, setStudents] = useState([]);
    const [todayClasses, setTodayClasses] = useState([]);

    useEffect(() => {
        if (!currentUser?.uid) return;

        setLoading(true);

        // Listen to Demos
        const qDemos = query(
            collection(db, COLLECTIONS.DEMOS),
            where('assignedCoachId', '==', currentUser.uid),
            where('status', 'in', [DEMO_STATUS.SCHEDULED, DEMO_STATUS.PENDING])
        );

        const unsubDemos = onSnapshot(qDemos, (snapshot) => {
            const demoList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            demoList.sort((a, b) => {
                const aTime = a.scheduledAt?.toMillis?.() || a.scheduledAt || 0;
                const bTime = b.scheduledAt?.toMillis?.() || b.scheduledAt || 0;
                return aTime - bTime;
            });
            setDemos(demoList);

            // Today's Classes
            const today = new Date();
            const todayStart = new Date(today.setHours(0, 0, 0, 0));
            const todayEnd = new Date(today.setHours(23, 59, 59, 999));

            const todays = demoList.filter(d => {
                if (!d.scheduledAt) return false;
                const date = d.scheduledAt.toDate ? d.scheduledAt.toDate() : new Date(d.scheduledAt);
                return date >= todayStart && date <= todayEnd;
            });
            setTodayClasses(todays);
            setLoading(false);
            setTimeout(() => setCardsVisible(true), 100);
        }, () => {
            setDemos([]);
            setTodayClasses([]);
            setLoading(false);
            setTimeout(() => setCardsVisible(true), 100);
        });

        // Listen to Students
        const qStudents = query(
            collection(db, COLLECTIONS.STUDENTS),
            where('assignedCoachId', '==', currentUser.uid)
        );

        const unsubStudents = onSnapshot(qStudents, (snapshot) => {
            setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, () => setStudents([]));

        return () => {
            unsubDemos();
            unsubStudents();
        };
    }, [currentUser]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: 'Good Morning', Icon: Sun };
        if (hour < 17) return { text: 'Good Afternoon', Icon: Sunset };
        return { text: 'Good Evening', Icon: Moon };
    };

    const getCoachName = () => {
        if (userData?.fullName) return userData.fullName;
        const email = currentUser?.email || '';
        const username = email.split('@')[0];
        if (username.includes('abhirambhat')) return 'Abhiram Bhat';
        return username.charAt(0).toUpperCase() + username.slice(1) || 'Coach';
    };

    const formatTime = (dateVal) => {
        if (!dateVal) return '';
        const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateVal) => {
        if (!dateVal) return '';
        const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const greeting = getGreeting();

    if (loading) {
        return (
            <div className="coach-loading-page">
                <div className="loading-spinner">♞</div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="coach-page">
            {/* Hero Section */}
            <section className="coach-hero">
                <div className="coach-hero-bg">
                    <img
                        src="https://images.unsplash.com/photo-1560174038-da43ac74f01b?w=1200&q=80"
                        alt=""
                        className="hero-bg-img"
                    />
                    <div className="hero-overlay"></div>
                </div>

                <div className="coach-hero-content">
                    <div className="hero-left">
                        <div className="greeting-badge">
                            <greeting.Icon size={20} color="#FC8A24" />
                            <span>{greeting.text}</span>
                        </div>
                        <h1 className="hero-title">Welcome back, {getCoachName()}!</h1>
                        <p className="hero-subtitle">
                            You have {todayClasses.length} session{todayClasses.length !== 1 ? 's' : ''} scheduled for today.
                            Let's inspire some chess champions! ♟️
                        </p>
                        <div className="hero-actions">
                            <Button onClick={() => navigate('/coach/schedule')} className="btn-hero primary">
                                <Calendar size={18} />
                                <span>My Schedule</span>
                            </Button>
                            <Button onClick={() => navigate('/coach/chat')} className="btn-hero secondary">
                                <MessageSquare size={18} />
                                <span>Messages</span>
                            </Button>
                        </div>
                    </div>

                    <div className="hero-right">
                        <div className="stats-card-floating">
                            <div className="stats-header">
                                <Trophy size={24} color="#FC8A24" />
                                <div className="stats-info">
                                    <span className="stats-label">Coach Rating</span>
                                    <span className="stats-value">4.9 ⭐</span>
                                </div>
                            </div>
                            <div className="mini-stats">
                                <div className="mini-stat">
                                    <span className="mini-num">{students.length}</span>
                                    <span className="mini-label">Students</span>
                                </div>
                                <div className="mini-stat">
                                    <span className="mini-num">{demos.length}</span>
                                    <span className="mini-label">Demos</span>
                                </div>
                                <div className="mini-stat">
                                    <span className="mini-num">98%</span>
                                    <span className="mini-label">Attendance</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Stats Row */}
            <div className="quick-stats-row">
                <div className={`stat-card ${cardsVisible ? 'visible' : ''}`} style={{ '--delay': '0.1s' }}>
                    <div className="stat-icon blue"><Users size={24} /></div>
                    <div className="stat-content">
                        <span className="stat-number">{students.length}</span>
                        <span className="stat-label">Active Students</span>
                    </div>
                </div>
                <div className={`stat-card ${cardsVisible ? 'visible' : ''}`} style={{ '--delay': '0.2s' }}>
                    <div className="stat-icon orange"><Video size={24} /></div>
                    <div className="stat-content">
                        <span className="stat-number">{demos.length}</span>
                        <span className="stat-label">Upcoming Demos</span>
                    </div>
                </div>
                <div className={`stat-card ${cardsVisible ? 'visible' : ''}`} style={{ '--delay': '0.3s' }}>
                    <div className="stat-icon green"><Target size={24} /></div>
                    <div className="stat-content">
                        <span className="stat-number">{todayClasses.length}</span>
                        <span className="stat-label">Today's Sessions</span>
                    </div>
                </div>
                <div className={`stat-card ${cardsVisible ? 'visible' : ''}`} style={{ '--delay': '0.4s' }}>
                    <div className="stat-icon purple"><Star size={24} /></div>
                    <div className="stat-content">
                        <span className="stat-number">4.9</span>
                        <span className="stat-label">Coach Rating</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="coach-content-grid">
                {/* Left Column */}
                <div className="main-column">
                    {/* Today's Schedule */}
                    <div className={`content-card ${cardsVisible ? 'visible' : ''}`}>
                        <div className="card-header">
                            <div className="card-title-group">
                                <Clock size={22} color="#6366f1" />
                                <h3>Today's Schedule</h3>
                            </div>
                            <span className="card-badge">{todayClasses.length} Sessions</span>
                        </div>

                        <div className="session-list">
                            {todayClasses.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📅</div>
                                    <p>No sessions scheduled for today</p>
                                    <span>Enjoy your free day or check your upcoming demos!</span>
                                </div>
                            ) : (
                                todayClasses.map(session => (
                                    <div key={session.id} className="session-item">
                                        <div className="session-time">
                                            <span className="time">{formatTime(session.scheduledAt)}</span>
                                        </div>
                                        <div className="session-details">
                                            <h4>{session.studentName || 'Student'}</h4>
                                            <p>
                                                <span className="badge demo">Demo</span>
                                                <span className="meta">• {session.studentAge} yrs • {session.chessExperience || 'Beginner'}</span>
                                            </p>
                                        </div>
                                        {session.meetingLink && (
                                            <button
                                                className="btn-join"
                                                onClick={() => window.open(session.meetingLink, '_blank')}
                                            >
                                                <Video size={16} />
                                                Join
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className={`quick-actions-grid ${cardsVisible ? 'visible' : ''}`}>
                        <button className="quick-action" onClick={() => navigate('/coach/batches')}>
                            <BookOpen size={24} color="#f59e0b" />
                            <span>Materials</span>
                        </button>
                        <button className="quick-action" onClick={() => navigate('/coach/schedule')}>
                            <Calendar size={24} color="#10b981" />
                            <span>Availability</span>
                        </button>
                        <button className="quick-action" onClick={() => navigate('/chat')}>
                            <MessageSquare size={24} color="#6366f1" />
                            <span>Chat</span>
                        </button>
                        <button className="quick-action" onClick={() => navigate('/coach/students')}>
                            <GraduationCap size={24} color="#ec4899" />
                            <span>Students</span>
                        </button>
                    </div>
                </div>

                {/* Right Column */}
                <div className="side-column">
                    {/* Upcoming Demos */}
                    <div className={`content-card ${cardsVisible ? 'visible' : ''}`}>
                        <div className="card-header">
                            <div className="card-title-group">
                                <Zap size={20} color="#f59e0b" />
                                <h3>Upcoming Demos</h3>
                            </div>
                            <button className="btn-link" onClick={() => navigate('/coach/schedule')}>
                                See All <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="demo-list">
                            {demos.slice(0, 4).map(demo => (
                                <div key={demo.id} className="demo-item">
                                    <div className="demo-date">
                                        <span className="day">{formatDate(demo.scheduledAt)}</span>
                                        <span className="time">{formatTime(demo.scheduledAt)}</span>
                                    </div>
                                    <div className="demo-info">
                                        <h4>{demo.studentName}</h4>
                                        <p>{demo.studentAge} yrs • {demo.chessExperience || 'Beginner'}</p>
                                    </div>
                                    <ChevronRight size={16} color="#cbd5e1" />
                                </div>
                            ))}
                            {demos.length === 0 && (
                                <div className="empty-mini">No upcoming demos</div>
                            )}
                        </div>
                    </div>

                    {/* Pro Tip Card */}
                    <div className={`tip-card ${cardsVisible ? 'visible' : ''}`}>
                        <div className="tip-icon">
                            <Lightbulb size={24} color="#fff" />
                        </div>
                        <h4>Pro Tip of the Day</h4>
                        <p>"Start every demo by asking about the student's favorite chess piece. It builds instant rapport!"</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoachPage;
