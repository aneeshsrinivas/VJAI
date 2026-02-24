import React, { useEffect, useRef, useState } from 'react';
import Button from '../ui/Button';
import { Trash2, RotateCcw, Repeat } from 'lucide-react';

const EMPTY_FEN = '8/8/8/8/8/8/8/8 w - - 0 1';

const pieceTypes = [
    { type: 'k', label: 'King' },
    { type: 'q', label: 'Queen' },
    { type: 'r', label: 'Rook' },
    { type: 'b', label: 'Bishop' },
    { type: 'n', label: 'Knight' },
    { type: 'p', label: 'Pawn' },
];

const glyph = {
    w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

const mapToFen = (pieces, turn = 'w') => {
    const rows = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    let fen = '';

    for (let r = 0; r < 8; r++) {
        let empty = 0;
        for (let c = 0; c < 8; c++) {
            const sq = cols[c] + rows[r];
            const piece = pieces[sq];
            if (piece) {
                if (empty) {
                    fen += empty;
                    empty = 0;
                }
                const type = piece[1].toLowerCase();
                const color = piece[0];
                fen += color === 'w' ? type.toUpperCase() : type;
            } else {
                empty++;
            }
        }
        if (empty) fen += empty;
        if (r < 7) fen += '/';
    }

    return `${fen} ${turn} - - 0 1`;
};

const ChessBoardEditor = ({ initialFen = EMPTY_FEN, onChange, size = 420 }) => {
    const [pieces, setPieces] = useState({});
    const [turnColor, setTurnColor] = useState('w');
    const [selectedPiece, setSelectedPiece] = useState({ color: 'w', type: 'p' });
    const [orientation, setOrientation] = useState('white');
    const [tool, setTool] = useState('place');
    const skipEmitRef = useRef(false);
    const lastEmittedFen = useRef(null);

    const parseFen = (fenStr) => {
        if (!fenStr) return { parsedPieces: {}, parsedTurn: 'w' };
        const [placement, turn] = fenStr.split(' ');
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
                parsedPieces[square] = `${color}${type.toUpperCase()}`;
                fileIdx += 1;
            }
        });

        return { parsedPieces, parsedTurn: turn === 'b' ? 'b' : 'w' };
    };

    useEffect(() => {
        const { parsedPieces, parsedTurn } = parseFen(initialFen);
        skipEmitRef.current = true; // prevent immediate emit loop when syncing from prop
        setPieces(parsedPieces);
        setTurnColor(parsedTurn);
    }, [initialFen]);

    useEffect(() => {
        const currentFen = mapToFen(pieces, turnColor);
        if (skipEmitRef.current) {
            skipEmitRef.current = false;
            lastEmittedFen.current = currentFen;
            return;
        }
        if (currentFen !== lastEmittedFen.current) {
            lastEmittedFen.current = currentFen;
            onChange?.(currentFen);
        }
    }, [pieces, turnColor, onChange]);

    const handleSquareClick = (square) => {
        setPieces((prev) => {
            const next = { ...prev };

            if (tool === 'erase') {
                delete next[square];
                return next;
            }

            if (!selectedPiece) {
                return next;
            }

            const code = `${selectedPiece.color}${selectedPiece.type.toUpperCase()}`;
            if (next[square] === code) delete next[square];
            else next[square] = code;
            return next;
        });
    };

    const clearBoard = () => setPieces({});

    const resetBoard = () => {
        setPieces({
            a1: 'wR', b1: 'wN', c1: 'wB', d1: 'wQ', e1: 'wK', f1: 'wB', g1: 'wN', h1: 'wR',
            a2: 'wP', b2: 'wP', c2: 'wP', d2: 'wP', e2: 'wP', f2: 'wP', g2: 'wP', h2: 'wP',
            a8: 'bR', b8: 'bN', c8: 'bB', d8: 'bQ', e8: 'bK', f8: 'bB', g8: 'bN', h8: 'bR',
            a7: 'bP', b7: 'bP', c7: 'bP', d7: 'bP', e7: 'bP', f7: 'bP', g7: 'bP', h7: 'bP',
        });
        setTurnColor('w');
        setTool('place');
        setSelectedPiece({ color: 'w', type: 'p' });
    };

    const flipBoard = () => setOrientation((prev) => (prev === 'white' ? 'black' : 'white'));

    const renderBoard = () => {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

        const displayFiles = orientation === 'white' ? files : [...files].reverse();
        const displayRanks = orientation === 'white' ? ranks : [...ranks].reverse();

        const squareSize = size / 8;

        return (
            <div style={{ 
                width: size, 
                height: size, 
                display: 'grid', 
                gridTemplateColumns: `repeat(8, ${squareSize}px)`,
                border: '2px solid #333',
                userSelect: 'none'
            }}>
                {displayRanks.map((rank, rankIdx) =>
                    displayFiles.map((file, fileIdx) => {
                        const square = file + rank;
                        const isLight = (rankIdx + fileIdx) % 2 === 0;
                        const piece = pieces[square];

                        return (
                            <div
                                key={square}
                                onClick={() => handleSquareClick(square)}
                                style={{
                                    width: squareSize,
                                    height: squareSize,
                                    backgroundColor: isLight ? '#e9edcc' : '#779954',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: squareSize * 0.7,
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'background-color 0.1s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = isLight ? '#f5f5dc' : '#6b8e23';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = isLight ? '#e9edcc' : '#779954';
                                }}
                            >
                                {piece && glyph[piece[0]][piece[1].toLowerCase()]}
                                {fileIdx === 0 && (
                                    <span style={{ 
                                        position: 'absolute', 
                                        top: 2, 
                                        left: 2, 
                                        fontSize: 10, 
                                        color: isLight ? '#779954' : '#e9edcc',
                                        fontWeight: 'bold'
                                    }}>
                                        {rank}
                                    </span>
                                )}
                                {rankIdx === 7 && (
                                    <span style={{ 
                                        position: 'absolute', 
                                        bottom: 2, 
                                        right: 2, 
                                        fontSize: 10, 
                                        color: isLight ? '#779954' : '#e9edcc',
                                        fontWeight: 'bold'
                                    }}>
                                        {file}
                                    </span>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        );
    };

    const Palette = ({ color }) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {pieceTypes.map((p) => {
                const isActive = tool === 'place' && selectedPiece?.color === color && selectedPiece?.type === p.type;
                return (
                    <button
                        key={`${color}-${p.type}`}
                        onClick={() => {
                            setTool('place');
                            setSelectedPiece({ color, type: p.type });
                        }}
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 10,
                            border: isActive ? '2px solid #2563eb' : '1px solid #e2e8f0',
                            background: isActive ? '#eff6ff' : '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: 24,
                        }}
                        type="button"
                    >
                        {glyph[color][p.type]}
                    </button>
                );
            })}
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {renderBoard()}

                <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <h4 style={{ margin: '0 0 8px', color: '#334155' }}>White Pieces</h4>
                        <Palette color="w" />
                    </div>

                    <div>
                        <h4 style={{ margin: '0 0 8px', color: '#334155' }}>Black Pieces</h4>
                        <Palette color="b" />
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <Button
                            size="sm"
                            variant={tool === 'erase' ? 'primary' : 'outline'}
                            onClick={() => setTool((prev) => (prev === 'erase' ? 'place' : 'erase'))}
                            style={{ flex: 1 }}
                        >
                            <Trash2 size={14} /> {tool === 'erase' ? 'Eraser On' : 'Eraser'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={flipBoard} style={{ flex: 1 }}>
                            Flip Board
                        </Button>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <Button size="sm" variant="outline" onClick={clearBoard} style={{ flex: 1 }}>
                            <Trash2 size={14} /> Clear
                        </Button>
                        <Button size="sm" variant="outline" onClick={resetBoard} style={{ flex: 1 }}>
                            <RotateCcw size={14} /> Standard Start
                        </Button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>Side to move</span>
                        <button
                            type="button"
                            onClick={() => setTurnColor((prev) => (prev === 'w' ? 'b' : 'w'))}
                            style={{
                                padding: '6px 12px',
                                borderRadius: 8,
                                border: '1px solid #cbd5e1',
                                background: turnColor === 'w' ? '#fff' : '#1e293b',
                                color: turnColor === 'w' ? '#0f172a' : '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                cursor: 'pointer',
                            }}
                        >
                            {turnColor === 'w' ? 'White to move' : 'Black to move'} <Repeat size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ fontSize: 12, color: '#475569', fontFamily: 'monospace', wordBreak: 'break-all', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: 10 }}>
                FEN: {mapToFen(pieces, turnColor)}
            </div>
        </div>
    );
};

export default ChessBoardEditor;
