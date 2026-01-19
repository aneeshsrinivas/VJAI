import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { toast, ToastContainer } from 'react-toastify';
import { Send, Lock, Plus, X, Users, MessageSquare, Search, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';

// ICA Color scheme
const COLORS = {
    orange: '#FC8A24',
    deepBlue: '#003366',
    oliveGreen: '#6B8E23',
    ivory: '#FFFEF3'
};

const ChatPage = ({ userRole: propRole }) => {
    const navigate = useNavigate();
    const { currentUser, userRole: authRole } = useAuth();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [batches, setBatches] = useState([]);
    const [newChatType, setNewChatType] = useState('ADMIN_PARENT');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);

    const role = (propRole || authRole || 'CUSTOMER').toUpperCase();

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

        try {
            if (role === 'ADMIN') {
                q = query(chatsRef);
            } else {
                q = query(chatsRef, where('participants', 'array-contains', currentUser.uid));
            }

            const unsubscribe = onSnapshot(q, (snapshot) => {
                let chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                chatList.sort((a, b) => {
                    const aTime = a.lastMessageAt?.toDate?.() || new Date(0);
                    const bTime = b.lastMessageAt?.toDate?.() || new Date(0);
                    return bTime - aTime;
                });

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
                toast.error('Error loading chats: ' + error.message);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error('Chat query error:', error);
            setLoading(false);
        }
    }, [currentUser, role]);

    // Real-time listener for messages
    useEffect(() => {
        if (!selectedChat) {
            setMessages([]);
            return;
        }

        try {
            const messagesRef = collection(db, 'messages');
            const q = query(messagesRef, where('chatId', '==', selectedChat.id));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                let msgList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                msgList.sort((a, b) => {
                    const aTime = a.createdAt?.toDate?.() || new Date(0);
                    const bTime = b.createdAt?.toDate?.() || new Date(0);
                    return aTime - bTime;
                });

                setMessages(msgList);
            }, (error) => {
                console.error('Error loading messages:', error);
                toast.error('Error loading messages');
            });

            return () => unsubscribe();
        } catch (error) {
            console.error('Messages query error:', error);
        }
    }, [selectedChat]);

    // Fetch users and batches for new chat modal
    useEffect(() => {
        if (role === 'ADMIN') {
            getDocs(collection(db, 'users')).then(snap => {
                setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            }).catch(err => console.error('Error fetching users:', err));

            getDocs(collection(db, 'batches')).then(snap => {
                setBatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            }).catch(err => console.error('Error fetching batches:', err));
        }
    }, [role]);

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedChat || sending || !currentUser) return;

        setSending(true);
        const messageText = message.trim();
        setMessage('');

        try {
            await addDoc(collection(db, 'messages'), {
                chatId: selectedChat.id,
                content: messageText,
                senderId: currentUser.uid,
                senderEmail: currentUser.email || 'admin@chess.com',
                senderRole: role,
                senderName: role === 'ADMIN' ? 'Admin' : currentUser.email?.split('@')[0] || 'User',
                createdAt: serverTimestamp()
            });

            await updateDoc(doc(db, 'chats', selectedChat.id), {
                lastMessage: messageText,
                lastMessageAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Send message error:', error);
            toast.error('Failed to send: ' + error.message);
            setMessage(messageText);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleCreateChat = async () => {
        if (!currentUser) {
            toast.error('You must be logged in to create a chat');
            return;
        }

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
                    : user?.fullName || user?.email || 'New Chat',
                createdAt: serverTimestamp(),
                lastMessageAt: serverTimestamp(),
                lastMessage: ''
            };

            const docRef = await addDoc(collection(db, 'chats'), chatData);
            setShowNewChatModal(false);
            setSelectedUserId('');
            setSelectedBatchId('');
            toast.success('Chat created!');
            setSelectedChat({ id: docRef.id, ...chatData });
        } catch (error) {
            console.error('Create chat error:', error);
            toast.error('Failed to create chat: ' + error.message);
        }
    };

    const getChatDisplayName = (chat) => {
        if (chat.name) return chat.name;
        if (chat.chatType === 'BATCH_GROUP') return 'Batch Group';
        return 'Chat';
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
        try {
            const date = timestamp.toDate();
            const now = new Date();
            const diff = now - date;

            if (diff < 60000) return 'Just now';
            if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
            if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } catch {
            return '';
        }
    };

    // Get back path based on role
    const getBackPath = () => {
        if (role === 'CUSTOMER') return '/parent';
        if (role === 'COACH') return '/coach';
        return '/admin';
    };

    return (
        <div className="chat-page" style={{ backgroundColor: COLORS.ivory }}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header with Back Button */}
            <div className="chat-header" style={{ backgroundColor: COLORS.deepBlue }}>
                <div className="chat-header-content">
                    <button
                        onClick={() => navigate(getBackPath())}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginRight: '16px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                    <MessageSquare size={24} color="white" />
                    <h1 style={{ color: 'white', margin: 0, fontSize: '20px' }}>Messages</h1>
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
                                                    {msg.senderName || 'User'}
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
                                    disabled={sending}
                                    style={{ borderColor: COLORS.deepBlue }}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!message.trim() || sending}
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
                            <h3 style={{ color: COLORS.deepBlue, margin: 0 }}>New Conversation</h3>
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
                                                <option key={user.id} value={user.id}>{user.fullName || user.email}</option>
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
