import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Crown, Users, GraduationCap } from 'lucide-react';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, userRole } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { role } = await login(email, password);

            // Navigate immediately based on returned role
            if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'coach') {
                navigate('/coach');
            } else if (role === 'customer') {
                navigate('/parent');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email. Please register first.');
            } else if (err.code === 'auth/wrong-password') {
                setError('Incorrect password. Please try again.');
            } else {
                setError('Failed to login. Please check your credentials.');
            }
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
                            <span className="feature-icon"><Crown size={24} /></span>
                            <span>Expert Coaches</span>
                        </div>
                        <div className="login-feature">
                            <span className="feature-icon"><GraduationCap size={24} /></span>
                            <span>Personalized Training</span>
                        </div>
                        <div className="login-feature">
                            <span className="feature-icon"><Users size={24} /></span>
                            <span>Tournament Ready</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="login-right">
                <div className="login-right-pattern"></div>
                <div className="login-card">
                    <button
                        className="back-to-home-btn"
                        onClick={() => navigate('/')}
                    >
                        Back to Home
                    </button>
                    <div className="login-header">
                        <div className="login-icon"><Crown size={32} /></div>
                        <h1>Welcome Back</h1>
                        <p>Log in to access your dashboard</p>
                    </div>

                    {error && <div className="error-message" style={{ color: '#DC2626', marginBottom: '1rem', textAlign: 'center', padding: '12px', backgroundColor: '#FEE2E2', borderRadius: '8px' }}>{error}</div>}

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="yourname@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
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
                        Don't have an account? <Link to="/select-role">Join Us</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
