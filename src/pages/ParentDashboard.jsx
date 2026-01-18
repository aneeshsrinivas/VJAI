import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import './ParentDashboard.css';

const ParentDashboard = () => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);
    const [cardsVisible, setCardsVisible] = useState(false);

    useEffect(() => {
        // Animate progress bar
        setTimeout(() => setProgress(85), 300);
        // Trigger card animations
        setTimeout(() => setCardsVisible(true), 100);
    }, []);

    return (
        <div className="parent-dashboard">
            {/* Animated Welcome Banner */}
            <div className="welcome-banner">
                <div className="welcome-content">
                    <div className="welcome-icon">👋</div>
                    <div className="welcome-text-section">
                        <h1 className="welcome-title">Welcome, Sharma Family</h1>
                        <p className="welcome-subtitle">Your child's chess journey is progressing excellently!</p>
                    </div>
                </div>
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
            </div>

            {/* Dashboard Grid */}
            <div className="dashboard-grid">
                {/* Coach Card */}
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
                                <div className="coach-stats">
                                    <div className="stat-item">
                                        <span className="stat-value">2350</span>
                                        <span className="stat-label">Rating</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">8 yrs</span>
                                        <span className="stat-label">Experience</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="privacy-note">
                            <span className="privacy-icon">🔒</span>
                            <span className="privacy-text">Contact details are private for your safety</span>
                        </div>
                    </Card>
                </div>

                {/* Batch Info Card */}
                <div className={`dashboard-card ${cardsVisible ? 'card-visible' : ''}`} style={{ animationDelay: '0.2s' }}>
                    <Card title="Batch Info">
                        <div className="batch-info">
                            <div className="batch-header">
                                <h3 className="batch-name">Intermediate B2</h3>
                                <span className="batch-badge">Active</span>
                            </div>
                            <div className="batch-details">
                                <div className="batch-detail-item">
                                    <span className="detail-icon">👥</span>
                                    <span className="detail-text">8 Students</span>
                                </div>
                                <div className="batch-detail-item">
                                    <span className="detail-icon">📅</span>
                                    <span className="detail-text">Tue, Thu, Sat</span>
                                </div>
                                <div className="batch-detail-item">
                                    <span className="detail-icon">⏰</span>
                                    <span className="detail-text">5:00 PM IST</span>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={() => navigate('/parent/chat')}
                                className="batch-chat-btn"
                            >
                                💬 View Batch Chat
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Next Class Card */}
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
                                <span className="topic-name">Sicilian Defense - Dragon Variation</span>
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

            {/* Second Row */}
            <div className="dashboard-grid">
                {/* Weekly Schedule */}
                <div className={`dashboard-card wide-card ${cardsVisible ? 'card-visible' : ''}`} style={{ animationDelay: '0.4s' }}>
                    <Card title="Weekly Schedule">
                        <div className="schedule-container">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                <div key={day} className="day-column">
                                    <span className="day-name">{day}</span>
                                    <div className={`class-indicator ${[1, 3, 5].includes(i) ? 'has-class' : 'no-class'}`}>
                                        {[1, 3, 5].includes(i) ? '♟' : '—'}
                                    </div>
                                    {[1, 3, 5].includes(i) && (
                                        <span className="class-time">5:00 PM</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Monthly Review */}
                <div className={`dashboard-card ${cardsVisible ? 'card-visible' : ''}`} style={{ animationDelay: '0.5s' }}>
                    <Card title="Monthly Review">
                        <div className="review-info">
                            <div className="review-icon">📊</div>
                            <p className="review-text">Request a 1:1 progress review with your coach</p>
                            <Button disabled className="review-btn">
                                Next Available: Feb 1
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={`quick-actions ${cardsVisible ? 'card-visible' : ''}`} style={{ animationDelay: '0.6s' }}>
                <h3 className="section-title">Quick Actions</h3>
                <div className="actions-grid">
                    <button className="action-card" onClick={() => navigate('/parent/schedule')}>
                        <span className="action-icon">📅</span>
                        <span className="action-label">View Full Schedule</span>
                    </button>
                    <button className="action-card" onClick={() => navigate('/parent/assignments')}>
                        <span className="action-icon">📝</span>
                        <span className="action-label">Assignments</span>
                    </button>
                    <button className="action-card" onClick={() => navigate('/parent/payments')}>
                        <span className="action-icon">💳</span>
                        <span className="action-label">Payment History</span>
                    </button>
                    <button className="action-card" onClick={() => navigate('/pricing')}>
                        <span className="action-icon">⭐</span>
                        <span className="action-label">Upgrade Plan</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
