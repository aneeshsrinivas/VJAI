import React from 'react';
import { Link2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import LichessSync from '../../components/features/LichessSync';

const ParentLichess = () => {
    const { currentUser, userData } = useAuth();
    const { isDark } = useTheme();

    const c = {
        pageBg: isDark ? '#0f1117' : 'linear-gradient(180deg, #f8f9fc 0%, #f0f2f5 100%)',
        heading: isDark ? '#f0f0f0' : '#181818',
        subtext: isDark ? 'rgba(255,255,255,0.5)' : '#666',
        cardBg: isDark ? '#141820' : 'white',
        cardBorder: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e8eaed',
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: c.pageBg,
            padding: '40px 24px',
            fontFamily: "'Figtree', sans-serif",
            transition: 'background 0.2s ease',
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <header style={{ marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '800',
                        color: c.heading,
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'color 0.2s ease',
                    }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #FC8A24 0%, #f5576c 100%)',
                            borderRadius: '12px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Link2 size={24} color="white" />
                        </span>
                        Lichess Sync
                    </h1>
                    <p style={{ color: c.subtext, fontSize: '15px', marginLeft: '56px' }}>
                        Link your Lichess account to track your chess rating progress.
                    </p>
                </header>

                <div style={{
                    background: c.cardBg,
                    border: c.cardBorder,
                    borderRadius: '16px',
                    padding: '28px',
                    boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                    <LichessSync currentUser={currentUser} userData={userData} />
                </div>
            </div>
        </div>
    );
};

export default ParentLichess;
