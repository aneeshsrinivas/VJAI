import React, { useState, useEffect } from 'react';
import Button from '../../ui/Button';
import { X, TrendingUp, TrendingDown, Target, Award, BookOpen, Zap, ExternalLink } from 'lucide-react';

// ICA Color scheme
const COLORS = {
    orange: '#FC8A24',
    deepBlue: '#003366',
    oliveGreen: '#6B8E23',
    ivory: '#FFFEF3'
};

// Real chess video resources mapped by skill area
const CHESS_RESOURCES = {
    Opening: [
        { title: 'Opening Principles for Beginners', url: 'https://www.youtube.com/watch?v=Ao9iOeK_jvU', type: 'Video', time: '15 min' },
        { title: 'Best Chess Openings for Beginners', url: 'https://www.youtube.com/watch?v=3MB_FGRsqOc', type: 'Video', time: '20 min' },
        { title: 'Italian Game Tutorial', url: 'https://www.youtube.com/watch?v=jJAWbzEU0N8', type: 'Video', time: '25 min' }
    ],
    Tactics: [
        { title: 'Chess Tactics: Forks, Pins & Skewers', url: 'https://www.youtube.com/watch?v=zP-7BXRIC30', type: 'Video', time: '18 min' },
        { title: 'Improve Your Tactics in Chess', url: 'https://www.youtube.com/watch?v=7_EUc6qSEJQ', type: 'Video', time: '22 min' },
        { title: 'Chess.com - Tactics Trainer', url: 'https://www.chess.com/puzzles', type: 'Practice', time: '30 min' }
    ],
    Endgame: [
        { title: 'Endgame Basics: King & Pawn', url: 'https://www.youtube.com/watch?v=qNGIqkbmVy4', type: 'Video', time: '20 min' },
        { title: 'Essential Endgame Knowledge', url: 'https://www.youtube.com/watch?v=jM0SVW2EXtI', type: 'Video', time: '25 min' },
        { title: 'Rook Endgames Masterclass', url: 'https://www.youtube.com/watch?v=9lTCQA5H3l0', type: 'Video', time: '30 min' }
    ],
    Strategy: [
        { title: 'Chess Strategy: Pawn Structure', url: 'https://www.youtube.com/watch?v=FnTvzGrwJDU', type: 'Video', time: '22 min' },
        { title: 'Positional Chess Concepts', url: 'https://www.youtube.com/watch?v=l-NeGw4K58k', type: 'Video', time: '28 min' },
        { title: 'Understanding Chess Strategy', url: 'https://www.youtube.com/watch?v=3uW7InqZYhQ', type: 'Video', time: '35 min' }
    ],
    Calculation: [
        { title: 'How to Calculate in Chess', url: 'https://www.youtube.com/watch?v=uo0jz9ZNsKI', type: 'Video', time: '20 min' },
        { title: 'Chess Visualization Training', url: 'https://www.youtube.com/watch?v=2ueHBYdpbnM', type: 'Video', time: '15 min' },
        { title: 'Improve Chess Calculation', url: 'https://www.youtube.com/watch?v=4AJWp6LbZHk', type: 'Video', time: '25 min' }
    ],
    Defense: [
        { title: 'Defensive Chess Techniques', url: 'https://www.youtube.com/watch?v=S6W5e_L8qDY', type: 'Video', time: '18 min' },
        { title: 'How to Defend in Chess', url: 'https://www.youtube.com/watch?v=J0bJUbv6Xwk', type: 'Video', time: '22 min' },
        { title: 'Prophylaxis in Chess', url: 'https://www.youtube.com/watch?v=MFN6SGE8M_s', type: 'Video', time: '20 min' }
    ]
};

