import React, { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast, ToastContainer } from 'react-toastify';
import { User, Save, ArrowLeft, Mail, Phone, MapPin, Clock, GraduationCap, Lock } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../../context/ThemeContext';

// ICA Colors
const COLORS = {
    orange: '#FC8A24',
    deepBlue: '#181818',
    oliveGreen: '#6B8E23',
    ivory: '#FFFEF3'
};

const ParentSettings = () => {
    const { currentUser, userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const { isDark } = useTheme();
    const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
    const [pwLoading, setPwLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        studentName: '',
        studentAge: '',
        phone: '',
        country: '',
        timezone: 'India (IST)',
        chessUsername: '',
        learningLevel: 'Beginner'
    });

    const c = {
        pageBg: isDark ? '#0f1117' : COLORS.ivory,
        heading: isDark ? '#f0f0f0' : COLORS.deepBlue,
        subtext: isDark ? 'rgba(255,255,255,0.5)' : '#666',
        cardBg: isDark ? '#141820' : 'white',
        cardBorder: isDark ? '1px solid rgba(255,255,255,0.06)' : undefined,
        labelColor: isDark ? '#c0c0c0' : COLORS.deepBlue,
        inputBg: isDark ? 'rgba(255,255,255,0.06)' : 'white',
        inputBorder: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #ddd',
        inputColor: isDark ? '#e0e0e0' : '#181818',
        inputDisabledBg: isDark ? 'rgba(255,255,255,0.03)' : '#f5f5f5',
        inputDisabledColor: isDark ? 'rgba(255,255,255,0.3)' : '#666',
        divider1: isDark ? 'rgba(255,138,36,0.5)' : COLORS.orange,
        divider2: isDark ? 'rgba(107,142,35,0.5)' : COLORS.oliveGreen,
        divider3: isDark ? 'rgba(255,255,255,0.1)' : '#ddd',
        backBtnColor: isDark ? '#e0e0e0' : COLORS.deepBlue,
    };

    useEffect(() => {
        if (userData) {
            setFormData({
                fullName: userData.fullName || '',
                studentName: userData.studentName || '',
                studentAge: userData.studentAge || '',
                phone: userData.phone || '',
                country: userData.country || '',
                timezone: userData.timezone || 'India (IST)',
                chessUsername: userData.chessUsername || '',
                learningLevel: userData.learningLevel || 'Beginner'
            });
        }
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            await updateDoc(doc(db, 'users', currentUser.uid), {
                ...formData,
                updatedAt: serverTimestamp()
            });
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!pwForm.current || !pwForm.new || !pwForm.confirm) {
            toast.error('Please fill in all password fields');
            return;
        }
        if (pwForm.new === pwForm.current) {
            toast.error('New password must be different from current password');
            return;
        }
        if (pwForm.new !== pwForm.confirm) {
            toast.error('New password and confirm password do not match');
            return;
        }
        if (pwForm.new.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        setPwLoading(true);
        try {
            const credential = EmailAuthProvider.credential(currentUser.email, pwForm.current);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, pwForm.new);
            setPwForm({ current: '', new: '', confirm: '' });
            toast.success('Password changed successfully!');
        } catch (error) {
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                toast.error('Current password is incorrect');
            } else {
                toast.error('Failed to change password: ' + error.message);
            }
        } finally {
            setPwLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        border: c.inputBorder,
        borderRadius: '8px',
        fontSize: '14px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        outline: 'none',
        backgroundColor: c.inputBg,
        color: c.inputColor,
        colorScheme: isDark ? 'dark' : 'light',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '6px',
        fontWeight: '600',
        color: c.labelColor,
        fontSize: '13px'
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: c.pageBg, transition: 'background-color 0.2s ease' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <Button
                        variant="ghost"
                        onClick={() => window.history.back()}
                        style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: c.backBtnColor }}
                    >
                        <ArrowLeft size={18} /> Back
                    </Button>
                    <h1 style={{ margin: 0, color: c.heading, display: 'flex', alignItems: 'center', gap: '12px', transition: 'color 0.2s ease' }}>
                        <User size={28} /> Account Settings
                    </h1>
                    <p style={{ color: c.subtext, marginTop: '8px', transition: 'color 0.2s ease' }}>Manage your profile and preferences</p>
                </div>

                {/* Profile Card */}
                <Card style={{ padding: '32px', marginBottom: '24px', backgroundColor: c.cardBg, border: c.cardBorder, transition: 'background-color 0.2s ease' }}>
                    <h3 style={{ margin: '0 0 24px', color: c.heading, borderBottom: `2px solid ${c.divider1}`, paddingBottom: '12px', transition: 'color 0.2s ease' }}>
                        Parent Information
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Email</label>
                            <div style={{ ...inputStyle, backgroundColor: c.inputDisabledBg, color: c.inputDisabledColor }}>
                                <Mail size={14} style={{ marginRight: '8px', display: 'inline' }} />
                                {currentUser?.email || '-'}
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="+91 XXXXX XXXXX"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Country</label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="e.g. India"
                            />
                        </div>
                    </div>
                </Card>

                {/* Student Card */}
                <Card style={{ padding: '32px', marginBottom: '24px', backgroundColor: c.cardBg, border: c.cardBorder, transition: 'background-color 0.2s ease' }}>
                    <h3 style={{ margin: '0 0 24px', color: c.heading, borderBottom: `2px solid ${c.divider2}`, paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s ease' }}>
                        <GraduationCap size={20} /> Student Details
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={labelStyle}>Student Name</label>
                            <input
                                type="text"
                                name="studentName"
                                value={formData.studentName}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="Student's name"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Student Age</label>
                            <input
                                type="number"
                                name="studentAge"
                                value={formData.studentAge}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="Age"
                                min="5"
                                max="18"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Chess.com Username</label>
                            <input
                                type="text"
                                name="chessUsername"
                                value={formData.chessUsername}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="e.g. magnus_c"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Learning Level</label>
                            <select
                                name="learningLevel"
                                value={formData.learningLevel}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Preferences Card */}
                <Card style={{ padding: '32px', marginBottom: '24px', backgroundColor: c.cardBg, border: c.cardBorder, transition: 'background-color 0.2s ease' }}>
                    <h3 style={{ margin: '0 0 24px', color: c.heading, borderBottom: `2px solid ${c.divider3}`, paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s ease' }}>
                        <Clock size={20} /> Preferences
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', maxWidth: '400px' }}>
                        <div>
                            <label style={labelStyle}>Timezone</label>
                            <select
                                name="timezone"
                                value={formData.timezone}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option>India (IST)</option>
                                <option>USA (EST)</option>
                                <option>USA (PST)</option>
                                <option>UK (GMT)</option>
                                <option>Australia (AEST)</option>
                                <option>UAE (GST)</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Security Card */}
                <Card style={{ padding: '32px', marginBottom: '24px', backgroundColor: c.cardBg, border: c.cardBorder, transition: 'background-color 0.2s ease' }}>
                    <h3 style={{ margin: '0 0 24px', color: c.heading, borderBottom: `2px solid ${c.divider1}`, paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s ease' }}>
                        <Lock size={20} /> Security
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '600px' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Current Password</label>
                            <input
                                type="password"
                                value={pwForm.current}
                                onChange={(e) => setPwForm(prev => ({ ...prev, current: e.target.value }))}
                                style={inputStyle}
                                placeholder="Enter current password"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>New Password</label>
                            <input
                                type="password"
                                value={pwForm.new}
                                onChange={(e) => setPwForm(prev => ({ ...prev, new: e.target.value }))}
                                style={inputStyle}
                                placeholder="Min 8 characters"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Confirm New Password</label>
                            <input
                                type="password"
                                value={pwForm.confirm}
                                onChange={(e) => setPwForm(prev => ({ ...prev, confirm: e.target.value }))}
                                style={inputStyle}
                                placeholder="Re-enter new password"
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                        <Button
                            onClick={handlePasswordChange}
                            disabled={pwLoading}
                            style={{
                                backgroundColor: COLORS.orange,
                                border: 'none',
                                padding: '12px 24px',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Lock size={16} /> {pwLoading ? 'Changing...' : 'Change Password'}
                        </Button>
                    </div>
                </Card>

                {/* Save Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        style={{
                            backgroundColor: COLORS.oliveGreen,
                            border: 'none',
                            padding: '14px 32px',
                            fontSize: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ParentSettings;
