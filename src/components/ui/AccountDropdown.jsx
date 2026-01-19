import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Settings, LogOut, User } from 'lucide-react';

const AccountDropdown = ({ userName = 'User', userRole = 'Customer', avatarEmoji = '👤', customIcon = null }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        // In real app, this would clear auth tokens
        console.log('Logging out...');
        navigate('/');
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* Account Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    color: 'white',
                    fontFamily: 'Figtree, sans-serif',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(252, 138, 36, 0.5)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
            >
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FC8A24 0%, #D4AF37 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                }}>
                    {customIcon ? customIcon : avatarEmoji}
                </div>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{userName}</div>
                    <div style={{ fontSize: '11px', opacity: 0.7 }}>{userRole}</div>
                </div>
                <span style={{
                    fontSize: '12px',
                    transition: 'transform 0.3s ease',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                    ▼
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    minWidth: '200px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    overflow: 'hidden',
                    zIndex: 1000,
                    animation: 'dropdownFadeIn 0.2s ease-out',
                }}>
                    {/* User Info Header */}
                    <div style={{
                        padding: '16px',
                        borderBottom: '1px solid #eee',
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #fff 100%)',
                    }}>
                        <div style={{ fontWeight: '700', color: '#003366', fontSize: '15px' }}>{userName}</div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{userRole}</div>
                    </div>

                    {/* Menu Items - Only show for Admin, not Parents or Coaches */}
                    {userRole !== 'Parent Account' && userRole !== 'Coach' && (
                        <div style={{ padding: '8px' }}>
                            <button
                                onClick={() => { setIsOpen(false); }}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: 'none',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#333',
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'Figtree, sans-serif',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                                <User size={16} /> My Profile
                            </button>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    const rolePrefix = userRole === 'Parent Account' ? 'parent' :
                                        userRole === 'Coach' ? 'coach' :
                                            userRole === 'Admin' ? 'admin' : 'parent';
                                    navigate(`/${rolePrefix}/settings`);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: 'none',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#333',
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'Figtree, sans-serif',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                                <Settings size={16} /> Settings
                            </button>
                        </div>
                    )}

                    {/* Logout */}
                    <div style={{ padding: '8px', borderTop: '1px solid #eee' }}>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'none',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#DC2626',
                                transition: 'all 0.2s ease',
                                fontFamily: 'Figtree, sans-serif',
                                fontWeight: '600',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes dropdownFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div >
    );
};

export default AccountDropdown;
