import React from 'react';
import { motion } from 'framer-motion';
import './FloatingChessPieces.css';

const pieces = [
    { symbol: '♔', delay: 0, x: '10%', y: '20%', size: 60 },
    { symbol: '♕', delay: 0.5, x: '85%', y: '15%', size: 50 },
    { symbol: '♗', delay: 1, x: '15%', y: '70%', size: 45 },
    { symbol: '♘', delay: 1.5, x: '80%', y: '75%', size: 55 },
    { symbol: '♖', delay: 2, x: '5%', y: '45%', size: 40 },
    { symbol: '♙', delay: 0.3, x: '90%', y: '50%', size: 35 },
];

const FloatingChessPieces = () => {
    return (
        <div className="floating-chess-pieces">
            {pieces.map((piece, index) => (
                <motion.div
                    key={index}
                    className="floating-piece"
                    style={{
                        left: piece.x,
                        top: piece.y,
                        fontSize: piece.size,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: 0.15,
                        scale: 1,
                        y: [0, -20, 0],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        opacity: { delay: piece.delay, duration: 1 },
                        scale: { delay: piece.delay, duration: 0.5, type: 'spring' },
                        y: {
                            duration: 4 + index * 0.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: piece.delay
                        },
                        rotate: {
                            duration: 6 + index * 0.3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: piece.delay
                        }
                    }}
                >
                    {piece.symbol}
                </motion.div>
            ))}
        </div>
    );
};

export default FloatingChessPieces;
