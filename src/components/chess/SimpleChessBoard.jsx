import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

const glyph = {
    w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

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

const SimpleChessBoard = ({ initialFen, onMoveMade, size = 400, readOnly = false }) => {
    const [game, setGame] = useState(null);
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [legalMoves, setLegalMoves] = useState([]);
    const [pieces, setPieces] = useState({});
    const [difficulty, setDifficulty] = useState('medium');
    const [engineLoading, setEngineLoading] = useState(false);
    const [gameStatus, setGameStatus] = useState('');
    const [customTurn, setCustomTurn] = useState('w');
    const [kingInCheck, setKingInCheck] = useState(null); // Square of king in check
    const [kingInCheckmate, setKingInCheckmate] = useState(null); // Square of king in checkmate

    const [engineError, setEngineError] = useState(false);

    useEffect(() => {
        const fenToUse = initialFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

        // Always parse and display the pieces from the assignment
        setPieces(parseFen(fenToUse));

        try {
            const newGame = new Chess(fenToUse);
            setGame(newGame);
            setCustomTurn(newGame.turn());
            updateGameStatus(newGame, null, parseFen(fenToUse));
        } catch (error) {
            console.log('FEN validation issue, allowing moves on displayed position');
            // Create a permissive game state - we'll validate moves manually
            setGame({
                fen: () => fenToUse,
                history: () => [],
                pgn: () => '',
                turn: () => fenToUse.split(' ')[1] === 'b' ? 'b' : 'w',
                _moves: [],
                _isCustom: true
            });
            setCustomTurn(fenToUse.split(' ')[1] === 'b' ? 'b' : 'w');
        }
        setEngineError(false); // Reset error on new game
    }, [initialFen]);

    useEffect(() => {
        // Debugging Bot Trigger
        // console.log("Bot Check:", { 
        //     readOnly, 
        //     gameExists: !!game, 
        //     engineLoading, 
        //     status: gameStatus, 
        //     turn: game ? (game._isCustom ? customTurn : game.turn()) : 'N/A' 
        // });

        if (readOnly || !game || engineLoading || engineError || gameStatus.includes('Checkmate') || gameStatus.includes('Stalemate')) return;

        const currentTurn = game._isCustom ? customTurn : game.turn();
        console.log("Turn Check:", currentTurn);

        if (currentTurn === 'b') {
            console.log("🤖 triggers bot move...");
            const timeoutId = setTimeout(() => {
                applyEngineMove();
            }, 500); // Small delay for better UX
            return () => clearTimeout(timeoutId);
        }
    }, [game, customTurn, gameStatus, readOnly, pieces, engineError]);

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
                    if (empty) {
                        row += empty;
                        empty = 0;
                    }
                    const char = p.color === 'w'
                        ? p.type.toUpperCase()
                        : p.type;
                    row += char;
                }
            }

            if (empty) row += empty;
            rows.push(row);
        }

        return rows.join('/') + ` ${turn} - - 0 1`;
    };

    const buildTempChess = () => {
        const fen = boardToFen(pieces, customTurn);
        return new Chess(fen);
    };

    const isKingInCheckmate = (pieces, kingColor) => {
        const kingSquare = getKingSquare(pieces, kingColor);
        if (!kingSquare) return false;

        // If not in check, can't be checkmate
        if (!isSquareUnderAttack(kingSquare, kingColor, pieces)) return false;

        // Check if any piece has a valid move
        for (const [sq, piece] of Object.entries(pieces)) {
            if (piece.color === kingColor) {
                if (getValidMoves(sq, pieces).length > 0) return false;
            }
        }
        return true;
    };

    const isSquareUnderAttack = (square, defendingColor, boardPieces) => {
        const attackingColor = defendingColor === 'w' ? 'b' : 'w';

        for (const [sq, piece] of Object.entries(boardPieces)) {
            if (piece.color === attackingColor) {
                const moves = getPseudoLegalMoves(sq, boardPieces, true);
                if (moves.includes(square)) {
                    return true;
                }
            }
        }
        return false;
    };

    const updateGameStatus = (currentGame, overrideFen, currentPieces, overrideTurn) => {
        let tempGame;
        setKingInCheck(null);
        setKingInCheckmate(null);

        try {
            tempGame = new Chess(overrideFen || currentGame.fen());

            // Use chess.js for valid positions
            if (tempGame.isCheckmate()) {
                const kingSquare = getKingSquare(currentPieces, tempGame.turn());
                setKingInCheckmate(kingSquare);
                setGameStatus(
                    `Checkmate! ${tempGame.turn() === 'w' ? 'Black' : 'White'} wins!`
                );
            } else if (tempGame.isDraw()) {
                setGameStatus('Draw!');
            } else if (tempGame.isStalemate()) {
                setGameStatus('Stalemate!');
            } else if (tempGame.isCheck()) {
                const kingSquare = getKingSquare(currentPieces, tempGame.turn());
                setKingInCheck(kingSquare);
                setGameStatus(
                    `${tempGame.turn() === 'w' ? 'White' : 'Black'} is in check!`
                );
            } else {
                setGameStatus('');
            }
        } catch {
            // For invalid positions, use custom checkmate detection
            if (currentGame._isCustom && currentPieces) {
                const currentColor = overrideTurn || customTurn;
                const kingSquare = getKingSquare(currentPieces, currentColor);
                const inCheck = kingSquare && isSquareUnderAttack(kingSquare, currentColor, currentPieces);

                // Check if any legal moves exist
                let hasLegalMoves = false;
                for (const sq in currentPieces) {
                    if (currentPieces[sq].color === currentColor) {
                        if (getValidMoves(sq, currentPieces).length > 0) {
                            hasLegalMoves = true;
                            break;
                        }
                    }
                }

                if (!hasLegalMoves) {
                    if (inCheck) {
                        setKingInCheckmate(kingSquare);
                        setGameStatus(`Checkmate! ${currentColor === 'w' ? 'Black' : 'White'} wins!`);
                    } else {
                        setGameStatus('Stalemate!');
                    }
                } else if (inCheck) {
                    setKingInCheck(kingSquare);
                    setGameStatus(`${currentColor === 'w' ? 'White' : 'Black'} is in check!`);
                } else {
                    setGameStatus('');
                }
            } else {
                setGameStatus('');
            }
        }
    };

    const getKingSquare = (boardPieces, kingColor) => {
        for (const [square, piece] of Object.entries(boardPieces)) {
            if (piece.type === 'k' && piece.color === kingColor) {
                return square;
            }
        }
        return null;
    };

    const applyEngineMove = async () => {
        console.log("Called applyEngineMove");
        if (!game || engineLoading) return;

        setEngineLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/chess/engine-move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fen: game._isCustom ? boardToFen(pieces, customTurn) : game.fen(),
                    difficulty: difficulty
                })
            });

            if (!response.ok) throw new Error('Engine request failed');

            const data = await response.json();

            if (data.bestMove) {
                if (game._isCustom) {
                    // Apply move manually for custom positions
                    const from = data.bestMove.substring(0, 2);
                    const to = data.bestMove.substring(2, 4);

                    const movingPiece = pieces[from];
                    const newPieces = { ...pieces };
                    newPieces[to] = movingPiece;
                    delete newPieces[from];
                    setPieces(newPieces);

                    game._moves.push(data.bestMove);
                    const nextTurn = customTurn === 'w' ? 'b' : 'w';
                    setCustomTurn(nextTurn);

                    const fen = boardToFen(newPieces, nextTurn);
                    updateGameStatus(game, fen, newPieces, nextTurn);

                    if (onMoveMade) {
                        onMoveMade({
                            fen: game.fen(),
                            moves: game._moves,
                            pgn: game._moves.join(' '),
                        });
                    }
                } else {
                    // Use chess.js for valid positions
                    const move = game.move(data.bestMove);
                    if (move) {
                        const newPieces = parseFen(game.fen());
                        setPieces(newPieces);
                        updateGameStatus(game, null, newPieces);

                        if (onMoveMade) {
                            onMoveMade({
                                fen: game.fen(),
                                moves: game.history(),
                                pgn: game.pgn(),
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Engine error:', error);
            setEngineError(true);
            // alert('Failed to get AI move. Make sure the server is running.');
        } finally {
            setEngineLoading(false);
        }
    };

    const handleSquareClick = (square) => {
        if (!game || readOnly) return;

        // If a square is already selected
        if (selectedSquare) {
            // Check if it's a custom game or regular chess.js game
            if (game._isCustom) {
                let moveSuccess = false;
                let newFen, newPieces, nextTurn;

                // 1. Try strict chess.js move first (best for valid PGNs)
                try {
                    const tempChess = buildTempChess();

                    // Allow capturing own pieces in Editor mode? No, valid moves only.
                    const move = tempChess.move({ from: selectedSquare, to: square, promotion: 'q' });

                    if (move) {
                        newFen = tempChess.fen();
                        newPieces = parseFen(newFen);
                        nextTurn = tempChess.turn();
                        moveSuccess = true;

                        game._moves.push(`${move.from}${move.to}${move.promotion ? move.promotion : ''}`);
                    }
                } catch (err) {
                    console.warn('Custom move chess.js validation failed, trying manual:', err.message);
                }

                // 2. If chess.js failed, try manual validation (fallback for invalid states)
                if (!moveSuccess) {
                    const validMoves = getValidMoves(selectedSquare, pieces);
                    if (validMoves.includes(square)) {
                        // Apply move manually
                        const movingPiece = { ...pieces[selectedSquare] };

                        // Auto-promotion to queen
                        let isPromotion = false;
                        if (movingPiece.type === 'p' && (square[1] === '1' || square[1] === '8')) {
                            movingPiece.type = 'q';
                            isPromotion = true;
                        }

                        newPieces = { ...pieces };
                        newPieces[square] = movingPiece;
                        delete newPieces[selectedSquare];

                        nextTurn = customTurn === 'w' ? 'b' : 'w';
                        newFen = boardToFen(newPieces, nextTurn);
                        moveSuccess = true;

                        game._moves.push(`${selectedSquare}${square}${isPromotion ? 'q' : ''}`);
                    }
                }

                if (moveSuccess) {
                    setPieces(newPieces);
                    setCustomTurn(nextTurn);
                    updateGameStatus(game, newFen, newPieces, nextTurn);
                    setSelectedSquare(null);
                    setLegalMoves([]);

                    if (onMoveMade) {
                        onMoveMade({
                            fen: newFen,
                            moves: [...game._moves],
                            pgn: game._moves.join(' '),
                        });
                    }
                    return;
                }

                // If validation fails, treat as invalid and reset selection
                setSelectedSquare(null);
                setLegalMoves([]);
            } else {
                // Regular chess.js move handling
                const move = game.move({
                    from: selectedSquare,
                    to: square,
                    promotion: 'q',
                });

                if (move) {
                    const newPieces = parseFen(game.fen());
                    setPieces(newPieces);
                    setSelectedSquare(null);
                    setLegalMoves([]);
                    updateGameStatus(game, null, newPieces);

                    if (onMoveMade) {
                        onMoveMade({
                            fen: game.fen(),
                            moves: game.history(),
                            pgn: game.pgn(),
                        });
                    }
                } else {
                    // Invalid move, try selecting the clicked square instead
                    const piece = game.get(square);
                    if (piece && piece.color === game.turn()) {
                        setSelectedSquare(square);
                        const moves = game.moves({ square, verbose: true });
                        setLegalMoves(moves.map(m => m.to));
                    } else {
                        setSelectedSquare(null);
                        setLegalMoves([]);
                    }
                }
            }
        } else {
            // No square selected, select this one if it has a piece
            if (game._isCustom) {
                const piece = pieces[square];
                if (piece && piece.color === customTurn) {
                    // Try robust manual validation first/always for consistency in custom mode
                    const moves = getValidMoves(square, pieces);
                    if (moves.length) {
                        setSelectedSquare(square);
                        setLegalMoves(moves);
                    }
                }
            } else {
                const piece = game.get(square);
                if (piece && piece.color === game.turn()) {
                    setSelectedSquare(square);
                    const moves = game.moves({ square, verbose: true });
                    setLegalMoves(moves.map(m => m.to));
                }
            }
        }
    };

    const getValidMoves = (square, currentPieces) => {
        const piece = currentPieces[square];
        if (!piece) return [];

        const pseudoMoves = getPseudoLegalMoves(square, currentPieces);
        const validMoves = [];

        pseudoMoves.forEach(move => {
            // Simulate move
            const nextPieces = { ...currentPieces };
            nextPieces[move] = nextPieces[square];
            delete nextPieces[square];

            // In custom mode, ensure king exists (might be deleted in editor)
            const kingSquare = getKingSquare(nextPieces, piece.color);
            if (kingSquare) {
                // Keep move if king is NOT under attack
                if (!isSquareUnderAttack(kingSquare, piece.color, nextPieces)) {
                    validMoves.push(move);
                }
            } else {
                // If no king, technically any move is "valid" in editor context, or invalid?
                // Let's allow it so users can move other pieces while setting up
                validMoves.push(move);
            }
        });

        return validMoves;
    };

    const getPseudoLegalMoves = (square, currentPieces, includePotentialAttacks = false) => {
        const piece = currentPieces[square];
        if (!piece) return [];

        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
        const [file, rank] = square.split('');
        const fileIdx = files.indexOf(file);
        const rankIdx = ranks.indexOf(rank);

        const moves = [];

        const addDirection = (df, dr) => {
            for (let i = 1; i < 8; i++) {
                const nf = files[fileIdx + (df * i)];
                const nr = ranks[rankIdx + (dr * i)];
                if (!nf || !nr) break;
                const target = `${nf}${nr}`;
                const targetPiece = currentPieces[target];
                if (!targetPiece) {
                    moves.push(target);
                } else {
                    if (targetPiece.color !== piece.color || includePotentialAttacks) moves.push(target);
                    break;
                }
            }
        };

        switch (piece.type) {
            case 'p': // Pawn
                const direction = piece.color === 'w' ? 1 : -1;
                const startRank = piece.color === 'w' ? '2' : '7';

                // One square forward
                if (!includePotentialAttacks) {
                    if (ranks[rankIdx + direction]) {
                        const forwardRank = ranks[rankIdx + direction];
                        const forward = `${file}${forwardRank}`;
                        if (!currentPieces[forward]) {
                            moves.push(forward);
                            // Two squares forward
                            if (rank === startRank && ranks[rankIdx + (direction * 2)]) {
                                const doubleForward = `${file}${ranks[rankIdx + (direction * 2)]}`;
                                if (!currentPieces[doubleForward]) {
                                    moves.push(doubleForward);
                                }
                            }
                        }
                    }
                }

                // Captures
                const captureFiles = [files[fileIdx - 1], files[fileIdx + 1]];
                captureFiles.forEach(cf => {
                    if (cf && ranks[rankIdx + direction]) {
                        const nextRank = ranks[rankIdx + direction];
                        const capture = `${cf}${nextRank}`;

                        // If checking attacks, always include diagonals
                        // If moving, only include if enemy there
                        if (includePotentialAttacks) {
                            moves.push(capture);
                        } else {
                            if (currentPieces[capture] && currentPieces[capture].color !== piece.color) {
                                moves.push(capture);
                            }
                        }
                    }
                });
                break;

            case 'n': // Knight
                const knightMoves = [
                    [2, 1], [2, -1], [-2, 1], [-2, -1],
                    [1, 2], [1, -2], [-1, 2], [-1, -2]
                ];
                knightMoves.forEach(([df, dr]) => {
                    const nf = files[fileIdx + df];
                    const nr = ranks[rankIdx + dr];
                    if (nf && nr) {
                        const target = `${nf}${nr}`;
                        const targetPiece = currentPieces[target];
                        if (!targetPiece || targetPiece.color !== piece.color || includePotentialAttacks) {
                            moves.push(target);
                        }
                    }
                });
                break;

            case 'k': // King
                for (let df = -1; df <= 1; df++) {
                    for (let dr = -1; dr <= 1; dr++) {
                        if (df === 0 && dr === 0) continue;
                        const nf = files[fileIdx + df];
                        const nr = ranks[rankIdx + dr];
                        if (nf && nr) {
                            const target = `${nf}${nr}`;
                            const targetPiece = currentPieces[target];
                            if (!targetPiece || targetPiece.color !== piece.color || includePotentialAttacks) {
                                moves.push(target);
                            }
                        }
                    }
                }
                break;

            case 'r': // Rook
                [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([df, dr]) => addDirection(df, dr));
                break;

            case 'b': // Bishop
                [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([df, dr]) => addDirection(df, dr));
                break;

            case 'q': // Queen
                [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([df, dr]) => addDirection(df, dr));
                break;
        }

        return moves;
    };

    const handleUndo = () => {
        if (!game) return;

        if (game._isCustom) {
            if (game._moves.length > 0) {
                game._moves.pop();
                // Re-parse from initial FEN and replay moves
                const initialPieces = parseFen(initialFen);
                setPieces(initialPieces);
                setSelectedSquare(null);
                setLegalMoves([]);
                const nextTurn = customTurn === 'w' ? 'b' : 'w';
                setCustomTurn(nextTurn);

                const fen = boardToFen(initialPieces, nextTurn);
                updateGameStatus(game, fen, initialPieces, nextTurn);

                if (onMoveMade) {
                    onMoveMade({
                        fen: game.fen(),
                        moves: game._moves,
                        pgn: game._moves.join(' '),
                    });
                }
            }
        } else {
            const move = game.undo();
            if (move) {
                const newPieces = parseFen(game.fen());
                setPieces(newPieces);
                setSelectedSquare(null);
                setLegalMoves([]);
                updateGameStatus(game, null, newPieces);

                if (onMoveMade) {
                    onMoveMade({
                        fen: game.fen(),
                        moves: game.history(),
                        pgn: game.pgn(),
                    });
                }
            }
        }
    };

    const rows = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const sqSize = size / 8;

    return (
        <div>
            <div style={{
                display: 'inline-block',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}>
                {rows.map((row, rIdx) => (
                    <div key={row} style={{ display: 'flex' }}>
                        {cols.map((col, cIdx) => {
                            const square = col + row;
                            const piece = pieces[square];
                            const isLight = (rIdx + cIdx) % 2 === 0;
                            const isSelected = square === selectedSquare;
                            const isLegalMove = legalMoves.includes(square);
                            const isKingCheck = square === kingInCheck;
                            const isKingMate = square === kingInCheckmate;

                            let backgroundColor = isLight ? '#e9edcc' : '#779954';
                            if (isKingMate) {
                                backgroundColor = '#dc2626'; // Red for checkmate
                            } else if (isKingCheck) {
                                backgroundColor = '#f97316'; // Orange for check
                            } else if (isSelected) {
                                backgroundColor = '#f7dc6f';
                            } else if (isLegalMove) {
                                backgroundColor = isLight ? '#bae67e' : '#7fa650';
                            }

                            return (
                                <div
                                    key={square}
                                    onClick={() => handleSquareClick(square)}
                                    style={{
                                        width: sqSize,
                                        height: sqSize,
                                        backgroundColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: Math.floor(sqSize * 0.7),
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        position: 'relative',
                                        transition: 'background-color 0.2s',
                                        boxShadow: (isKingCheck || isKingMate) ? 'inset 0 0 20px rgba(0,0,0,0.5)' : 'none',
                                        animation: isKingCheck ? 'kingPulse 1s infinite' : 'none',
                                    }}
                                >
                                    {piece && glyph[piece.color]?.[piece.type]}
                                    {isLegalMove && !piece && (
                                        <div style={{
                                            width: '25%',
                                            height: '25%',
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(0,0,0,0.2)',
                                        }} />
                                    )}
                                    {isLegalMove && piece && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            border: '3px solid rgba(0,0,0,0.3)',
                                            borderRadius: '50%',
                                            pointerEvents: 'none',
                                        }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {gameStatus && (
                <div style={{
                    marginTop: '16px',
                    padding: '16px 20px',
                    background: gameStatus.toLowerCase().includes('checkmate') ? '#fef3c7' :
                        gameStatus.toLowerCase().includes('check') ? '#fee2e2' :
                            '#dbeafe',
                    borderRadius: '12px',
                    border: `3px solid ${gameStatus.toLowerCase().includes('checkmate') ? '#f59e0b' :
                        gameStatus.toLowerCase().includes('check') ? '#ef4444' :
                            '#3b82f6'
                        }`,
                    textAlign: 'center',
                    fontWeight: '700',
                    color: gameStatus.toLowerCase().includes('checkmate') ? '#92400e' :
                        gameStatus.toLowerCase().includes('check') ? '#991b1b' :
                            '#1e40af',
                    fontSize: '18px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    animation: gameStatus.toLowerCase().includes('check') ? 'pulse 1s infinite' : 'none'
                }}>
                    {gameStatus.toLowerCase().includes('checkmate') && '👑 '}
                    {gameStatus.toLowerCase().includes('check') && !gameStatus.toLowerCase().includes('checkmate') && '⚠️ '}
                    {gameStatus}
                </div>
            )}

            {engineError && (
                <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#b91c1c',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600'
                }}>
                    <span>⚠️</span> Engine offline. Manual mode enabled.
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                @keyframes kingPulse {
                    0%, 100% { 
                        transform: scale(1);
                        box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
                    }
                    50% { 
                        transform: scale(1.05);
                        box-shadow: inset 0 0 30px rgba(0,0,0,0.7);
                    }
                }
            `}</style>

            {game && (game._isCustom ? game._moves.length > 0 : game.history().length > 0) && (
                <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <button
                            onClick={handleUndo}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                            }}
                        >
                            ↶ Undo
                        </button>

                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                            }}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <div style={{
                        padding: '12px',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                    }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#334155' }}>
                            Moves: {game._isCustom ? game._moves.length : game.history().length}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                            {game._isCustom ? game._moves.join(', ') : game.history().join(', ')}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimpleChessBoard;
