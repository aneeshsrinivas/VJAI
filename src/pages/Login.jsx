import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

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
                                required
                            />
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" /> Remember me
                            </label>
                            <a href="#" className="forgot-password">Forgot Password?</a>
                        </div>

                        <button type="submit" className="login-btn">
                            Login
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
