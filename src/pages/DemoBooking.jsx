import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Mail, Phone, GraduationCap, MessageSquare, Award } from 'lucide-react';
import { createDemoRequest } from '../services/firestoreService';
import { emailService } from '../services/emailService';
import './DemoBooking.css';

const DemoBooking = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        parentName: '',
        email: '',
        phone: '',
        studentName: '',
        studentAge: '',
        skillLevel: 'beginner',
        preferredDate: '',
        preferredTime: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            parentName: formData.parentName,
            parentEmail: formData.email,
            parentPhone: formData.phone,
            studentName: formData.studentName,
            studentAge: formData.studentAge,
            chessExperience: formData.skillLevel,
            preferredDate: formData.preferredDate,
            preferredTime: formData.preferredTime,
            message: formData.message,
            timezone: 'IST'
        };
        try {
            const result = await createDemoRequest(payload);

            if (result.success) {
                // Send confirmation email to parent
                try {
                    await emailService.sendDemoRequestConfirmation({
                        parentEmail: formData.email,
                        parentName: formData.parentName,
                        studentName: formData.studentName,
                        preferredDate: formData.preferredDate,
                        preferredTime: formData.preferredTime,
                        demoId: result.demoId
                    });
                } catch (emailError) {
                    console.error('Email sending failed:', emailError);
                    // Non-blocking error - don't fail the submission if email fails
                }

                navigate('/demo-confirmation');
            } else {
                alert('Failed to book demo: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to book demo: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="db-page">
            {/* Back button — top left */}
            <button className="db-back-btn" onClick={() => navigate('/')}>
                <ArrowLeft size={14} style={{ marginRight: 6 }} />
                Back to Home
            </button>

            {/* Centered form card */}
            <div className="db-card">
                {/* Header */}
                <div className="db-card-header">
                    <img src="/logo.png" alt="Indian Chess Academy" className="db-logo" />
                    <h1>Book a Free Demo</h1>
                    <p>Experience personalized chess coaching — completely free, no commitment.</p>
                </div>

                <form onSubmit={handleSubmit} className="db-form">
                    <div className="db-form-row">
                        <div className="db-form-group">
                            <label htmlFor="parentName"><User size={12} /> Parent Name <span>*</span></label>
                            <input type="text" id="parentName" name="parentName" value={formData.parentName} onChange={handleChange} required placeholder="Your full name" />
                        </div>
                        <div className="db-form-group">
                            <label htmlFor="email"><Mail size={12} /> Email Address <span>*</span></label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="yourname@email.com" />
                        </div>
                    </div>

                    <div className="db-form-row">
                        <div className="db-form-group">
                            <label htmlFor="phone"><Phone size={12} /> Phone Number <span>*</span></label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" />
                        </div>
                        <div className="db-form-group">
                            <label htmlFor="studentName"><GraduationCap size={12} /> Student Name <span>*</span></label>
                            <input type="text" id="studentName" name="studentName" value={formData.studentName} onChange={handleChange} required placeholder="Student's name" />
                        </div>
                    </div>

                    <div className="db-form-row">
                        <div className="db-form-group">
                            <label htmlFor="studentAge"><User size={12} /> Student Age <span>*</span></label>
                            <input type="number" id="studentAge" name="studentAge" value={formData.studentAge} onChange={handleChange} required min="5" max="80" placeholder="Age (5+)" />
                        </div>
                        <div className="db-form-group">
                            <label htmlFor="skillLevel"><Award size={12} /> Skill Level <span>*</span></label>
                            <select id="skillLevel" name="skillLevel" value={formData.skillLevel} onChange={handleChange} required>
                                <option value="beginner">Beginner (Never played)</option>
                                <option value="novice">Novice (Knows basic rules)</option>
                                <option value="intermediate">Intermediate (Plays regularly)</option>
                                <option value="advanced">Advanced (Tournament player)</option>
                            </select>
                        </div>
                    </div>

                    <div className="db-form-row">
                        <div className="db-form-group">
                            <label htmlFor="preferredDate"><Calendar size={12} /> Preferred Date <span>*</span></label>
                            <input type="date" id="preferredDate" name="preferredDate" value={formData.preferredDate} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div className="db-form-group">
                            <label htmlFor="preferredTime"><Clock size={12} /> Preferred Time <span>*</span></label>
                            <select id="preferredTime" name="preferredTime" value={formData.preferredTime} onChange={handleChange} required>
                                <option value="">Select a time slot</option>
                                <option value="morning">Morning (9 AM – 12 PM)</option>
                                <option value="afternoon">Afternoon (12 PM – 4 PM)</option>
                                <option value="evening">Evening (4 PM – 7 PM)</option>
                            </select>
                        </div>
                    </div>

                    <div className="db-form-group db-full">
                        <label htmlFor="message"><MessageSquare size={12} /> Additional Notes</label>
                        <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows="3" placeholder="Any specific goals or questions?" />
                    </div>

                    <div className="db-actions">
                        <button type="submit" className="db-btn db-btn--gold" disabled={loading}>
                            {loading ? 'Submitting…' : 'Confirm Booking →'}
                        </button>
                        <button type="button" className="db-btn db-btn--ghost" onClick={() => navigate('/')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DemoBooking;
