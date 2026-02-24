import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useState } from "react";

export default function ServicesChessGame({ onServiceReveal }) {
    const [game, setGame] = useState(new Chess());
    const [moveIndex, setMoveIndex] = useState(0);

    const allowedMoves = [
        { from: "e2", to: "e4", black: "e7e5" },
        // more moves later
    ];

    function onPieceDrop(source, target) {
        const current = allowedMoves[moveIndex];

        if (source !== current.from || target !== current.to) {
            return false;
        }

        const newGame = new Chess(game.fen());
        newGame.move({ from: source, to: target });
        setGame(newGame);

        onServiceReveal(moveIndex); // fade in service card

        setTimeout(() => {
            newGame.move({
                from: current.black.slice(0, 2),
                to: current.black.slice(2, 4),
            });
            setGame(new Chess(newGame.fen()));
            setMoveIndex((i) => i + 1);
        }, 900);

        return true;
    }

    return (
        <Chessboard
            position={game.fen()}
            onPieceDrop={onPieceDrop}
            arePiecesDraggable={true}
        />
    );
}
<Chessboard
    customArrows={[
        ["e2", "e4"]
    ]}
    customSquareStyles={{
        e4: { backgroundColor: "rgba(0,255,0,0.4)" }
    }}
/>