const SkillHeatmap = ({ studentName = "Student" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('heatmap');
    const [hoveredCell, setHoveredCell] = useState(null);
    const [animationPhase, setAnimationPhase] = useState(0);

    // Chess skills categories
    const skillCategories = [
        { id: 'Opening', name: 'Opening', icon: '♔', color: '#3B82F6' },
        { id: 'Tactics', name: 'Tactics', icon: '♞', color: COLORS.orange },
        { id: 'Strategy', name: 'Strategy', icon: '♝', color: COLORS.oliveGreen },
        { id: 'Endgame', name: 'Endgame', icon: '♚', color: '#8B5CF6' },
        { id: 'Calculation', name: 'Calculation', icon: '♜', color: '#EC4899' },
        { id: 'Defense', name: 'Defense', icon: '♟', color: '#10B981' }
    ];

    // Generate skill data
    const generateSkillData = () => {
        return skillCategories.map(cat => ({
            ...cat,
            score: Math.floor(40 + Math.random() * 55),
            trend: Math.random() > 0.5 ? 'up' : 'down',
            change: Math.floor(Math.random() * 15)
        }));
    };

    const [skills] = useState(generateSkillData());

    // Generate compact heatmap data (6x6 for smaller size)
    const generateHeatmap = () => {
        const zones = [
            ['Opening', 'Opening', 'Opening', 'Opening', 'Opening', 'Opening'],
            ['Opening', 'Tactics', 'Tactics', 'Tactics', 'Tactics', 'Opening'],
            ['Strategy', 'Tactics', 'Center', 'Center', 'Tactics', 'Strategy'],
            ['Strategy', 'Tactics', 'Center', 'Center', 'Tactics', 'Strategy'],
            ['Endgame', 'Endgame', 'Endgame', 'Endgame', 'Endgame', 'Endgame'],
            ['Endgame', 'Endgame', 'Endgame', 'Endgame', 'Endgame', 'Endgame']
        ];

        return zones.map((row, r) =>
            row.map((zone, c) => {
                const baseScore = zone === 'Center' ? 85 : zone === 'Tactics' ? 75 : zone === 'Opening' ? 55 : zone === 'Endgame' ? 40 : 65;
                return {
                    score: Math.max(20, Math.min(100, baseScore + (Math.random() * 20 - 10))),
                    zone
                };
            })
        );
    };

    const [heatmapData] = useState(generateHeatmap());

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setAnimationPhase(1), 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const getHeatColor = (score) => {
        if (score >= 80) return { bg: 'rgba(107, 142, 35, 0.9)', text: '#fff' };
        if (score >= 65) return { bg: 'rgba(107, 142, 35, 0.6)', text: '#fff' };
        if (score >= 50) return { bg: 'rgba(252, 138, 36, 0.7)', text: '#fff' };
        if (score >= 35) return { bg: 'rgba(252, 138, 36, 0.5)', text: '#333' };
        return { bg: 'rgba(220, 38, 38, 0.6)', text: '#fff' };
    };

    const overallScore = Math.round(skills.reduce((sum, s) => sum + s.score, 0) / skills.length);
    const weakestSkill = skills.reduce((a, b) => a.score < b.score ? a : b);

    if (!isOpen) {
        return (
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: COLORS.deepBlue, padding: '6px 10px', fontSize: '12px' }}
            >
                <Target size={14} /> Skills
            </Button>
        );
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: '#fff', borderRadius: '12px', width: '600px', maxWidth: '95%',
                maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                transform: animationPhase ? 'scale(1)' : 'scale(0.95)',
                opacity: animationPhase ? 1 : 0,
                transition: 'all 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 20px', borderBottom: '1px solid #eee',
                    background: COLORS.deepBlue,
                    color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
                            {studentName}'s Skill Analysis
                        </h3>
                        <p style={{ margin: '2px 0 0', opacity: 0.8, fontSize: '12px' }}>
                            Overall: {overallScore}% | Focus: {weakestSkill.name}
                        </p>
                    </div>
                    <button onClick={() => { setIsOpen(false); setAnimationPhase(0); }} style={{
                        background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px',
                        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'white'
                    }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '2px', padding: '0 20px', borderBottom: '1px solid #eee', background: COLORS.ivory }}>
                    {[
                        { id: 'heatmap', label: 'Heatmap' },
                        { id: 'skills', label: 'Skills' },
                        { id: 'recommend', label: 'Resources' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 16px', border: 'none', background: 'none',
                                fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                                color: activeTab === tab.id ? COLORS.deepBlue : '#666',
                                borderBottom: activeTab === tab.id ? `3px solid ${COLORS.orange}` : '3px solid transparent'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
                    {activeTab === 'heatmap' && (
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                            {/* Compact 6x6 Chessboard Heatmap */}
                            <div>
                                <div style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2px',
                                    padding: '6px', background: '#2C1810', borderRadius: '6px', width: 'fit-content'
                                }}>
                                    {heatmapData.flat().map((cell, i) => {
                                        const colors = getHeatColor(cell.score);
                                        const isHovered = hoveredCell === i;
                                        return (
                                            <div
                                                key={i}
                                                onMouseEnter={() => setHoveredCell(i)}
                                                onMouseLeave={() => setHoveredCell(null)}
                                                style={{
                                                    width: '36px', height: '36px', background: colors.bg,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '10px', fontWeight: '600', color: colors.text,
                                                    cursor: 'pointer', transition: 'all 0.15s',
                                                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                                                    zIndex: isHovered ? 10 : 1, position: 'relative',
                                                    borderRadius: isHovered ? '3px' : '0'
                                                }}
                                            >
                                                {isHovered ? Math.round(cell.score) : ''}
                                            </div>
                                        );
                                    })}
                                </div>
                                {hoveredCell !== null && (
                                    <div style={{ marginTop: '8px', padding: '8px', background: COLORS.ivory, borderRadius: '6px', textAlign: 'center', fontSize: '12px' }}>
                                        <strong>{heatmapData.flat()[hoveredCell].zone}</strong>: {Math.round(heatmapData.flat()[hoveredCell].score)}%
                                    </div>
                                )}
                            </div>

                            {/* Legend */}
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 12px', color: COLORS.deepBlue, fontSize: '13px' }}>Legend</h4>
                                {[
                                    { label: 'Excellent (80+)', color: 'rgba(107, 142, 35, 0.9)' },
                                    { label: 'Good (65-79)', color: 'rgba(107, 142, 35, 0.6)' },
                                    { label: 'Average (50-64)', color: 'rgba(252, 138, 36, 0.7)' },
                                    { label: 'Needs Work (<50)', color: 'rgba(220, 38, 38, 0.6)' }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <div style={{ width: '16px', height: '16px', background: item.color, borderRadius: '3px' }} />
                                        <span style={{ fontSize: '11px', color: '#666' }}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            {skills.map((skill) => (
                                <div key={skill.id} style={{
                                    padding: '12px', background: '#fff', borderRadius: '8px',
                                    border: '1px solid #eee'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontSize: '18px' }}>{skill.icon}</span>
                                            <span style={{ fontWeight: '600', color: COLORS.deepBlue, fontSize: '13px' }}>{skill.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: skill.trend === 'up' ? COLORS.oliveGreen : '#DC2626' }}>
                                            {skill.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            {skill.change}%
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ flex: 1, height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${skill.score}%`, height: '100%',
                                                background: skill.score >= 70 ? COLORS.oliveGreen : skill.score >= 50 ? COLORS.orange : '#DC2626',
                                                borderRadius: '3px'
                                            }} />
                                        </div>
                                        <span style={{ fontWeight: '700', fontSize: '13px', color: COLORS.deepBlue }}>{skill.score}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'recommend' && (
                        <div>
                            <div style={{ padding: '12px', background: `${COLORS.orange}15`, borderRadius: '8px', borderLeft: `3px solid ${COLORS.orange}`, marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    <Zap size={14} color={COLORS.orange} />
                                    <span style={{ fontWeight: '700', color: COLORS.deepBlue, fontSize: '13px' }}>Focus: {weakestSkill.name}</span>
                                </div>
                                <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
                                    Recommended resources to improve {weakestSkill.name.toLowerCase()} skills.
                                </p>
                            </div>

                            <h4 style={{ margin: '0 0 12px', color: COLORS.deepBlue, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <BookOpen size={16} /> Video Tutorials & Practice
                            </h4>

                            {(CHESS_RESOURCES[weakestSkill.id] || CHESS_RESOURCES.Tactics).map((item, i) => (
                                <a
                                    key={i}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '12px', marginBottom: '8px', background: '#fff', borderRadius: '8px',
                                        border: '1px solid #eee', textDecoration: 'none', transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = COLORS.orange}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#eee'}
                                >
                                    <div>
                                        <div style={{ fontWeight: '600', color: COLORS.deepBlue, fontSize: '13px' }}>{item.title}</div>
                                        <div style={{ fontSize: '11px', color: '#999' }}>{item.type} - {item.time}</div>
                                    </div>
                                    <ExternalLink size={16} color={COLORS.orange} />
                                </a>
                            ))}

                            <div style={{ marginTop: '16px' }}>
                                <Button style={{ width: '100%', backgroundColor: COLORS.deepBlue, border: 'none' }}>
                                    <BookOpen size={14} style={{ marginRight: 6 }} />
                                    Generate Full Lesson Plan
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillHeatmap;
