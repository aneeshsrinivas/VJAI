import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Crown, Users, GraduationCap } from 'lucide-react';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, userRole, switchDevUser, isDevMode } = useAuth();
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
            if (Array.isArray(saved)) {
                setSavedAccounts(saved);
            }
        } catch (err) {
            console.error("Failed to load accounts", err);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { role, user } = await login(email, password); // assuming login returns user obj too, or just role

            // Handle Remember Me (Multi-account)
            if (rememberMe) {
                const newAccount = { e: email, p: password, role: role, name: email.split('@')[0] };
                const updated = [newAccount, ...savedAccounts.filter(a => a.e !== email)].slice(0, 5); // Keep max 5
                localStorage.setItem('vjai_saved_accounts', JSON.stringify(updated));
                setSavedAccounts(updated);
            }

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

    const selectAccount = (acc) => {
        setEmail(acc.e);
        setPassword(acc.p);
        setRememberMe(true);
        setShowAccounts(false);
    };

    const handleDevAccess = (userType) => {
        switchDevUser(userType);
        if (userType === 'admin') navigate('/admin');
        else if (userType === 'coach') navigate('/coach');
        else navigate('/parent');
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
                            {/* Saved Accounts Dropdown */}
                            {showAccounts && savedAccounts.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    zIndex: 50,
                                    marginTop: '4px',
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}>
                                    {savedAccounts.map((acc, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => selectAccount(acc)}
                                            style={{
                                                padding: '10px 12px',
                                                cursor: 'pointer',
                                                borderBottom: idx < savedAccounts.length - 1 ? '1px solid #f3f4f6' : 'none',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '500', color: '#111827', fontSize: '14px' }}>{acc.e}</span>
                                                <span style={{ fontSize: '12px', color: '#6B7280' }}>Saved • {acc.role || 'User'}</span>
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#3B82F6', fontWeight: '600' }}>Auth</div>
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
                            <label className="remember-me" style={{ cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                /> Remember me
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

                    {isDevMode && (
                        <div className="quick-access">
                            <strong>Dev Mode — Quick Access</strong>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                <button
                                    onClick={() => handleDevAccess('parent')}
                                    style={{
                                        flex: 1,
                                        padding: '10px 8px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #EBD6C3',
                                        background: '#FFFEF3',
                                        cursor: 'pointer',
                                        fontFamily: 'Figtree, sans-serif',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#181818',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#FC8A24'; e.currentTarget.style.color = '#FC8A24'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#EBD6C3'; e.currentTarget.style.color = '#181818'; }}
                                >
                                    <Users size={16} />
                                    Parent
                                </button>
                                <button
                                    onClick={() => handleDevAccess('coach')}
                                    style={{
                                        flex: 1,
                                        padding: '10px 8px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #EBD6C3',
                                        background: '#FFFEF3',
                                        cursor: 'pointer',
                                        fontFamily: 'Figtree, sans-serif',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#181818',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#FC8A24'; e.currentTarget.style.color = '#FC8A24'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#EBD6C3'; e.currentTarget.style.color = '#181818'; }}
                                >
                                    <GraduationCap size={16} />
                                    Coach
                                </button>
                                <button
                                    onClick={() => handleDevAccess('admin')}
                                    style={{
                                        flex: 1,
                                        padding: '10px 8px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #EBD6C3',
                                        background: '#FFFEF3',
                                        cursor: 'pointer',
                                        fontFamily: 'Figtree, sans-serif',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#181818',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#FC8A24'; e.currentTarget.style.color = '#FC8A24'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#EBD6C3'; e.currentTarget.style.color = '#181818'; }}
                                >
                                    <Crown size={16} />
                                    Admin
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
