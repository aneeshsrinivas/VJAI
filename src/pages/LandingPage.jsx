import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import '../index.css';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '100vh', fontFamily: 'var(--font-primary)' }}>
            {/* Header */}
            <header style={{ backgroundColor: 'var(--color-deep-blue)', padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '32px', color: '#fff' }}>♔</div> {/* Placeholder Logo */}
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: '#fff', margin: 0, lineHeight: 1 }}>VJAI</h1>
                        <p style={{ margin: 0, color: '#EBD6C3', fontSize: '14px', letterSpacing: '1px' }}>INDIAN CHESS ACADEMY OPERATIONS</p>
                    </div>
                </div>
                <Button variant="secondary" onClick={() => navigate('/login')} style={{ borderColor: '#fff', color: '#fff' }}>Login</Button>
            </header>

            {/* Hero Section */}
            <section className="bg-chess-pattern" style={{ padding: '80px 24px', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '64px', color: 'var(--color-deep-blue)', marginBottom: '16px', maxWidth: '800px' }}>
                    The Strategic Platform for Modern Chess Education
                </h1>
                <p style={{ fontSize: '20px', color: 'var(--color-dark-brown)', maxWidth: '700px', lineHeight: '1.6', marginBottom: '48px' }}>
                    Streamline academy operations, visualize student progress, and master your conversion funnel with strategic elegance.
                </p>
                <Button onClick={() => navigate('/select-role')} style={{ padding: '16px 48px', fontSize: '18px' }}>
                    Get Started
                </Button>
            </section>

            {/* Problem & Solution */}
            <section style={{ padding: '80px 24px', backgroundColor: '#fff' }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px' }}>
                    <div>
                        <h2 style={{ fontSize: '36px', marginBottom: '24px' }}>Why VJAI Was Built</h2>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {['Coordinating demos across timezones', 'Tracking payments manually', 'Fragmented communication'].map((item, i) => (
                                <li key={i} style={{ marginBottom: '16px', display: 'flex', gap: '12px', fontSize: '18px', color: '#68300B' }}>
                                    <span style={{ color: 'var(--color-error)' }}>⚠</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '36px', marginBottom: '24px' }}>How VJAI Solves This</h2>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {['Automated batch optimization', 'Engagement health scores', 'Unified Parent-Coach chat'].map((item, i) => (
                                <li key={i} style={{ marginBottom: '16px', display: 'flex', gap: '12px', fontSize: '18px', color: '#003366' }}>
                                    <span style={{ color: 'var(--color-olive-green)' }}>✓</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Role Cards */}
            <section style={{ padding: '80px 24px', backgroundColor: 'var(--color-ivory)' }}>
                <h2 style={{ textAlign: 'center', fontSize: '42px', marginBottom: '64px' }}>Built for Every Role</h2>
                <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
                    {[
                        { title: 'Parent & Student', icon: '♟', desc: 'Track progress, manage schedules, and chat with coaches.', border: 'var(--color-olive-green)' },
                        { title: 'Coach', icon: '♞', desc: 'Manage batches, plan lessons, and track student ratings.', border: '#FC8A24' },
                        { title: 'Admin', icon: '♚', desc: 'Full operational control, financial analytics, and demo management.', border: 'var(--color-deep-blue)' }
                    ].map((role, i) => (
                        <div key={i} className="hover-lift" style={{
                            backgroundColor: '#fff',
                            padding: '32px',
                            borderRadius: '16px',
                            borderLeft: `8px solid ${role.border}`,
                            width: '300px',
                            boxShadow: 'var(--shadow-md)'
                        }}>
                            <div style={{ fontSize: '64px', marginBottom: '16px', color: 'var(--color-warm-orange)' }}>{role.icon}</div>
                            <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>{role.title}</h3>
                            <p style={{ color: '#666' }}>{role.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{ backgroundColor: 'var(--color-deep-blue)', padding: '80px 24px', textAlign: 'center' }}>
                <h2 style={{ color: '#fff', fontSize: '48px', marginBottom: '24px' }}>Ready to Make Your Move?</h2>
                <p style={{ color: '#EBD6C3', fontSize: '20px', marginBottom: '48px' }}>Join the academy that treats chess education as a science.</p>
                <Button onClick={() => navigate('/select-role')} style={{ backgroundColor: 'var(--color-warm-orange)', color: '#fff', padding: '16px 48px', fontSize: '18px' }}>
                    Select Your Role
                </Button>
            </section>

            <footer style={{ backgroundColor: '#002244', padding: '40px', textAlign: 'center', color: '#8899AA' }}>
                &copy; 2026 Indian Chess Academy. Built with strategic elegance.
            </footer>
        </div>
    );
};

export default LandingPage;
