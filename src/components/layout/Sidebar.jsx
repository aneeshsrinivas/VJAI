import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ role = 'admin', activePath = '/dashboard' }) => {
    const navigate = useNavigate();
    const links = role === 'admin' ? [
        { label: 'Dashboard', icon: '♛', path: '/admin' },
        { label: 'Demos', icon: '♟️', path: '/admin/demos' },
        { label: 'Students', icon: '♝', path: '/admin/students' },
        { label: 'Coaches', icon: '♞', path: '/admin/coaches' },
        { label: 'Finances', icon: '♜', path: '/admin/finances' },
    ] : [
        { label: 'Dashboard', icon: '♞', path: '/coach' },
        { label: 'My Students', icon: '♟️', path: '/coach/students' },
        { label: 'Batches', icon: '👥', path: '/coach/batches' },
        { label: 'Availability', icon: '📅', path: '/coach/schedule' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <span style={{ fontSize: '32px' }}>♔</span>
                <span>ICA Admin</span>
            </div>

            <nav className="sidebar-nav">
                {links.map((link) => (
                    <div
                        key={link.path}
                        className={`nav-item ${activePath === link.path ? 'active' : ''}`}
                        onClick={() => navigate(link.path)}
                    >
                        <span className="nav-icon">{link.icon}</span>
                        {link.label}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-compact">
                    <div className="user-avatar">
                        {role === 'admin' ? 'A' : 'C'}
                    </div>
                    <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>
                            {role === 'admin' ? 'System Admin' : 'Coach Ramesh'}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>
                            {role === 'admin' ? 'Operations' : 'Senior Coach'}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
