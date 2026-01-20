import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Header from '../components/layout/Header';
import '../pages/Dashboard.css';

const BatchChat = () => {
    const { currentUser, userRole, userData } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [batches, setBatches] = useState([]);
    const [selectedBatchName, setSelectedBatchName] = useState('');
    const [loading, setLoading] = useState(true);

    // Determine room ID based on user role
    useEffect(() => {
        if (!currentUser?.uid) return;

        const initializeBatch = async () => {
            try {
                if (userRole === 'customer') {
                    // For customers, use assignedBatchId as room
                    const roomId = userData?.assignedBatchId || userData?.assignedBatchIds?.[0];
                    setSelectedBatchId(roomId);
                    setSelectedBatchName('Batch Chat');
                } else if (userRole === 'coach') {
                    // For coaches, load their batches
                    await loadCoachBatches();
                }
            } catch (error) {
                console.error('Error initializing batch:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeBatch();
    }, [currentUser, userRole, userData]);

    const loadCoachBatches = async () => {
        if (!currentUser?.uid) return;

        try {
            const batchesRef = collection(db, 'coaches', currentUser.uid, 'batches');
            
            const batchesSnap = await getDocs(batchesRef);
            const batchList = batchesSnap.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name || 'Unnamed Batch'
            }));
            console.log("batchList: ", batchList)
            setBatches(batchList);
            console.log('Loaded batches:', batchList);
        } catch (error) {
            console.error('Error loading batches:', error);
            setBatches([]);
        }
    };

    const handleSend = () => {
        if (!newMessage.trim()) return;
        setMessages([...messages, {
            id: messages.length + 1,
            sender: 'You',
            role: 'parent',
            text: newMessage,
            time: 'Just now'
        }]);
        setNewMessage('');
    };

    return (
        <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <div className="dashboard-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* For Coaches: Show batch selection */}
                {userRole === 'coach' && (
                    <div style={{ marginBottom: '20px' }}>
                        <h2 style={{ marginBottom: '12px', color: '#333' }}>Select a Batch to Chat</h2>
                        {loading ? (
                            <p style={{ color: '#999' }}>Loading batches...</p>
                        ) : batches.length === 0 ? (
                            <p style={{ color: '#999' }}>No batches found. Create a batch in Coach Roster first.</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                                {batches.map(batch => (
                                    <Button
                                        key={batch.id}
                                        onClick={() => {
                                            setSelectedBatchId(batch.id);
                                            setSelectedBatchName(batch.name);
                                            setMessages([]); // Clear messages when switching batches
                                        }}
                                        style={{
                                            backgroundColor: selectedBatchId === batch.id ? '#003366' : '#f0f0f0',
                                            color: selectedBatchId === batch.id ? '#fff' : '#333',
                                            border: selectedBatchId === batch.id ? '2px solid #003366' : '1px solid #ddd',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {batch.name}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Chat Room */}
                {selectedBatchId ? (
                    <>
                        <div className="dashboard-header" style={{ marginBottom: '16px' }}>
                            <h1 className="welcome-text">Batch Chat: {selectedBatchName}</h1>
                            <p className="sub-text">Room ID: {selectedBatchId}</p>
                        </div>

                        <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#FAFAFA' }} className="bg-chess-pattern">
                                {messages.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#999', padding: '40px 20px' }}>
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map(msg => (
                                        <div key={msg.id} style={{ alignSelf: msg.role === 'parent' ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textAlign: msg.role === 'parent' ? 'right' : 'left' }}>
                                                {msg.sender} • <span style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 'bold', color: msg.role === 'admin' ? '#D32F2F' : msg.role === 'coach' ? 'var(--color-olive-green)' : 'var(--color-deep-blue)' }}>{msg.role}</span>
                                            </div>
                                            <div style={{
                                                padding: '12px 16px',
                                                borderRadius: msg.role === 'parent' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                                backgroundColor: msg.role === 'parent' ? 'var(--color-deep-blue)' : '#fff',
                                                color: msg.role === 'parent' ? '#fff' : '#333',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                border: msg.role !== 'parent' ? '1px solid #eee' : 'none'
                                            }}>
                                                {msg.text}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#999', marginTop: '4px', textAlign: msg.role === 'parent' ? 'right' : 'left' }}>{msg.time}</div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div style={{ padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <Button variant="ghost" style={{ padding: '8px' }}>📎</Button>
                                <div style={{ flex: 1 }}>
                                    <Input
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        style={{ margin: 0 }}
                                    />
                                </div>
                                <Button onClick={handleSend} style={{ width: 'auto' }}>Send ➤</Button>
                            </div>
                        </Card>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                        <p style={{ fontSize: '16px' }}>
                            {userRole === 'coach' ? 'Please select a batch to start chatting' : 'No batch assigned yet'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BatchChat;
