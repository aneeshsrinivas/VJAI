import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const DirectChatPage = () => {
    const [selectedUser, setSelectedUser] = useState(0);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello, when is the next tournament?", sender: 'user', time: '10:30 AM' },
        { id: 2, text: "Hi! It's scheduled for next Saturday.", sender: 'me', time: '10:45 AM' },
    ]);
    const [inputText, setInputText] = useState('');

    const users = [
        { id: 0, name: 'Mrs. Sharma (Arjun)', role: 'Parent', unread: 0 },
        { id: 1, name: 'Coach Ramesh', role: 'Coach', unread: 2 },
        { id: 2, name: 'Mr. Gupta (Rohan)', role: 'Parent', unread: 0 },
    ];

    const handleSend = () => {
        if (!inputText.trim()) return;
        setMessages([...messages, { id: Date.now(), text: inputText, sender: 'me', time: 'Now' }]);
        setInputText('');
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', height: 'calc(100vh - 120px)' }}>

            {/* User List */}
            <Card title="Messages" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Input placeholder="Search users..." style={{ marginBottom: '16px' }} />
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {users.map((user, index) => (
                        <div
                            key={user.id}
                            onClick={() => setSelectedUser(index)}
                            style={{
                                padding: '12px',
                                borderBottom: '1px solid #eee',
                                cursor: 'pointer',
                                backgroundColor: selectedUser === index ? '#F0F9FF' : 'transparent',
                                borderRadius: '8px'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong style={{ color: 'var(--color-deep-blue)' }}>{user.name}</strong>
                                {user.unread > 0 && (
                                    <span style={{ backgroundColor: '#EF4444', color: 'white', borderRadius: '50%', padding: '2px 8px', fontSize: '10px' }}>
                                        {user.unread}
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{user.role}</div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Chat Window */}
            <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0' }}>
                {/* Chat Header */}
                <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0 }}>{users[selectedUser].name}</h3>
                        <span style={{ fontSize: '12px', color: '#22C55E' }}>● Online</span>
                    </div>
                    <Button variant="outline" size="sm">View Profile</Button>
                </div>

                {/* Messages Area */}
                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: '#FAFAFA' }}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            style={{
                                display: 'flex',
                                justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                                marginBottom: '16px'
                            }}
                        >
                            <div style={{
                                maxWidth: '70%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                backgroundColor: msg.sender === 'me' ? 'var(--color-deep-blue)' : 'white',
                                color: msg.sender === 'me' ? 'white' : '#333',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                border: msg.sender === 'me' ? 'none' : '1px solid #eee'
                            }}>
                                <div>{msg.text}</div>
                                <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>
                                    {msg.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div style={{ padding: '16px', borderTop: '1px solid #eee', display: 'flex', gap: '12px' }}>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                    <Button onClick={handleSend}>Send</Button>
                </div>
            </Card>
        </div>
    );
};

export default DirectChatPage;
