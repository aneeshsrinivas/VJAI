import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
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
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f1117 0%, #161b27 100%)',
            padding: '24px',
            fontFamily: "'Figtree', sans-serif"
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '24px',
                padding: '48px',
                maxWidth: '600px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                animation: 'slideUp 0.5s ease-out'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                    <CheckCircle size={40} color="#34d399" />
                </div>

                <h1 style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    color: '#ffffff',
                    marginBottom: '16px'
                }}>
                    {content.title}
                </h1>

                <p style={{
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '40px',
                    lineHeight: '1.6'
                }}>
                    {content.msg}
                </p>

                <div style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic', marginBottom: '16px' }}>
                        {content.next} ({countdown}s)
                    </p>
                    <Button
                        onClick={() => navigate('/login')}
                        style={{
                            width: '100%',
                            maxWidth: '250px',
                            padding: '16px',
                            fontSize: '16px',
                            fontWeight: '600',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #FC8A24 0%, #f97316 100%)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        Go to Login Now
                    </Button>
                </div>

                <style>
                    {`
                        @keyframes slideUp {
                            from { opacity: 0; transform: translateY(20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}
                </style>
            </div>
        </div>
    );
};

export default RegistrationSuccessPage;
