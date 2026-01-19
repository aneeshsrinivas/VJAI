import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Clock, Users, Calendar, TrendingUp, BookOpen, Award, Lightbulb } from 'lucide-react';
import './CoachDashboard.css';

const CoachPage = () => {
    const navigate = useNavigate();

    const todayClasses = [
        { id: 1, time: '4:00 PM', batch: 'Beginner A1', students: 12, status: 'upcoming', color: '#10b981' },
        { id: 2, time: '5:00 PM', batch: 'Intermediate B2', students: 8, status: 'live', color: '#3b82f6' },
        { id: 3, time: '7:00 PM', batch: 'Advanced C1', students: 6, status: 'upcoming', color: '#8b5cf6' },
    ];

    const stats = [
        { label: 'Total Students', value: '26', icon: Users, color: '#3b82f6' },
        { label: 'Active Batches', value: '3', icon: BookOpen, color: '#10b981' },
        { label: 'Classes This Week', value: '12', icon: Calendar, color: '#f59e0b' },
        { label: 'Avg. Attendance', value: '94%', icon: TrendingUp, color: '#8b5cf6' },
    ];

    return (
        <div className="coach-dashboard">
            {/* Welcome Section */}
            <div className="coach-welcome">
                <div className="coach-welcome-content">
                    <h1 className="coach-welcome-title">Welcome back, Coach Ramesh!</h1>
                    <p className="coach-welcome-subtitle">Ready to inspire your students today?</p>
                </div>
                <div className="coach-welcome-actions">
                    <Button onClick={() => navigate('/coach/schedule')} className="coach-btn-primary">
                        <Calendar size={18} />
                        View Full Schedule
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="coach-stats-grid">
                {stats.map((stat, index) => (
                    <Card key={index} className="coach-stat-card">
                        <div className="coach-stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div className="coach-stat-content">
                            <div className="coach-stat-value">{stat.value}</div>
                            <div className="coach-stat-label">{stat.label}</div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="coach-content-grid">
                {/* Left Column */}
                <div className="coach-left-column">
                    {/* Today's Classes */}
                    <Card className="coach-card">
                        <div className="coach-card-header">
                            <h2 className="coach-card-title">Today's Classes</h2>
                            <span className="coach-badge">{todayClasses.length} Scheduled</span>
                        </div>
                        <div className="coach-classes-list">
                            {todayClasses.map((cls) => (
                                <div key={cls.id} className={`coach-class-item ${cls.status === 'live' ? 'live' : ''}`}>
                                    <div className="coach-class-time">
                                        <Clock size={18} />
                                        <span>{cls.time}</span>
                                    </div>
                                    <div className="coach-class-details">
                                        <div className="coach-class-name">{cls.batch}</div>
                                        <div className="coach-class-meta">
                                            <Users size={14} />
                                            <span>{cls.students} Students</span>
                                        </div>
                                    </div>
                                    <div className="coach-class-actions">
                                        {cls.status === 'live' ? (
                                            <Button size="sm" className="coach-btn-live">
                                                Start Class
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="outline">
                                                Prepare
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="coach-card">
                        <div className="coach-card-header">
                            <h2 className="coach-card-title">Quick Actions</h2>
                        </div>
                        <div className="coach-quick-actions">
                            <button className="coach-action-btn" onClick={() => navigate('/coach/batches')}>
                                <div className="coach-action-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}>
                                    <BookOpen size={20} />
                                </div>
                                <div className="coach-action-text">
                                    <div className="coach-action-title">Upload Materials</div>
                                    <div className="coach-action-subtitle">Share resources with batches</div>
                                </div>
                            </button>
                            <button className="coach-action-btn" onClick={() => navigate('/coach/schedule')}>
                                <div className="coach-action-icon" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
                                    <Calendar size={20} />
                                </div>
                                <div className="coach-action-text">
                                    <div className="coach-action-title">Manage Availability</div>
                                    <div className="coach-action-subtitle">Block unavailable slots</div>
                                </div>
                            </button>
                            <button className="coach-action-btn" onClick={() => navigate('/coach/chat')}>
                                <div className="coach-action-icon" style={{ background: '#8b5cf615', color: '#8b5cf6' }}>
                                    <Users size={20} />
                                </div>
                                <div className="coach-action-text">
                                    <div className="coach-action-title">Batch Chat</div>
                                    <div className="coach-action-subtitle">Communicate with students</div>
                                </div>
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="coach-right-column">
                    {/* Demo Schedule */}
                    <Card className="coach-card">
                        <div className="coach-card-header">
                            <h2 className="coach-card-title">Upcoming Demos</h2>
                        </div>
                        <div className="coach-demo-card">
                            <div className="coach-demo-badge">Tomorrow, 3:00 PM</div>
                            <div className="coach-demo-name">Ishaan Verma</div>
                            <div className="coach-demo-meta">
                                <span>Beginner Level</span>
                                <span>•</span>
                                <span>10 Years Old</span>
                            </div>
                            <Button size="sm" variant="outline" style={{ marginTop: '12px', width: '100%' }}>
                                View Details
                            </Button>
                        </div>
                    </Card>

                    {/* Teaching Tip */}
                    <Card className="coach-card coach-tip-card">
                        <div className="coach-tip-icon">
                            <Lightbulb size={24} />
                        </div>
                        <div className="coach-tip-title">Teaching Tip</div>
                        <div className="coach-tip-text">
                            "Use puzzles to reinforce tactical patterns. Students retain concepts better through problem-solving."
                        </div>
                    </Card>

                    {/* Performance Overview */}
                    <Card className="coach-card">
                        <div className="coach-card-header">
                            <h2 className="coach-card-title">This Month</h2>
                            <Award size={20} color="#f59e0b" />
                        </div>
                        <div className="coach-performance-stats">
                            <div className="coach-perf-item">
                                <div className="coach-perf-label">Classes Completed</div>
                                <div className="coach-perf-value">48</div>
                            </div>
                            <div className="coach-perf-item">
                                <div className="coach-perf-label">Materials Uploaded</div>
                                <div className="coach-perf-value">12</div>
                            </div>
                            <div className="coach-perf-item">
                                <div className="coach-perf-label">Student Progress</div>
                                <div className="coach-perf-value">+15%</div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CoachPage;
