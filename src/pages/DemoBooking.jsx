import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Send form data to backend
        console.log('Demo booking submitted:', formData);
        alert('Thank you! We will contact you shortly to confirm your free demo class.');
        navigate('/');
    };

    return (
        <div className="demo-booking-page">
            <div className="demo-background-overlay"></div>

            <button
                onClick={() => navigate('/')}
                className="demo-back-button"
            >
                ← Back to Home
            </button>

            {/* Form Section */}
            <section className="form-section-demo">
                <div className="form-container-demo">
                    <div className="form-header-demo">
                        <h1>Book Your Free Demo Class</h1>
                        <p>Experience our personalized chess coaching with a complimentary trial session</p>
                    </div>

                    <form onSubmit={handleSubmit} className="demo-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="parentName">Parent Name *</label>
                                <input
                                    type="text"
                                    id="parentName"
                                    name="parentName"
                                    value={formData.parentName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="your.email@example.com"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number *</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="studentName">Student Name *</label>
                                <input
                                    type="text"
                                    id="studentName"
                                    name="studentName"
                                    value={formData.studentName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Student's name"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="studentAge">Student Age *</label>
                                <input
                                    type="number"
                                    id="studentAge"
                                    name="studentAge"
                                    value={formData.studentAge}
                                    onChange={handleChange}
                                    required
                                    min="5"
                                    max="18"
                                    placeholder="Age (5-18)"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="skillLevel">Current Skill Level *</label>
                                <select
                                    id="skillLevel"
                                    name="skillLevel"
                                    value={formData.skillLevel}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="beginner">Beginner (Never played)</option>
                                    <option value="novice">Novice (Knows basic rules)</option>
                                    <option value="intermediate">Intermediate (Plays regularly)</option>
                                    <option value="advanced">Advanced (Tournament player)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="preferredDate">Preferred Date *</label>
                                <input
                                    type="date"
                                    id="preferredDate"
                                    name="preferredDate"
                                    value={formData.preferredDate}
                                    onChange={handleChange}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="preferredTime">Preferred Time *</label>
                                <select
                                    id="preferredTime"
                                    name="preferredTime"
                                    value={formData.preferredTime}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select a time slot</option>
                                    <option value="morning">Morning (9 AM - 12 PM)</option>
                                    <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                                    <option value="evening">Evening (4 PM - 7 PM)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="message">Additional Message (Optional)</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Any specific requirements or questions?"
                            ></textarea>
                        </div>

                        <div className="form-actions">
                            <Button type="submit" className="submit-btn-demo">
                                Book Free Demo Class
                            </Button>
                            <button type="button" onClick={() => navigate('/')} className="cancel-btn-demo">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default DemoBooking;
