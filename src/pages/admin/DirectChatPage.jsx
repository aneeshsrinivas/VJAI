import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, addDoc, doc, serverTimestamp, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Send, Search, ChevronDown, MessageSquare } from 'lucide-react';

const DirectChatPage = () => {
    const { currentUser } = useAuth();
    const { isDark } = useTheme();
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const messagesEndRef = useRef(null);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowUserDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch all customers
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

        const chatId = [currentUser.uid, selectedUser.id].sort().join('_');

        const q = query(collection(db, 'messages'), where('chatId', '==', chatId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgList = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => (a.createdAt?.toDate?.() || 0) - (b.createdAt?.toDate?.() || 0));
            setMessages(msgList);
        });

        return () => unsubscribe();
    }, [selectedUser, currentUser]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || !selectedUser || !currentUser) return;

        setSendingMessage(true);

        try {
            const chatId = [currentUser.uid, selectedUser.id].sort().join('_');

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

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setShowUserDropdown(false);
        setSearchQuery('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: '900px', margin: '0 auto' }}>
            {/* Header with User Dropdown */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <MessageSquare size={24} />
                    <h2 style={{ margin: 0 }}>Messages</h2>
                </div>

                {/* User Selector Dropdown */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                    <button
                        className="chat-user-selector"
                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            border: `1px solid ${isDark ? '#3d3f55' : '#ddd'}`,
                            background: isDark ? '#1a1d27' : 'white',
                            color: isDark ? '#f0f0f0' : '#333',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontFamily: 'inherit'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {selectedUser ? (
                                <>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '8px',
                                        backgroundColor: '#FC8A24', color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '13px', fontWeight: '700'
                                    }}>
                                        {selectedUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div className="chat-user-name" style={{ fontWeight: '600', color: isDark ? '#f0f0f0' : '#333' }}>{selectedUser.name}</div>
                                        <div className="chat-user-email" style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#666' }}>{selectedUser.email}</div>
                                    </div>
                                </>
                            ) : (
                                <span className="sub-text">Select a user to chat with...</span>
                            )}
                        </div>
                        <ChevronDown size={18} style={{ transform: showUserDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>

                    {/* Dropdown Panel */}
                    {showUserDropdown && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            borderRadius: '10px',
                            border: `1px solid ${isDark ? '#3d3f55' : '#ddd'}`,
                            background: isDark ? '#1a1d27' : 'white',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            zIndex: 100,
                            maxHeight: '300px',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* Search */}
                            <div style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#2d2f3e' : '#eee'}` }}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px 8px 34px',
                                            borderRadius: '6px',
                                            border: '1px solid #ddd',
                                            fontSize: '13px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>
                            {/* User List */}
                            <div data-lenis-prevent style={{ overflowY: 'auto', maxHeight: '240px' }}>
                                {loading ? (
                                    <div className="sub-text" style={{ padding: '16px', textAlign: 'center' }}>Loading...</div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="sub-text" style={{ padding: '16px', textAlign: 'center' }}>No users found</div>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className={`chat-user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                                            onClick={() => handleSelectUser(user)}
                                            style={{
                                                padding: '10px 16px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                borderBottom: '1px solid #f5f5f5',
                                                transition: 'background 0.15s'
                                            }}
                                        >
                                            <div style={{
                                                width: '28px', height: '28px', borderRadius: '6px',
                                                backgroundColor: selectedUser?.id === user.id ? '#FC8A24' : '#003366',
                                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '12px', fontWeight: '700', flexShrink: 0
                                            }}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="chat-user-name" style={{ fontWeight: '500', fontSize: '13px', color: isDark ? '#f0f0f0' : '#333' }}>{user.name}</div>
                                                <div className="chat-user-email" style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#888' }}>{user.email}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden', minHeight: 0 }}>
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="chat-header" style={{
                            padding: '14px 20px',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0
                        }}>
                            <h3 style={{ margin: 0, fontSize: '16px' }}>{selectedUser.name}</h3>
                            <span className="sub-text" style={{ fontSize: '12px' }}>{selectedUser.email}</span>
                        </div>

                        {/* Messages Area */}
                        <div
                            className="chat-messages-area"
                            data-lenis-prevent
                            style={{
                                flex: 1,
                                padding: '20px',
                                overflowY: 'auto',
                                minHeight: 0
                            }}
                        >
                            {messages.length === 0 ? (
                                <div className="sub-text" style={{ textAlign: 'center', paddingTop: '40px' }}>
                                    No messages yet. Start the conversation!
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: msg.senderId === currentUser?.uid ? 'flex-end' : 'flex-start',
                                            marginBottom: '12px'
                                        }}
                                    >
                                        <div style={{
                                            maxWidth: '70%',
                                            padding: '10px 14px',
                                            borderRadius: '12px',
                                            backgroundColor: msg.senderId === currentUser?.uid ? '#003366' : '#f0f0f0',
                                            color: msg.senderId === currentUser?.uid ? 'white' : '#333',
                                            fontSize: '14px'
                                        }}>
                                            <div>{msg.content}</div>
                                            <div style={{
                                                fontSize: '10px',
                                                opacity: 0.6,
                                                marginTop: '4px',
                                                textAlign: 'right'
                                            }}>
                                                {msg.createdAt?.toDate?.()?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit' }) || 'Now'}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="chat-input-area" style={{
                            padding: '14px 20px',
                            borderTop: '1px solid #eee',
                            display: 'flex',
                            gap: '10px',
                            flexShrink: 0
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
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '14px',
                                    fontFamily: 'inherit'
                                }}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!inputText.trim() || sendingMessage}
                                style={{
                                    backgroundColor: '#FC8A24',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '10px 16px'
                                }}
                            >
                                <Send size={16} />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="sub-text" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <MessageSquare size={32} />
                        Select a user from the dropdown to start chatting
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DirectChatPage;
