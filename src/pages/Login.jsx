import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login, userRole } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Effect to redirect based on role if already logged in (or after successful login)
    React.useEffect(() => {
        if (userRole === 'admin') navigate('/admin');
        if (userRole === 'coach') navigate('/coach');
        if (userRole === 'customer') navigate('/parent');
    }, [userRole, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            // Navigation handled by useEffect
        } catch (err) {
            console.error(err);
            setError('Failed to login. Please check your credentials.');
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Left Side - Chess Board Visual */}
            <div className="login-left">
                <div className="login-left-overlay"></div>
                <div className="login-left-content">
                    <h1>Master Your Game</h1>
                    <p>Join the Indian Chess Academy and elevate your strategic thinking to the next level.</p>
                    <div className="login-features">
                        <div className="login-feature">
                            <span className="feature-icon">♔</span>
                            <span>Expert Coaches</span>
                        </div>
                        <div className="login-feature">
                            <span className="feature-icon">♕</span>
                            <span>Personalized Training</span>
                        </div>
                        <div className="login-feature">
                            <span className="feature-icon">♖</span>
                            <span>Tournament Ready</span>
                        </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', fontSize: '300px', opacity: 0.1, color: '#fff' }}>♞</div>
            </div>

            {/* Right Side - Login Form */}
            <div className="login-right">
                <div className="login-right-pattern"></div>
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-icon">♔</div>
                        <h1>Welcome Back</h1>
                        <p>Log in to access your VJAI dashboard</p>
                    </div>

                    {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="e.g. parent@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" /> Remember me
                            </label>
                            <a href="#" className="forgot-password">Forgot Password?</a>
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="register-link">
                        Don't have an account? <Link to="/select-role">Register Here</Link>
                    </div>

                    <div className="quick-access">
                        <strong>Quick Access for Demo:</strong>
                        • admin@vjai.com (Admin)<br />
                        • coach@vjai.com (Coach)<br />
                        • parent@vjai.com (Parent)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
