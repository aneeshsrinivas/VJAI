import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast, ToastContainer } from 'react-toastify';
import { Send, FileText, Clock, Users } from 'lucide-react';

const BroadcastPage = () => {
    const { currentUser } = useAuth();
    const [batches, setBatches] = useState([]);
    const [broadcasts, setBroadcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        studentType: 'ALL',
        level: 'ALL',
        timezone: 'ALL',
        batchId: 'ALL',
        subject: '',
        message: ''
    });

    // Fetch batches for dropdown
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'batches'));
                const batchList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setBatches(batchList);
            } catch (error) {
                console.error('Error fetching batches:', error);
            }
        };
        fetchBatches();
    }, []);

    // Real-time listener for broadcasts
    useEffect(() => {
        const q = query(collection(db, 'broadcasts'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const broadcastList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBroadcasts(broadcastList);
            setLoading(false);
        }, (error) => {
            console.error('Error listening to broadcasts:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSendBroadcast = async () => {
        if (!formData.subject.trim() || !formData.message.trim()) {
            toast.error('Please fill in subject and message');
            return;
        }

        setSending(true);
        try {
            // Save broadcast to Firestore
            const broadcastRef = await addDoc(collection(db, 'broadcasts'), {
                subject: formData.subject,
                message: formData.message,
                audience: {
                    studentType: formData.studentType,
                    level: formData.level,
                    timezone: formData.timezone,
                    batchId: formData.batchId
                },
                sentBy: currentUser?.uid || 'admin',
                sentByEmail: currentUser?.email || 'admin@system',
                status: 'SENT',
                createdAt: serverTimestamp()
            });

            // Also send to group chat if a specific batch is selected
            if (formData.batchId !== 'ALL') {
                // Find chat for this batch and add message
                const chatsSnapshot = await getDocs(collection(db, 'chats'));
                const batchChat = chatsSnapshot.docs.find(doc => doc.data().batchId === formData.batchId);

                if (batchChat) {
                    await addDoc(collection(db, 'messages'), {
                        chatId: batchChat.id,
                        senderId: currentUser?.uid || 'admin',
                        senderName: 'Admin Broadcast',
                        senderRole: 'ADMIN',
                        content: `[ANNOUNCEMENT] ${formData.subject}\n\n${formData.message}`,
                        createdAt: serverTimestamp()
                    });
                }
            }

            toast.success('Broadcast sent successfully');
            setFormData({
                studentType: 'ALL',
                level: 'ALL',
                timezone: 'ALL',
                batchId: 'ALL',
                subject: '',
                message: ''
            });
        } catch (error) {
            toast.error('Failed to send broadcast: ' + error.message);
        } finally {
            setSending(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!formData.subject.trim()) {
            toast.error('Please add a subject to save as draft');
            return;
        }

        try {
            await addDoc(collection(db, 'broadcasts'), {
                subject: formData.subject,
                message: formData.message,
                audience: {
                    studentType: formData.studentType,
                    level: formData.level,
                    timezone: formData.timezone,
                    batchId: formData.batchId
                },
                sentBy: currentUser?.uid || 'admin',
                status: 'DRAFT',
                createdAt: serverTimestamp()
            });
            toast.success('Draft saved');
        } catch (error) {
            toast.error('Failed to save draft: ' + error.message);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}>
                    <Send size={24} />
                </div>
                <div>
                    <h1 style={{ margin: 0 }}>Broadcast Center</h1>
                    <p style={{ margin: '4px 0 0', color: '#666' }}>Send announcements to students and parents</p>
                </div>
            </div>

            <Card title="New Announcement">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Audience Selection */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Student Type</label>
                            <select
                                name="studentType"
                                value={formData.studentType}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                            >
                                <option value="ALL">All Types</option>
                                <option value="1:1">1:1 Students</option>
                                <option value="GROUP">Group Batch Students</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Level</label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                            >
                                <option value="ALL">All Levels</option>
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Timezone</label>
                            <select
                                name="timezone"
                                value={formData.timezone}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                            >
                                <option value="ALL">All Timezones</option>
                                <option value="IST">India (IST)</option>
                                <option value="EST">USA (EST)</option>
                                <option value="PST">USA (PST)</option>
                                <option value="GMT">Europe (GMT)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Specific Batch</label>
                            <select
                                name="batchId"
                                value={formData.batchId}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                            >
                                <option value="ALL">All Active Batches</option>
                                {batches.map(batch => (
                                    <option key={batch.id} value={batch.id}>
                                        {batch.name || batch.id}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Subject */}
                    <Input
                        label="Subject Line"
                        name="subject"
                        placeholder="e.g. Schedule Change for Republic Day"
                        value={formData.subject}
                        onChange={handleInputChange}
                    />

                    {/* Message Body */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Message Body</label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Type your announcement here..."
                            style={{
                                width: '100%',
                                height: '200px',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                        <Button variant="secondary" onClick={handleSaveDraft}>Save Draft</Button>
                        <Button onClick={handleSendBroadcast} disabled={sending}>
                            {sending ? 'Sending...' : 'Send Broadcast'}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Recent Broadcasts */}
            <div style={{ marginTop: '32px' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} />
                    Recent Broadcasts
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                    {loading ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>Loading broadcasts...</div>
                    ) : broadcasts.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                            No broadcasts yet. Send your first announcement to get started.
                        </div>
                    ) : (
                        broadcasts.slice(0, 5).map(broadcast => (
                            <div key={broadcast.id} style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <strong style={{ color: 'var(--color-deep-blue)' }}>{broadcast.subject}</strong>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            backgroundColor: broadcast.status === 'SENT' ? '#DCFCE7' : '#FEF3C7',
                                            color: broadcast.status === 'SENT' ? '#166534' : '#92400E'
                                        }}>
                                            {broadcast.status}
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} />
                                            {formatDate(broadcast.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#555' }}>
                                    {broadcast.message?.substring(0, 100)}{broadcast.message?.length > 100 ? '...' : ''}
                                </p>
                                <div style={{ marginTop: '8px', fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Users size={12} />
                                    Audience: {broadcast.audience?.studentType === 'ALL' ? 'All Students' : broadcast.audience?.studentType}
                                    {broadcast.audience?.batchId !== 'ALL' && ` | Batch: ${broadcast.audience?.batchId}`}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default BroadcastPage;
