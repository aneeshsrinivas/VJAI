import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const StudentDashboard = () => {
    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, color: 'var(--color-deep-blue)' }}>Hi Arjun! 👋</h1>
                    <p style={{ margin: '4px 0 0', color: '#666' }}>Ready to conquer the chessboard today?</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ padding: '8px 16px', backgroundColor: '#FFF7ED', borderRadius: '20px', color: '#C2410C', fontWeight: 'bold' }}>
                        🔥 12 Day Streak
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Progress Tracker */}
                    <Card title="Your Journey">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Current Rating</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-deep-blue)' }}>1450</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '12px', color: '#666' }}>Level</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-deep-blue)' }}>Intermediate</div>
                            </div>
                        </div>
                        <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '68%', height: '100%', backgroundColor: 'var(--color-warm-orange)' }}></div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', textAlign: 'center' }}>
                            Next Milestone: 1500 (Advanced) - Keep Pushing!
                        </div>
                    </Card>

                    {/* Upcoming Classes */}
                    <Card title="Upcoming Classes">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F0F9FF', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '24px' }}>♟️</div>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#0369A1' }}>Today, 5:00 PM</div>
                                    <div style={{ fontSize: '12px' }}>Intermediate B2 Batch</div>
                                </div>
                            </div>
                            <Button size="sm">Join Class</Button>
                        </div>
                    </Card>

                    {/* Homework */}
                    <Card title="Homework: Endgame Pawn Structures">
                        <p style={{ margin: '0 0 16px', color: '#555', fontSize: '14px' }}>
                            Complete the following tasks by Jan 25:
                        </p>
                        <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#333', marginBottom: '16px' }}>
                            <li style={{ marginBottom: '8px' }}>Solve 10 endgame puzzles on Lichess</li>
                            <li style={{ marginBottom: '8px' }}>Watch Coach's video: "King & Pawn Opposition"</li>
                            <li>Play 3 slow games (15+10)</li>
                        </ul>
                        <Button variant="outline" style={{ borderStyle: 'dashed', width: '100%' }}>
                            📤 Upload Solution (PGN or Screenshot)
                        </Button>
                    </Card>

                    {/* Learning Resources Mock */}
                    <Card title="Recommended for You">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>
                                📹 Video: Sicilian Defense Basics
                            </div>
                            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>
                                📄 PDF: Top 10 Tactical Motifs
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Coach Profile */}
                    <Card title="Your Coach">
                        <div style={{ textAlign: 'center', padding: '12px' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#E5E7EB', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                                ♞
                            </div>
                            <h3 style={{ margin: '0 0 4px 0' }}>Ramesh Babu</h3>
                            <div style={{ color: 'var(--color-warm-orange)', fontWeight: 'bold', fontSize: '12px' }}>International Master</div>
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
                                "Focus on your fundamentals and always check for checks!"
                            </p>
                        </div>
                    </Card>

                    {/* Batch Chat Link */}
                    <Card style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                        <h4 style={{ margin: '0 0 8px' }}>Batch Chat is Active</h4>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>Discuss strategies with your 7 classmates.</p>
                        <Button variant="secondary" style={{ width: '100%' }}>Open Chat</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
