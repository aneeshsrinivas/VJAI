import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudentByAccountId, getSubscriptionByAccountId } from '../services/firestoreService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ReviewRequestModal from '../components/features/ReviewRequestModal';
import { Calendar, MessageSquare, CreditCard, Star, Clock, User, BookOpen } from 'lucide-react';
import './ParentDashboard.css';

const ParentDashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [student, setStudent] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cardsVisible, setCardsVisible] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchStudentData();
        }
        setTimeout(() => setCardsVisible(true), 100);
    }, [currentUser]);

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

    return (
        <div className="parent-dashboard">
            {/* Welcome Banner */}
            <div className="welcome-banner">
                <div className="welcome-content">
                    <div className="welcome-icon-box">
                        <User size={24} />
                    </div>
                    <div className="welcome-text-section">
                        <h1 className="welcome-title">Welcome, {getDisplayName()}</h1>
                        <p className="welcome-subtitle">
                            {student ? `Tracking ${student.studentName}'s chess progress` : 'Your dashboard is loading...'}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <Button variant="secondary" onClick={() => navigate('/parent/chat')} className="btn-chat-mobile">
                        <MessageSquare size={16} style={{ marginRight: 8 }} />
                        Batch Chat
                    </Button>
                    <Button onClick={() => setReviewModalOpen(true)} className="btn-review-mobile">
                        Request 15-min Review
                    </Button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading your dashboard...</div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                        {/* Left Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                            {/* Student Info Card */}
                            {student && (
                                <div className={`dashboard-card ${cardsVisible ? 'card-visible' : ''}`}>
                                    <Card title="Student Profile">
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Name</div>
                                                <div style={{ fontWeight: '600' }}>{student.studentName}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Level</div>
                                                <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{student.level || 'Beginner'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Type</div>
                                                <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{student.studentType || 'Group'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Status</div>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    backgroundColor: student.status === 'ACTIVE' ? '#DCFCE7' : '#FEF3C7',
                                                    color: student.status === 'ACTIVE' ? '#166534' : '#92400E'
                                                }}>
                                                    {student.status || 'ACTIVE'}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {/* Subscription Card */}
                            {subscription && (
                                <div className={`dashboard-card ${cardsVisible ? 'card-visible' : ''}`} style={{ animationDelay: '0.1s' }}>
                                    <Card title="Subscription">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>Plan</div>
                                                <div style={{ fontWeight: '600' }}>{subscription.planId || 'Standard Plan'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>Amount</div>
                                                <div style={{ fontWeight: '700', color: 'var(--color-deep-blue)' }}>
                                                    Rs. {subscription.amount || 0}/month
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>Status</div>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    backgroundColor: subscription.status === 'ACTIVE' ? '#DCFCE7' : '#FEE2E2',
                                                    color: subscription.status === 'ACTIVE' ? '#166534' : '#991B1B'
                                                }}>
                                                    {subscription.status}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Coach Card */}
                            <div className={`dashboard-card ${cardsVisible ? 'card-visible' : ''}`} style={{ animationDelay: '0.2s' }}>
                                <Card title="Your Coach">
                                    <div className="coach-info">
                                        <div className="coach-avatar-box">
                                            <User size={24} />
                                        </div>
                                        <div className="coach-details">
                                            <h3 className="coach-name">{student?.assignedCoachId ? 'Coach Assigned' : 'Pending Assignment'}</h3>
                                            <div className="coach-meta">
                                                <span className="coach-title">Chess Trainer</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="privacy-note">
                                        <span className="privacy-icon"><Clock size={14} /></span>
                                        <span className="privacy-text">Contact details are private for your safety</span>
                                    </div>
                                </Card>
                            </div>

                            {/* Next Class Card */}
                            <div className={`dashboard-card ${cardsVisible ? 'card-visible' : ''}`} style={{ animationDelay: '0.3s' }}>
                                <Card variant="chess" title="Next Class">
                                    <div className="next-class-info">
                                        <div className="class-time">
                                            <div className="time-display">Check Schedule</div>
                                            <div className="time-countdown">
                                                <span className="countdown-badge">View full schedule for timings</span>
                                            </div>
                                        </div>
                                        <Button
                                            className="join-class-btn"
                                            onClick={() => navigate('/parent/schedule')}
                                        >
                                            <Calendar size={16} style={{ marginRight: 8 }} />
                                            View Schedule
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className={`quick-actions ${cardsVisible ? 'card-visible' : ''}`} style={{ animationDelay: '0.4s' }}>
                        <h3 className="section-title">Quick Actions</h3>
                        <div className="actions-grid">
                            <button className="action-card" onClick={() => navigate('/parent/schedule')}>
                                <span className="action-icon"><Calendar size={20} /></span>
                                <span className="action-label">Schedule</span>
                            </button>
                            <button className="action-card" onClick={() => navigate('/parent/assignments')}>
                                <span className="action-icon"><BookOpen size={20} /></span>
                                <span className="action-label">Assignments</span>
                            </button>
                            <button className="action-card" onClick={() => navigate('/parent/payments')}>
                                <span className="action-icon"><CreditCard size={20} /></span>
                                <span className="action-label">Payments</span>
                            </button>
                            <button className="action-card" onClick={() => navigate('/pricing')}>
                                <span className="action-icon"><Star size={20} /></span>
                                <span className="action-label">Upgrade</span>
                            </button>
                        </div>
                    </div>
                </>
            )}

            <ReviewRequestModal
                isOpen={isReviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
            />
        </div>
    );
};

export default ParentDashboard;
