import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, GraduationCap, Wallet, Radio, MessageSquare,
    CreditCard, Calendar, BookOpen, Layers, Shield, BarChart3, FileText, LogOut, ChevronRight, Target, Package,
    Sun, Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Sidebar.css';

const Sidebar = ({ role = 'admin', activePath = '/dashboard' }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [showDropdown, setShowDropdown] = useState(false);

    const links = role === 'admin' ? [
        { label: 'Command Center', icon: <LayoutDashboard size={20} />, path: '/admin' },
        { label: 'Live Analytics', icon: <BarChart3 size={20} />, path: '/admin/live-analytics' },
        { label: 'Demo Pipeline', icon: <Users size={20} />, path: '/admin/demos' },
        { label: 'Students', icon: <GraduationCap size={20} />, path: '/admin/students' },
        { label: 'Coach Roster', icon: <BookOpen size={20} />, path: '/admin/coaches' },
        { label: 'Applications', icon: <FileText size={20} />, path: '/admin/applications' },
        { label: 'Skill Sets', icon: <Target size={20} />, path: '/admin/skillsets' },
        { label: 'Finances', icon: <Wallet size={20} />, path: '/admin/finances' },
        { label: 'Broadcast', icon: <Radio size={20} />, path: '/admin/broadcast' },
        { label: 'Messages', icon: <MessageSquare size={20} />, path: '/chat' },
        { label: 'Subscriptions', icon: <CreditCard size={20} />, path: '/admin/subscriptions' },
        { label: 'Subscription Plans', icon: <Package size={20} />, path: '/admin/subscription-plans' },
        { label: 'Accounts', icon: <Shield size={20} />, path: '/admin/accounts' },
    ] : [
        { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/coach' },
        { label: 'My Students', icon: <Users size={20} />, path: '/coach/students' },
        { label: 'Batches', icon: <Layers size={20} />, path: '/coach/batches' },
        { label: 'Schedule', icon: <Calendar size={20} />, path: '/coach/schedule' },
        { label: 'Messages', icon: <MessageSquare size={20} />, path: '/coach/chat' },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const getUserInitials = () => (role === 'admin' ? 'A' : 'C');
    const getUserDisplayName = () => (role === 'admin' ? 'System Admin' : 'Coach');

    return (
        <aside className="sidebar">
            {/* Logo Section */}
            <div className="sidebar-brand">
                <img src="/logo.png" alt="Indian Chess Academy" className="sidebar-logo" />
                <span className="sidebar-title">{role === 'admin' ? 'ICA Admin' : 'Coach Portal'}</span>
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
                    <button
                        className={`user-profile-btn ${role === 'coach' || role !== 'admin' ? 'coach-card' : ''} ${showDropdown ? 'active' : ''}`}
                        onClick={() => setShowDropdown(!showDropdown)}
                        type="button"
                    >
                        <div className={`user-avatar ${role === 'admin' ? 'admin' : 'coach'}`}>
                            {getUserInitials()}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{getUserDisplayName()}</div>
                            <div className="user-role">
                                {role === 'admin' ? '👑 System Administrator' : '🎓 Chess Coach'}
                            </div>
                        </div>
                        <ChevronRight
                            size={16}
                            className={`chevron ${showDropdown ? 'rotated' : ''}`}
                        />
                    </button>
                </div>

                {/* Theme Toggle Button */}
                <button
                    className="sidebar-theme-toggle"
                    onClick={toggleTheme}
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDark ? (
                        <>
                            <Sun size={18} />
                            <span>Light Mode</span>
                        </>
                    ) : (
                        <>
                            <Moon size={18} />
                            <span>Dark Mode</span>
                        </>
                    )}
                </button>

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
