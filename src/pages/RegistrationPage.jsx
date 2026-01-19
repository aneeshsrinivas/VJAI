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

        if (role !== 'coach' && formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        if (role === 'parent' || role === 'customer') {
            // Redundant check as UI is blocked, but safe
            return navigate('/demo-booking');
        }

        setLoading(true);
        try {
            if (role === 'coach') {
                // Submit Application Only
                // Import this! I need to ensure it's imported at the top. I'll rely on a separate replace or assume dynamic import... 
                // Wait, I cannot use dynamic import easily inside function without async. 
                // I should check imports. 
                // For now, I'll update functionality assuming I will add the import next step.
                const { createCoachApplication } = await import('../services/firestoreService');

                const applicationData = {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    title: formData.title,
                    fideRating: formData.fideRating,
                    experience: formData.experience,
                    department: formData.department // If applicable
                };

                await createCoachApplication(applicationData);
                alert('Application Submitted! We will review and contact you.');
                navigate('/');
            } else {
                // Admin registration (Blocked in UI but logic remains for other roles if any)
                const { email, password, confirmPassword, ...profileData } = formData;
                await signup(email, password, role === 'parent' ? 'customer' : role, profileData);
                navigate(`/registration-success?role=${role}`);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to process: ' + err.message);
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
            case 'customer':
                return (
                    <div className="restriction-message">
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <h3 style={{ color: 'var(--color-deep-blue)', marginBottom: '16px' }}>Registration via Demo Only</h3>
                            <p style={{ marginBottom: '24px', color: '#555' }}>
                                To ensure the best placement for your child, we require a free demo class before enrollment.
                                Please book a session to get started.
                            </p>
                            <button
                                onClick={() => navigate('/demo-booking')}
                                className="submit-btn"
                            >
                                Book Free Demo
                            </button>
                        </div>
                    </div>
                );
            case 'admin':
                return (
                    <div className="restriction-message">
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <h3 style={{ color: '#d32f2f', marginBottom: '16px' }}>Access Restricted</h3>
                            <p style={{ color: '#555' }}>
                                Admin accounts are created internally by the System Administrator.
                                Please contact your supervisor for credentials.
                            </p>
                            <Link to="/login" style={{ display: 'block', marginTop: '16px', color: 'var(--color-deep-blue)' }}>Back to Login</Link>
                        </div>
                    </div>
                );
            case 'coach':
                return (
                    <>
                        <div style={{ padding: '12px', backgroundColor: '#fff3e0', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', color: '#e65100' }}>
                            <strong>Note:</strong> Coach applications are reviewed by our team. You will be contacted upon approval.
                        </div>
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

                        {/* 
                            Password field removed for Coach Application - Admin creates it? 
                            OR keep it if we let them create account PENDING approval? 
                            User said "Admin... manual account creation". 
                            So Coach just submits DATA. No password.
                        */}

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                <input type="checkbox" required /> I understand this is an application for a coaching position.
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

                    <button type="submit" className="submit-btn" style={{ marginTop: '24px' }}>
                        {loading ? 'Account Created...' : (role === 'coach' ? 'Submit Application' : 'Create Account')}
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
