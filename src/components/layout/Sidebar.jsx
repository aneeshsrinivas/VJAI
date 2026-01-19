import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import {
    LayoutDashboard, Users, GraduationCap, Wallet, Radio, MessageSquare,
    CreditCard, Calendar, BookOpen, Layers, Shield, BarChart3, FileText, LogOut
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ role = 'admin', activePath = '/dashboard' }) => {
    const navigate = useNavigate();

    const links = role === 'admin' ? [
        { label: 'Command Center', icon: <LayoutDashboard size={20} />, path: '/admin' },
        { label: 'Live Analytics', icon: <BarChart3 size={20} />, path: '/admin/live-analytics' },
        { label: 'Demo Pipeline', icon: <Users size={20} />, path: '/admin/demos' },
        { label: 'Students', icon: <GraduationCap size={20} />, path: '/admin/students' },
        { label: 'Coach Roster', icon: <BookOpen size={20} />, path: '/admin/coaches' },
        { label: 'Applications', icon: <FileText size={20} />, path: '/admin/applications' },
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

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <aside className="sidebar">
            {/* Logo Section */}
            <div className="sidebar-brand">
                <img src="/ica-logo.png" alt="Indian Chess Academy" className="sidebar-logo" />
                <span className="sidebar-title">ICA Admin</span>
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
                        <div className="user-name">
                            {role === 'admin' ? 'System Admin' : 'Coach'}
                        </div>
                        <div className="user-role">
                            {role === 'admin' ? 'Operations' : 'Senior Coach'}
                        </div>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="logout-btn"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
