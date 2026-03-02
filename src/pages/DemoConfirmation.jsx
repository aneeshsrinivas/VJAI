import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const DemoConfirmation = () => {
    const navigate = useNavigate();

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
                    Demo Request Submitted
                </h1>

                <p style={{
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '40px',
                    lineHeight: '1.6'
                }}>
                    Thank you! Our team will contact you within 24 hours to schedule your free demo class.
                </p>

                <Button
                    onClick={() => navigate('/')}
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
                    Go Back Home
                </Button>

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

export default DemoConfirmation;
