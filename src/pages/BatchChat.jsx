import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Header from '../components/layout/Header';
import '../pages/Dashboard.css';

const BatchChat = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'Admin', role: 'admin', text: 'Welcome to the Intermediate B2 batch! Please find the syllabus attached.', time: 'Yesterday, 10:00 AM' },
        { id: 2, sender: 'Ramesh Babu', role: 'coach', text: 'Hello everyone! Excited to start. Please solve the puzzle I shared.', time: 'Yesterday, 10:05 AM' },
        { id: 3, sender: 'Sharma Parent', role: 'parent', text: 'Thanks! Arjun is excited.', time: 'Yesterday, 10:15 AM' },
        { id: 4, sender: 'Admin', role: 'admin', text: 'Link for today\'s class: meet.google.com/abc-defg', time: 'Today, 4:55 PM' },
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSend = () => {
        if (!newMessage.trim()) return;
        setMessages([...messages, {
            id: messages.length + 1,
            sender: 'You',
            role: 'parent',
            text: newMessage,
            time: 'Just now'
        }]);
        setNewMessage('');
    };

    return (
        <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <div className="dashboard-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="dashboard-header" style={{ marginBottom: '16px' }}>
                    <h1 className="welcome-text">Batch Chat: Intermediate B2</h1>
                    <p className="sub-text">Tue/Thu/Sat • 5:00 PM</p>
                </div>

                <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                    <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#FAFAFA' }} className="bg-chess-pattern">
                        {messages.map(msg => (
                            <div key={msg.id} style={{ alignSelf: msg.role === 'parent' ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textAlign: msg.role === 'parent' ? 'right' : 'left' }}>
                                    {msg.sender} • <span style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 'bold', color: msg.role === 'admin' ? '#D32F2F' : msg.role === 'coach' ? 'var(--color-olive-green)' : 'var(--color-deep-blue)' }}>{msg.role}</span>
                                </div>
                                <div style={{
                                    padding: '12px 16px',
                                    borderRadius: msg.role === 'parent' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                    backgroundColor: msg.role === 'parent' ? 'var(--color-deep-blue)' : '#fff',
                                    color: msg.role === 'parent' ? '#fff' : '#333',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    border: msg.role !== 'parent' ? '1px solid #eee' : 'none'
                                }}>
                                    {msg.text}
                                </div>
                                <div style={{ fontSize: '10px', color: '#999', marginTop: '4px', textAlign: msg.role === 'parent' ? 'right' : 'left' }}>{msg.time}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Button variant="ghost" style={{ padding: '8px' }}>📎</Button>
                        <div style={{ flex: 1 }}>
                            <Input
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                style={{ margin: 0 }}
                            />
                        </div>
                        <Button onClick={handleSend} style={{ width: 'auto' }}>Send ➤</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default BatchChat;
