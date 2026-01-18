import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Lock, FileText, MessageSquare, Upload } from 'lucide-react';

const CoachPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Coach Dashboard</h1>
                    <p style={{ margin: '4px 0 0', color: '#666' }}>Manage your classes and students.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button onClick={() => navigate('/admin/calendar')}>View Full Calendar</Button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Today's Classes */}
                    <Card title="Today's Classes">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#F0F9FF', borderRadius: '8px', borderLeft: '4px solid #0284C7', marginBottom: '12px' }}>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-deep-blue)' }}>5:00 PM - Intermediate B2</div>
                                <div style={{ fontSize: '14px', color: '#666' }}>8 Students • Group Class</div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button size="sm" onClick={() => alert('Starting Live Class Session...')}>Start Class</Button>
                                <Button size="sm" variant="secondary" onClick={() => alert('Opening Attendance Sheet...')}>Attendance</Button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', borderLeft: '4px solid #9CA3AF' }}>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>7:00 PM - Advanced C1</div>
                                <div style={{ fontSize: '14px', color: '#666' }}>6 Students • Group Class</div>
                            </div>
                            <Button size="sm" variant="outline" disabled>Upcoming</Button>
                        </div>
                    </Card>

                    {/* My Students (Privacy Enforced) */}
                    <Card title="My Students">
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                        <th style={{ padding: '12px' }}>Name</th>
                                        <th style={{ padding: '12px' }}>Level</th>
                                        <th style={{ padding: '12px' }}>Batch</th>
                                        <th style={{ padding: '12px' }}>Parent Contact</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: 'Arjun Sharma', level: 'Intermediate', batch: 'B2', parent: 'Raman Sharma' },
                                        { name: 'Priya Patel', level: 'Beginner', batch: 'A1', parent: 'Sanjay Patel' },
                                        { name: 'Rohan Gupta', level: 'Intermediate', batch: 'B2', parent: 'Vikram Gupta' },
                                    ].map((student, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{student.name}</td>
                                            <td style={{ padding: '12px' }}>{student.level}</td>
                                            <td style={{ padding: '12px' }}>{student.batch}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#F3F4F6', borderRadius: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                                                    <Lock size={12} /> Hidden (Use Batch Chat)
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Material Upload */}
                    <Card title="Upload Learning Materials">
                        <div style={{ border: '2px dashed #ccc', borderRadius: '8px', padding: '32px', textAlign: 'center', backgroundColor: '#FAFAFA' }}>
                            <div style={{ marginBottom: '8px', color: '#888' }}><Upload size={32} /></div>
                            <p style={{ margin: '0 0 16px', fontWeight: '500' }}>Drag & drop PDF/PGN files here</p>
                            <input
                                type="file"
                                id="file-upload"
                                style={{ display: 'none' }}
                                onChange={(e) => alert(`Selected file: ${e.target.files[0]?.name}`)}
                            />
                            <Button variant="secondary" size="sm" onClick={() => document.getElementById('file-upload').click()}>Select Files</Button>
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Select Batch</label>
                            <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                                <option>Intermediate B2</option>
                                <option>Advanced C1</option>
                            </select>
                        </div>
                        <Button style={{ marginTop: '16px', width: '100%' }}>Upload to Batch</Button>
                    </Card>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Demo Schedule */}
                    <Card title="Demo Schedule">
                        <div style={{ padding: '12px', backgroundColor: '#FFF7ED', borderRadius: '8px', marginBottom: '12px' }}>
                            <div style={{ fontSize: '12px', color: '#9A3412', fontWeight: 'bold', marginBottom: '4px' }}>TOMORROW, 3:00 PM</div>
                            <div style={{ fontWeight: 'bold' }}>New Demo: Ishaan Ver...</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Beginner • 10 Years Old</div>
                            <Button size="sm" variant="outline" style={{ marginTop: '8px', width: '100%' }}>View Details</Button>
                        </div>
                    </Card>

                    {/* Quick Chats */}
                    <Card title="Batch Chats">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Button variant="ghost" style={{ justifyContent: 'flex-start', gap: '8px' }}><MessageSquare size={16} /> Intermediate B2 (3 new)</Button>
                            <Button variant="ghost" style={{ justifyContent: 'flex-start', gap: '8px' }}><MessageSquare size={16} /> Advanced C1</Button>
                            <Button variant="ghost" style={{ justifyContent: 'flex-start', gap: '8px' }}><MessageSquare size={16} /> Beginner A1</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CoachPage;
