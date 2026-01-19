import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Input from '../components/ui/Input'; // Assuming Input component exists or I should use standard input
import './RegistrationPage.css';



import { useAuth } from '../context/AuthContext';

const RegistrationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const role = searchParams.get('role') || 'parent';
    const { signup } = useAuth();

    // Unified Form State
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        // Student Specific
        studentName: '',
        studentAge: '',
        learningLevel: 'Beginner (New to Chess)',
        studentType: 'Group Class',
        timezone: 'India (IST)',
        country: '',
        chessUsername: '',
        // Coach Specific
        phone: '',
        title: 'Trainer',
        fideRating: '',
        experience: '',
        // Admin Specific
        employeeId: '',
        department: 'Operations'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Password strength calculator
    const getPasswordStrength = (password) => {
        if (!password) return { level: 0, label: '', color: '#ddd' };

        let score = 0;

        // Length checks
        if (password.length >= 6) score += 1;
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;

        // Character type checks
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 2;

        if (score <= 2) return { level: 1, label: 'Weak', color: '#DC2626' };
        if (score <= 4) return { level: 2, label: 'Medium', color: '#F59E0B' };
        if (score <= 6) return { level: 3, label: 'Strong', color: '#6B8E23' };
        return { level: 4, label: 'Very Strong', color: '#059669' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Require Very Strong password
        if (passwordStrength.level < 4) {
            return setError('Password must be Very Strong. Include 12+ characters with uppercase, lowercase, numbers, and special characters.');
        }

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        if (formData.studentAge && Number(formData.studentAge) <= 5) {
            return setError('Student Age must be above 5 years.');
        }

        // Validate email domain based on selected role
        const email = formData.email.toLowerCase();
        if (role === 'coach' && !email.endsWith('@coach.com')) {
            return setError('Coaches must register with a @coach.com email address.');
        }

        setLoading(true);
        try {
            // Destructure basic auth fields, keep the rest as profile data
            const { email: userEmail, password, confirmPassword, ...profileData } = formData;

            // signup now auto-detects role based on email domain
            const result = await signup(userEmail, password, profileData);
            navigate(`/registration-success?role=${result.role}`);
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already registered. Please login instead.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else {
                setError('Failed to create account: ' + err.message);
            }
            setLoading(false);
        }
    };

    const getRoleTitle = () => {
        if (role === 'parent') return 'Parent & Student Registration';
        if (role === 'coach') return 'Coach Application';
        if (role === 'admin') return 'Admin Account Request';
        return 'Registration';
    };

    const getRoleDescription = () => {
        if (role === 'parent') return 'Create a unified family profile to manage classes and progress.';
        if (role === 'coach') return 'Join our elite teaching faculty and inspire the next generation.';
        if (role === 'admin') return 'Secure access for operations and academy management.';
        return 'Create your account.';
    };

    const renderFields = () => {
        switch (role) {
            case 'parent':
            case 'customer': // Treat parent/student as CUSTOMER
                return (
                    <>
                        {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

                        <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', color: '#0d47a1' }}>
                            <strong>Core Principle:</strong> A single account is used for authentication. Parent details are stored inside the Student record.
                        </div>
                        <Input
                            label="Parent Name"
                            name="fullName"
                            required
                            placeholder="Enter parent's full name"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                        <Input
                            label="Parent Email (Login ID)"
                            name="email"
                            type="email"
                            required
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <Input
                            label="Student Name"
                            name="studentName"
                            required
                            placeholder="Student's name"
                            value={formData.studentName}
                            onChange={handleChange}
                        />
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <Input
                                    label="Student Age"
                                    name="studentAge"
                                    type="number"
                                    required
                                    placeholder="Age"
                                    min="6"
                                    max="18"
                                    value={formData.studentAge}
                                    onChange={handleChange}
                                />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Learning Level</label>
                                <select
                                    name="learningLevel"
                                    value={formData.learningLevel}
                                    onChange={handleChange}
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                                >
                                    <option>Beginner (New to Chess)</option>
                                    <option>Intermediate (Rated 1000-1400)</option>
                                    <option>Advanced (Rated 1400+)</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Student Type (Mandatory)</label>
                                <select
                                    name="studentType"
                                    value={formData.studentType}
                                    onChange={handleChange}
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                                >
                                    <option>Group Class</option>
                                    <option>1-on-1 Tutoring</option>
                                </select>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Timezone</label>
                                <select
                                    name="timezone"
                                    value={formData.timezone}
                                    onChange={handleChange}
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                                >
                                    <option>India (IST)</option>
                                    <option>USA (EST)</option>
                                    <option>USA (PST)</option>
                                    <option>UK (GMT)</option>
                                    <option>Australia (AEST)</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <Input
                                    label="Country"
                                    name="country"
                                    placeholder="e.g. India"
                                    required
                                    value={formData.country}
                                    onChange={handleChange}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Input
                                    label="Chess.com Username (Optional)"
                                    name="chessUsername"
                                    placeholder="e.g. magnus_c"
                                    value={formData.chessUsername}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            required
                            placeholder="Create a secure password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <div style={{ marginTop: '-8px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                                    {[1, 2, 3, 4].map(level => (
                                        <div
                                            key={level}
                                            style={{
                                                flex: 1,
                                                height: '4px',
                                                borderRadius: '2px',
                                                background: passwordStrength.level >= level ? passwordStrength.color : '#e5e7eb',
                                                transition: 'all 0.3s'
                                            }}
                                        />
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: passwordStrength.color }}>
                                        {passwordStrength.label}
                                    </span>
                                    {passwordStrength.level < 4 && (
                                        <span style={{ fontSize: '11px', color: '#666' }}>
                                            Needs: {passwordStrength.level < 3 ? '12+ chars, ' : ''}{!/[A-Z]/.test(formData.password) ? 'UPPERCASE, ' : ''}{!/[0-9]/.test(formData.password) ? 'numbers, ' : ''}{!/[^a-zA-Z0-9]/.test(formData.password) ? 'special char' : ''}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            required
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                <input type="checkbox" required /> I agree to create a single family account (Role: CUSTOMER).
                            </label>
                        </div>
                    </>
                );
            case 'coach':
                return (
                    <>
                        <Input label="Full Name" name="fullName" required placeholder="Your full name" value={formData.fullName} onChange={handleChange} />
                        <Input label="Email" name="email" type="email" required placeholder="name@example.com" value={formData.email} onChange={handleChange} />
                        <Input label="Phone Number (Private)" name="phone" required placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleChange} />
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Title</label>
                                <select
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                                >
                                    <option>Trainer</option>
                                    <option>FIDE Master (FM)</option>
                                    <option>International Master (IM)</option>
                                    <option>Grandmaster (GM)</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <Input label="FIDE Rating" name="fideRating" type="number" placeholder="Optional" value={formData.fideRating} onChange={handleChange} />
                            </div>
                        </div>
                        <Input label="Experience (Years)" name="experience" type="number" required value={formData.experience} onChange={handleChange} />
                        <Input label="Password" name="password" type="password" required value={formData.password} onChange={handleChange} />
                        {/* Password Strength Indicator for Coach */}
                        {formData.password && (
                            <div style={{ marginTop: '-8px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                                    {[1, 2, 3, 4].map(level => (
                                        <div
                                            key={level}
                                            style={{
                                                flex: 1,
                                                height: '4px',
                                                borderRadius: '2px',
                                                background: passwordStrength.level >= level ? passwordStrength.color : '#e5e7eb',
                                                transition: 'all 0.3s'
                                            }}
                                        />
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: passwordStrength.color }}>
                                        {passwordStrength.label}
                                    </span>
                                    {passwordStrength.level < 4 && (
                                        <span style={{ fontSize: '11px', color: '#666' }}>
                                            Needs: {formData.password.length < 12 ? '12+ chars, ' : ''}{!/[A-Z]/.test(formData.password) ? 'UPPERCASE, ' : ''}{!/[0-9]/.test(formData.password) ? 'numbers, ' : ''}{!/[^a-zA-Z0-9]/.test(formData.password) ? 'special char' : ''}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        <Input label="Confirm Password" name="confirmPassword" type="password" required placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} />
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                <input type="checkbox" required /> I understand I will not see parent contact info directly.
                            </label>
                        </div>
                    </>
                );
            case 'admin':
                return (
                    <>
                        <Input label="Full Name" name="fullName" required value={formData.fullName} onChange={handleChange} />
                        <Input label="Work Email" name="email" type="email" required placeholder="name@indianchessacademy.com" value={formData.email} onChange={handleChange} />
                        <Input label="Employee ID" name="employeeId" required value={formData.employeeId} onChange={handleChange} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Department</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                            >
                                <option>Operations</option>
                                <option>Finance</option>
                                <option>HR & Management</option>
                            </select>
                        </div>
                        <Input label="Password" name="password" type="password" required value={formData.password} onChange={handleChange} />
                        {/* Password Strength Indicator for Admin */}
                        {formData.password && (
                            <div style={{ marginTop: '-8px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                                    {[1, 2, 3, 4].map(level => (
                                        <div
                                            key={level}
                                            style={{
                                                flex: 1,
                                                height: '4px',
                                                borderRadius: '2px',
                                                background: passwordStrength.level >= level ? passwordStrength.color : '#e5e7eb',
                                                transition: 'all 0.3s'
                                            }}
                                        />
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: passwordStrength.color }}>
                                        {passwordStrength.label}
                                    </span>
                                    {passwordStrength.level < 4 && (
                                        <span style={{ fontSize: '11px', color: '#666' }}>
                                            Needs: {formData.password.length < 12 ? '12+ chars, ' : ''}{!/[A-Z]/.test(formData.password) ? 'UPPERCASE, ' : ''}{!/[0-9]/.test(formData.password) ? 'numbers, ' : ''}{!/[^a-zA-Z0-9]/.test(formData.password) ? 'special char' : ''}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        <Input label="Confirm Password" name="confirmPassword" type="password" required placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} />
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                <input type="checkbox" required /> I acknowledge full data access responsibility.
                            </label>
                        </div>
                    </>
                );

            default:
                return <div>Invalid Role</div>;
        }
    };

    return (
        <div className="registration-page">
            <div className="registration-overlay"></div>

            <button
                onClick={() => navigate('/')}
                className="registration-back-button"
            >
                ← Back to Home
            </button>

            <div className="registration-card">
                <div className="registration-header">
                    <h1>{getRoleTitle()}</h1>
                    <p>{getRoleDescription()}</p>
                </div>

                <form onSubmit={handleSubmit} className="registration-form">
                    {renderFields()}

                    <button type="submit" className="submit-btn" style={{ marginTop: '24px' }} disabled={loading}>
                        {loading ? 'Processing...' : (role === 'coach' ? 'Submit Application' : 'Create Account')}
                    </button>
                </form>

                <div className="login-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;
