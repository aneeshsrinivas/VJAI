import React, { useState, useEffect } from 'react';
import SimpleChessBoard from './SimpleChessBoard';
import { Chess } from 'chess.js';
import Button from '../ui/Button';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

// Helper to manually parse FEN into object
const parseFen = (fenStr) => {
    if (!fenStr) return {};
    const [placement] = fenStr.split(' ');
    const ranks = placement?.split('/') || [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const parsedPieces = {};

    ranks.forEach((rankStr, rankIdx) => {
        let fileIdx = 0;
        for (const ch of rankStr) {
            if (Number.isInteger(Number(ch))) {
                fileIdx += Number(ch);
                continue;
            }
            const color = ch === ch.toUpperCase() ? 'w' : 'b';
            const type = ch.toLowerCase();
            const square = `${files[fileIdx]}${8 - rankIdx}`;
            parsedPieces[square] = { color, type };
            fileIdx += 1;
        }
    });

    return parsedPieces;
};

// Helper to convert object back to FEN
const boardToFen = (pieces, turn) => {
    const rows = [];
    for (let r = 8; r >= 1; r--) {
        let row = '';
        let empty = 0;
        for (let f of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
            const sq = `${f}${r}`;
            const p = pieces[sq];
            if (!p) {
                empty++;
            } else {
                if (empty) { row += empty; empty = 0; }
                const char = p.color === 'w' ? p.type.toUpperCase() : p.type;
                row += char;
            }
        }
        if (empty) row += empty;
        rows.push(row);
    }
    return rows.join('/') + ` ${turn} - - 0 1`;
};

const ChessReplay = ({ pgn, initialFen }) => {
    // Current display FEN
    // Default to standard start if nothing provided, but initialFen might be provided.
    const defaultStartFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    // We use a safe initial state for the visual board
    const [currentFen, setCurrentFen] = useState(initialFen || defaultStartFen);

    const [moveHistory, setMoveHistory] = useState([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
    const [isCustomMode, setIsCustomMode] = useState(false);

    useEffect(() => {
        if (!pgn) return;

        const startFen = initialFen || defaultStartFen;

        // 1. Try Standard Parsing
        try {
            // Attempt to create a game with the start FEN
            const tempGame = new Chess(startFen);

            // Attempt to load PGN. 
            // Note: If startFen is custom (e.g. no kings), new Chess() might throw immediately.
            // If new Chess() throws, we go straight into catch block.

            tempGame.loadPgn(pgn);

            const history = tempGame.history({ verbose: true });

            // If parsing "succeeded" but returned 0 moves, and we know we have a PGN string,
            // it's likely a format issue (e.g. "c1c8" coordinate notation vs SAN).
            // chess.js loadPgn usually expects SAN.
            if (history.length === 0 && pgn.trim().length > 0) {
                throw new Error("Parsed 0 moves from non-empty PGN. Possibly coordinate notation.");
            }

            setMoveHistory(history.map(m => ({
                san: m.san,
                from: m.from,
                to: m.to,
                promotion: m.promotion
            })));

            setIsCustomMode(false);
            setCurrentFen(startFen);
            setCurrentMoveIndex(-1);

        } catch (e) {
            console.warn("Falling back to Custom Move Replay due to validation error:", e.message);

            // 2. Custom/Manual Parsing
            // We assume the PGN is a string of moves separated by spaces or newlines.
            // They might be "e2e4" or "c1c8q". 
            // We will clean the string and split.
            const rawMoves = pgn
                .replace(/\d+\./g, '') // remove "1." "2." etc
                .trim()
                .split(/\s+/);

            const parsedMoves = [];

            for (const m of rawMoves) {
                if (m.length < 4) continue; // Skip invalid junk

                // coordinates are "from" (2 chars) and "to" (2 chars) + optional promotion (1 char)
                const from = m.substring(0, 2);
                const to = m.substring(2, 4);
                const promotion = m.length > 4 ? m.substring(4, 5) : undefined;

                parsedMoves.push({
                    san: m, // Use the raw string as the display label (SAN)
                    from,
                    to,
                    promotion
                });
            }

            setMoveHistory(parsedMoves);
            setIsCustomMode(true);
            setCurrentFen(startFen);
            setCurrentMoveIndex(-1);
        }

    }, [pgn, initialFen]);

    const goToMove = (index) => {
        const startFen = initialFen || defaultStartFen;

        if (!isCustomMode) {
            // Standard Replay Logic
            try {
                const tempGame = new Chess(startFen);
                for (let i = 0; i <= index; i++) {
                    const move = moveHistory[i];
                    if (move) tempGame.move(move);
                }
                setCurrentFen(tempGame.fen());
            } catch (e) {
                console.error("Standard replay error:", e);
                // If standard fails mid-way (rare), maybe just stop updating or fallback?
                // Usually initialFen validity check in useEffect prevents this branch if invalid.
            }
        } else {
            // Custom Replay Logic (Manual Board Mutation)
            let pieces = parseFen(startFen);
            let turnStr = startFen.split(' ')[1] || 'w';

            for (let i = 0; i <= index; i++) {
                const move = moveHistory[i];
                if (move) {
                    const movingPiece = { ...pieces[move.from] };

                    // Only apply if there is actually a piece to move. 
                    // In custom setups, we trust the moves are valid for the visual replay.
                    if (movingPiece && movingPiece.type) {

                        // Move piece
                        pieces[move.to] = movingPiece;
                        delete pieces[move.from];

                        // Handle Promotion (if any)
                        if (move.promotion) {
                            pieces[move.to] = { ...movingPiece, type: move.promotion };
                        }

                        // Flip visual turn (purely for FEN generation usually)
                        turnStr = turnStr === 'w' ? 'b' : 'w';
                    }
                }
            }
            setCurrentFen(boardToFen(pieces, turnStr));
        }

        setCurrentMoveIndex(index);
    };

    const handleNext = () => {
        if (currentMoveIndex < moveHistory.length - 1) goToMove(currentMoveIndex + 1);
    };

    const handlePrev = () => {
        if (currentMoveIndex >= 0) goToMove(currentMoveIndex - 1);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px', margin: '0 auto' }}>
            <div style={{
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <SimpleChessBoard
                    initialFen={currentFen}
                    readOnly={true}
                />
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                    <Button size="sm" variant="outline" onClick={() => goToMove(-1)} disabled={currentMoveIndex === -1}>
                        <RotateCcw size={16} />
                    </Button>
                    <Button size="sm" onClick={handlePrev} disabled={currentMoveIndex === -1}>
                        <ChevronLeft size={20} />
                    </Button>
                    <div style={{ padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', minWidth: '80px', textAlign: 'center', fontWeight: 'bold' }}>
                        {currentMoveIndex + 1} / {moveHistory.length}
                    </div>
                    <Button size="sm" onClick={handleNext} disabled={currentMoveIndex === moveHistory.length - 1}>
                        <ChevronRight size={20} />
                    </Button>
                </div>

                <div style={{
                    maxHeight: '150px',
                    overflowY: 'auto',
                    background: 'white',
                    borderRadius: '8px',
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '13px',
                    color: '#1e293b',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px'
                }}>
                    {moveHistory.map((move, index) => (
                        <span
                            key={index}
                            onClick={() => goToMove(index)}
                            style={{
                                cursor: 'pointer',
                                background: index === currentMoveIndex ? '#3b82f6' : (index % 2 === 0 ? '#f1f5f9' : 'white'),
                                color: index === currentMoveIndex ? 'white' : 'inherit',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid transparent'
                            }}
                        >
                            {Math.ceil((index + 1) / 2)}.{index % 2 === 0 ? '' : '..'}{move.san}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChessReplay;
