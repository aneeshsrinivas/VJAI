import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Crown } from 'lucide-react';
import './Header.css';
import Button from '../ui/Button';

const Header = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <header className="header" style={{ borderBottom: '1px solid #eee' }}>
            <div className="header-logo" style={{ color: 'var(--color-deep-blue)', gap: '12px' }}>
                <Crown size={24} color="var(--color-warm-orange)" />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'bold' }}>ICA Student</span>
            </div>

            <nav className="header-nav">
                <Link to="/parent" className={`header-link ${isActive('/parent')}`}>Dashboard</Link>
                <Link to="/parent/schedule" className={`header-link ${isActive('/parent/schedule')}`}>Schedule</Link>
                <Link to="/parent/assignments" className={`header-link ${isActive('/parent/assignments')}`}>Assignments</Link>
                <Link to="/parent/payments" className={`header-link ${isActive('/parent/payments')}`}>Payments</Link>
            </nav>

            <div className="header-actions">
                <Button variant="ghost"><Bell size={20} /></Button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-deep-blue)' }}>Sharma Family</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#eee', border: '1px solid var(--color-deep-blue)' }}></div>
                </div>
            </div>
        </header>
    );
};

export default Header;
