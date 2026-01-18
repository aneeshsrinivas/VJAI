import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Send, Paperclip, Lock } from 'lucide-react';

// Unified Chat Page enforcing Communication Rules
const ChatPage = ({ userRole = 'ADMIN' }) => { // Roles: ADMIN, COACH, CUSTOMER
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');

    // Mock Chats - Filtered by Role in real app
    const chats = [
        { id: 'G-101', type: 'GROUP', name: 'Intermediate Batch A', participants: ['Coach Ramesh', 'Admin', 'Parent 1', 'Parent 2'] },
        { id: 'D-101', type: 'DIRECT', name: 'Admin Support', participants: ['Admin', 'Parent 1'] }, // Valid for Parent
        { id: 'D-102', type: 'DIRECT', name: 'Coach Ramesh', participants: ['Admin', 'Coach Ramesh'] }, // Valid for Coach
        // { id: 'D-BAD', type: 'DIRECT', name: 'Coach Ramesh', participants: ['Parent 1', 'Coach Ramesh'] } // INVALID - Should never exist
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
            return chat.type === 'GROUP' || (chat.type === 'DIRECT' && chat.name === 'Admin Support'); // Assuming Admin names themselves 'Admin' in direct chats
        }
        return false;
    });

    const canUploadFile = selectedChat?.type === 'GROUP';

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', height: 'calc(100vh - 100px)' }}>
            {/* Sidebar List */}
            <Card style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #eee', backgroundColor: '#f9fafb' }}>
                    <h3 style={{ margin: 0 }}>Messages</h3>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {visibleChats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            style={{
                                padding: '16px',
                                borderBottom: '1px solid #f0f0f0',
                                backgroundColor: selectedChat?.id === chat.id ? '#F0F9FF' : '#fff',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            <div style={{ fontWeight: '600', color: 'var(--color-deep-blue)' }}>{chat.name}</div>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                {chat.type === 'GROUP' ? 'Group Chat' : 'Direct Message'}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Chat Area */}
            <Card style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {selectedChat ? (
                    <>
                        <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>{selectedChat.name}</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {selectedChat.type !== 'GROUP' && <Lock size={12} />}
                                    {selectedChat.type === 'GROUP' ? 'Participants: ' + selectedChat.participants.length : 'Private Conversation'}
                                </p>
                            </div>
                            <div style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
                                {selectedChat.type === 'GROUP' ? 'Files Allowed' : 'No Files allowed in 1:1'}
                            </div>
                        </div>

                        <div style={{ flex: 1, padding: '24px', backgroundColor: '#fdfdfd', overflowY: 'auto' }}>
                            {/* Mock Messages */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>System • 10:00 AM</div>
                                <div style={{ padding: '12px', backgroundColor: '#eee', borderRadius: '8px', display: 'inline-block' }}>
                                    Welcome to the chat! Phone numbers and emails are hidden for privacy.
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '16px', borderTop: '1px solid #eee', display: 'flex', gap: '12px' }}>
                            <Button
                                variant="outline"
                                disabled={!canUploadFile}
                                title={canUploadFile ? "Upload File" : "Files allowed only in Group Chats"}
                                onClick={() => alert('File Upload')}
                            >
                                <Paperclip size={18} color={canUploadFile ? '#333' : '#ccc'} />
                            </Button>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'var(--font-primary)' }}
                            />
                            <Button><Send size={18} /></Button>
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                        Select a conversation to start messaging
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ChatPage;
