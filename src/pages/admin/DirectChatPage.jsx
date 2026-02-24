import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Send, Search } from 'lucide-react';

const COLORS = {
    orange: '#FC8A24',
    deepBlue: '#003366',
    oliveGreen: '#6B8E23',
    ivory: '#FFFEF3'
};

const DirectChatPage = () => {
    const { currentUser } = useAuth();
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    // Fetch all customers (CUSTOMER role users)
    useEffect(() => {
        if (!currentUser) return;

        const loadUsers = async () => {
            try {
                const q = query(collection(db, 'users'), where('role', '==', 'customer'));
                const snapshot = await getDocs(q);
                const customerList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().fullName || doc.data().studentName || doc.data().email?.split('@')[0] || 'User',
                    email: doc.data().email,
                    role: 'Parent'
                }));
                setUsers(customerList);
                if (customerList.length > 0 && !selectedUser) {
                    setSelectedUser(customerList[0]);
                }
            } catch (error) {
                console.error('Error loading users:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, [currentUser]);

    // Load messages when user is selected
    useEffect(() => {
        if (!selectedUser || !currentUser) return;

        // Create or get chat document ID
        const chatId = [currentUser.uid, selectedUser.id].sort().join('_');

        // Subscribe to messages
        const q = query(collection(db, 'messages'), where('chatId', '==', chatId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgList = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => (a.createdAt?.toDate?.() || 0) - (b.createdAt?.toDate?.() || 0));
            setMessages(msgList);
        });

        return () => unsubscribe();
    }, [selectedUser, currentUser]);

    const handleSend = async () => {
        if (!inputText.trim() || !selectedUser || !currentUser) return;

        setSendingMessage(true);

        try {
            const chatId = [currentUser.uid, selectedUser.id].sort().join('_');

            // Create chat document if it doesn't exist
            const chatDocRef = doc(db, 'chats', chatId);
            await setDoc(chatDocRef, {
                adminId: currentUser.uid,
                userId: selectedUser.id,
                participants: [currentUser.uid, selectedUser.id],
                chatType: 'ADMIN_PARENT',
                lastMessage: inputText.trim(),
                lastMessageAt: serverTimestamp(),
                createdAt: serverTimestamp()
            }, { merge: true });

            // Add message
            await addDoc(collection(db, 'messages'), {
                chatId: chatId,
                content: inputText.trim(),
                senderId: currentUser.uid,
                senderName: 'Admin',
                senderRole: 'ADMIN',
                senderEmail: currentUser.email,
                createdAt: serverTimestamp()
            });

            setInputText('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSendingMessage(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', height: 'calc(100vh - 120px)' }}>

            {/* User List */}
            <Card title="Users" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '14px'
                        }}
                    />
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>Loading users...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>No users found</div>
                    ) : (
                        filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                style={{
                                    padding: '12px',
                                    marginBottom: '8px',
                                    borderBottom: '1px solid #eee',
                                    cursor: 'pointer',
                                    backgroundColor: selectedUser?.id === user.id ? `${COLORS.orange}20` : 'transparent',
                                    borderLeft: selectedUser?.id === user.id ? `4px solid ${COLORS.orange}` : '4px solid transparent',
                                    borderRadius: '6px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    if (selectedUser?.id !== user.id) {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (selectedUser?.id !== user.id) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <strong style={{ color: COLORS.deepBlue, fontSize: '14px' }}>{user.name}</strong>
                                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{user.email}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Chat Window */}
            <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0' }}>
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div style={{
                            padding: '16px 24px',
                            borderBottom: `2px solid ${COLORS.deepBlue}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#fafafa'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, color: COLORS.deepBlue }}>{selectedUser.name}</h3>
                                <span style={{ fontSize: '12px', color: '#666' }}>{selectedUser.email}</span>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div style={{
                            flex: 1,
                            padding: '24px',
                            overflowY: 'auto',
                            backgroundColor: COLORS.ivory
                        }}>
                            {messages.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#999', paddingTop: '40px' }}>
                                    No messages yet. Start the conversation!
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: msg.senderId === currentUser?.uid ? 'flex-end' : 'flex-start',
                                            marginBottom: '16px'
                                        }}
                                    >
                                        <div style={{
                                            maxWidth: '70%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            backgroundColor: msg.senderId === currentUser?.uid ? COLORS.deepBlue : '#fff',
                                            color: msg.senderId === currentUser?.uid ? 'white' : '#333',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                            border: msg.senderId === currentUser?.uid ? 'none' : `1px solid ${COLORS.deepBlue}30`
                                        }}>
                                            <div>{msg.content}</div>
                                            <div style={{
                                                fontSize: '10px',
                                                opacity: 0.7,
                                                marginTop: '4px',
                                                textAlign: 'right'
                                            }}>
                                                {msg.createdAt?.toDate?.()?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit' }) || 'Now'}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <div style={{
                            padding: '16px 24px',
                            borderTop: `1px solid ${COLORS.deepBlue}20`,
                            display: 'flex',
                            gap: '12px'
                        }}>
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                disabled={sendingMessage}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${COLORS.deepBlue}30`,
                                    fontSize: '14px'
                                }}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!inputText.trim() || sendingMessage}
                                style={{
                                    backgroundColor: COLORS.orange,
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Send size={16} />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: '#999'
                    }}>
                        Select a user to start chatting
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DirectChatPage;
