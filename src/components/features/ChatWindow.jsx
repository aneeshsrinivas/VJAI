import React, { useState, useEffect, useRef } from 'react';
import { listenToMessages, sendMessage } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import './ChatWindow.css';

const ChatWindow = ({ chatId, chatType }) => {
    const { currentUser, userRole } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!chatId) return;

        const unsubscribe = listenToMessages(chatId, (msgs) => {
            setMessages(msgs);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [chatId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        setLoading(true);

        const result = await sendMessage(
            chatId,
            currentUser.uid,
            currentUser.displayName || 'User',
            userRole?.toUpperCase() || 'CUSTOMER',
            newMessage.trim()
        );

        if (result.success) {
            setNewMessage('');
        } else {
            console.error('Failed to send message');
        }

        setLoading(false);
    };

    const getRoleColor = (role) => {
        const colors = {
            'ADMIN': '#1E3A8A',
            'COACH': '#10B981',
            'CUSTOMER': '#6B7280'
        };
        return colors[role] || '#6B7280';
    };

    const getChatTitle = () => {
        switch (chatType) {
            case 'ADMIN_PARENT': return 'Chat with Admin';
            case 'ADMIN_COACH': return 'Chat with Admin';
            case 'BATCH_GROUP': return 'Batch Group Chat';
            default: return 'Chat';
        }
    };

    if (!chatId) {
        return (
            <div className="chat-window chat-empty">
                <p>Select a chat to start messaging</p>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h3>{getChatTitle()}</h3>
            </div>

            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="no-messages">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`message ${msg.senderId === currentUser?.uid ? 'message-own' : 'message-other'}`}
                        >
                            <div className="message-header">
                                <span
                                    className="sender-name"
                                    style={{ color: getRoleColor(msg.senderRole) }}
                                >
                                    {msg.senderName}
                                </span>
                                <span className="message-time">
                                    {msg.createdAt?.toDate?.().toLocaleTimeString() || ''}
                                </span>
                            </div>
                            <div className="message-content">
                                {msg.fileUrl ? (
                                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                                        [File] {msg.fileName}
                                    </a>
                                ) : (
                                    <p>{msg.content}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !newMessage.trim()}>
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
