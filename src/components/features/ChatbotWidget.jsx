import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { chatWithGemini } from '../../services/geminiService';
import './ChatbotWidget.css';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hi! I'm here to help answer questions about Indian Chess Academy. What would you like to know?",
            sender: 'bot',
            timestamp: new Date(),
            isError: false
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationHistory, setConversationHistory] = useState([]);
    const messagesEndRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!inputValue.trim()) return;

        // Add user message to UI
        const userMessage = {
            id: messages.length + 1,
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
            isError: false
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // Build conversation history for LLM context
        const newHistory = [
            ...conversationHistory,
            {
                role: 'user',
                content: inputValue
            }
        ];

        try {
            // Get response from Gemini
            const response = await chatWithGemini(inputValue, conversationHistory);

            if (response && response.success) {
                // Add bot response to UI
                const botMessage = {
                    id: messages.length + 2,
                    text: response.message || 'I received your message but couldn\'t generate a response.',
                    sender: 'bot',
                    timestamp: new Date(),
                    isError: false
                };
                setMessages(prev => [...prev, botMessage]);

                // Update conversation history
                setConversationHistory([
                    ...newHistory,
                    {
                        role: 'assistant',
                        content: response.message
                    }
                ]);
            } else {
                // Add error message
                const errorMessage = {
                    id: messages.length + 2,
                    text: response?.message || 'Sorry, I couldn\'t process your request. Please try again.',
                    sender: 'bot',
                    timestamp: new Date(),
                    isError: true
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                id: messages.length + 2,
                text: 'Oops! Something went wrong. Please try again later.',
                sender: 'bot',
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const resetChat = () => {
        setMessages([
            {
                id: 1,
                text: "Hi! I'm here to help answer questions about Indian Chess Academy. What would you like to know?",
                sender: 'bot',
                timestamp: new Date(),
                isError: false
            }
        ]);
        setConversationHistory([]);
        setInputValue('');
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="chatbot-fab"
                    title="Chat with us"
                    aria-label="Open chat"
                />
            )}

            {/* Chat Widget Modal */}
            {isOpen && (
                <div className="chatbot-widget">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div>
                            <h3>Chess Academy Chat</h3>
                            <p>Ask us anything!</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="chatbot-close-btn"
                            type="button"
                            aria-label="Close chat"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div className="chatbot-messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`chatbot-message ${msg.sender}`}>
                                <div className={`message-bubble ${msg.isError ? 'error' : ''}`}>
                                    {msg.text}
                                </div>
                                <span className="message-time">
                                    {msg.timestamp.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </span>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chatbot-message bot">
                                <div className="message-bubble typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reset Button */}
                    {messages.length > 1 && (
                        <button
                            onClick={resetChat}
                            className="chatbot-reset-btn"
                            type="button"
                        >
                            Start New Chat
                        </button>
                    )}

                    {/* Input Form */}
                    <form className="chatbot-input-form" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            placeholder="Ask a question..."
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            disabled={isLoading}
                            className="chatbot-input"
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputValue.trim()}
                            className="chatbot-send-btn"
                            aria-label="Send message"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatbotWidget;