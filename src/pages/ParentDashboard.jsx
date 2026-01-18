import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AccountDropdown from '../components/ui/AccountDropdown';
import ReviewRequestModal from '../components/features/ReviewRequestModal';
import './ParentDashboard.css';

const ParentDashboard = () => {
    const navigate = useNavigate();
    // Integrated State: Mine + His
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [cardsVisible, setCardsVisible] = useState(false);

    useEffect(() => {
        // Animate progress bar (His feature)
        setTimeout(() => setProgress(85), 300);
        // Trigger card animations
        setTimeout(() => setCardsVisible(true), 100);
    }, []);

    // Helper for Weekly Schedule Logic (My Feature)
    const scheduleItems = [
        { day: 'Monday', time: '5:00 PM IST', status: 'UPCOMING', isToday: true },
        { day: 'Wednesday', time: '5:00 PM IST', status: 'COMPLETED', isToday: false },
        { day: 'Friday', time: '5:00 PM IST', status: 'PENDING', isToday: false }
    ];

    return (
        <div className="parent-dashboard">
            {/* Animated Welcome Banner (Merged) */}
            <div className="welcome-banner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div className="welcome-content">
                        <div className="welcome-icon">👋</div>
                        <div className="welcome-text-section">
                            <h1 className="welcome-title">Welcome, Sharma Family</h1>
                            <p className="welcome-subtitle">Your child's chess journey is progressing excellently!</p>
                        </div>
                    </div>
                    <AccountDropdown
                        userName="Sharma Family"
                        userRole="Parent Account"
                        avatarEmoji="👨‍👩‍👧"
                    />
                </div>
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <Button variant="secondary" onClick={() => navigate('/parent/chat')} className="btn-chat-mobile">
                        <span style={{ marginRight: '8px' }}>💬</span> Batch Chat
                    </Button>
                    <Button onClick={() => setReviewModalOpen(true)} className="btn-review-mobile">
                        Request 15-min Review
                    </Button>
                </div>
            </div>


            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Left Column - Progress & Schedule */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Progress Bar (His) */}
                    <div className="progress-section">
                        <div className="progress-header">
                            <span className="progress-label">Next Milestone: Bishop Rank</span>
                            <span className="progress-percentage">{progress}%</span>
                        </div>
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* My Dynamic Weekly Schedule in His Layout */}
                    <div className={`dashboard-card ${cardsVisible ? 'card-visible' : ''}`}>
                        <Card title="Weekly Schedule">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {scheduleItems.map((slot, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', borderLeft: slot.isToday ? '4px solid var(--color-warm-orange)' : '4px solid transparent' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: 'var(--color-deep-blue)' }}>
                                                {slot.day} {slot.isToday && <span style={{ fontSize: '10px', backgroundColor: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>TODAY</span>}
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#666' }}>{slot.time}</div>
                                        </div>
                                        {slot.isToday ? (
                                            <Button size="sm" onClick={() => window.open('https://meet.google.com/abc-defg', '_blank')}>Join Class</Button>
                                        ) : (
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#999' }}>{slot.status}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                </div>

                {/* Right Column - Stats/Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Coach Card (His layout, confirmed Privacy Note) */}
                    <div className={`dashboard-card ${cardsVisible ? 'card-visible' : ''}`} style={{ animationDelay: '0.1s' }}>
                        <Card title="Your Coach">
                            <div className="coach-info">
                                <div className="coach-avatar">♞</div>
                                <div className="coach-details">
                                    <h3 className="coach-name">Coach Ramesh Kumar</h3>
                                    <div className="coach-meta">
                                        <span className="coach-title">FIDE Master</span>
                                        <span className="coach-rating">⭐ 4.9/5</span>
                                    </div>
                                </div>
                            </div>
                            <div className="privacy-note">
                                <span className="privacy-icon">🔒</span>
                                <span className="privacy-text">Contact details are private for your safety</span>
                            </div>
                        </Card>
                    </div>

                    {/* Next Class Card (His) */}
                    <div className={`dashboard-card ${cardsVisible ? 'card-visible' : ''}`} style={{ animationDelay: '0.3s' }}>
                        <Card variant="chess" title="Next Class">
                            <div className="next-class-info">
                                <div className="class-time">
                                    <div className="time-display">Today, 5:00 PM</div>
                                    <div className="time-countdown">
                                        <span className="countdown-badge">Starting in 45 mins</span>
                                    </div>
                                </div>
                                <div className="class-topic">
                                    <span className="topic-label">Topic:</span>
                                    <span className="topic-name">Sicilian Defense</span>
                                </div>
                                <Button
                                    className="join-class-btn pulsing-btn"
                                    onClick={() => window.open('https://meet.google.com', '_blank')}
                                >
                                    🎥 Join Class Now
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Quick Actions (His) */}
            <div className={`quick-actions ${cardsVisible ? 'card-visible' : ''}`} style={{ animationDelay: '0.6s' }}>
                <h3 className="section-title">Quick Actions</h3>
                <div className="actions-grid">
                    <button className="action-card" onClick={() => navigate('/parent/schedule')}>
                        <span className="action-icon">📅</span>
                        <span className="action-label">Schedule</span>
                    </button>
                    <button className="action-card" onClick={() => navigate('/parent/assignments')}>
                        <span className="action-icon">📝</span>
                        <span className="action-label">Assignments</span>
                    </button>
                    <button className="action-card" onClick={() => navigate('/parent/payments')}>
                        <span className="action-icon">💳</span>
                        <span className="action-label">Payments</span>
                    </button>
                    <button className="action-card" onClick={() => navigate('/pricing')}>
                        <span className="action-icon">⭐</span>
                        <span className="action-label">Upgrade</span>
                    </button>
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
