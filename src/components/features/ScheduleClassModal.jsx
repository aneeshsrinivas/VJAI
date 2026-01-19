import React, { useState } from 'react';
import Button from '../ui/Button';
import { createClass } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Video, X, AlignLeft } from 'lucide-react';

const ScheduleClassModal = ({ isOpen, onClose, batchId, batchName, onSuccess }) => {
    if (!isOpen) return null;

    const { currentUser, userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        topic: '',
        date: '',
        time: '',
        meetLink: '',
        description: '',
        batchType: 'group'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const selectedBatchId = formData.batchType === 'group' ? 'batch_group' : 'batch_intermediate_1_1';
        const selectedBatchName = formData.batchType === 'group' ? 'Intermediate Group Batch' : 'Intermediate 1:1';

        const result = await createClass({
            ...formData,
            coachId: currentUser.uid,
            coachName: userData?.fullName || currentUser.email?.split('@')[0] || 'Coach',
            batchId: selectedBatchId,
            batchName: selectedBatchName,
            status: 'SCHEDULED',
            scheduledAt: new Date(`${formData.date}T${formData.time}`)
        });

        setLoading(false);

        if (result.success) {
            if (onSuccess) onSuccess();
            onClose();
        } else {
            alert('Failed to schedule class');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, fontFamily: "'Figtree', sans-serif"
        }}>
            <div style={{
                background: 'white', borderRadius: '16px', padding: '24px',
                width: '100%', maxWidth: '500px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>Schedule New Class</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Topic</label>
                        <input
                            type="text"
                            name="topic"
                            required
                            placeholder="e.g. Ruy Lopez Strategy"
                            value={formData.topic}
                            onChange={handleChange}
                            style={{
                                width: '100%', padding: '10px',
                                borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Date</label>
                            <input
                                type="date"
                                name="date"
                                required
                                value={formData.date}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '10px',
                                    borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Time</label>
                            <input
                                type="time"
                                name="time"
                                required
                                value={formData.time}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '10px',
                                    borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Meeting Link</label>
                        <div style={{ position: 'relative' }}>
                            <Video size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                            <input
                                type="url"
                                name="meetLink"
                                placeholder="https://meet.google.com/..."
                                value={formData.meetLink}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '10px 10px 10px 40px',
                                    borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Batch Type</label>
                        <select
                            name="batchType"
                            value={formData.batchType}
                            onChange={(e) => setFormData({ ...formData, batchType: e.target.value })}
                            style={{
                                width: '100%', padding: '10px',
                                borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none',
                                background: 'white', fontFamily: 'inherit'
                            }}
                        >
                            <option value="group">Group Batch</option>
                            <option value="intermediate_1_1">Intermediate 1:1</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Description (Optional)</label>
                        <textarea
                            name="description"
                            placeholder="Class notes or prep..."
                            rows="2"
                            value={formData.description}
                            onChange={handleChange}
                            style={{
                                width: '100%', padding: '12px',
                                borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Scheduling...' : 'Schedule Class'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleClassModal;
