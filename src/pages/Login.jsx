import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock Login Logic based on Core Data Entities
        // 2.1 Account (Authentication Only) - Role: ADMIN | COACH | CUSTOMER
        if (email.includes('admin')) navigate('/admin');
        else if (email.includes('coach')) navigate('/coach');
        else {
            // "Pre-existing student and parent as customer"
            // For now, CUSTOMER role views the ParentDashboard
            console.log('Logging in as CUSTOMER role');
            navigate('/parent');
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
            {/* Left Side - Visual */}
            <div style={{
                flex: 1,
                backgroundColor: 'var(--color-deep-blue)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '64px',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden'
            }} className="bg-chess-pattern">
                <div style={{ zIndex: 2 }}>
                    <div style={{ fontSize: '64px', marginBottom: '24px' }}>♔</div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '56px', marginBottom: '16px' }}>Welcome Back</h1>
                    <p style={{ fontSize: '20px', color: '#EBD6C3', maxWidth: '400px', lineHeight: '1.6' }}>
                        Log in to VJAI, the strategic operations platform for the Indian Chess Academy.
                    </p>
                </div>
                {/* Decorative Elements - Reduced Opacity */}
                <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', fontSize: '300px', opacity: 0.05, color: '#fff' }}>♞</div>
            </div>

            {/* Right Side - Form */}
            <div style={{ flex: 1, backgroundColor: 'var(--color-ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <Card style={{ width: '100%', maxWidth: '400px', padding: '48px' }} className="animate-fade-in">
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-deep-blue)', marginBottom: '32px', textAlign: 'center' }}>
                        Login to Account
                    </h2>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="e.g. parent@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input type="checkbox" /> Remember me
                            </label>
                            <a href="#" style={{ color: 'var(--color-deep-blue)', textDecoration: 'underline' }}>Forgot Password?</a>
                        </div>

                        <Button type="submit" style={{ backgroundColor: 'var(--color-warm-orange)', marginTop: '16px' }}>
                            Login
                        </Button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: '#666' }}>
                        Don't have an account? <Link to="/select-role" style={{ color: 'var(--color-deep-blue)', fontWeight: 'bold' }}>Register Here</Link>
                    </div>

                    <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#F5F5F5', borderRadius: '8px', fontSize: '12px', color: '#666' }}>
                        <strong>Quick Access for Demo:</strong><br />
                        • admin@vjai.com (Admin)<br />
                        • coach@vjai.com (Coach)<br />
                        • parent@vjai.com (Parent)
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Login;
