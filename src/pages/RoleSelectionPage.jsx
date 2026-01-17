import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const RoleSelectionPage = () => {
    const navigate = useNavigate();

    const roles = [
        {
            id: 'parent',
            title: 'Parent & Student',
            icon: '♟',
            desc: 'For enrolled families. Access schedule, chat, and progress.',
            action: 'Register as Parent',
            color: 'var(--color-olive-green)'
        },
        {
            id: 'coach',
            title: 'Coach',
            icon: '♞',
            desc: 'For instructors. Manage students, classes, and content.',
            action: 'Register as Coach',
            color: 'var(--color-olive-green)'
        },
        {
            id: 'admin',
            title: 'Admin',
            icon: '♚',
            desc: 'For operations team. Manage entire academy workflow.',
            action: 'Register as Admin',
            color: 'var(--color-deep-blue)'
        },
        {
            id: 'demo',
            title: 'Book Free Demo',
            icon: '👑',
            desc: 'New here? Schedule a free trial class with us.',
            action: 'Book Free Demo',
            color: 'var(--color-warm-orange)'
        }
    ];

    return (
        <div style={{ backgroundColor: '#FFFEF3', minHeight: '100vh', padding: '40px 20px', fontFamily: 'var(--font-primary)' }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginBottom: '24px', color: 'var(--color-deep-blue)' }}>
                ← Back
            </button>

            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '48px', color: 'var(--color-deep-blue)', marginBottom: '16px' }}>Select Your Role</h1>
                <p style={{ fontSize: '18px', color: '#68300B' }}>Choose the portal that matches your relationship with VJAI</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '32px',
                maxWidth: '1000px',
                margin: '0 auto'
            }}>
                {roles.map(role => (
                    <div key={role.id} className="hover-lift" style={{
                        backgroundColor: '#fff',
                        padding: '40px',
                        borderRadius: '12px',
                        border: '2px solid #EBD6C3',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '400px'
                    }}>
                        <div>
                            <div style={{ fontSize: '80px', color: 'var(--color-warm-orange)', marginBottom: '24px' }}>{role.icon}</div>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-deep-blue)', marginBottom: '16px' }}>{role.title}</h2>
                            <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '32px' }}>{role.desc}</p>
                        </div>
                        <Button
                            onClick={() => role.id === 'demo' ? navigate('/book-demo') : navigate(`/register?role=${role.id}`)}
                            style={{ backgroundColor: role.color, width: '100%' }}
                        >
                            {role.action}
                        </Button>
                    </div>
                ))}
            </div>

            <div style={{ maxWidth: '800px', margin: '48px auto', padding: '24px', backgroundColor: '#F9F5FF', borderLeft: '4px solid var(--color-deep-blue)', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-deep-blue)' }}>Note on Access Protocols</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                    Strict privacy is enforced. Coaches do not have access to parent contact details. Parents have a single family account.
                </p>
            </div>
        </div>
    );
};

export default RoleSelectionPage;
