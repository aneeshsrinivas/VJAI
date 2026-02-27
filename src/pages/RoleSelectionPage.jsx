import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Users, GraduationCap, BookOpen, BarChart3, Calendar, Award, Shield, Zap } from 'lucide-react';
import './RoleSelectionPage.css';

const RoleSelectionPage = () => {
    const navigate = useNavigate();

    const parentFeatures = [
        { icon: BookOpen, text: 'Book a free demo class' },
        { icon: Users, text: 'Personalized assessment' },
        { icon: Award, text: 'Meet our expert coaches' },
        { icon: Zap, text: 'View subscription plans' },
    ];

    const coachFeatures = [
        { icon: GraduationCap, text: 'Join our teaching faculty' },
        { icon: Users, text: 'Manage student roster' },
        { icon: BookOpen, text: 'Upload course content' },
        { icon: BarChart3, text: 'Track performance' },
    ];

    return (
        <div className="rsp-page">
            {/* ── LEFT — Cinematic chess visual ── */}
            <div className="rsp-left">
                <video className="rsp-bg-video" src="/chess-video.mp4" autoPlay loop muted playsInline />
                <div className="rsp-left-overlay" />

                {/* Back button — top left of the visual panel */}
                <button className="rsp-back-btn" onClick={() => navigate('/')}>
                    <ArrowLeft size={14} style={{ marginRight: 6 }} />
                    Back to Home
                </button>

                <div className="rsp-left-content">
                    <div className="rsp-brand">
                        <img src="/logo.png" alt="Indian Chess Academy" className="rsp-brand-logo" />
                        <span>Indian Chess Academy</span>
                    </div>
                    <h1>Choose<br />Your Path.</h1>
                    <p>Whether you're here to learn or to teach, we have the right portal for you. Join thousands of students and coaches on their chess journey.</p>
                    <div className="rsp-stats">
                        <div className="rsp-stat">
                            <span className="rsp-stat-num">2,400+</span>
                            <span className="rsp-stat-label">Students</span>
                        </div>
                        <div className="rsp-stat-divider" />
                        <div className="rsp-stat">
                            <span className="rsp-stat-num">80+</span>
                            <span className="rsp-stat-label">Expert Coaches</span>
                        </div>
                        <div className="rsp-stat-divider" />
                        <div className="rsp-stat">
                            <span className="rsp-stat-num">12+</span>
                            <span className="rsp-stat-label">Years Running</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RIGHT — Dark portal selection ── */}
            <div className="rsp-right">
                <div className="rsp-right-orbs" />

                <div className="rsp-right-inner">
                    <div className="rsp-header">
                        <p className="rsp-eyebrow">Select Your Portal</p>
                        <h2>Who are you?</h2>
                        <p className="rsp-subheading">Access your personalized dashboard</p>
                    </div>

                    {/* Parent & Student Card */}
                    <div className="rsp-card rsp-card--gold">
                        <div className="rsp-card-badge">Most Popular</div>
                        <div className="rsp-card-top">
                            <div className="rsp-card-icon rsp-card-icon--gold">
                                <Users size={28} />
                            </div>
                            <div>
                                <h3 className="rsp-card-title">Parent &amp; Student</h3>
                                <p className="rsp-card-desc">For families looking to enroll</p>
                            </div>
                        </div>
                        <ul className="rsp-features">
                            {parentFeatures.map(({ icon: Icon, text }) => (
                                <li key={text} className="rsp-feature">
                                    <span className="rsp-feature-icon rsp-feature-icon--gold">
                                        <Icon size={14} />
                                    </span>
                                    {text}
                                </li>
                            ))}
                        </ul>
                        <button
                            className="rsp-btn rsp-btn--gold"
                            onClick={() => navigate('/demo-booking')}
                        >
                            Book Free Demo
                            <span className="rsp-btn-arrow">→</span>
                        </button>
                    </div>

                    {/* Coach Card */}
                    <div className="rsp-card rsp-card--silver">
                        <div className="rsp-card-top">
                            <div className="rsp-card-icon rsp-card-icon--silver">
                                <GraduationCap size={28} />
                            </div>
                            <div>
                                <h3 className="rsp-card-title">Coach</h3>
                                <p className="rsp-card-desc">For instructors and mentors</p>
                            </div>
                        </div>
                        <ul className="rsp-features">
                            {coachFeatures.map(({ icon: Icon, text }) => (
                                <li key={text} className="rsp-feature">
                                    <span className="rsp-feature-icon rsp-feature-icon--silver">
                                        <Icon size={14} />
                                    </span>
                                    {text}
                                </li>
                            ))}
                        </ul>
                        <button
                            className="rsp-btn rsp-btn--ghost"
                            onClick={() => navigate('/register?role=coach')}
                        >
                            Apply as Coach
                            <span className="rsp-btn-arrow">→</span>
                        </button>
                    </div>

                    {/* Footer row: security + login */}
                    <div className="rsp-footer-row">
                        <div className="rsp-note">
                            <Shield size={13} className="rsp-note-icon" />
                            <p>Strict privacy protocols. Coaches do not have access to parent contact details.</p>
                        </div>
                        <div className="rsp-login-cta">
                            Already have an account?{' '}
                            <Link to="/login">Sign In</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionPage;
