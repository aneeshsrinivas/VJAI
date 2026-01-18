import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import './RegistrationPage.css';

const RegistrationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const role = searchParams.get('role') || 'parent';
    const [formData, setFormData] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, API call here
        navigate(`/registration-success?role=${role}`);
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
                return (
                    <>
                        <div className="form-group">
                            <label>Parent Name</label>
                            <input type="text" required placeholder="Enter parent's full name" />
                        </div>
                        <div className="form-group">
                            <label>Parent Email</label>
                            <input type="email" required placeholder="name@example.com" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label>Student Name</label>
                                <input type="text" required placeholder="Student's name" />
                            </div>
                            <div className="form-group">
                                <label>Student Age</label>
                                <input type="number" required placeholder="Age" min="4" max="18" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Learning Level</label>
                            <select defaultValue="Beginner">
                                <option value="Beginner">Beginner (New to Chess)</option>
                                <option value="Intermediate">Intermediate (Rated 1000-1400)</option>
                                <option value="Advanced">Advanced (Rated 1400+)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" required placeholder="Create a secure password" />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input type="password" required placeholder="Confirm your password" />
                        </div>
                        <label className="checkbox-group">
                            <input type="checkbox" required />
                            <span>I agree to create a single family account for all siblings.</span>
                        </label>
                    </>
                );
            case 'coach':
                return (
                    <>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" required placeholder="Your full name" />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" required placeholder="name@example.com" />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="tel" required placeholder="+91 XXXXX XXXXX" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label>Chess Title</label>
                                <select defaultValue="Trainer">
                                    <option value="Trainer">Certified Trainer</option>
                                    <option value="FM">FIDE Master (FM)</option>
                                    <option value="IM">International Master (IM)</option>
                                    <option value="GM">Grandmaster (GM)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>FIDE Rating</label>
                                <input type="number" placeholder="Optional" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" required />
                        </div>
                        <label className="checkbox-group">
                            <input type="checkbox" required />
                            <span>I understand I will not see parent contact info directly.</span>
                        </label>
                    </>
                );
            case 'admin':
                return (
                    <>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" required />
                        </div>
                        <div className="form-group">
                            <label>Work Email</label>
                            <input type="email" required placeholder="name@indianchessacademy.com" />
                        </div>
                        <div className="form-group">
                            <label>Department</label>
                            <select>
                                <option>Operations</option>
                                <option>Finance</option>
                                <option>HR & Management</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" required />
                        </div>
                        <label className="checkbox-group">
                            <input type="checkbox" required />
                            <span>I acknowledge full data access responsibility.</span>
                        </label>
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

                    <button type="submit" className="submit-btn">
                        {role === 'coach' ? 'Submit Application' : 'Create Account'}
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
