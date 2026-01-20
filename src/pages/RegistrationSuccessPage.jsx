import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const RegistrationSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const role = searchParams.get('role') || 'parent';
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        const redirect = setTimeout(() => {
            navigate('/login');
        }, 10000);

        return () => {
            clearInterval(timer);
            clearTimeout(redirect);
        };
    }, [navigate]);

    const getContent = () => {
        switch (role) {
            case 'parent':
                return {
                    title: 'Welcome to the Family!',
                    msg: 'Your account has been created. Please check your inbox to verify your email address before scheduling your first demo.',
                    next: 'Redirecting to login...'
                };
            case 'coach':
                return {
                    title: 'Application Received',
                    msg: 'Thank you for applying. Our Grandmaster pane will review your profile. Expect a response within 24 hours.',
                    next: 'Returning to login...'
                };
            case 'admin':
                return {
                    title: 'Request Sent',
                    msg: 'Your admin access request is pending approval from the Super Admin. You will be notified via email.',
                    next: 'Returning to login...'
                };
            default:
                return { title: 'Success', msg: 'Operation complete.', next: 'Redirecting...' };
        }
    };

    const content = getContent();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px', backgroundColor: 'var(--color-ivory)' }} className="bg-chess-pattern">
            <div style={{ fontSize: '80px', color: 'var(--color-olive-green)', marginBottom: '24px', animation: 'knightMove 1s ease-out' }}>
                ✓
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '48px', color: 'var(--color-deep-blue)', marginBottom: '24px' }}>
                {content.title}
            </h1>

            <p style={{ fontSize: '18px', color: '#555', maxWidth: '600px', marginBottom: '48px', lineHeight: '1.6' }}>
                {content.msg}
            </p>

            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #EBD6C3' }}>
                <p style={{ margin: 0, color: '#888', fontStyle: 'italic' }}>
                    {content.next} ({countdown}s)
                </p>
                <Button variant="ghost" onClick={() => navigate('/login')} style={{ marginTop: '16px' }}>
                    Go to Login Now
                </Button>
            </div>
        </div>
    );
};

export default RegistrationSuccessPage;
