import React, { useState } from 'react';
import Button from '../ui/Button';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { X, Send } from 'lucide-react';
import SimpleChessBoard from '../chess/SimpleChessBoard';

const StudentChessAssignmentModal = ({ isOpen, onClose, assignment }) => {
    if (!isOpen || !assignment) return null;

    const { currentUser, userData } = useAuth();
    const [gameState, setGameState] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleMoveMade = (state) => {
        console.log('📋 Move made - Current game state:', {
            moves: state.moves,
            moveCount: state.moves.length,
            fen: state.fen,
            pgn: state.pgn
        });
        setGameState(state);
    };

    const handleSubmit = async () => {
        if (!gameState || gameState.moves.length === 0) {
            alert("Please make at least one move first!");
            return;
        }

        setSubmitting(true);
        try {
            const submissionRef = doc(db, 'chessAssignment', assignment.id, 'submissions', currentUser.uid);
            console.log("student name is :", userData?.studentName)
            await setDoc(submissionRef, {
                studentId: currentUser.uid,
                studentName: userData?.studentName || currentUser.displayName || currentUser.email || 'Student',
                moves: gameState.moves,
                pgn: gameState.pgn,
                fen: gameState.fen,
                batchId: assignment.batchId,
                batchName: assignment.batchName,
                submittedAt: serverTimestamp(),
                status: 'Submitted'
            });

            alert('Solution Submitted Successfully!');
            onClose();
        } catch (error) {
            console.error("Error submitting solution:", error);
            alert('Failed to submit solution.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, fontFamily: "'Figtree', sans-serif"
        }}>
            <div style={{
                background: 'white', borderRadius: '16px', padding: '24px',
                width: '100%', maxWidth: '600px',
                maxHeight: '95vh', overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>{assignment.title}</h2>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
                            Posted by {assignment.coachName}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '8px', fontSize: '15px', color: '#334155', lineHeight: '1.5' }}>
                    <strong>Instructions:</strong> {assignment.description}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '20px' }}>
                    <SimpleChessBoard
                        initialFen={assignment.fen}
                        onMoveMade={handleMoveMade}
                        readOnly={false}
                        size={500}
                    />
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        <Send size={16} style={{ marginRight: '6px' }} />
                        {submitting ? 'Submitting...' : 'Submit Solution'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StudentChessAssignmentModal;
