import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast, ToastContainer } from 'react-toastify';
import { Send, Paperclip, Lock, Plus, X, Users, MessageSquare, Shield, Search, User } from 'lucide-react';
import './ChatPage.css';

// Color scheme
const COLORS = {
    orange: '#FC8A24',
    deepBlue: '#003366',
    oliveGreen: '#6B8E23',
    ivory: '#FFFEF3'
};

const ChatPage = () => {
    const { currentUser, userRole } = useAuth();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [batches, setBatches] = useState([]);
    const [newChatType, setNewChatType] = useState('ADMIN_PARENT');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);

    const role = (userRole || 'CUSTOMER').toUpperCase();

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Real-time listener for chats
    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const chatsRef = collection(db, 'chats');
        let q;

        if (role === 'ADMIN') {
            q = query(chatsRef, orderBy('lastMessageAt', 'desc'));
        } else {
            q = query(chatsRef, where('participants', 'array-contains', currentUser.uid), orderBy('lastMessageAt', 'desc'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const filtered = chatList.filter(chat => {
                if (role === 'ADMIN') return true;
                if (role === 'CUSTOMER') {
                    return chat.chatType === 'BATCH_GROUP' || chat.chatType === 'ADMIN_PARENT';
                }
                if (role === 'COACH') {
                    return chat.chatType === 'BATCH_GROUP' || chat.chatType === 'ADMIN_COACH';
                }
                return false;
            });

            setChats(filtered);
            setLoading(false);
        }, (error) => {
            console.error('Error loading chats:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, role]);

    // Real-time listener for messages
    useEffect(() => {
        if (!selectedChat) {
            setMessages([]);
            return;
        }

        const messagesRef = collection(db, 'messages');
        const q = query(messagesRef, where('chatId', '==', selectedChat.id), orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgList);
        });

        return () => unsubscribe();
    }, [selectedChat]);

    // Fetch users and batches for new chat modal
    useEffect(() => {
        if (role === 'ADMIN') {
            getDocs(collection(db, 'users')).then(snap => {
                setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            });
            getDocs(collection(db, 'batches')).then(snap => {
                setBatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            });
        }
    }, [role]);

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedChat) return;

        try {
            await addDoc(collection(db, 'messages'), {
                chatId: selectedChat.id,
                content: message.trim(),
                senderId: currentUser.uid,
                senderEmail: currentUser.email,
                senderRole: role,
                senderName: role === 'ADMIN' ? 'Admin' : currentUser.email?.split('@')[0] || 'User',
                createdAt: serverTimestamp()
            });

            await updateDoc(doc(db, 'chats', selectedChat.id), {
                lastMessage: message.trim(),
                lastMessageAt: serverTimestamp()
            });

            setMessage('');
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleCreateChat = async () => {
        if (newChatType === 'BATCH_GROUP' && !selectedBatchId) {
            toast.error('Please select a batch');
            return;
        }
        if (newChatType !== 'BATCH_GROUP' && !selectedUserId) {
            toast.error('Please select a user');
            return;
        }

        try {
            const batch = batches.find(b => b.id === selectedBatchId);
            const user = users.find(u => u.id === selectedUserId);

            const chatData = {
                chatType: newChatType,
                participants: newChatType === 'BATCH_GROUP'
                    ? [currentUser.uid, ...(batch?.studentIds || [])]
                    : [currentUser.uid, selectedUserId],
                name: newChatType === 'BATCH_GROUP'
                    ? batch?.name || `Batch ${selectedBatchId}`
                    : user?.email || 'New Chat',
                createdAt: serverTimestamp(),
                lastMessageAt: serverTimestamp(),
                lastMessage: ''
            };

            await addDoc(collection(db, 'chats'), chatData);
            setShowNewChatModal(false);
            setSelectedUserId('');
            setSelectedBatchId('');
            toast.success('Chat created successfully!');
        } catch (error) {
            toast.error('Failed to create chat');
        }
    };

    const getChatDisplayName = (chat) => {
        if (chat.name) return chat.name;
        if (chat.chatType === 'BATCH_GROUP') return 'Batch Group';
        return chat.participants?.find(p => p !== currentUser?.uid) || 'Chat';
    };

    const getChatIcon = (chatType) => {
        switch (chatType) {
            case 'BATCH_GROUP': return <Users size={18} color={COLORS.oliveGreen} />;
            case 'ADMIN_COACH': return <User size={18} color={COLORS.deepBlue} />;
            default: return <MessageSquare size={18} color={COLORS.orange} />;
        }
    };

    const filteredChats = chats.filter(chat =>
        getChatDisplayName(chat).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (timestamp) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', height: 'calc(100vh - 100px)', padding: '24px' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Sidebar List */}
            <Card style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #1e3a8a20', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: COLORS.deepBlue }}>
                        <MessageSquare size={18} />
                        Messages
                    </h3>
                    {role === 'ADMIN' && (
                        <Button size="sm" onClick={() => setShowNewChatModal(true)} style={{ backgroundColor: COLORS.orange, border: 'none' }}>
                            <Plus size={16} />
                        </Button>
                    )}
                </div>

                {/* Search */}
                <div style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#f1f5f9',
                        padding: '8px 12px',
                        borderRadius: '8px'
                    }}>
                        <Search size={16} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>Loading chats...</div>
                    ) : filteredChats.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                            <Users size={32} style={{ color: '#ccc', marginBottom: '12px' }} />
                            <div>No conversations found.</div>
                        </div>
                    ) : (
                        filteredChats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => setSelectedChat(chat)}
                                style={{
                                    padding: '16px',
                                    borderBottom: '1px solid #f0f0f0',
                                    borderLeft: selectedChat?.id === chat.id ? `4px solid ${COLORS.orange}` : '4px solid transparent',
                                    backgroundColor: selectedChat?.id === chat.id ? '#F0F9FF' : '#fff',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ fontWeight: '600', color: COLORS.deepBlue, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {getChatIcon(chat.chatType)}
                                        {getChatDisplayName(chat)}
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{formatTime(chat.lastMessageAt)}</span>
                                </div>

                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {chat.lastMessage || <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>No messages yet</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Main Chat Area */}
            <Card style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: selectedChat.chatType === 'BATCH_GROUP' ? '#dcfce7' : '#e0f2fe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {getChatIcon(selectedChat.chatType)}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, color: COLORS.deepBlue }}>{getChatDisplayName(selectedChat)}</h3>
                                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {selectedChat.chatType === 'BATCH_GROUP' ? 'Group Chat' : 'Private Conversation'}
                                        {role === 'COACH' && (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                backgroundColor: '#fffbeb',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                color: '#b45309'
                                            }}>
                                                <Lock size={10} /> Privacy active
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {messages.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px' }}>
                                    <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isMe = msg.senderId === currentUser?.uid;
                                    return (
                                        <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textAlign: isMe ? 'right' : 'left' }}>
                                                {msg.senderName} • {formatTime(msg.createdAt)}
                                            </div>
                                            <div style={{
                                                padding: '12px 16px',
                                                backgroundColor: isMe ? COLORS.deepBlue : '#fff',
                                                color: isMe ? '#fff' : '#1e293b',
                                                borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                wordBreak: 'break-word'
                                            }}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '16px', borderTop: '1px solid #eee', backgroundColor: '#fff', display: 'flex', gap: '12px' }}>
                            <Button variant="outline" title="Attach file (Coming soon)" disabled>
                                <Paperclip size={18} />
                            </Button>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                            <Button onClick={handleSendMessage} disabled={!message.trim()} style={{ backgroundColor: COLORS.orange, border: 'none' }}>
                                <Send size={18} />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ padding: '24px', backgroundColor: '#f1f5f9', borderRadius: '50%' }}>
                            <MessageSquare size={48} color="#cbd5e1" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#475569' }}>Select a conversation</h3>
                            <p style={{ margin: 0 }}>Choose a chat from the sidebar to start messaging</p>
                        </div>
                    </div>
                )}
            </Card>

            {/* New Chat Modal (Admin Only) */}
            {showNewChatModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowNewChatModal(false)}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '400px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, color: COLORS.deepBlue }}>New Conversation</h3>
                            <button onClick={() => setShowNewChatModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155', fontSize: '14px' }}>Chat Type</label>
                            <select
                                value={newChatType}
                                onChange={(e) => setNewChatType(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                            >
                                <option value="ADMIN_PARENT">Chat with Parent</option>
                                <option value="ADMIN_COACH">Chat with Coach</option>
                                <option value="BATCH_GROUP">Batch Group Chat</option>
                            </select>
                        </div>

                        {newChatType === 'BATCH_GROUP' ? (
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155', fontSize: '14px' }}>Select Batch</label>
                                <select
                                    value={selectedBatchId}
                                    onChange={(e) => setSelectedBatchId(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                >
                                    <option value="">-- Select Batch --</option>
                                    {batches.map(batch => (
                                        <option key={batch.id} value={batch.id}>{batch.name || batch.id}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155', fontSize: '14px' }}>
                                    {newChatType === 'ADMIN_PARENT' ? 'Select Parent' : 'Select Coach'}
                                </label>
                                <select
                                    value={recipientId}
                                    onChange={(e) => setRecipientId(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                >
                                    <option value="">-- Select Recipient --</option>
                                    {/* Note: In a real app, users list should be filtered by role here if fetched all */}
                                    {users
                                        .filter(u => newChatType === 'ADMIN_PARENT' ? u.role === 'customer' : u.role === 'coach')
                                        .map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.displayName || user.email}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <Button variant="secondary" onClick={() => setShowNewChatModal(false)}>Cancel</Button>
                            <Button onClick={handleCreateChat} style={{ backgroundColor: COLORS.orange, border: 'none' }}>Create Chat</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
