import React, { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast, ToastContainer } from 'react-toastify';
import { User, Save, ArrowLeft, Mail, Phone, MapPin, Clock, GraduationCap } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

// ICA Colors
const COLORS = {
    orange: '#FC8A24',
    deepBlue: '#003366',
    oliveGreen: '#6B8E23',
    ivory: '#FFFEF3'
};

const ParentSettings = () => {
    const { currentUser, userData } = useAuth();
    const [loading, setLoading] = useState(false);
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

    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        outline: 'none'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '6px',
        fontWeight: '600',
        color: COLORS.deepBlue,
        fontSize: '13px'
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: COLORS.ivory }}>
            <ToastContainer position="top-right" autoClose={3000} />

            <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <Button
                        variant="ghost"
                        onClick={() => window.history.back()}
                        style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: COLORS.deepBlue }}
                    >
                        <ArrowLeft size={18} /> Back
                    </Button>
                    <h1 style={{ margin: 0, color: COLORS.deepBlue, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <User size={28} /> Account Settings
                    </h1>
                    <p style={{ color: '#666', marginTop: '8px' }}>Manage your profile and preferences</p>
                </div>

                {/* Profile Card */}
                <Card style={{ padding: '32px', marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 24px', color: COLORS.deepBlue, borderBottom: `2px solid ${COLORS.orange}`, paddingBottom: '12px' }}>
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
                            <div style={{ ...inputStyle, background: '#f5f5f5', color: '#666' }}>
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
                <Card style={{ padding: '32px', marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 24px', color: COLORS.deepBlue, borderBottom: `2px solid ${COLORS.oliveGreen}`, paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                <Card style={{ padding: '32px', marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 24px', color: COLORS.deepBlue, borderBottom: '2px solid #ddd', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
