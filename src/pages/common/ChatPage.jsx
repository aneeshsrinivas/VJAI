import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Send, Paperclip, Lock, Users, MessageSquare, Shield } from 'lucide-react';

// Unified Chat Page enforcing Communication Rules
const ChatPage = ({ userRole = 'ADMIN' }) => { // Roles: ADMIN, COACH, CUSTOMER
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');

    // Mock Chats - Filtered by Role in real app
    const chats = [
        { id: 'G-101', type: 'GROUP', name: 'Intermediate Batch A', participants: ['Coach Ramesh', 'Admin', 'Parent 1', 'Parent 2'] },
        { id: 'D-101', type: 'DIRECT', name: 'Admin Support', participants: ['Admin', 'Parent 1'] }, // Valid for Parent
        { id: 'D-102', type: 'DIRECT', name: 'Coach Ramesh', participants: ['Admin', 'Coach Ramesh'] }, // Valid for Coach
    ];

    // Filter Logic based on Role (Strict Rules)
    const visibleChats = chats.filter(chat => {
        if (userRole === 'ADMIN') return true; // Admin sees all
        if (userRole === 'CUSTOMER') {
            // Parent can only see Groups or Chat with Admin
            return chat.type === 'GROUP' || (chat.type === 'DIRECT' && chat.name === 'Admin Support');
        }
        if (userRole === 'COACH') {
            // Coach can only see Groups or Chat with Admin
            return chat.type === 'GROUP' || (chat.type === 'DIRECT' && chat.name === 'Admin Support');
        }
        return false;
    });

    const canUploadFile = selectedChat?.type === 'GROUP';

    return (
        <div style={{
            height: 'calc(100vh - 80px)', // Adjust for navbar
            padding: '24px',
            fontFamily: "'Figtree', sans-serif",
            background: 'linear-gradient(180deg, #f8f9fc 0%, #f0f2f5 100%)'
        }}>
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', height: '100%', maxWidth: '1400px', margin: '0 auto' }}>

                {/* Sidebar List */}
                <Card style={{
                    padding: '0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}>
                    <div style={{
                        padding: '20px',
                        borderBottom: '1px solid #f0f0f0',
                        background: 'white'
                    }}>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#003366' }}>Messages</h2>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>
                        {visibleChats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => setSelectedChat(chat)}
                                style={{
                                    padding: '16px 20px',
                                    borderBottom: '1px solid #f8f9fa',
                                    backgroundColor: selectedChat?.id === chat.id ? '#F0F9FF' : '#fff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    borderLeft: selectedChat?.id === chat.id ? '4px solid #FC8A24' : '4px solid transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedChat?.id !== chat.id) e.currentTarget.style.backgroundColor = '#f8f9fc';
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedChat?.id !== chat.id) e.currentTarget.style.backgroundColor = '#fff';
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: chat.type === 'GROUP' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'linear-gradient(135deg, #FC8A24, #ff9d4d)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    flexShrink: 0
                                }}>
                                    {chat.type === 'GROUP' ? <Users size={20} /> : <Shield size={20} />}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.name}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {chat.type === 'GROUP' ? 'Group Chat' : 'Direct Message'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Chat Area */}
                <Card style={{
                    padding: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    overflow: 'hidden'
                }}>
                    {selectedChat ? (
                        <>
                            <div style={{
                                padding: '16px 24px',
                                borderBottom: '1px solid #f0f0f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'white'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: selectedChat.type === 'GROUP' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'linear-gradient(135deg, #FC8A24, #ff9d4d)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        {selectedChat.type === 'GROUP' ? <Users size={20} /> : <Shield size={20} />}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#003366' }}>{selectedChat.name}</h3>
                                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {selectedChat.type !== 'GROUP' && <Lock size={12} />}
                                            {selectedChat.type === 'GROUP' ? `${selectedChat.participants.length} Participants` : 'Private Conversation'}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#94a3b8', background: '#f8f9fa', padding: '6px 12px', borderRadius: '20px' }}>
                                    {selectedChat.type === 'GROUP' ? 'Files Allowed' : 'Text Only Mode'}
                                </div>
                            </div>

                            <div style={{ flex: 1, padding: '24px', backgroundColor: '#f9fafb', overflowY: 'auto' }}>
                                {/* Mock Messages */}
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', background: 'white', padding: '4px 12px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>Today</div>
                                </div>

                                <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>System • 10:00 AM</div>
                                    <div style={{
                                        padding: '12px 20px',
                                        backgroundColor: '#eff6ff',
                                        color: '#1e3a8a',
                                        border: '1px solid #dbeafe',
                                        borderRadius: '16px',
                                        fontSize: '13px',
                                        textAlign: 'center',
                                        maxWidth: '80%'
                                    }}>
                                        <Shield size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
                                        Welcome to the secure chat. Contact details are hidden for privacy and safety.
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '20px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '12px', background: 'white' }}>
                                <Button
                                    variant="ghost"
                                    disabled={!canUploadFile}
                                    title={canUploadFile ? "Upload File" : "Files allowed only in Group Chats"}
                                    onClick={() => alert('File Upload')}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '12px',
                                        color: canUploadFile ? '#64748b' : '#cbd5e1'
                                    }}
                                >
                                    <Paperclip size={20} />
                                </Button>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px',
                                            borderRadius: '14px',
                                            border: '1px solid #e2e8f0',
                                            outline: 'none',
                                            fontSize: '14px',
                                            fontFamily: "'Figtree', sans-serif",
                                            transition: 'border-color 0.2s',
                                            background: '#f8f9fa'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#FC8A24';
                                            e.target.style.background = 'white';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                            e.target.style.background = '#f8f9fa';
                                        }}
                                    />
                                </div>
                                <Button style={{
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #FC8A24, #ff9d4d)',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(252, 138, 36, 0.3)'
                                }}>
                                    <Send size={18} />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: '#f1f5f9',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px'
                            }}>
                                <MessageSquare size={32} color="#cbd5e1" />
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#475569' }}>Your Messages</h3>
                            <p style={{ margin: 0, fontSize: '14px' }}>Select a conversation to start messaging</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ChatPage;
