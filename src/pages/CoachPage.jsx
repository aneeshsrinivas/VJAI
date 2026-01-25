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
    const [schedule, setSchedule] = useState([]); // New state for classes
    const [students, setStudents] = useState([]);
    const [todayClasses, setTodayClasses] = useState([]);
    const [selectedDemo, setSelectedDemo] = useState(null); // Modal state

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
            const demoList = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Normalize date field: fallback to scheduledStart if scheduledAt is missing
                    scheduledAt: data.scheduledAt || data.scheduledStart || data.preferredDateTime
                };
            });
            demoList.sort((a, b) => {
                const getDate = (d) => {
                    if (!d.scheduledAt) return 0;
                    return d.scheduledAt.toDate ? d.scheduledAt.toDate().getTime() : new Date(d.scheduledAt).getTime();
                };
                return getDate(a) - getDate(b);
            });
            setDemos(demoList);

            setDemos(demoList);
            setLoading(false);
            setTimeout(() => setCardsVisible(true), 100);
        }, () => {
            setDemos([]);
            setLoading(false);
            setTimeout(() => setCardsVisible(true), 100);
        });

        // Listen to Students
        const qStudents = query(
            collection(db, 'users'),
            where('assignedCoachId', '==', currentUser.uid),
            where('role', '==', 'customer')
        );

        const unsubStudents = onSnapshot(qStudents, (snapshot) => {
            setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, () => setStudents([]));

        return () => {
            unsubDemos();
            unsubStudents();
        };
    }, [currentUser]);

    // Fetch Schedule (Classes)
    useEffect(() => {
        if (!currentUser?.uid) return;

        const qSchedule = query(
            collection(db, COLLECTIONS.SCHEDULE),
            where('coachId', '==', currentUser.uid)
        );

        const unsubSchedule = onSnapshot(qSchedule, (snapshot) => {
            const list = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    scheduledAt: data.scheduledAt // Ensure consistency
                };
            });
            setSchedule(list);
        });

        return () => unsubSchedule();
    }, [currentUser]);

    // Update todayClasses when demos or schedule change
    useEffect(() => {
        const today = new Date();
        const start = new Date(today.setHours(0, 0, 0, 0));
        const end = new Date(today.setHours(23, 59, 59, 999));

        const getDate = (d) => d.scheduledAt?.toDate ? d.scheduledAt.toDate() : new Date(d.scheduledAt || 0);

        const todaysDemos = demos.filter(d => {
            const date = getDate(d);
            return date >= start && date <= end;
        }).map(d => ({ ...d, type: 'demo' }));

        const todaysClasses = schedule.filter(c => {
            const date = getDate(c);
            return date >= start && date <= end;
        }).map(c => ({
            ...c,
            type: 'class',
            studentName: c.batchName || c.topic || 'Class',
            chessExperience: 'Batch Class',
            studentAge: 'N/A'
        }));

        const combined = [...todaysDemos, ...todaysClasses];

        // Filter out items without valid scheduledAt
        const validCombined = combined.filter(item => {
            if (!item.scheduledAt) return false;
            const date = item.scheduledAt.toDate ? item.scheduledAt.toDate() : new Date(item.scheduledAt);
            return !isNaN(date.getTime()) && date.getFullYear() > 1970;
        });

        // Deduplicate by ID and (Title + Time)
        const uniqueMap = new Map();
        validCombined.forEach(item => {
            const timeKey = item.scheduledAt?.seconds || new Date(item.scheduledAt).getTime();
            const key = `${item.title || item.studentName}-${timeKey}`;

            const isDuplicateKey = Array.from(uniqueMap.values()).some(existing => {
                const existingTime = existing.scheduledAt?.seconds || new Date(existing.scheduledAt).getTime();
                const existingKey = `${existing.title || existing.studentName}-${existingTime}`;
                return existingKey === key;
            });

            if (!uniqueMap.has(item.id) && !isDuplicateKey) {
                uniqueMap.set(item.id, item);
            }
        });

        const uniqueCombined = Array.from(uniqueMap.values());
        uniqueCombined.sort((a, b) => getDate(a) - getDate(b));

        setTodayClasses(uniqueCombined);
    }, [demos, schedule]);

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
                                            <h4>
                                                {session.type === 'class' ? '📚' : '🎯'} {session.studentName || 'Student'}
                                            </h4>
                                            <p>
                                                <span className={`badge ${session.type === 'class' ? 'class' : 'demo'}`}>
                                                    {session.type === 'class' ? 'Class' : 'Demo'}
                                                </span>
                                                <span className="meta">• {session.studentAge === 'N/A' ? '' : `${session.studentAge} yrs •`} {session.chessExperience || 'Beginner'}</span>
                                            </p>
                                        </div>
                                        {((session.type === 'demo' && session.meetingLink) || (session.type === 'class' && session.meetLink)) && (
                                            <button
                                                className="btn-join"
                                                onClick={() => window.open(session.meetingLink || session.meetLink, '_blank')}
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
                                <div
                                    key={demo.id}
                                    className="demo-item"
                                    onClick={() => setSelectedDemo(demo)}
                                    style={{ cursor: 'pointer' }}
                                >
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

            {/* Demo Details Modal */}
            {selectedDemo && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setSelectedDemo(null)}>
                    <div style={{
                        background: 'white', padding: '24px', borderRadius: '20px',
                        width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        animation: 'slideUp 0.3s ease-out'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Zap size={20} color="#F59E0B" fill="#F59E0B" />
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>Demo Details</h3>
                            </div>
                            <button onClick={() => setSelectedDemo(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <ChevronRight size={24} style={{ transform: 'rotate(90deg)' }} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                <div style={{
                                    width: '48px', height: '48px',
                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                    borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#3b82f6', fontWeight: 'bold', fontSize: '20px',
                                    border: '1px solid #bfdbfe'
                                }}>
                                    {selectedDemo.studentName?.charAt(0)}
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>{selectedDemo.studentName}</h4>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px', marginTop: '2px' }}>
                                        {selectedDemo.studentAge} years • {selectedDemo.chessExperience}
                                    </p>
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <Calendar size={20} color="#64748b" />
                                    <div>
                                        <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Date & Time</span>
                                        <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '15px' }}>
                                            {formatDate(selectedDemo.scheduledAt)} at {formatTime(selectedDemo.scheduledAt)}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <Target size={20} color="#64748b" />
                                    <div>
                                        <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Focus Goal</span>
                                        <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '15px' }}>{selectedDemo.goal || 'General Improvement'}</span>
                                    </div>
                                </div>

                                <div style={{ paddingTop: '16px', borderTop: '1px dashed #e2e8f0', marginTop: '4px' }}>
                                    {selectedDemo.meetingLink ? (
                                        <a
                                            href={selectedDemo.meetingLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn-join"
                                            style={{
                                                justifyContent: 'center', width: '100%', textDecoration: 'none',
                                                padding: '12px', fontSize: '15px'
                                            }}
                                        >
                                            <Video size={18} /> Join Class Room
                                        </a>
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '14px', background: '#fef2f2', padding: '10px', borderRadius: '8px' }}>
                                            Checking for meeting link...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {selectedDemo.parentName && (
                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#94a3b8' }}>Parent Contact</p>
                                    <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#334155' }}>{selectedDemo.parentName}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#3b82f6', fontWeight: '500' }}>{selectedDemo.parentEmail}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default CoachPage;
