import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

import Input from '../../components/ui/Input';
import { toast, ToastContainer } from 'react-toastify';
import { Send, Paperclip, Lock, Plus, X, Users, MessageSquare } from 'lucide-react';

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


    const role = (userRole || 'CUSTOMER').toUpperCase();

    // Real-time listener for all chats visible to this user
    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const chatsRef = collection(db, 'chats');
        let q;

        // Admin sees ALL chats
        if (role === 'ADMIN') {
            q = query(chatsRef, orderBy('lastMessageAt', 'desc'));
        } else {
            // Others see only chats where they are a participant
            q = query(chatsRef, where('participants', 'array-contains', currentUser.uid), orderBy('lastMessageAt', 'desc'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Additional filtering for coaches - don't show parent details
            const filtered = chatList.filter(chat => {
                if (role === 'ADMIN') return true;
                if (role === 'CUSTOMER') {
                    // Parents can see admin chats and batch groups
                    return chat.chatType === 'BATCH_GROUP' || chat.chatType === 'ADMIN_PARENT';
                }
                if (role === 'COACH') {
                    // Coaches see batch groups and admin chats only
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

    // Real-time listener for messages in selected chat
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

    // Fetch users and batches for new chat modal (Admin only)
    useEffect(() => {
        if (role === 'ADMIN' && showNewChatModal) {
            const fetchData = async () => {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUsers(usersList);

                const batchesSnapshot = await getDocs(collection(db, 'batches'));
                const batchesList = batchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setBatches(batchesList);
            };
            fetchData();
        }
    }, [role, showNewChatModal]);

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedChat) return;

        try {
            // Add message
            await addDoc(collection(db, 'messages'), {
                chatId: selectedChat.id,
                senderId: currentUser.uid,
                senderName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
                senderRole: role,
                content: message.trim(),
                createdAt: serverTimestamp()
            });

            // Update chat's last message
            const chatRef = doc(db, 'chats', selectedChat.id);
            await updateDoc(chatRef, {
                lastMessage: message.trim().substring(0, 50),
                lastMessageAt: serverTimestamp()
            });

            setMessage('');
        } catch (error) {
            toast.error('Failed to send message');
            console.error('Error sending message:', error);
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
        if ((newChatType === 'ADMIN_PARENT' || newChatType === 'ADMIN_COACH') && !selectedUserId) {
            toast.error('Please select a user');
            return;
        }

        try {
            const batch = batches.find(b => b.id === selectedBatchId);
            const chatData = {
                chatType: newChatType,
                participants: newChatType === 'BATCH_GROUP'
                    ? [currentUser.uid]
                    : [currentUser.uid, selectedUserId],
                batchId: newChatType === 'BATCH_GROUP' ? selectedBatchId : null,
                batchName: newChatType === 'BATCH_GROUP' ? (batch?.name || selectedBatchId) : null,
                lastMessage: '',
                lastMessageAt: serverTimestamp(),
                createdAt: serverTimestamp(),
                createdBy: currentUser.uid
            };

            await addDoc(collection(db, 'chats'), chatData);
            toast.success('Chat created successfully');
            setShowNewChatModal(false);
            setSelectedUserId('');
            setSelectedBatchId('');
        } catch (error) {
            toast.error('Failed to create chat');
            console.error('Error creating chat:', error);
        }
    };

    const getChatDisplayName = (chat) => {
        if (chat.chatType === 'BATCH_GROUP') {
            return chat.batchName || 'Batch Group';
        }
        if (chat.chatType === 'ADMIN_PARENT') {
            return role === 'ADMIN' ? 'Parent Chat' : 'Admin Support';
        }
        if (chat.chatType === 'ADMIN_COACH') {
            return role === 'ADMIN' ? 'Coach Chat' : 'Admin';
        }
        return 'Chat';
    };

    const canUploadFile = selectedChat?.chatType === 'BATCH_GROUP';

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
                        {chats.map(chat => (
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
                                    </div>
                                    {chat.lastMessage && (
                                        <div style={{ fontSize: '12px', color: '#999', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {chat.lastMessage}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Chat Area */}
                <Card style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {selectedChat ? (
                        <>
                            <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>{getChatDisplayName(selectedChat)}</h3>
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
                    )}
                </Card>

                {/* New Chat Modal (Admin Only) */}
                {showNewChatModal && (
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
                )}
            </div>
        </div>
    );
};

export default ChatPage;
