import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const BroadcastPage = () => {
    const [audience, setAudience] = useState('ALL_PARENTS');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);

    const handleSend = () => {
        setSent(true);
        setTimeout(() => {
            setSent(false);
            setTitle('');
            setMessage('');
            alert('Broadcast sent successfully!');
        }, 2000);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '24px' }}>📢 Broadcast Center</h1>

            <Card title="New Announcement">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Audience Selection */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Target Audience</label>
                        <select
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                        >
                            <option value="ALL_PARENTS">All Parents</option>
                            <option value="ALL_STUDENTS">All Students</option>
                            <option value="ALL_COACHES">All Coaches</option>
                            <option value="BATCH_B2">Batch: Intermediate B2</option>
                            <option value="BATCH_C1">Batch: Advanced C1</option>
                        </select>
                    </div>

                    {/* Message Title */}
                    <Input
                        label="Subject Line"
                        placeholder="e.g. Schedule Change for Republic Day"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    {/* Message Body */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Message Body</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
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
                        <Button variant="secondary">Save Draft</Button>
                        <Button onClick={handleSend} disabled={!title || !message || sent}>
                            {sent ? 'Sending...' : 'Send Broadcast'}
                        </Button>
                    </div>
                </div>
            </Card>

            <div style={{ marginTop: '32px' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Recent Broadcasts</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                    <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <strong style={{ color: 'var(--color-deep-blue)' }}>Weekly Tournament Registration</strong>
                            <span style={{ fontSize: '12px', color: '#666' }}>Jan 20, 2024</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>Sent to: All Students • Opened: 85%</p>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <strong style={{ color: 'var(--color-deep-blue)' }}>Maintenance Downtime Alert</strong>
                            <span style={{ fontSize: '12px', color: '#666' }}>Jan 15, 2024</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>Sent to: All Users • Opened: 92%</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BroadcastPage;
