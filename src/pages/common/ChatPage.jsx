import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, where, updateDoc, doc, setDoc, getDoc } from 'firebase/firestore';
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
    const wsRef = useRef(null);
    const prevRoomRef = useRef(null);
    const messagesRef = useRef([]);
    const selectedChatRef = useRef(null);

    const WS_URL = import.meta.env.VITE_WS_URL || import.meta.env.REACT_APP_WS_URL || 'ws://localhost:3001';
    console.log('WebSocket URL:', WS_URL);
    const role = (propRole || authRole || 'CUSTOMER').toUpperCase();

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        messagesRef.current = messages;
        selectedChatRef.current = selectedChat;
    }, [messages]);

    // WebSocket connection
    useEffect(() => {
        if (wsRef.current) return; // already connected

        let reconnectAttempts = 0;
        const maxReconnectAttempts = 10;
        let reconnectTimeout;

        const connectWebSocket = () => {
            try {
                const ws = new WebSocket(WS_URL);
                wsRef.current = ws;

                ws.onopen = () => {
                    console.log('WebSocket connected');
                    reconnectAttempts = 0;
                };

                ws.onmessage = (ev) => {
                    try {
                        const data = JSON.parse(ev.data);
                        if (data.type === 'message') {
                            const { room, text, user, ts } = data;
                            // Only append if viewing the same room
                            if (selectedChatRef.current && selectedChatRef.current.id === room) {
                                // avoid duplicates: check existing messages
                                const exists = messagesRef.current.find(m => (m.content === text && m.senderId === user.id && Math.abs((m.createdAt?.toDate?.()?.getTime?.() || 0) - ts) < 2000));
                                if (!exists) {
                                    const m = {
                                        id: `ws-${ts}-${user.id}`,
                                        chatId: room,
                                        content: text,
                                        senderId: user.id,
                                        senderName: user.name || user.id,
                                        senderRole: user.role || 'USER',
                                        createdAt: { toDate: () => new Date(ts) }
                                    };
                                    setMessages(prev => [...prev, m]);
                                }
                            }
                        }
                    } catch (e) {
                        // ignore parse errors
                    }
                };

                ws.onclose = (ev) => {
                    console.warn('WebSocket closed', { code: ev.code, reason: ev.reason, wasClean: ev.wasClean });
                    wsRef.current = null;

                    // Attempt to reconnect with exponential backoff
                    if (reconnectAttempts < maxReconnectAttempts) {
                        reconnectAttempts += 1;
                        const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts));
                        console.log(`Reconnecting in ${delay}ms...`);
                        reconnectTimeout = setTimeout(connectWebSocket, delay);
                    }
                };

                ws.onerror = (ev) => {
                    console.error('WebSocket error event', ev);
                };
            } catch (e) {
                console.error('Error creating WebSocket:', e);
            }
        };

        connectWebSocket();

        return () => {
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            try {
                if (wsRef.current) {
                    wsRef.current.close();
                    wsRef.current = null;
                }
            } catch (e) {
                console.error('Error closing WebSocket:', e);
            }
        };
    }, [WS_URL]);

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

        // If this is a group chat, join via WebSocket
        if (wsRef.current && selectedChat.chatType === 'BATCH_GROUP') {
            const prev = prevRoomRef.current;
            if (prev && prev !== selectedChat.id) {
                try { wsRef.current.send(JSON.stringify({ type: 'leave', room: prev, user: { id: currentUser?.uid, name: currentUser?.email?.split('@')[0] } })); } catch (e) {}
            }
            try { wsRef.current.send(JSON.stringify({ type: 'join', room: selectedChat.id, user: { id: currentUser?.uid, name: currentUser?.email?.split('@')[0] } })); } catch (e) {}
            prevRoomRef.current = selectedChat.id;
        } else if (wsRef.current && prevRoomRef.current && selectedChat?.id !== prevRoomRef.current) {
            // leaving previous room when switching to a non-group chat
            try { wsRef.current.send(JSON.stringify({ type: 'leave', room: prevRoomRef.current, user: { id: currentUser?.uid } })); } catch (e) {}
            prevRoomRef.current = null;
        }

        try {
            const messagesRef = collection(db, 'messages');
            const q = query(messagesRef, where('chatId', '==', selectedChat.id));

            console.log('Setting up messages listener for chatId:', selectedChat.id);

            const unsubscribe = onSnapshot(q, (snapshot) => {
                let msgList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                msgList.sort((a, b) => {
                    const aTime = a.createdAt?.toDate?.() || new Date(0);
                    const bTime = b.createdAt?.toDate?.() || new Date(0);
                    return aTime - bTime;
                });

                console.log('Messages loaded for chat:', selectedChat.id, msgList);
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

    // keep selectedChatRef in sync
    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    // Fetch users and batches for new chat modal and coach batch list
    useEffect(() => {
        if (role === 'ADMIN') {
            getDocs(collection(db, 'users')).then(snap => {
                setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            }).catch(err => console.error('Error fetching users:', err));

            getDocs(collection(db, 'batches')).then(snap => {
                setBatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            }).catch(err => console.error('Error fetching batches:', err));
        } else if (role === 'COACH' && currentUser?.uid) {
            // Load coach's batches from subcollection
            getDocs(collection(db, 'coaches', currentUser.uid, 'batches')).then(snap => {
                const batchList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setBatches(batchList);
                console.log('Coach batches loaded:', batchList);
            }).catch(err => console.error('Error fetching coach batches:', err));
        } else if (role === 'CUSTOMER' && currentUser?.uid) {
            // Load student's assigned batches from users collection
            console.log('Fetching student from users collection for UID:', currentUser.uid);

            const studentRef = doc(db, 'users', currentUser.uid);

            getDoc(studentRef)
                .then((snap) => {
                    if (!snap.exists()) {
                        console.log('No student document found in users collection');
                        return;
                    }

                    const data = snap.data();

                    console.log('Student data: in chat', data);
                    console.log("assignedBatchName field:", data.assignedBatchName);
                    
                    let assignedBatchIds = data.assignedBatch || data.assignedBatchId || [];
                    let assignedBatchNames = data.assignedBatchName || [];
                    
                    // Convert single ID string to array
                    if (typeof assignedBatchIds === 'string') {
                        assignedBatchIds = [assignedBatchIds];
                    }
                    
                    // Convert single name string to array
                    if (typeof assignedBatchNames === 'string') {
                        assignedBatchNames = [assignedBatchNames];
                    }
                    
                    if (!Array.isArray(assignedBatchIds)) {
                        assignedBatchIds = [];
                    }
                    if (!Array.isArray(assignedBatchNames)) {
                        assignedBatchNames = [];
                    }
                    
                    console.log('Assigned batch IDs:', assignedBatchIds);
                    console.log('Assigned batch Names:', assignedBatchNames);
                    
                    if (!assignedBatchIds || assignedBatchIds.length === 0) {
                        console.log('No assigned batches found');
                        return;
                    }

                    // Combine IDs and names into batch objects
                    const batchList = assignedBatchIds.map((id, idx) => ({
                        id: id,  // This is the room ID for WebSocket
                        name: assignedBatchNames[idx] || id  // Display name
                    }));

                    setBatches(batchList);

                    console.log('Customer batches loaded:', batchList);
                })
                .catch(err => console.error('Error fetching student:', err));
        }
    }, [role, currentUser?.uid]);

    const handleSendMessage = async () => {
        console.log('handleSendMessage called');
        console.log('message:', message);
        console.log('selectedChat:', selectedChat);
        console.log('sending:', sending);
        console.log('currentUser:', currentUser);
        
        if (!message.trim()) {
            console.log('Message is empty, returning');
            return;
        }
        if (!selectedChat) {
            console.log('No selectedChat, returning');
            return;
        }
        if (sending) {
            console.log('Already sending, returning');
            return;
        }
        if (!currentUser) {
            console.log('No currentUser, returning');
            return;
        }

        setSending(true);
        const messageText = message.trim();
        setMessage('');

        try {
            console.log('Sending message for chat:', selectedChat);
            console.log('Current user UID:', currentUser.uid);
            console.log('Selected chat ID:', selectedChat.id);
            
            // Check if chat document exists using getDoc (more efficient)
            const chatDocRef = doc(db, 'chats', selectedChat.id);
            const chatSnap = await getDoc(chatDocRef);

            console.log('Chat document exists:', chatSnap.exists());

            if (!chatSnap.exists()) {
                // Chat doesn't exist, create it first
                const chatData = {
                    chatType: selectedChat.chatType || 'BATCH_GROUP',
                    name: selectedChat.name || `Batch ${selectedChat.id}`,
                    participants: selectedChat.participants || [currentUser.uid],
                    createdAt: serverTimestamp(),
                    lastMessageAt: serverTimestamp(),
                    lastMessage: messageText
                };

                // Add admin/user specific fields for direct chats
                if (selectedChat.chatType === 'ADMIN_PARENT' || selectedChat.chatType === 'ADMIN_COACH') {
                    chatData.adminId = role === 'ADMIN' ? currentUser.uid : selectedChat.participants?.find(p => p !== currentUser.uid);
                    chatData.userId = role === 'ADMIN' ? selectedChat.userId : currentUser.uid;
                }

                console.log('Creating new chat document with ID:', selectedChat.id);
                console.log('Chat data:', chatData);
                await setDoc(chatDocRef, chatData);
                console.log('Chat document created successfully');
            }

            // If this is a group chat, broadcast over WebSocket for live updates
            if (selectedChat.chatType === 'BATCH_GROUP' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                try {
                    wsRef.current.send(JSON.stringify({
                        type: 'message',
                        room: selectedChat.id,
                        text: messageText,
                        user: { id: currentUser.uid, name: currentUser.email?.split('@')[0] },
                        ts: Date.now()
                    }));
                } catch (e) {
                    // ignore ws send error
                }
            }

            // Add message to messages collection
            const messageData = {
                chatId: selectedChat.id,
                content: messageText,
                senderId: currentUser.uid,
                senderEmail: currentUser.email || 'admin@chess.com',
                senderRole: role,
                senderName: role === 'ADMIN' ? 'Admin' : currentUser.email?.split('@')[0] || 'User',
                createdAt: serverTimestamp()
            };
            
            console.log('Adding message:', messageData);
            
            const msgRef = await addDoc(collection(db, 'messages'), messageData);
            console.log('Message added successfully with ID:', msgRef.id);

            await updateDoc(chatDocRef, {
                lastMessage: messageText,
                lastMessageAt: serverTimestamp()
            });
            console.log('Chat document updated with last message');
            
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

                    {role === 'ADMIN' && users.length > 0 && (
                        <div style={{ padding: '12px', borderBottom: `1px solid ${COLORS.deepBlue}20` }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: COLORS.deepBlue, marginBottom: '8px' }}>All Users</div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {users.map(user => (
                                    <li
                                        key={user.id}
                                        onClick={() => {
                                            const chatType = user.role === 'coach' ? 'ADMIN_COACH' : 'ADMIN_PARENT';
                                            const userName = user.fullName || user.email?.split('@')[0] || 'User';
                                            // Use consistent format: userId_admin
                                            const chatId = `${user.id}_admin`;
                                            
                                            console.log('Admin selecting user:', { userId: user.id, chatId, chatType });
                                            
                                            const userChat = chats.find(c => c.id === chatId);
                                            if (userChat) {
                                                console.log('Found existing chat:', userChat);
                                                setSelectedChat(userChat);
                                            } else {
                                                console.log('Creating new chat reference');
                                                setSelectedChat({
                                                    id: chatId,
                                                    name: userName,
                                                    chatType: chatType,
                                                    userId: user.id,
                                                    participants: [currentUser?.uid, user.id]
                                                });
                                            }
                                        }}
                                        style={{
                                            padding: '8px 12px',
                                            fontSize: '12px',
                                            color: selectedChat?.userId === user.id ? COLORS.orange : COLORS.deepBlue,
                                            backgroundColor: selectedChat?.userId === user.id ? `${COLORS.deepBlue}10` : 'transparent',
                                            borderLeft: selectedChat?.userId === user.id ? `3px solid ${COLORS.orange}` : '3px solid transparent',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            marginBottom: '4px',
                                            borderRadius: '0',
                                            listStyle: 'none',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${COLORS.deepBlue}05`}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = selectedChat?.userId === user.id ? `${COLORS.deepBlue}10` : 'transparent'}
                                    >
                                        <span>{user.fullName || user.email?.split('@')[0] || 'User'}</span>
                                        <span style={{ fontSize: '10px', color: '#999', fontStyle: 'italic' }}>
                                            {user.role === 'coach' ? '🏆 Coach' : '👨‍👩‍👧 Parent'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {role === 'CUSTOMER' && (
                        <div style={{ padding: '12px', borderBottom: `1px solid ${COLORS.deepBlue}20` }}>
                            <li
                                onClick={() => {
                                    // Use consistent format: userId_admin
                                    const chatId = `${currentUser?.uid}_admin`;
                                    console.log('Customer clicking admin chat, chatId:', chatId);
                                    const adminChat = chats.find(c => c.id === chatId || c.chatType === 'ADMIN_PARENT');
                                    if (adminChat) {
                                        setSelectedChat(adminChat);
                                    } else {
                                        setSelectedChat({
                                            id: chatId,
                                            name: 'Admin Support',
                                            chatType: 'ADMIN_PARENT',
                                            userId: currentUser?.uid,
                                            participants: [currentUser?.uid]
                                        });
                                    }
                                }}
                                style={{
                                    padding: '8px 12px',
                                    fontSize: '12px',
                                    color: selectedChat?.chatType === 'ADMIN_PARENT' ? COLORS.orange : COLORS.deepBlue,
                                    backgroundColor: selectedChat?.chatType === 'ADMIN_PARENT' ? `${COLORS.deepBlue}10` : 'transparent',
                                    borderLeft: selectedChat?.chatType === 'ADMIN_PARENT' ? `3px solid ${COLORS.orange}` : '3px solid transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    marginBottom: '8px',
                                    borderRadius: '0',
                                    listStyle: 'none'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${COLORS.deepBlue}05`}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = selectedChat?.chatType === 'ADMIN_PARENT' ? `${COLORS.deepBlue}10` : 'transparent'}
                            >
                                💬 Chat with Admin
                            </li>
                        </div>
                    )}

                    {(role === 'COACH' || role === 'CUSTOMER') && batches.length > 0 && (
                        <div style={{ padding: '12px', borderBottom: `1px solid ${COLORS.deepBlue}20` }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: COLORS.deepBlue, marginBottom: '8px' }}>
                                {role === 'COACH' ? 'My Batches' : 'My Classes'}
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {batches.map(batch => (
                                    <li
                                        key={batch.id}
                                        onClick={() => {
                                            const batchChat = chats.find(c => c.id === batch.id);
                                            if (batchChat) {
                                                setSelectedChat(batchChat);
                                            } else {
                                                // Create quick batch chat reference
                                                setSelectedChat({
                                                    id: batch.id,
                                                    name: batch.name,
                                                    chatType: 'BATCH_GROUP',
                                                    participants: [currentUser?.uid]
                                                });
                                            }
                                        }}
                                        style={{
                                            padding: '8px 12px',
                                            fontSize: '12px',
                                            color: selectedChat?.id === batch.id ? COLORS.orange : COLORS.deepBlue,
                                            backgroundColor: selectedChat?.id === batch.id ? `${COLORS.deepBlue}10` : 'transparent',
                                            borderLeft: selectedChat?.id === batch.id ? `3px solid ${COLORS.orange}` : '3px solid transparent',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            marginBottom: '4px',
                                            borderRadius: '0'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${COLORS.deepBlue}05`}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = selectedChat?.id === batch.id ? `${COLORS.deepBlue}10` : 'transparent'}
                                    >
                                        {batch.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

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
                            {role === 'CUSTOMER' && batches.length > 0 ? (
                                <>
                                    <div style={{ width: '100%', maxWidth: '500px' }}>
                                        <h2 style={{ color: COLORS.deepBlue, marginBottom: '24px', textAlign: 'center' }}>My Classes</h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {batches.map(batch => (
                                                <div
                                                    key={batch.id}
                                                    onClick={() => {
                                                        const batchChat = chats.find(c => c.id === batch.id);
                                                        if (batchChat) {
                                                            setSelectedChat(batchChat);
                                                        } else {
                                                            setSelectedChat({
                                                                id: batch.id,
                                                                name: batch.name,
                                                                chatType: 'BATCH_GROUP',
                                                                participants: [currentUser?.uid]
                                                            });
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '16px',
                                                        backgroundColor: '#fff',
                                                        border: `2px solid ${COLORS.deepBlue}20`,
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.borderColor = COLORS.orange;
                                                        e.currentTarget.style.backgroundColor = `${COLORS.orange}10`;
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.borderColor = `${COLORS.deepBlue}20`;
                                                        e.currentTarget.style.backgroundColor = '#fff';
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        backgroundColor: COLORS.oliveGreen,
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        <Users size={24} color="white" />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '16px', fontWeight: '600', color: COLORS.deepBlue }}>
                                                            {batch.name}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                                                            Click to view messages
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="chat-no-selection-icon" style={{ backgroundColor: COLORS.ivory }}>
                                        <MessageSquare size={64} color={COLORS.deepBlue} />
                                    </div>
                                    <h2 style={{ color: COLORS.deepBlue }}>Select a conversation</h2>
                                    <p>Choose a chat from the sidebar to start messaging</p>
                                </>
                            )}
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
