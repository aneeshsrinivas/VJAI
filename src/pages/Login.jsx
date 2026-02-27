import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Crown, Users, GraduationCap, ArrowLeft } from 'lucide-react';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, switchDevUser, isDevMode } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [savedAccounts, setSavedAccounts] = useState([]);
    const [showAccounts, setShowAccounts] = useState(false);

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('vjai_saved_accounts') || '[]');
            if (Array.isArray(saved)) setSavedAccounts(saved);
        } catch (err) { console.error(err); }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { role } = await login(email, password);
            if (rememberMe) {
                const newAccount = { e: email, p: password, role, name: email.split('@')[0] };
                const updated = [newAccount, ...savedAccounts.filter(a => a.e !== email)].slice(0, 5);
                localStorage.setItem('vjai_saved_accounts', JSON.stringify(updated));
            }
            if (role === 'admin') navigate('/admin');
            else if (role === 'coach') navigate('/coach');
            else if (role === 'customer') navigate('/parent');
            else navigate('/');
        } catch (err) {
            if (err.code === 'auth/user-not-found') setError('No account found with this email.');
            else if (err.code === 'auth/wrong-password') setError('Incorrect password.');
            else setError('Login failed. Check your credentials.');
            setLoading(false);
        }
    };

    const selectAccount = (acc) => {
        setEmail(acc.e); setPassword(acc.p); setRememberMe(true); setShowAccounts(false);
    };

    const handleDevAccess = (userType) => {
        switchDevUser(userType);
        if (userType === 'admin') navigate('/admin');
        else if (userType === 'coach') navigate('/coach');
        else navigate('/parent');
    };

    return (
        <div className="login-page">
            {/* LEFT — Cinematic chess visual */}
            <div className="login-left">
                <video className="login-bg-video" src="/chess-slow.mp4" autoPlay loop muted playsInline />
                <div className="login-left-overlay" />
                <div className="login-left-content">
                    <div className="login-brand">
                        <img src="/logo.png" alt="Indian Chess Academy" className="login-brand-logo" />
                        <span>Indian Chess Academy</span>
                    </div>
                    <h1>Master<br />Your Game.</h1>
                    <p>Join the academy and elevate your strategic thinking to grandmaster level.</p>
                    <div className="login-features">
                        <div className="login-feature">
                            <span className="feature-icon"><Crown size={20} /></span>
                            <span>Expert Coaches</span>
                        </div>
                        <div className="login-feature">
                            <span className="feature-icon"><GraduationCap size={20} /></span>
                            <span>Personalized Training</span>
                        </div>
                        <div className="login-feature">
                            <span className="feature-icon"><Users size={20} /></span>
                            <span>Tournament Ready</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT — Glassmorphism form */}
            <div className="login-right">
                <div className="login-right-orbs" />
                <div className="login-card">
                    <button className="back-to-home-btn" onClick={() => navigate('/')}>
                        <ArrowLeft size={14} style={{ marginRight: 6 }} />
                        Back to Home
                    </button>

                    <div className="login-header">
                        <div className="login-icon"><Crown size={26} /></div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to access your dashboard</p>
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group" style={{ position: 'relative' }}>
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="yourname@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setShowAccounts(true)}
                                onBlur={() => setTimeout(() => setShowAccounts(false), 200)}
                                required
                                autoComplete="off"
                            />
                            {showAccounts && savedAccounts.length > 0 && (
                                <div className="saved-accounts-dropdown">
                                    {savedAccounts.map((acc, idx) => (
                                        <div key={idx} className="saved-account-item" onClick={() => selectAccount(acc)}>
                                            <div>
                                                <span className="saved-email">{acc.e}</span>
                                                <span className="saved-role">Saved &bull; {acc.role}</span>
                                            </div>
                                            <span className="saved-badge">Use</span>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                Remember me
                            </label>
                            <a href="#" className="forgot-password">Forgot Password?</a>
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="register-link">
                        Don't have an account? <Link to="/select-role">Join Us</Link>
                    </div>

                    {isDevMode && (
                        <div className="quick-access">
                            <strong>Dev Mode</strong>
                            <div className="dev-btns">
                                <button className="dev-btn" onClick={() => handleDevAccess('parent')}>
                                    <Users size={14} />Parent
                                </button>
                                <button className="dev-btn" onClick={() => handleDevAccess('coach')}>
                                    <GraduationCap size={14} />Coach
                                </button>
                                <button className="dev-btn" onClick={() => handleDevAccess('admin')}>
                                    <Crown size={14} />Admin
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
