import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, doc, getDoc, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS } from '../config/firestoreCollections';
import {
    Clock, Users, Calendar, TrendingUp, BookOpen, ChevronRight,
    MessageSquare, GraduationCap, Video, CheckCircle2,
    Sparkles, Brain, Star, Play, PlayCircle, Plus, Upload, Trash2,
    FileText
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import CreateChessPuzzleModal from '../components/features/CreateChessPuzzleModal';
import UploadMaterialModal from '../components/features/UploadMaterialModal';
import CreateAssignmentModal from '../components/features/CreateAssignmentModal';
import './CoachDashboard.css';

const CoachDashboard = () => {
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();
    const { isDark } = useTheme();
    const fileInputRef = useRef(null);

    // State for dynamic data
    const [coachProfile, setCoachProfile] = useState(null);
    const [coachDocId, setCoachDocId] = useState(null); // Firestore doc ID (not auth UID)
    const [students, setStudents] = useState([]);
    const [demos, setDemos] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cardsVisible, setCardsVisible] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [selectedBatchForUpload, setSelectedBatchForUpload] = useState(null);
    const [createAssignmentBatch, setCreateAssignmentBatch] = useState(null);
    const [createPuzzleBatch, setCreatePuzzleBatch] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [schedule, setSchedule] = useState([]);

    // Fetch Schedule (Classes)
    useEffect(() => {
        if (!currentUser?.uid) return;

        const scheduleQuery = query(
            collection(db, COLLECTIONS.SCHEDULE),
            where('coachId', '==', currentUser.uid)
        );

        const unsubSchedule = onSnapshot(scheduleQuery, (snapshot) => {
            const list = snapshot.docs.map(doc => {
                const data = doc.data();
                const date = data.scheduledAt?.toDate ? data.scheduledAt.toDate() : new Date();
                return {
                    id: doc.id,
                    type: 'class',
                    title: data.batchName || data.topic || 'Class',
                    studentName: data.batchName || 'Group Class',
                    chessExperience: 'Batch',
                    scheduledStart: date,
                    meetingLink: data.meetLink
                };
            });
            setSchedule(list);
        }, (error) => {
            console.error('Schedule query error:', error);
            setSchedule([]);
        });

        return () => unsubSchedule();
    }, [currentUser]);

    // Combine Demos and Schedule
    const combinedSchedule = [...demos.map(d => ({ ...d, type: 'demo' })), ...schedule].sort((a, b) => {
        const dateA = new Date(a.scheduledStart || 0);
        const dateB = new Date(b.scheduledStart || 0);
        return dateA - dateB;
    });

    const upcomingEvents = combinedSchedule.filter(e => {
        const eventDate = new Date(e.scheduledStart || 0);
        const now = new Date();
        now.setHours(now.getHours() - 2);
        return eventDate > now;
    }).slice(0, 5);

    console.log('CoachDashboard Schedule:', { schedule, demos, combinedSchedule, upcomingEvents });

    // Fetch Coach Profile and related data
    useEffect(() => {
        if (!currentUser?.uid) return;

        const fetchCoachProfile = async () => {
            const coachQuery = query(
                collection(db, COLLECTIONS.COACHES),
                where('accountId', '==', currentUser.uid)
            );

            const unsubCoach = onSnapshot(coachQuery, async (snapshot) => {
                if (!snapshot.empty) {
                    const docId = snapshot.docs[0].id;
                    setCoachProfile({ id: docId, ...snapshot.docs[0].data() });
                    setCoachDocId(docId);
                } else {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        setCoachProfile({ id: userDoc.id, ...userDoc.data() });
                    }
                }
                setLoading(false);
                setTimeout(() => setCardsVisible(true), 100);
            }, (error) => {
                console.error('Coach profile listener error:', error);
                setLoading(false);
                setTimeout(() => setCardsVisible(true), 100);
            });

            return unsubCoach;
        };

        // Demos - simplified query to avoid index requirement
        const demosQuery = query(
            collection(db, COLLECTIONS.DEMOS),
            where('assignedCoachId', '==', currentUser.uid),
            where('status', '==', 'SCHEDULED'),
            limit(10)
        );

        const unsubDemos = onSnapshot(demosQuery, (snapshot) => {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            // Sort in JS instead of Firestore to avoid index requirement
            list.sort((a, b) => {
                const aTime = a.scheduledStart || 0;
                const bTime = b.scheduledStart || 0;
                return aTime - bTime;
            });
            setDemos(list.slice(0, 5));
        }, (error) => {
            console.error('Demos query error:', error);
            setDemos([]);
        });

        fetchCoachProfile();

        return () => {
            unsubDemos();
        };
    }, [currentUser]);

    // Fetch students and batches
    // Students are in the 'users' collection; admin may assign by coachDocId OR auth UID
    useEffect(() => {
        if (!currentUser?.uid) return;

        const idsToQuery = [currentUser.uid];
        if (coachDocId && coachDocId !== currentUser.uid) {
            idsToQuery.push(coachDocId);
        }

        // Query students assigned to this coach (by auth UID or coach doc ID)
        const studentsQuery = query(
            collection(db, 'users'),
            where('assignedCoachId', 'in', idsToQuery),
            where('role', 'in', ['student', 'customer'])
        );

        const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
            setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (error) => {
            console.error('Students query error:', error);
            setStudents([]);
        });

        // Batches: try coachDocId first, fallback to auth UID
        const batchPath = coachDocId || currentUser.uid;
        const unsubBatches = onSnapshot(
            collection(db, COLLECTIONS.COACHES, batchPath, 'batches'),
            (snapshot) => {
                setBatches(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            },
            (error) => {
                console.error('Batches query error:', error);
                // If coachDocId path failed, try auth UID as fallback
                if (batchPath !== currentUser.uid) {
                    const unsubFallback = onSnapshot(
                        collection(db, COLLECTIONS.COACHES, currentUser.uid, 'batches'),
                        (snap) => setBatches(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
                        () => setBatches([])
                    );
                    return () => unsubFallback();
                }
                setBatches([]);
            }
        );

        return () => {
            unsubStudents();
            unsubBatches();
        };
    }, [coachDocId, currentUser]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: 'Good Morning', emoji: '🌅' };
        if (hour < 17) return { text: 'Good Afternoon', emoji: '☀️' };
        return { text: 'Good Evening', emoji: '🌙' };
    };

    const getCoachName = () => {
        if (coachProfile?.fullName) return coachProfile.fullName;
        if (coachProfile?.coachName) return coachProfile.coachName;
        if (coachProfile?.name) return coachProfile.name;
        if (userData?.fullName) return userData.fullName;

        const email = currentUser?.email || '';
        const username = email.split('@')[0];
        if (username.includes('abhirambhat')) return 'Abhiram Bhat';

        return username.charAt(0).toUpperCase() + username.slice(1) || 'Coach';
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedBatchForUpload) {
            alert('Please select a batch first');
            return;
        }

        setUploadingFile(true);
        setTimeout(() => {
            setUploadingFile(false);
            alert(`✅ "${file.name}" uploaded successfully!`);
        }, 1500);
    };

    const getSkillStats = () => {
        const beginners = students.filter(s => s.level === 'beginner').length;
        const intermediate = students.filter(s => s.level === 'intermediate').length;
        const advanced = students.filter(s => s.level === 'advanced').length;
        return { beginners, intermediate, advanced };
    };

    const skillStats = getSkillStats();
    const greeting = getGreeting();

    if (loading) {
        return (
            <div className="coach-loading">
                <div className="loader">
                    <div className="chess-piece">♞</div>
                </div>
                <p>Preparing your command center...</p>
            </div>
        );
    }

    return (
        <div className="coach-dashboard ultra">
            {/* Animated Background */}
            <div className="animated-bg">
                <div className="bg-gradient"></div>
                <div className="floating-shapes">
                    <div className="shape shape-1">♟</div>
                    <div className="shape shape-2">♛</div>
                    <div className="shape shape-3">♜</div>
                    <div className="shape shape-4">♝</div>
                </div>
            </div>

            {/* HERO SECTION */}
            <section className="hero-compact">
                <div className="hero-content">
                    <div className="hero-left">
                        <div className="greeting-badge glass">
                            <Sparkles size={16} />
                            <span>{greeting.emoji} {greeting.text}</span>
                        </div>

                        <h1 className="hero-title gradient-text">
                            Welcome, {getCoachName()}!
                        </h1>

                        <p className="hero-tagline">
                            You're shaping the next generation of chess champions.
                            <span className="highlight">Let's make moves! ♟️</span>
                        </p>

                        <div className="hero-actions">
                            <button className="btn-primary glow" onClick={() => navigate('/coach/schedule')}>
                                <Calendar size={16} />
                                <span>Schedule</span>
                            </button>
                            <button className="btn-glass" onClick={() => navigate('/coach/chat')}>
                                <MessageSquare size={16} />
                                <span>Chat</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS CARDS - 3D Effect */}
            <div className="stats-container">
                <div className={`stat-card-3d students ${cardsVisible ? 'visible' : ''}`}>
                    <div className="card-glow"></div>
                    <div className="card-content">
                        <div className="card-icon">
                            <GraduationCap size={28} />
                        </div>
                        <div className="card-data">
                            <span className="card-number">{students.length}</span>
                            <span className="card-label">Active Students</span>
                        </div>
                    </div>
                    <div className="card-trend positive">
                        <TrendingUp size={14} /> Growing
                    </div>
                </div>

                <div className={`stat-card-3d demos ${cardsVisible ? 'visible' : ''}`}>
                    <div className="card-glow"></div>
                    <div className="card-content">
                        <div className="card-icon">
                            <Video size={28} />
                        </div>
                        <div className="card-data">
                            <span className="card-number">{demos.length}</span>
                            <span className="card-label">Scheduled Demos</span>
                        </div>
                    </div>
                    <div className="card-trend neutral">
                        <Clock size={14} /> Upcoming
                    </div>
                </div>

                <div className={`stat-card-3d batches ${cardsVisible ? 'visible' : ''}`}>
                    <div className="card-glow"></div>
                    <div className="card-content">
                        <div className="card-icon">
                            <Layers size={28} />
                        </div>
                        <div className="card-data">
                            <span className="card-number">{batches.length}</span>
                            <span className="card-label">My Batches</span>
                        </div>
                    </div>
                    <div className="card-trend positive">
                        <CheckCircle2 size={14} /> Active
                    </div>
                </div>

                <div className={`stat-card-3d rating ${cardsVisible ? 'visible' : ''}`}>
                    <div className="card-glow"></div>
                    <div className="card-content">
                        <div className="card-icon">
                            <Star size={28} />
                        </div>
                        <div className="card-data">
                            <span className="card-number" style={{ fontSize: '16px' }}>Pending</span>
                            <span className="card-label">Lichess Rating</span>
                        </div>
                    </div>
                    <div className="card-trend neutral">
                        <Clock size={14} /> Integration pending
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="content-grid">
                {/* LEFT - Main Content */}
                <div className="main-section">
                    {/* Schedule Card (Replaces Demos Card) */}
                    <div className={`glass-card demos-section ${cardsVisible ? 'visible' : ''}`}>
                        <div className="card-header">
                            <div className="header-title">
                                <Calendar size={20} className="icon-accent" />
                                <h2>📅 Your Schedule</h2>
                            </div>
                            <button className="btn-link" onClick={() => navigate('/coach/schedule')}>
                                View All <ChevronRight size={16} />
                            </button>
                        </div>

                        {upcomingEvents.length === 0 ? (
                            <div className="empty-state glass">
                                <div className="empty-icon">📅</div>
                                <p>No classes or demos scheduled</p>
                                <span>Check your calendar for details</span>
                            </div>
                        ) : (
                            <div className="demos-list">
                                {upcomingEvents.map((event, index) => (
                                    <div key={event.id} className={`demo-card ${event.type === 'demo' ? 'demo-event' : 'class-event'}`} style={{ animationDelay: `${index * 0.1}s`, borderLeft: event.type === 'demo' ? '4px solid #10B981' : '4px solid #3B82F6' }}>
                                        <div className="demo-time">
                                            <span className="time-badge">
                                                {event.scheduledStart
                                                    ? new Date(event.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : 'TBD'}
                                            </span>
                                            <span className="date-text">
                                                {event.scheduledStart
                                                    ? new Date(event.scheduledStart).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
                                                    : ''}
                                            </span>
                                        </div>
                                        <div className="demo-info">
                                            <h4>
                                                {event.type === 'demo' ? '🎯' : '📚'} {event.studentName}
                                            </h4>
                                            <p>
                                                {event.type === 'demo'
                                                    ? `${event.chessExperience || 'Beginner'} • Demo`
                                                    : `${event.title} • Class`}
                                            </p>
                                        </div>
                                        {event.meetingLink && (
                                            <button className="btn-join" onClick={() => window.open(event.meetingLink, '_blank')}>
                                                <Play size={16} /> Join
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Students & Skill Map */}
                    <div className={`glass-card students-section ${cardsVisible ? 'visible' : ''}`}>
                        <div className="card-header">
                            <div className="header-title">
                                <Brain size={20} className="icon-accent" />
                                <h2>🧠 Student Skill Distribution</h2>
                            </div>
                        </div>

                        <div className="skill-map-ultra">
                            <div className="skill-item beginner">
                                <div className="skill-icon">🌱</div>
                                <div className="skill-bar-container">
                                    <div className="skill-label">Beginners</div>
                                    <div className="skill-bar">
                                        <div
                                            className="skill-fill"
                                            style={{ width: `${students.length > 0 ? (skillStats.beginners / students.length) * 100 : 30}%` }}
                                        >
                                            <span className="skill-count">{skillStats.beginners}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="skill-item intermediate">
                                <div className="skill-icon">📚</div>
                                <div className="skill-bar-container">
                                    <div className="skill-label">Intermediate</div>
                                    <div className="skill-bar">
                                        <div
                                            className="skill-fill"
                                            style={{ width: `${students.length > 0 ? (skillStats.intermediate / students.length) * 100 : 50}%` }}
                                        >
                                            <span className="skill-count">{skillStats.intermediate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="skill-item advanced">
                                <div className="skill-icon">🏆</div>
                                <div className="skill-bar-container">
                                    <div className="skill-label">Advanced</div>
                                    <div className="skill-bar">
                                        <div
                                            className="skill-fill"
                                            style={{ width: `${students.length > 0 ? (skillStats.advanced / students.length) * 100 : 20}%` }}
                                        >
                                            <span className="skill-count">{skillStats.advanced}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Students Table */}
                        {students.length > 0 && (
                            <div className="students-table-wrapper">
                                <table className="students-table">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Level</th>
                                            <th>Type</th>
                                            <th>Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.slice(0, 5).map(student => (
                                            <tr key={student.id}>
                                                <td>
                                                    <div className="student-cell">
                                                        <div className="student-avatar">{(student.studentName || 'S').charAt(0)}</div>
                                                        <span>{student.studentName || 'Student'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge level ${student.level || 'beginner'}`}>
                                                        {student.level || 'Beginner'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge type ${student.studentType === '1-1' ? 'solo' : 'group'}`}>
                                                        {student.studentType === '1-1' ? '1-on-1' : 'Group'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="progress-mini">
                                                        <div className="progress-fill" style={{ width: '65%' }}></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="sidebar-section">
                    {/* Upload Materials */}
                    <div className={`glass-card upload-section ${cardsVisible ? 'visible' : ''}`}>
                        <div className="card-header">
                            <div className="header-title">
                                <Upload size={18} className="icon-accent" />
                                <h3>📁 Upload Materials</h3>
                            </div>
                        </div>

                        <div className="upload-dropzone" onClick={() => fileInputRef.current?.click()}>
                            <div className="upload-icon">
                                <FileText size={32} />
                            </div>
                            <p className="upload-text">
                                {uploadingFile ? '⏳ Uploading...' : 'Click to upload files'}
                            </p>
                            <span className="upload-formats">PDF, PGN, DOC • Max 10MB</span>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".pdf,.pgn,.doc,.docx,.txt"
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div className="batch-selector">
                            <label>Upload to:</label>
                            <select
                                value={selectedBatchForUpload}
                                onChange={(e) => setSelectedBatchForUpload(e.target.value)}
                            >
                                <option value="">Select batch...</option>
                                {batches.map(batch => (
                                    <option key={batch.id} value={batch.name}>{batch.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Batches */}
                    <div className={`glass-card batches-section ${cardsVisible ? 'visible' : ''}`}>
                        <div className="card-header">
                            <div className="header-title">
                                <BookOpen size={18} className="icon-accent" />
                                <h3>📚 My Batches</h3>
                            </div>
                        </div>

                        <div className="batches-list">
                            {batches.map(batch => (
                                <div key={batch.id} className="batch-card" style={{ padding: '20px', borderRadius: '16px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
                                    <div className="batch-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span className="batch-name" style={{ fontWeight: '700', fontSize: '16px' }}>{batch.name}</span>
                                        <span className={`batch-level ${batch.level}`} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: batch.level === 'beginner' ? '#dcfce7' : '#dbeafe', color: batch.level === 'beginner' ? '#166534' : '#1e40af' }}>{batch.level}</span>
                                    </div>
                                    <div className="batch-meta" style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                                        <span>👥 {batch.studentsId?.length ?? 0} students</span>
                                        <span>📅 {batch.schedule || 'Flexible'}</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <button 
                                            className="btn-batch-action" 
                                            onClick={() => setCreatePuzzleBatch(batch)}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', fontSize: '12px', borderRadius: '8px', border: '1px solid #10b981', background: '#ecfdf5', color: '#047857', fontWeight: '600' }}
                                        >
                                            <PlayCircle size={14} /> Puzzle
                                        </button>
                                        <button 
                                            className="btn-batch-action" 
                                            onClick={() => setSelectedBatchForUpload(batch)}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', fontSize: '12px', borderRadius: '8px', border: '1px solid #3b82f6', background: '#eff6ff', color: '#1d4ed8', fontWeight: '600' }}
                                        >
                                            <Upload size={14} /> Material
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className={`glass-card quick-section ${cardsVisible ? 'visible' : ''}`}>
                        <h3>⚡ Quick Actions</h3>
                        <div className="quick-grid">
                            <button onClick={() => navigate('/coach/schedule')} className="quick-btn">
                                <Calendar size={20} />
                                <span>Schedule</span>
                            </button>
                            <button onClick={() => navigate('/coach/batches')} className="quick-btn">
                                <Users size={20} />
                                <span>Batches</span>
                            </button>
                            <button onClick={() => navigate('/coach/chat')} className="quick-btn">
                                <MessageSquare size={20} />
                                <span>Chat</span>
                            </button>
                            <button onClick={() => navigate('/coach/students')} className="quick-btn">
                                <GraduationCap size={20} />
                                <span>Students</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateChessPuzzleModal 
                isOpen={!!createPuzzleBatch} 
                onClose={() => setCreatePuzzleBatch(null)} 
                batchId={createPuzzleBatch?.id}
                batchName={createPuzzleBatch?.name}
                onSuccess={() => {}}
            />

            <UploadMaterialModal
                isOpen={!!selectedBatchForUpload}
                onClose={() => setSelectedBatchForUpload(null)}
                batchId={selectedBatchForUpload?.id}
                batchName={selectedBatchForUpload?.name}
                onSuccess={() => {}}
            />

            <CreateAssignmentModal
                isOpen={!!createAssignmentBatch}
                onClose={() => setCreateAssignmentBatch(null)}
                batchId={createAssignmentBatch?.id}
                batchName={createAssignmentBatch?.name}
                onSuccess={() => {}}
            />
            {/* Floating Contact Admin Button */}
            <button
                className="floating-contact-admin"
                onClick={() => navigate('/coach/chat')}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#FC8A24',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(252, 138, 36, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Contact Admin Support"
            >
                <MessageSquare size={28} color="white" />
            </button>
        </div>
    );
};

// Extra icon component
const Layers = ({ size = 24, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
    </svg>
);

export default CoachDashboard;
