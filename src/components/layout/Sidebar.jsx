import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, GraduationCap, Wallet, Radio, MessageSquare,
    CreditCard, Calendar, BookOpen, Layers, Shield
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ role = 'admin', activePath = '/dashboard' }) => {
    const navigate = useNavigate();
    const links = role === 'admin' ? [
        { label: 'Command Center', icon: <LayoutDashboard size={20} />, path: '/admin' },
        { label: 'Demo Pipeline', icon: <Users size={20} />, path: '/admin/demos' },
        { label: 'Students', icon: <GraduationCap size={20} />, path: '/admin/students' },
        { label: 'Coach Roster', icon: <BookOpen size={20} />, path: '/admin/coaches' },
        { label: 'Finances', icon: <Wallet size={20} />, path: '/admin/finances' },
        { label: 'Broadcast', icon: <Radio size={20} />, path: '/admin/broadcast' },
        { label: 'Messages', icon: <MessageSquare size={20} />, path: '/chat' },
        { label: 'Subscriptions', icon: <CreditCard size={20} />, path: '/admin/subscriptions' },
        { label: 'Accounts', icon: <Shield size={20} />, path: '/admin/accounts' },
    ] : [
        { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/coach' },
        { label: 'My Students', icon: <Users size={20} />, path: '/coach/students' },
        { label: 'Batches', icon: <Layers size={20} />, path: '/coach/batches' },
        { label: 'Availability', icon: <Calendar size={20} />, path: '/coach/schedule' },
    ];

    return (
        <aside className="sidebar" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="sidebar-brand" style={{ color: 'var(--color-deep-blue)' }}>
                {/* Simplified Logo for Admin Panel */}
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--color-warm-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-olive-green)', borderRadius: '50%' }}></div>
                </div>
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
                    <div className="user-avatar" style={{ backgroundColor: 'var(--color-deep-blue)', color: '#fff' }}>
                        {role === 'admin' ? 'A' : 'C'}
                    </div>
                    <div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-white)' }}>
                            {role === 'admin' ? 'System Admin' : 'Coach Ramesh'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-white)', opacity: 0.8 }}>
                            {role === 'admin' ? 'Operations' : 'Senior Coach'}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
