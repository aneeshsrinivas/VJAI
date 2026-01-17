import React, { useState } from 'react';
import Button from '../../ui/Button';

const SkillHeatmap = ({ studentName = "Arjun" }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Mock heatmap data (8x8 grid values 0-100)
    const generateHeatmap = () => {
        const grid = [];
        for (let r = 0; r < 8; r++) {
            const row = [];
            for (let c = 0; c < 8; c++) {
                // Mock pattern: Weak corners, strong center
                let val = 60 + Math.random() * 40;
                if (r < 2) val -= 30; // Opening weakness
                if (r > 5) val -= 20; // Endgame weakness
                row.push(val);
            }
            grid.push(row);
        }
        return grid;
    };

    const heatmapData = generateHeatmap();

    const getColor = (val) => {
        if (val >= 75) return 'var(--color-olive-green)';
        if (val >= 50) return '#FDD835'; // Yellow
        return '#D32F2F'; // Red
    };

    if (!isOpen) {
        return (
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>♟️</span> View Skill Heatmap
            </Button>
        );
    }

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} className="animate-fade-in">
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '500px', maxWidth: '90%', position: 'relative' }} className="rangoli-border-top">
                <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>

                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-deep-blue)', marginTop: 0 }}>{studentName}'s Skill Heatmap</h2>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ flex: 1, padding: '12px', backgroundColor: '#F1F8E9', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#2E7D32' }}>Opening</div>
                        <div style={{ fontSize: '12px', color: '#558B2F' }}>65% (Avg)</div>
                    </div>
                    <div style={{ flex: 1, padding: '12px', backgroundColor: '#E3F2FD', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#1565C0' }}>Middlegame</div>
                        <div style={{ fontSize: '12px', color: '#0277BD' }}>82% (Strong)</div>
                    </div>
                    <div style={{ flex: 1, padding: '12px', backgroundColor: '#FFEBEE', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#C62828' }}>Endgame</div>
                        <div style={{ fontSize: '12px', color: '#D32F2F' }}>42% (Weak)</div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '2px', padding: '4px', border: '4px solid #3E2723', backgroundColor: '#5D4037' }}>
                        {heatmapData.map((row, r) => (
                            row.map((val, c) => (
                                <div key={`${r}-${c}`} style={{ width: '32px', height: '32px', backgroundColor: getColor(val), opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                    {/* Optional: Add piece icons randomly for flavor */}
                                </div>
                            ))
                        ))}
                    </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#FFF3E0', borderRadius: '8px', borderLeft: '4px solid var(--color-warm-orange)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#EF6C00', textTransform: 'uppercase' }}>AI Recommendation</div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Focus next 3 lessons on endgame pawn structures (f5, g5 weakness detected). Recommend "Silman's Endgame Course" Chapter 4.</p>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                    <Button style={{ flex: 1 }}>Generate Lesson Plan</Button>
                    <Button variant="secondary" style={{ flex: 1 }}>Share Report with Parent</Button>
                </div>
            </div>
        </div>
    );
};

export default SkillHeatmap;
