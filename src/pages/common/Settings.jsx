import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { User, Mail, Phone, Lock, Bell, Globe, Shield } from 'lucide-react';

const Settings = () => {
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        push: true
    });

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #f8f9fc 0%, #f0f2f5 100%)',
            padding: '40px 24px',
            fontFamily: "'Figtree', sans-serif"
        }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <header style={{ marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '800',
                        color: '#003366',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '12px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Shield size={24} color="white" />
                        </span>
                        Settings
                    </h1>
                    <p style={{ color: '#666', fontSize: '16px', marginLeft: '54px' }}>
                        Manage your account preferences and security settings.
                    </p>
                </header>

                {/* Account Information - HIDDEN for privacy (phone/email should not be visible) */}
                {false && (
                    <Card style={{
                        marginBottom: '24px',
                        border: 'none',
                        borderRadius: '20px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        padding: '24px'
                    }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#003366', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <User size={20} /> Account Information
                        </h2>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    defaultValue="Sharma Family"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '14px',
                                        fontFamily: "'Figtree', sans-serif"
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>
                                    <Mail size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    defaultValue="sharma.family@example.com"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '14px',
                                        fontFamily: "'Figtree', sans-serif"
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>
                                    <Phone size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    defaultValue="+91 98765 43210"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '14px',
                                        fontFamily: "'Figtree', sans-serif"
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                            <Button style={{
                                background: 'linear-gradient(135deg, #FC8A24, #ff9d4d)',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(252, 138, 36, 0.3)'
                            }}>
                                Save Changes
                            </Button>
                            <Button variant="outline">Cancel</Button>
                        </div>
                    </Card>
                )}

                {/* Security */}
                <Card style={{
                    marginBottom: '24px',
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    padding: '24px'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#003366', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Lock size={20} /> Security
                    </h2>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>
                                Current Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter current password"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '14px',
                                    fontFamily: "'Figtree', sans-serif"
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>
                                New Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter new password"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '14px',
                                    fontFamily: "'Figtree', sans-serif"
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '14px',
                                    fontFamily: "'Figtree', sans-serif"
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <Button style={{
                            background: 'linear-gradient(135deg, #FC8A24, #ff9d4d)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(252, 138, 36, 0.3)'
                        }}>
                            Update Password
                        </Button>
                    </div>
                </Card>

                {/* Notifications */}
                <Card style={{
                    marginBottom: '24px',
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    padding: '24px'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#003366', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Bell size={20} /> Notification Preferences
                    </h2>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        {[
                            { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                            { key: 'sms', label: 'SMS Notifications', desc: 'Receive important alerts via SMS' },
                            { key: 'push', label: 'Push Notifications', desc: 'Receive browser push notifications' }
                        ].map(item => (
                            <div key={item.key} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                background: '#f8f9fc',
                                borderRadius: '12px'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '15px' }}>{item.label}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{item.desc}</div>
                                </div>
                                <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                                    <input
                                        type="checkbox"
                                        checked={notifications[item.key]}
                                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        cursor: 'pointer',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: notifications[item.key] ? '#FC8A24' : '#cbd5e1',
                                        transition: '0.3s',
                                        borderRadius: '24px'
                                    }}>
                                        <span style={{
                                            position: 'absolute',
                                            content: '',
                                            height: '18px',
                                            width: '18px',
                                            left: notifications[item.key] ? '26px' : '3px',
                                            bottom: '3px',
                                            backgroundColor: 'white',
                                            transition: '0.3s',
                                            borderRadius: '50%'
                                        }} />
                                    </span>
                                </label>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Language & Region */}
                <Card style={{
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    padding: '24px'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#003366', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Globe size={20} /> Language & Region
                    </h2>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>
                                Language
                            </label>
                            <select
                                defaultValue="en"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '14px',
                                    fontFamily: "'Figtree', sans-serif",
                                    background: 'white'
                                }}
                            >
                                <option value="en">English</option>
                                <option value="hi">हिन्दी (Hindi)</option>
                                <option value="ta">தமிழ் (Tamil)</option>
                                <option value="te">తెలుగు (Telugu)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>
                                Time Zone
                            </label>
                            <select
                                defaultValue="ist"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '14px',
                                    fontFamily: "'Figtree', sans-serif",
                                    background: 'white'
                                }}
                            >
                                <option value="ist">(GMT+5:30) India Standard Time</option>
                                <option value="pst">(GMT-8:00) Pacific Standard Time</option>
                                <option value="est">(GMT-5:00) Eastern Standard Time</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <Button style={{
                            background: 'linear-gradient(135deg, #FC8A24, #ff9d4d)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(252, 138, 36, 0.3)'
                        }}>
                            Save Preferences
                        </Button>
                    </div>
                </Card>
            </div>
        </div >
    );
};

export default Settings;
