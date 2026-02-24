import React, { useState } from 'react';
import Button from '../ui/Button';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { FileText, AlignLeft, X } from 'lucide-react';
import ChessBoardEditor from '../chess/ChessBoardEditor';

const CreateChessPuzzleModal = ({ isOpen, onClose, batchId, batchName, onSuccess }) => {
    if (!isOpen) return null;

    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addDoc(collection(db, 'chessAssignment'), {
                ...formData,
                fen: fen,
                batchId: batchId || 'global',
                batchName: batchName || 'Global',
                coachId: currentUser.uid,
                coachName: currentUser.displayName || 'Coach',
                type: 'Puzzle',
                createdAt: serverTimestamp(),
            });

            setLoading(false);
            if (onSuccess) onSuccess();
            onClose();
            alert('Puzzle Assigned Successfully!');
        } catch (error) {
            console.error("Error creating assignment:", error);
            alert('Failed to create assignment');
            setLoading(false);
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
                width: '100%', maxWidth: '900px',
                maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>Create Chess Puzzle</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '32px', flexDirection: 'column' }}> {/* Changed to column for mobile or just simpler layout, or row for large screen */}
                    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>

                        {/* Left Column: Form Details */}
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <form id="puzzleForm" onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Title</label>
                                    <div style={{ position: 'relative' }}>
                                        <FileText size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                                        <input
                                            type="text"
                                            name="title"
                                            required
                                            placeholder="e.g. Mate in 2"
                                            value={formData.title}
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
                                        rows="4"
                                        value={formData.description}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%', padding: '12px',
                                            borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'none'
                                        }}
                                    />
                                </div>

                                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                    <h4 style={{ margin: '0 0 8px', fontSize: '14px' }}>Assigning to:</h4>
                                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{batchName || 'Global'}</div>
                                </div>
                            </form>
                        </div>

                        {/* Right Column: Board Editor */}
                        <div style={{ flex: '0 0 auto' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Setup Board Position</label>
                            <ChessBoardEditor
                                onChange={setFen}
                                initialFen={fen}
                            />
                        </div>

                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" form="puzzleForm" disabled={loading}>
                            {loading ? 'Creating...' : 'Assign Puzzle'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateChessPuzzleModal;
