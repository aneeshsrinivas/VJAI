import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ReviewRequestModal from '../components/features/ReviewRequestModal';

const ParentDashboard = () => {
    const navigate = useNavigate();
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, color: 'var(--color-deep-blue)' }}>Welcome, Sharma Family</h1>
                    <p style={{ margin: '4px 0 0', color: '#666' }}>Student: <strong>Arjun Sharma</strong> (Intermediate Level)</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="secondary" onClick={() => navigate('/parent/chat')}>
                        <span style={{ marginRight: '8px' }}>💬</span> Open Batch Chat
                    </Button>
                    <Button onClick={() => setReviewModalOpen(true)}>
                        Request 15-min Review
                    </Button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Weekly Schedule */}
                    <Card title="Weekly Class Schedule">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { day: 'Monday', time: '5:00 PM IST', status: 'UPCOMING', isToday: true },
                                { day: 'Wednesday', time: '5:00 PM IST', status: 'COMPLETED', isToday: false },
                                { day: 'Friday', time: '5:00 PM IST', status: 'PENDING', isToday: false }
                            ].map((slot, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', borderLeft: slot.isToday ? '4px solid var(--color-warm-orange)' : '4px solid transparent' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: 'var(--color-deep-blue)' }}>
                                            {slot.day} {slot.isToday && <span style={{ fontSize: '10px', backgroundColor: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>TODAY</span>}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#666' }}>{slot.time}</div>
                                    </div>
                                    {slot.isToday ? (
                                        <Button size="sm" onClick={() => window.open('https://meet.google.com/abc-defg', '_blank')}>Join Class</Button>
                                    ) : (
                                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#999' }}>{slot.status}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Progress Report */}
                    <Card title="Student Progress Report">
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ flex: 1, textAlign: 'center', padding: '16px', backgroundColor: '#F0F9FF', borderRadius: '8px' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-deep-blue)' }}>1450</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Current Rating</div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center', padding: '16px', backgroundColor: '#FFF7ED', borderRadius: '8px' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-warm-orange)' }}>24/36</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Lessons Completed</div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center', padding: '16px', backgroundColor: '#F0FDF4', borderRadius: '8px' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-olive-green)' }}>92%</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Attendance</div>
                            </div>
                        </div>

                        <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Coach Feedback (Areas of Improvement)</h4>
                        <ul style={{ paddingLeft: '20px', color: '#555', lineHeight: '1.6' }}>
                            <li><strong>Opening:</strong> Needs more work on e4 defenses.</li>
                            <li><strong>Middlegame:</strong> Good tactical vision, keep solving puzzles!</li>
                            <li style={{ color: 'var(--color-error)' }}><strong>Endgame:</strong> Weak pawn structures (Focus Area).</li>
                        </ul>
                    </Card>

                    {/* Homework */}
                    <Card title="Homework Assignments">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #eee', borderRadius: '8px' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>Endgame Pawn Structures</div>
                                <div style={{ fontSize: '12px', color: '#d32f2f' }}>Due: Jan 25, 2026</div>
                            </div>
                            <Button variant="secondary" size="sm">View & Submit</Button>
                        </div>
                    </Card>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Assigned Coach */}
                    <Card title="Assigned Coach">
                        <div style={{ textAlign: 'center', padding: '16px' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#eee', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                                ♞
                            </div>
                            <h3 style={{ margin: '0 0 4px 0' }}>Ramesh Babu</h3>
                            <div style={{ color: 'var(--color-warm-orange)', fontWeight: 'bold', fontSize: '14px' }}>International Master (IM)</div>
                            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Rating: 2450</div>

                            <div style={{ marginTop: '24px', padding: '12px', backgroundColor: '#FFF7ED', borderRadius: '8px', fontSize: '12px', color: '#9A3412', textAlign: 'left' }}>
                                <strong>⚠️ Privacy Notice:</strong><br />
                                Direct contact with coaches is not permitted. Please use the Batch Group Chat for all communication.
                            </div>
                        </div>
                    </Card>

                    {/* Batch Details */}
                    <Card title="Batch Details">
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '12px', color: '#666' }}>Batch Name</div>
                            <div style={{ fontWeight: 'bold' }}>Intermediate B2</div>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '12px', color: '#666' }}>Classmates</div>
                            <div>7 other students</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Level</div>
                            <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#E0E7FF', color: '#3730A3', fontSize: '12px', fontWeight: 'bold' }}>Intermediate</div>
                        </div>
                    </Card>

                    {/* Payment History Mock */}
                    <Card title="Recent Invoice">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>Jan 2026 Fee</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Paid on Jan 2</div>
                            </div>
                            <div style={{ fontWeight: 'bold', color: 'var(--color-deep-blue)' }}>₹4,500</div>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '12px' }}>
                            <a href="#" style={{ fontSize: '12px', color: 'var(--color-warm-orange)' }} onClick={(e) => { e.preventDefault(); navigate('/parent/payments'); }}>View History</a>
                        </div>
                    </Card>
                </div>
            </div>

            <ReviewRequestModal
                isOpen={isReviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
            />
        </div>
    );
};

export default ParentDashboard;
