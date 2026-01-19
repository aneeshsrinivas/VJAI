import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast, ToastContainer } from 'react-toastify';
import { Send, Paperclip, Lock, Plus, X, Users, MessageSquare, Shield, Search, User } from 'lucide-react';
import './ChatPage.css';

// Color scheme from user
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
                <div style={{ padding: '16px', borderBottom: '1px solid #eee', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={18} />
                        Messages
                    </h3>
                    {role === 'ADMIN' && (
                        <Button size="sm" onClick={() => setShowNewChatModal(true)}>
                            <Plus size={16} />
                        </Button>
                    )}
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>Loading chats...</div>
                    ) : chats.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                            <Users size={32} style={{ color: '#ccc', marginBottom: '12px' }} />
                            <div>No conversations yet.</div>
                            {role === 'ADMIN' && (
                                <div style={{ marginTop: '12px' }}>
                                    <Button size="sm" onClick={() => setShowNewChatModal(true)}>Start New Chat</Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        chats.map(chat => (
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
                                <div style={{ fontWeight: '600', color: 'var(--color-deep-blue)' }}>{getChatDisplayName(chat)}</div>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                    {chat.chatType === 'BATCH_GROUP' ? 'Group Chat' : 'Direct Message'}
                                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {selectedChat.chatType !== 'BATCH_GROUP' && <Lock size={12} />}
                                        {selectedChat.chatType === 'BATCH_GROUP' ? `${selectedChat.participants?.length || 0} Participants` : 'Private Conversation'}
                                    </p>
                                </div>
                                {role === 'COACH' && (
                                    <div style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#FEF3C7', borderRadius: '4px', color: '#92400E' }}>
                                        Contact details hidden for privacy
                                    </div>
                                )}
=======
        <div className="chat-page" style={{ backgroundColor: COLORS.ivory }}>
                                <ToastContainer position="top-right" autoClose={3000} />

                                {/* Header */}
                                <div className="chat-header" style={{ backgroundColor: COLORS.deepBlue }}>
                                    <div className="chat-header-content">
                                        <MessageSquare size={24} color="white" />
                                        <h1 style={{ color: 'white', margin: 0 }}>Messages</h1>
                                    </div>
                                    {role === 'ADMIN' && (
                                        <Button onClick={() => setShowNewChatModal(true)} style={{ backgroundColor: COLORS.orange, border: 'none' }}>
                                            <Plus size={16} style={{ marginRight: 6 }} />
                                            New Chat
                                        </Button>
                                    )}
                                </div>

                                <div className="chat-container">
                                    {/* Sidebar - Chat List */}
                                    <div className="chat-sidebar">
                                        <div className="chat-search" style={{ borderColor: COLORS.deepBlue }}>
                                            <Search size={18} color="#666" />
                                            <input
                                                type="text"
                                                placeholder="Search conversations..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>

                                        <div className="chat-list">
                                            {loading ? (
                                                <div className="chat-empty">Loading chats...</div>
                                            ) : filteredChats.length === 0 ? (
                                                <div className="chat-empty">
                                                    <MessageSquare size={40} color="#ddd" />
                                                    <p>No conversations yet</p>
                                                    {role === 'ADMIN' && (
                                                        <Button size="sm" onClick={() => setShowNewChatModal(true)} style={{ backgroundColor: COLORS.orange, border: 'none' }}>
                                                            Start a chat
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                filteredChats.map(chat => (
                                                    <div
                                                        key={chat.id}
                                                        className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                                                        onClick={() => setSelectedChat(chat)}
                                                        style={{ borderLeftColor: selectedChat?.id === chat.id ? COLORS.orange : 'transparent' }}
                                                    >
                                                        <div className="chat-item-icon" style={{
                                                            backgroundColor: chat.chatType === 'BATCH_GROUP' ? '#E8F5E9' : '#E3F2FD'
                                                        }}>
                                                            {getChatIcon(chat.chatType)}
                                                        </div>
                                                        <div className="chat-item-content">
                                                            <div className="chat-item-header">
                                                                <span className="chat-item-name" style={{ color: COLORS.deepBlue }}>
                                                                    {getChatDisplayName(chat)}
                                                                </span>
                                                                <span className="chat-item-time">{formatTime(chat.lastMessageAt)}</span>
                                                            </div>
                                                            <div className="chat-item-preview">
                                                                {chat.lastMessage || 'No messages yet'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Main Chat Area */}
                                    <div className="chat-main">
                                        {selectedChat ? (
                                            <>
                                                {/* Chat Header */}
                                                <div className="chat-main-header" style={{ borderBottomColor: COLORS.deepBlue }}>
                                                    <div className="chat-main-info">
                                                        <div className="chat-main-icon" style={{
                                                            backgroundColor: selectedChat.chatType === 'BATCH_GROUP' ? COLORS.oliveGreen : COLORS.deepBlue
                                                        }}>
                                                            {selectedChat.chatType === 'BATCH_GROUP' ? <Users size={20} color="white" /> : <User size={20} color="white" />}
                                                        </div>
                                                        <div>
                                                            <h3 style={{ color: COLORS.deepBlue, margin: 0 }}>{getChatDisplayName(selectedChat)}</h3>
                                                            <span className="chat-type-badge" style={{
                                                                backgroundColor: selectedChat.chatType === 'BATCH_GROUP' ? '#E8F5E9' : '#FFF3E0',
                                                                color: selectedChat.chatType === 'BATCH_GROUP' ? COLORS.oliveGreen : COLORS.orange
                                                            }}>
                                                                {selectedChat.chatType === 'BATCH_GROUP' ? 'Group Chat' : 'Private Chat'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {role === 'COACH' && (
                                                        <div className="privacy-badge">
                                                            <Lock size={12} />
                                                            Contact details hidden
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Messages */}
                                                <div className="chat-messages">
                                                    {messages.length === 0 ? (
                                                        <div className="chat-messages-empty">
                                                            <MessageSquare size={48} color="#ddd" />
                                                            <p>No messages yet</p>
                                                            <span>Start the conversation!</span>
                                                        </div>
                                                    ) : (
                                                        messages.map(msg => (
                                                            <div
                                                                key={msg.id}
                                                                className={`message ${msg.senderId === currentUser?.uid ? 'sent' : 'received'}`}
                                                            >
                                                                <div className="message-header">
                                                                    <span className="message-sender" style={{
                                                                        color: msg.senderRole === 'ADMIN' ? COLORS.deepBlue :
                                                                            msg.senderRole === 'COACH' ? COLORS.oliveGreen : COLORS.orange
                                                                    }}>
                                                                        {msg.senderName}
                                                                    </span>
                                                                    <span className="message-time">{formatTime(msg.createdAt)}</span>
                                                                </div>
                                                                <div
                                                                    className="message-bubble"
                                                                    style={{
                                                                        backgroundColor: msg.senderId === currentUser?.uid ? COLORS.deepBlue : '#fff',
                                                                        color: msg.senderId === currentUser?.uid ? 'white' : '#333'
                                                                    }}
                                                                >
                                                                    {msg.content}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                    <div ref={messagesEndRef} />
                                                </div>

                                                {/* Message Input */}
                                                <div className="chat-input">
                                                    <input
                                                        type="text"
                                                        value={message}
                                                        onChange={(e) => setMessage(e.target.value)}
                                                        onKeyPress={handleKeyPress}
                                                        placeholder="Type your message..."
                                                        style={{ borderColor: COLORS.deepBlue }}
                                                    />
                                                    <Button
                                                        onClick={handleSendMessage}
                                                        disabled={!message.trim()}
                                                        style={{ backgroundColor: COLORS.orange, border: 'none' }}
                                                    >
                                                        <Send size={18} />
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="chat-no-selection">
                                                <div className="chat-no-selection-icon" style={{ backgroundColor: COLORS.ivory }}>
                                                    <MessageSquare size={64} color={COLORS.deepBlue} />
                                                </div>
                                                <h2 style={{ color: COLORS.deepBlue }}>Select a conversation</h2>
                                                <p>Choose a chat from the sidebar to start messaging</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* New Chat Modal */}
                                {showNewChatModal && (
                                    <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
                                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                                            <div className="modal-header" style={{ borderBottomColor: COLORS.deepBlue }}>
                                                <h3 style={{ color: COLORS.deepBlue }}>New Conversation</h3>
                                                <button onClick={() => setShowNewChatModal(false)} className="modal-close">
                                                    <X size={20} />
                                                </button>
                                            </div>

                                            <div className="modal-body">
                                                <div className="form-group">
                                                    <label style={{ color: COLORS.deepBlue }}>Chat Type</label>
                                                    <select
                                                        value={newChatType}
                                                        onChange={(e) => setNewChatType(e.target.value)}
                                                    >
                                                        <option value="ADMIN_PARENT">Chat with Parent</option>
                                                        <option value="ADMIN_COACH">Chat with Coach</option>
                                                        <option value="BATCH_GROUP">Batch Group Chat</option>
                                                    </select>
                                                </div>

                                                {newChatType === 'BATCH_GROUP' ? (
                                                    <div className="form-group">
                                                        <label style={{ color: COLORS.deepBlue }}>Select Batch</label>
                                                        <select
                                                            value={selectedBatchId}
                                                            onChange={(e) => setSelectedBatchId(e.target.value)}
                                                        >
                                                            <option value="">-- Select Batch --</option>
                                                            {batches.map(batch => (
                                                                <option key={batch.id} value={batch.id}>{batch.name || batch.id}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <div className="form-group">
                                                        <label style={{ color: COLORS.deepBlue }}>
                                                            Select {newChatType === 'ADMIN_PARENT' ? 'Parent' : 'Coach'}
                                                        </label>
                                                        <select
                                                            value={selectedUserId}
                                                            onChange={(e) => setSelectedUserId(e.target.value)}
                                                        >
                                                            <option value="">-- Select User --</option>
                                                            {users
                                                                .filter(u => newChatType === 'ADMIN_PARENT' ? u.role === 'customer' : u.role === 'coach')
                                                                .map(user => (
                                                                    <option key={user.id} value={user.id}>{user.email}</option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="modal-footer">
                                                <Button variant="secondary" onClick={() => setShowNewChatModal(false)}>Cancel</Button>
                                                <Button onClick={handleCreateChat} style={{ backgroundColor: COLORS.orange, border: 'none' }}>
                                                    Create Chat
                                                </Button>
                                            </div>

                                            <div style={{ flex: 1, padding: '24px', backgroundColor: '#fdfdfd', overflowY: 'auto' }}>
                                                {messages.length === 0 ? (
                                                    <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                                                        No messages yet. Start the conversation!
                                                    </div>
                                                ) : (
                                                    messages.map(msg => (
                                                        <div key={msg.id} style={{ marginBottom: '16px' }}>
                                                            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                                                                <span style={{ fontWeight: '600', color: msg.senderRole === 'ADMIN' ? '#1E3A8A' : msg.senderRole === 'COACH' ? '#10B981' : '#666' }}>
                                                                    {msg.senderName}
                                                                </span>
                                                                {' - '}
                                                                {msg.createdAt?.toDate?.().toLocaleTimeString() || ''}
                                                            </div>
                                                            <div style={{
                                                                padding: '12px',
                                                                backgroundColor: msg.senderId === currentUser?.uid ? 'var(--color-deep-blue)' : '#eee',
                                                                color: msg.senderId === currentUser?.uid ? '#fff' : '#333',
                                                                borderRadius: '8px',
                                                                display: 'inline-block',
                                                                maxWidth: '70%'
                                                            }}>
                                                                {msg.content}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            <div style={{ padding: '16px', borderTop: '1px solid #eee', display: 'flex', gap: '12px' }}>
                                                {canUploadFile && (
                                                    <Button variant="outline" title="Upload File">
                                                        <Paperclip size={18} />
                                                    </Button>
                                                )}
                                                <input
                                                    type="text"
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    onKeyPress={handleKeyPress}
                                                    placeholder="Type a message..."
                                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                                                />
                                                <Button onClick={handleSendMessage} disabled={!message.trim()}>
                                                    <Send size={18} />
                                                </Button>
                                            </div>
                                        </>
                                        ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', flexDirection: 'column', gap: '12px' }}>
                                            <MessageSquare size={48} style={{ color: '#ddd' }} />
                                            Select a conversation to start messaging
                                        </div>
<<<<<<< HEAD
                )}
            </Card >

    {/* New Chat Modal (Admin Only) */ }
{
    showNewChatModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowNewChatModal(false)}>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '400px', maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>New Conversation</h3>
                    <button onClick={() => setShowNewChatModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Chat Type</label>
                    <select
                        value={newChatType}
                        onChange={(e) => setNewChatType(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    >
                        <option value="ADMIN_PARENT">Chat with Parent</option>
                        <option value="ADMIN_COACH">Chat with Coach</option>
                        <option value="BATCH_GROUP">Batch Group Chat</option>
                    </select>
                </div>

                {newChatType === 'BATCH_GROUP' ? (
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Select Batch</label>
                        <select
                            value={selectedBatchId}
                            onChange={(e) => setSelectedBatchId(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                        >
                            <option value="">-- Select Batch --</option>
                            {batches.map(batch => (
                                <option key={batch.id} value={batch.id}>{batch.name || batch.id}</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Select {newChatType === 'ADMIN_PARENT' ? 'Parent' : 'Coach'}
                        </label>
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                        >
                            <option value="">-- Select User --</option>
                            {users
                                .filter(u => newChatType === 'ADMIN_PARENT' ? u.role === 'customer' : u.role === 'coach')
                                .map(user => (
                                    <option key={user.id} value={user.id}>{user.email}</option>
                                ))
                            }
                        </select>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" onClick={() => setShowNewChatModal(false)}>Cancel</Button>
                    <Button onClick={handleCreateChat}>Create Chat</Button>
                </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
