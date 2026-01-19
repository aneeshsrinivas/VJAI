import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import ParentIcon from '../components/icons/ParentIcon';
import CoachIcon from '../components/icons/CoachIcon';
import AdminIcon from '../components/icons/AdminIcon';
import DemoIcon from '../components/icons/DemoIcon';
import './RoleSelectionPage.css';

const RoleSelectionPage = () => {
    const navigate = useNavigate();

    const roles = [
        {
            id: 'parent',
            title: 'Parent & Student',
            icon: ParentIcon,
            desc: 'For families looking to enroll',
            features: [
                'Book a free demo class',
                'Personalized assessment',
                'Meet our expert coaches',
                'View subscription plans'
            ],
            action: 'Book Free Demo',
            color: '#6B8E23',
            highlight: true
        },
        {
            id: 'coach',
            title: 'Coach',
            icon: CoachIcon,
            desc: 'For instructors and mentors',
            features: [
                'Join our teaching faculty',
                'Manage student roster',
                'Upload course content',
                'Track performance'
            ],
            action: 'Apply as Coach',
            color: '#FC8A24' // Changed color to differentiate
        }
    ];

    return (
        <div className="role-selection-page">
            <div className="role-background-overlay"></div>

            <div className="role-content">
                <button
                    onClick={() => navigate('/')}
                    className="role-back-button"
                >
                    ← Back to Home
                </button>

                <div className="role-header">
                    <h1>Welcome to Indian Chess Academy</h1>
                    <p>Select your role to access the appropriate portal</p>
                </div>

                <div className="role-cards-grid">
                    {roles.map(role => {
                        const IconComponent = role.icon;
                        return (
                            <div
                                key={role.id}
                                className={`role-card ${role.highlight ? 'role-card-highlight' : ''}`}
                            >
                                <div className="role-card-icon">
                                    <IconComponent size={72} color="#D4AF37" />
                                </div>

                                <h2 className="role-card-title">{role.title}</h2>
                                <p className="role-card-desc">{role.desc}</p>

                                <ul className="role-card-features">
                                    {role.features.map((feature, index) => (
                                        <li key={index}>
                                            <span className="feature-check">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    onClick={() => role.id === 'parent' ? navigate('/demo-booking') : navigate(`/register?role=${role.id}`)}
                                    style={{
                                        backgroundColor: role.color,
                                        width: '100%',
                                        marginTop: 'auto'
                                    }}
                                >
                                    {role.action}
                                </Button>
                            </div>
                        );
                    })}
                </div>

                <div className="role-note">
                    <div className="role-note-icon">🔒</div>
                    <div className="role-note-content">
                        <h4>Privacy & Security</h4>
                        <p>
                            Strict privacy protocols are enforced. Coaches do not have access to parent contact details.
                            Each family has a single unified account for all students.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionPage;
