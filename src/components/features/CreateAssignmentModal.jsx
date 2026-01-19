import React, { useState } from 'react';
import Button from '../ui/Button';
import { createAssignment } from '../../services/firestoreService';
import { FileText, Calendar, AlignLeft, X } from 'lucide-react';

const CreateAssignmentModal = ({ isOpen, onClose, batchId, batchName, onSuccess }) => {
    if (!isOpen) return null;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        type: 'Puzzle Set'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await createAssignment({
            ...formData,
            batchId: batchId || 'global', // Fallback or handle appropriately
            batchName: batchName,
            status: 'Pending'
        });

        setLoading(false);

        if (result.success) {
            if (onSuccess) onSuccess();
            onClose();
        } else {
            alert('Failed to create assignment');
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
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>Create Assignment</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Title</label>
                        <div style={{ position: 'relative' }}>
                            <FileText size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                            <input
                                type="text"
                                name="title"
                                required
                                placeholder="e.g. Knight Fork Puzzles"
                                value={formData.title}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '10px 10px 10px 40px',
                                    borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            style={{
                                width: '100%', padding: '10px',
                                borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'
                            }}
                        >
                            <option>Puzzle Set</option>
                            <option>Quiz</option>
                            <option>Game Analysis</option>
                            <option>Home Practice</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Due Date</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                            <input
                                type="date"
                                name="dueDate"
                                required
                                value={formData.dueDate}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '10px 10px 10px 40px',
                                    borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Description</label>
                        <textarea
                            name="description"
                            required
                            placeholder="Instructions for the student..."
                            rows="3"
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
                            {loading ? 'Creating...' : 'Assign Now'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAssignmentModal;
