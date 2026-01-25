import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import Button from '../ui/Button';
import { RotateCcw } from 'lucide-react';

const ChessSolver = ({ initialFen, onGameChange, isReadOnly = false }) => {
    const [game, setGame] = useState(new Chess(initialFen || '8/8/8/8/8/8/8/8 w - - 0 1'));
    const [history, setHistory] = useState([]);
    const [engineLoading, setEngineLoading] = useState(false);
    const [engineSuggestion, setEngineSuggestion] = useState(null);
    const [difficulty, setDifficulty] = useState('medium');

    useEffect(() => {
        // Reset game if initialFen changes significantly? 
        // Be careful not to reset on every render if parent manages state.
        // For now, assume initialFen is static per puzzle session.
        const newGame = new Chess(initialFen || '8/8/8/8/8/8/8/8 w - - 0 1');
        setGame(newGame);
        setHistory([]);
    }, [initialFen]);

    const onDrop = (sourceSquare, targetSquare) => {
        if (isReadOnly) return false;

        try {
            const gameCopy = new Chess(game.fen());

            // Allow promotion to queen for simplicity
            const move = gameCopy.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q',
            });

            if (move === null) return false; // Illegal move

            setGame(gameCopy);
            setHistory(gameCopy.history());

            if (onGameChange) {
                onGameChange({
                    fen: gameCopy.fen(),
                    pgn: gameCopy.pgn(),
                    history: gameCopy.history(),
                    isGameOver: gameCopy.isGameOver(),
                    turn: gameCopy.turn()
                });
            }
            return true;
        } catch (e) {
            console.error("Move error:", e);
            return false;
        }
    };

    const handleUndo = () => {
        const gameCopy = new Chess(game.fen());
        const move = gameCopy.undo();
        if (move) {
            setGame(gameCopy);
            setHistory(gameCopy.history());
            if (onGameChange) {
                onGameChange({
                    fen: gameCopy.fen(),
                    pgn: gameCopy.pgn(),
                    history: gameCopy.history(),
                    isGameOver: gameCopy.isGameOver(),
                    turn: gameCopy.turn()
                });
            }
        }
    };

    const applyEngineMove = async () => {
        const apiBase = import.meta?.env?.VITE_SERVER_URL || 'http://localhost:3001';
        setEngineLoading(true);
        setEngineSuggestion(null);
        try {
            const resp = await fetch(`${apiBase}/api/chess/engine-move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fen: game.fen(), difficulty })
            });
            const data = await resp.json();
            if (!resp.ok || !data?.success || !data.bestMove) throw new Error(data?.error || 'No move found');

            const moveSan = data.bestMove;
            const gameCopy = new Chess(game.fen());
            const move = gameCopy.move(moveSan, { sloppy: true });
            if (!move) throw new Error('Engine move was illegal in this position');

            setGame(gameCopy);
            setHistory(gameCopy.history());
            setEngineSuggestion({ move: moveSan, score: data.score, pv: data.pv });

            onGameChange?.({
                fen: gameCopy.fen(),
                pgn: gameCopy.pgn(),
                history: gameCopy.history(),
                isGameOver: gameCopy.isGameOver(),
                turn: gameCopy.turn()
            });
        } catch (err) {
            console.error('Engine move error:', err);
            alert('AI move failed. Please try again.');
        } finally {
            setEngineLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px', margin: '0 auto' }}>
            <div style={{
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                <Chessboard
                    position={game.fen()}
                    onPieceDrop={onDrop}
                    arePiecesDraggable={!isReadOnly}
                    customDarkSquareStyle={{ backgroundColor: '#779954' }}
                    customLightSquareStyle={{ backgroundColor: '#e9edcc' }}
                />
            </div>

            {/* Controls & History */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#334155' }}>Moves</h3>
                    {!isReadOnly && (
                        <Button size="sm" variant="outline" onClick={handleUndo} disabled={history.length === 0}>
                            <RotateCcw size={14} style={{ marginRight: '4px' }} /> Undo
                        </Button>
                    )}
                </div>

                <div style={{
                    minHeight: '60px',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    background: 'white',
                    borderRadius: '8px',
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    color: '#1e293b',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    {history.length === 0 ? (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Make a move to start...</span>
                    ) : (
                        history.map((move, index) => (
                            <span key={index} style={{
                                background: index % 2 === 0 ? '#eff6ff' : '#f1f5f9',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: '500'
                            }}>
                                {Math.floor(index / 2) + 1}. {move}
                            </span>
                        ))
                    )}
                </div>

                {game.isGameOver() && (
                    <div style={{
                        marginTop: '12px',
                        padding: '8px',
                        background: '#dcfce7',
                        color: '#15803d',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontWeight: '600'
                    }}>
                        {game.isCheckmate() ? 'Checkmate!' : 'Game Over'}
                    </div>
                )}

                {!isReadOnly && (
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', minWidth: 120 }}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                        <Button size="sm" onClick={applyEngineMove} disabled={engineLoading}>
                            {engineLoading ? 'AI Thinking…' : 'Ask AI Move'}
                        </Button>
                        {engineSuggestion && (
                            <span style={{ fontSize: 12, color: '#334155' }}>
                                Suggested: {engineSuggestion.move} {engineSuggestion.score !== null ? `(eval ${engineSuggestion.score})` : ''}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChessSolver;
