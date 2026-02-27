import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Mail, Phone, GraduationCap, MessageSquare, CheckCircle2, Award, Users, Zap } from 'lucide-react';
import { createDemoRequest } from '../services/firestoreService';
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
            await createDemoRequest(payload);
            navigate('/demo-confirmation');
        } catch (error) {
            console.error(error);
            alert('Failed to book demo: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const promises = [
        { icon: CheckCircle2, text: '100% Free, No credit card' },
        { icon: Award, text: 'FIDE-rated coaches' },
        { icon: Users, text: 'Ages 5 to adult' },
        { icon: Zap, text: 'Results in 30 days' },
    ];

    return (
        <div className="db-page">
            {/* Ambient orbs */}
            <div className="db-orbs" />

            {/* ── LEFT — Branding panel ── */}
            <div className="db-left">
                {/* Back button */}
                <button className="db-back-btn" onClick={() => navigate('/')}>
                    <ArrowLeft size={14} style={{ marginRight: 6 }} />
                    Back to Home
                </button>

                <div className="db-left-content">
                    <div className="db-brand">
                        <img src="/ica-logo.png" alt="ICA" className="db-brand-logo" />
                        <span>Indian Chess Academy</span>
                    </div>

                    <h1>Book Your<br />Free Demo.</h1>
                    <p>Experience expert-led chess coaching at zero cost. One session is all it takes to see the difference.</p>

                    <div className="db-promises">
                        {promises.map(({ icon: Icon, text }) => (
                            <div key={text} className="db-promise">
                                <span className="db-promise-icon"><Icon size={16} /></span>
                                {text}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT — Glassmorphism form ── */}
            <div className="db-right">
                <div className="db-card">
                    <div className="db-card-header">
                        <p className="db-eyebrow">Step 1 of 1</p>
                        <h2>Your Details</h2>
                        <p className="db-card-sub">Fill in the form — we'll reach out to confirm your slot.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="db-form">
                        {/* Row 1 */}
                        <div className="db-form-row">
                            <div className="db-form-group">
                                <label htmlFor="parentName">
                                    <User size={13} /> Parent Name <span>*</span>
                                </label>
                                <input
                                    type="text" id="parentName" name="parentName"
                                    value={formData.parentName} onChange={handleChange}
                                    required placeholder="Your full name"
                                />
                            </div>
                            <div className="db-form-group">
                                <label htmlFor="email">
                                    <Mail size={13} /> Email Address <span>*</span>
                                </label>
                                <input
                                    type="email" id="email" name="email"
                                    value={formData.email} onChange={handleChange}
                                    required placeholder="yourname@email.com"
                                />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="db-form-row">
                            <div className="db-form-group">
                                <label htmlFor="phone">
                                    <Phone size={13} /> Phone Number <span>*</span>
                                </label>
                                <input
                                    type="tel" id="phone" name="phone"
                                    value={formData.phone} onChange={handleChange}
                                    required placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                            <div className="db-form-group">
                                <label htmlFor="studentName">
                                    <GraduationCap size={13} /> Student Name <span>*</span>
                                </label>
                                <input
                                    type="text" id="studentName" name="studentName"
                                    value={formData.studentName} onChange={handleChange}
                                    required placeholder="Student's name"
                                />
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div className="db-form-row">
                            <div className="db-form-group">
                                <label htmlFor="studentAge">
                                    <User size={13} /> Student Age <span>*</span>
                                </label>
                                <input
                                    type="number" id="studentAge" name="studentAge"
                                    value={formData.studentAge} onChange={handleChange}
                                    required min="5" max="80" placeholder="Age (5+)"
                                />
                            </div>
                            <div className="db-form-group">
                                <label htmlFor="skillLevel">
                                    <Award size={13} /> Current Skill Level <span>*</span>
                                </label>
                                <select id="skillLevel" name="skillLevel" value={formData.skillLevel} onChange={handleChange} required>
                                    <option value="beginner">Beginner (Never played)</option>
                                    <option value="novice">Novice (Knows basic rules)</option>
                                    <option value="intermediate">Intermediate (Plays regularly)</option>
                                    <option value="advanced">Advanced (Tournament player)</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 4 */}
                        <div className="db-form-row">
                            <div className="db-form-group">
                                <label htmlFor="preferredDate">
                                    <Calendar size={13} /> Preferred Date <span>*</span>
                                </label>
                                <input
                                    type="date" id="preferredDate" name="preferredDate"
                                    value={formData.preferredDate} onChange={handleChange}
                                    required min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="db-form-group">
                                <label htmlFor="preferredTime">
                                    <Clock size={13} /> Preferred Time <span>*</span>
                                </label>
                                <select id="preferredTime" name="preferredTime" value={formData.preferredTime} onChange={handleChange} required>
                                    <option value="">Select a time slot</option>
                                    <option value="morning">Morning (9 AM – 12 PM)</option>
                                    <option value="afternoon">Afternoon (12 PM – 4 PM)</option>
                                    <option value="evening">Evening (4 PM – 7 PM)</option>
                                </select>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="db-form-group db-full">
                            <label htmlFor="message">
                                <MessageSquare size={13} /> Additional Notes
                            </label>
                            <textarea
                                id="message" name="message"
                                value={formData.message} onChange={handleChange}
                                rows="3"
                                placeholder="Any specific goals, requirements, or questions?"
                            />
                        </div>

                        {/* Actions */}
                        <div className="db-actions">
                            <button type="submit" className="db-btn db-btn--gold" disabled={loading}>
                                {loading ? 'Submitting…' : 'Book Free Demo →'}
                            </button>
                            <button type="button" className="db-btn db-btn--ghost" onClick={() => navigate('/')}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DemoBooking;
