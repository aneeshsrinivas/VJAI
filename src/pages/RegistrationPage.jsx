import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Input from '../components/ui/Input'; // Assuming Input component exists or I should use standard input
import './RegistrationPage.css';



const RegistrationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const role = searchParams.get('role') || 'parent';


    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock API call
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
            case 'customer': // Treat parent/student as CUSTOMER
                return (
                    <>
                        <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', color: '#0d47a1' }}>
                            <strong>Core Principle:</strong> A single account is used for authentication. Parent details are stored inside the Student record.
                        </div>
                        <Input label="Parent Name" required placeholder="Enter parent's full name" />
                        <Input label="Parent Email (Login ID)" type="email" required placeholder="name@example.com" />
                        <Input label="Student Name" required placeholder="Student's name" />
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <Input label="Student Age" type="number" required placeholder="Age" min="4" max="18" />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Learning Level</label>
                                <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}>
                                    <option>Beginner (New to Chess)</option>
                                    <option>Intermediate (Rated 1000-1400)</option>
                                    <option>Advanced (Rated 1400+)</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Student Type (Mandatory)</label>
                                <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}>
                                    <option>Group Class</option>
                                    <option>1-on-1 Tutoring</option>
                                </select>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Timezone</label>
                                <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}>
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
                                <Input label="Country" placeholder="e.g. India" required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Input label="Chess.com Username (Optional)" placeholder="e.g. magnus_c" />
                            </div>
                        </div>
                        <Input label="Password" type="password" required placeholder="Create a secure password" />
                        <Input label="Confirm Password" type="password" required placeholder="Confirm your password" />
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
                        <Input label="Full Name" required placeholder="Your full name" />
                        <Input label="Email" type="email" required placeholder="name@example.com" />
                        <Input label="Phone Number (Private)" required placeholder="+91 XXXXX XXXXX" />
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Title</label>
                                <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}>
                                    <option>Trainer</option>
                                    <option>FIDE Master (FM)</option>
                                    <option>International Master (IM)</option>
                                    <option>Grandmaster (GM)</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <Input label="FIDE Rating" type="number" placeholder="Optional" />
                            </div>
                        </div>
                        <Input label="Experience (Years)" type="number" required />
                        <Input label="Password" type="password" required />
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
                        <Input label="Full Name" required />
                        <Input label="Work Email" type="email" required placeholder="name@indianchessacademy.com" />
                        <Input label="Employee ID" required />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Department</label>
                            <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}>
                                <option>Operations</option>
                                <option>Finance</option>
                                <option>HR & Management</option>
                            </select>
                        </div>
                        <Input label="Password" type="password" required />
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

                    <button type="submit" className="submit-btn" style={{ marginTop: '24px' }}>
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
