import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

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

    const renderFields = () => {
        switch (role) {
            case 'parent':
                return (
                    <>
                        <Input label="Parent Name" required />
                        <Input label="Parent Email" type="email" required />
                        <Input label="Student Name" required />
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Input label="Student Age" type="number" style={{ flex: 1 }} required />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '500', color: '#68300B' }}>Learning Level</label>
                                <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #BDBDBD' }}>
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                            </div>
                        </div>
                        <Input label="Password" type="password" required />
                        <Input label="Confirm Password" type="password" required />
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                <input type="checkbox" required /> I agree to create a single family account.
                            </label>
                        </div>
                    </>
                );
            case 'coach':
                return (
                    <>
                        <Input label="Full Name" required />
                        <Input label="Email" type="email" required />
                        <Input label="Phone Number (Private)" required />
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '500', color: '#68300B' }}>Title</label>
                                <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #BDBDBD' }}>
                                    <option>FIDE Master (FM)</option>
                                    <option>International Master (IM)</option>
                                    <option>Grandmaster (GM)</option>
                                    <option>Trainer</option>
                                </select>
                            </div>
                            <Input label="FIDE Rating" type="number" style={{ flex: 1 }} />
                        </div>
                        <Input label="Experience (Years)" type="number" required />
                        <Input label="Password" type="password" required />
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                <input type="checkbox" required /> I understand I will not see parent contact info.
                            </label>
                        </div>
                    </>
                );
            case 'admin':
                return (
                    <>
                        <Input label="Full Name" required />
                        <Input label="Work Email" type="email" required />
                        <Input label="Employee ID" required />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '500', color: '#68300B' }}>Department</label>
                            <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #BDBDBD' }}>
                                <option>Operations</option>
                                <option>Finance</option>
                                <option>HR</option>
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

    const getRoleTitle = () => {
        if (role === 'parent') return 'Parent & Student Registration';
        if (role === 'coach') return 'Coach Application';
        if (role === 'admin') return 'Admin Account Request';
        return 'Registration';
    };

    return (
        <div className="bg-chess-pattern" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <Card style={{ maxWidth: '600px', width: '100%', padding: '48px' }} className="rangoli-border-top animate-fade-in">
                <h1 style={{ fontFamily: 'var(--font-display)', textAlign: 'center', color: 'var(--color-deep-blue)', marginBottom: '8px' }}>
                    {getRoleTitle()}
                </h1>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '32px' }}>
                    {role === 'parent' ? 'Create a unified family profile.' : role === 'coach' ? 'Join our elite teaching faculty.' : 'Secure operations access.'}
                </p>

                <form onSubmit={handleSubmit}>
                    {renderFields()}
                    <Button style={{ width: '100%', marginTop: '24px', backgroundColor: 'var(--color-warm-orange)' }}>
                        {role === 'coach' ? 'Submit Application' : 'Create Account'}
                    </Button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--color-warm-orange)', fontWeight: 'bold' }}>Login here</Link>
                </div>
            </Card>
        </div>
    );
};

export default RegistrationPage;
